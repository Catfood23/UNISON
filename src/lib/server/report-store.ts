import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import type { NewReport, PublicReport, Report, Status } from "../report-model";
import * as google from "./google-report-store";

const dataDirectory = process.env["UNISON_DATA_DIR"]
  ? path.resolve(process.env["UNISON_DATA_DIR"])
  : path.join(process.cwd(), ".data");
const reportsFile = path.join(dataDirectory, "reports.json");
let writeQueue: Promise<void> = Promise.resolve();

async function readAll(): Promise<Report[]> {
  try {
    const content = await readFile(reportsFile, "utf8");
    const reports: unknown = JSON.parse(content);
    if (!Array.isArray(reports)) throw new Error("Report store has an invalid format.");
    return reports as Report[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error["code"] === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(reports: Report[]): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${reportsFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(reports, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryFile, reportsFile);
}

function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function isGoogleReportStorageConfigured(): boolean {
  // Let the Google adapter reject a partial configuration instead of silently
  // writing to local storage when just one server setting has been supplied.
  return google.isGoogleReportStorageConfigured();
}

function googleStorageEnabled(): boolean {
  const configured = isGoogleReportStorageConfigured();
  if (!configured && process.env["UNISON_REQUIRE_GOOGLE_STORAGE"] === "true") {
    throw new Error("Google Sheets and Drive storage must be configured for this deployment.");
  }
  return configured;
}

function publicReport(report: Report): Report {
  return report.photo?.startsWith("data:image/")
    ? { ...report, photo: `/api/reports/${encodeURIComponent(report.id)}/photo` }
    : report;
}

/** Original local records, including photo data, used only for one-time migration. */
export async function listLocalReports(): Promise<Report[]> {
  await writeQueue;
  return readAll();
}

export async function listReports(): Promise<Report[]> {
  if (googleStorageEnabled()) return (await google.listGoogleReports()).map(publicReport);
  return (await listLocalReports()).map(publicReport);
}

export async function getReport(id: string): Promise<Report | null> {
  if (googleStorageEnabled()) return google.getGoogleReport(id);
  return (await listLocalReports()).find((report) => report.id === id) ?? null;
}

export async function listPublicReports(): Promise<PublicReport[]> {
  return (await listReports()).map(({ id, category, neighborhood, date, status }) => ({
    id,
    category,
    ...(neighborhood === undefined ? {} : { neighborhood }),
    date,
    status,
  }));
}

export async function getPublicReport(id: string): Promise<PublicReport | null> {
  const report = await getReport(id);
  if (!report) return null;
  const { id: reportId, category, neighborhood, date, status } = report;
  return {
    id: reportId,
    category,
    ...(neighborhood === undefined ? {} : { neighborhood }),
    date,
    status,
  };
}

export function createReport(input: NewReport): Promise<Report> {
  if (googleStorageEnabled()) return google.createGoogleReport(input).then(publicReport);
  return serializeWrite(async () => {
    const report: Report = {
      ...input,
      id: `UN-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
      date: new Date().toISOString(),
      status: "Submitted",
    };
    await writeAll([report, ...(await readAll())]);
    return publicReport(report);
  });
}

export function updateReportStatus(id: string, status: Status): Promise<Report | null> {
  if (googleStorageEnabled())
    return google
      .updateGoogleReportStatus(id, status)
      .then((report) => report && publicReport(report));
  return serializeWrite(async () => {
    const reports = await readAll();
    const index = reports.findIndex((report) => report.id === id);
    const existing = reports[index];
    if (!existing) return null;
    const updated = { ...existing, status };
    reports[index] = updated;
    await writeAll(reports);
    return publicReport(updated);
  });
}

export function deleteReport(id: string): Promise<boolean> {
  if (googleStorageEnabled()) return google.deleteGoogleReport(id);
  return serializeWrite(async () => {
    const reports = await readAll();
    const remaining = reports.filter((report) => report.id !== id);
    if (remaining.length === reports.length) return false;
    await writeAll(remaining);
    return true;
  });
}

export async function getReportPhoto(
  id: string,
): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  if (googleStorageEnabled()) {
    return google.getGoogleReportPhoto(id);
  }
  const report = (await listLocalReports()).find((item) => item.id === id);
  const match = report?.photo?.match(
    /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/,
  );
  const encoded = match?.[2];
  const mimeType = match?.[1];
  return encoded && mimeType ? { bytes: Buffer.from(encoded, "base64"), mimeType } : null;
}
