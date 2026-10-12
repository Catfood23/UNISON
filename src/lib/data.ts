// All content here is DEMO / SAMPLE data for an educational prototype.
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  changeReportStatus,
  deleteReport as deleteDemoReport,
  listAnnouncements,
  listReports,
  makeReport,
  type DemoReport,
} from "@/lib/demo-store";
import type { Announcement } from "@/lib/demo-types";
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

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "announcement-road",
    type: "Road repair",
    title: "Main Street resurfacing",
    body: "Road repair work between 10 AM and 5 PM on Monday–Wednesday. Please use the bypass lane.",
    date: "Oct 12",
  },
  {
    id: "announcement-water",
    type: "Water supply",
    title: "Scheduled water interruption",
    body: "Water supply will be paused on Saturday 9 AM–1 PM for pipeline maintenance. Store water in advance.",
    date: "Oct 14",
  },
  {
    id: "announcement-garbage",
    type: "Garbage",
    title: "New garbage collection schedule",
    body: "Wet waste: daily 7 AM. Dry waste: Tuesdays and Fridays. Please segregate waste at home.",
    date: "Oct 15",
  },
];

export const ALL_HOODS = "All neighborhoods";

export function loadReports(): Promise<PublicReport[]> {
  return Promise.resolve(listReports());
}

export function loadReport(id: string): Promise<DemoReport> {
  const found = listReports().find((item) => item.id === id);
  return found
    ? Promise.resolve(found)
    : Promise.reject(new Error("Report not found in this browser."));
}

export async function createReport(report: NewReport, ownerId: string): Promise<DemoReport> {
  return makeReport({ ...report, ownerId });
}

export async function updateReport(id: string, status: Status): Promise<Report> {
  changeReportStatus(id, status);
  const updated = listReports().find((item) => item.id === id);
  if (!updated) throw new Error("Report not found.");
  return updated;
}

export async function removeReport(id: string): Promise<void> {
  deleteDemoReport(id);
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
  const { user } = useAuth();
  const [reports, setReports] = useState<DemoReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState("");
  useEffect(() => {
    let active = true;
    const sync = () => {
      try {
        const records = listReports().filter(
          (report) => user?.role === "admin" || report.ownerId === user?.id,
        );
        if (active) {
          setReports(records);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };
    sync();
    window.addEventListener("unison-demo-changed", sync);
    return () => {
      active = false;
      window.removeEventListener("unison-demo-changed", sync);
    };
  }, [user?.id, user?.role]);
  return { reports, loading, error };
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => listAnnouncements());
  useEffect(() => {
    const sync = () => setAnnouncements(listAnnouncements());
    window.addEventListener("unison-demo-changed", sync);
    return () => window.removeEventListener("unison-demo-changed", sync);
  }, []);
  return announcements;
}

export function useNeighborhood() {
  const { user } = useAuth();
  const defaultHood = Object.hasOwn(WEATHER, user?.neighborhood ?? "")
    ? (user?.neighborhood as Neighborhood)
    : "Green Park (demo)";
  const [n, setN] = useState<Neighborhood>(defaultHood);
  useEffect(() => {
    const read = () => {
      try {
        const s = localStorage.getItem("sc-hood");
        if (s && Object.hasOwn(WEATHER, s)) setN(s as Neighborhood);
        else setN(defaultHood);
      } catch {
        setN(defaultHood);
      }
    };
    read();
    window.addEventListener("hood-changed", read);
    return () => window.removeEventListener("hood-changed", read);
  }, [defaultHood]);
  return [
    n,
    (v: string) => {
      if (!Object.hasOwn(WEATHER, v)) return;
      try {
        localStorage.setItem("sc-hood", v);
      } catch {
        return;
      }
      setN(v as Neighborhood);
      window.dispatchEvent(new Event("hood-changed"));
    },
  ] as const;
}
