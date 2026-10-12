// All content here is DEMO / SAMPLE data for an educational prototype.
import { useEffect, useState } from "react";
import {
  CATEGORIES,
  MAX_DESCRIPTION,
  MAX_LOCATION,
  NEIGHBORHOODS,
  STATUSES,
  type Neighborhood,
  type NewReport,
  type PublicReport,
  type Report,
  type Status,
} from "./report-model";

export { CATEGORIES, MAX_DESCRIPTION, MAX_LOCATION, NEIGHBORHOODS, STATUSES };
export type { Category, NewReport, PublicReport, Report, Status } from "./report-model";

export const WEATHER: Record<string, { temp: number; cond: string; humidity: number }> = {
  "Green Park (demo)": { temp: 29, cond: "Partly cloudy", humidity: 68 },
  "Lakeview (demo)": { temp: 27, cond: "Light rain", humidity: 82 },
  "Riverside (demo)": { temp: 31, cond: "Sunny", humidity: 55 },
  "Old Town (demo)": { temp: 30, cond: "Humid & hazy", humidity: 74 },
};

export const ANNOUNCEMENTS = [
  {
    type: "Road repair",
    title: "Main Street resurfacing",
    body: "Road repair work between 10 AM and 5 PM on Monday–Wednesday. Please use the bypass lane.",
    date: "Oct 12",
  },
  {
    type: "Water supply",
    title: "Scheduled water interruption",
    body: "Water supply will be paused on Saturday 9 AM–1 PM for pipeline maintenance. Store water in advance.",
    date: "Oct 14",
  },
  {
    type: "Garbage",
    title: "New garbage collection schedule",
    body: "Wet waste: daily 7 AM. Dry waste: Tuesdays and Fridays. Please segregate waste at home.",
    date: "Oct 15",
  },
];

export const ALL_HOODS = "All neighborhoods";

function dispatchReportsChanged() {
  window.dispatchEvent(new Event("reports-changed"));
}

async function requestReports<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "The reports service is unavailable.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function loadReports(): Promise<PublicReport[]> {
  return requestReports<PublicReport[]>("/api/reports");
}

export function loadReport(id: string): Promise<PublicReport> {
  return requestReports<PublicReport>(`/api/reports/${encodeURIComponent(id)}`);
}

export async function createReport(report: NewReport): Promise<Report> {
  const created = await requestReports<Report>("/api/reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
  dispatchReportsChanged();
  return created;
}

export async function updateReport(id: string, status: Status): Promise<Report> {
  const updated = await requestReports<Report>(`/api/reports/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  dispatchReportsChanged();
  return updated;
}

export async function removeReport(id: string): Promise<void> {
  await requestReports<void>(`/api/reports/${encodeURIComponent(id)}`, { method: "DELETE" });
  dispatchReportsChanged();
}

/** Reports created before neighborhoods existed count for every neighborhood. */
export function filterByHood<T extends Pick<PublicReport, "neighborhood">>(
  reports: T[],
  hood: string,
) {
  if (hood === ALL_HOODS) return reports;
  return reports.filter((r) => !r.neighborhood || r.neighborhood === hood);
}

/** Only raster images are accepted (SVG etc. rejected). */
export function isAllowedImage(type: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type);
}

/** Shrinks a photo to max 800px JPEG — keeps storage small and strips EXIF/GPS data. */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}

export function useReports() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const nextReports = await loadReports();
        if (active) {
          setReports(nextReports);
          setError("");
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load reports.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void sync();
    window.addEventListener("reports-changed", sync);
    return () => {
      active = false;
      window.removeEventListener("reports-changed", sync);
    };
  }, []);
  return { reports, loading, error };
}

export function useNeighborhood() {
  const [n, setN] = useState<Neighborhood>("Green Park (demo)");
  useEffect(() => {
    const read = () => {
      const s = localStorage.getItem("sc-hood");
      if (s && Object.hasOwn(WEATHER, s)) setN(s as Neighborhood);
    };
    read();
    window.addEventListener("hood-changed", read);
    return () => window.removeEventListener("hood-changed", read);
  }, []);
  return [
    n,
    (v: string) => {
      if (!Object.hasOwn(WEATHER, v)) return;
      localStorage.setItem("sc-hood", v);
      setN(v as Neighborhood);
      window.dispatchEvent(new Event("hood-changed"));
    },
  ] as const;
}
