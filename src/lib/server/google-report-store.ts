import { Buffer } from "node:buffer";
import process from "node:process";
import type { NewReport, Report, Status } from "../report-model";

type GoogleConfig = { url: string; secret: string };
type GooglePhoto = { mimeType: string; base64: string };

let migration: Promise<void> | undefined;

function getGoogleConfig(): GoogleConfig | null {
  const url = process.env["UNISON_GOOGLE_APPS_SCRIPT_URL"]?.trim() ?? "";
  const secret = process.env["UNISON_GOOGLE_SHARED_SECRET"]?.trim() ?? "";
  if (!url && !secret) return null;
  if (!url || !secret)
    throw new Error("Google Sheets storage is not fully configured on the server.");

  const parsedUrl = new URL(url);
  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "script.google.com" ||
    !parsedUrl.pathname.endsWith("/exec")
  ) {
    throw new Error("UNISON_GOOGLE_APPS_SCRIPT_URL must be the HTTPS Apps Script /exec URL.");
  }
  return { url, secret };
}

async function callScript<T>(
  config: GoogleConfig,
  action: string,
  fields: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, secret: config.secret, ...fields }),
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  const responseText = await response.text();
  let result: { ok?: boolean; data?: T; error?: string };
  try {
    result = JSON.parse(responseText) as typeof result;
  } catch {
    throw new Error(
      "Google storage returned an unexpected response. Check the Apps Script deployment URL and access setting.",
    );
  }
  if (!response.ok || result.ok !== true) {
    throw new Error(result.error || `Google storage request failed (${response.status}).`);
  }
  return result.data as T;
}

async function ensureLocalReportsMigrated(config: GoogleConfig): Promise<void> {
  // Cloudflare Workers do not have the local demo server's persistent report
  // file. Migrate it from the local Node server before deploying the Worker.
  if (process.env["UNISON_SKIP_LOCAL_IMPORT"] === "true") return;
  if (!migration) {
    migration = (async () => {
      const status = await callScript<{ complete: boolean }>(config, "migrationStatus");
      if (status.complete) return;

      const { listLocalReports } = await import("./report-store");
      const reports = await listLocalReports();
      await callScript<{ imported: number }>(config, "importLocal", { reports });
    })().catch((error: unknown) => {
      migration = undefined;
      throw error;
    });
  }
  await migration;
}

async function request<T>(action: string, fields: Record<string, unknown> = {}): Promise<T> {
  const config = getGoogleConfig();
  if (!config) throw new Error("Google storage is not configured.");
  await ensureLocalReportsMigrated(config);
  return callScript<T>(config, action, fields);
}

export function isGoogleReportStorageConfigured(): boolean {
  return getGoogleConfig() !== null;
}

export async function listGoogleReports(): Promise<Report[]> {
  return request<Report[]>("list");
}

export async function getGoogleReport(id: string): Promise<Report | null> {
  const reports = await listGoogleReports();
  return reports.find((report) => report.id === id) ?? null;
}

export async function createGoogleReport(input: NewReport): Promise<Report> {
  return request<Report>("create", { report: input });
}

export async function updateGoogleReportStatus(id: string, status: Status): Promise<Report | null> {
  return request<Report | null>("updateStatus", { id, status });
}

export async function deleteGoogleReport(id: string): Promise<boolean> {
  return request<boolean>("delete", { id });
}

export async function getGoogleReportPhoto(
  id: string,
): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  const photo = await request<GooglePhoto | null>("getPhoto", { id });
  return photo ? { bytes: Buffer.from(photo.base64, "base64"), mimeType: photo.mimeType } : null;
}
