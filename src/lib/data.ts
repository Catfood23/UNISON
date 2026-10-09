// All content here is DEMO / SAMPLE data for an educational prototype.
import { useEffect, useState } from "react";

export const CATEGORIES = [
  "Pothole",
  "Damaged road",
  "Broken streetlight",
  "Garbage",
  "Drainage",
  "Waterlogging",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["Submitted", "Verified", "In Progress", "Resolved"] as const;
export type Status = (typeof STATUSES)[number];

export const NEIGHBORHOODS: string[] = ["Green Park (demo)", "Lakeview (demo)", "Riverside (demo)", "Old Town (demo)"];

export const WEATHER: Record<string, { temp: number; cond: string; humidity: number }> = {
  "Green Park (demo)": { temp: 29, cond: "Partly cloudy", humidity: 68 },
  "Lakeview (demo)": { temp: 27, cond: "Light rain", humidity: 82 },
  "Riverside (demo)": { temp: 31, cond: "Sunny", humidity: 55 },
  "Old Town (demo)": { temp: 30, cond: "Humid & hazy", humidity: 74 },
};

export type Report = {
  id: string;
  category: Category;
  location: string;
  description: string;
  photo?: string | undefined;
  date: string;
  status: Status;
};

export const ANNOUNCEMENTS = [
  { type: "Road repair", title: "Main Street resurfacing", body: "Road repair work between 10 AM and 5 PM on Monday–Wednesday. Please use the bypass lane.", date: "Oct 12" },
  { type: "Water supply", title: "Scheduled water interruption", body: "Water supply will be paused on Saturday 9 AM–1 PM for pipeline maintenance. Store water in advance.", date: "Oct 14" },
  { type: "Garbage", title: "New garbage collection schedule", body: "Wet waste: daily 7 AM. Dry waste: Tuesdays and Fridays. Please segregate waste at home.", date: "Oct 15" },
];

const KEY = "smart-community-reports";

export function loadReports(): Report[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveReports(r: Report[]) {
  localStorage.setItem(KEY, JSON.stringify(r));
  window.dispatchEvent(new Event("reports-changed"));
}
export function makeId() {
  return "SC-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sync = () => setReports(loadReports());
    const t = setTimeout(() => { sync(); setLoading(false); }, 300);
    window.addEventListener("reports-changed", sync);
    return () => { clearTimeout(t); window.removeEventListener("reports-changed", sync); };
  }, []);
  return { reports, loading };
}

export function useNeighborhood() {
  const [n, setN] = useState<string>("Green Park (demo)");
  useEffect(() => { const s = localStorage.getItem("sc-hood"); if (s && WEATHER[s]) setN(s); }, []);
  return [n, (v: string) => { setN(v); localStorage.setItem("sc-hood", v); }] as const;
}
