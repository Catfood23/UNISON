import { DEMO_ADMIN, SEED_ANNOUNCEMENTS, SEED_REPORTS } from "@/lib/demo-constants";
import type { Announcement, DemoReport, User } from "@/lib/demo-types";
import type { Category, Status } from "@/lib/report-model";
export type { DemoReport } from "@/lib/demo-types";

export const USERS_KEY = "unison.demo.users.v1";
export const SESSION_KEY = "unison.demo.session.v1";
export const REPORTS_KEY = "unison.demo.reports.v1";
export const ANNOUNCEMENTS_KEY = "unison.demo.announcements.v1";
export const EMERGENCY_KEY = "unison.demo.emergency.v1";
export const SESSION_TTL = 24 * 60 * 60 * 1000;

export type DemoSession = { userId: string; expiresAt: number };
export type EmergencyContact = { id: string; name: string; number: string; kind: string };
export function homeRouteForRole(role: User["role"]): "/app" | "/admin" {
  return role === "admin" ? "/admin" : "/app";
}
export function canAccessRole(user: User | null, requiredRole?: User["role"]): boolean {
  return !!user && user.active && (!requiredRole || user.role === requiredRole);
}

export const SEED_EMERGENCY: EmergencyContact[] = [
  { id: "112", name: "National Emergency", number: "112", kind: "Emergency" },
  { id: "100", name: "Police", number: "100", kind: "Police" },
  { id: "101", name: "Fire", number: "101", kind: "Fire" },
  { id: "108", name: "Ambulance", number: "108", kind: "Ambulance" },
  { id: "1091", name: "Women Helpline", number: "1091", kind: "Support" },
  { id: "1098", name: "Child Helpline", number: "1098", kind: "Support" },
];

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = browserStorage()?.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function writeJson<T>(key: string, value: T): boolean {
  try {
    const storage = browserStorage();
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function notifyDemoChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("unison-demo-changed"));
}
export function listUsers(): User[] {
  const users: unknown = readJson<unknown>(USERS_KEY, []);
  return Array.isArray(users) &&
    users.length > 0 &&
    users.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.email === "string" &&
        (item.role === "admin" || item.role === "resident"),
    )
    ? (users as User[])
    : [DEMO_ADMIN];
}
export function saveUsers(users: User[]) {
  const ok = writeJson(USERS_KEY, users);
  if (ok) notifyDemoChange();
  return ok;
}
export function findUserByEmail(email: string) {
  return listUsers().find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
}
export function getSession(): DemoSession | null {
  const session = readJson<DemoSession | null>(SESSION_KEY, null);
  if (
    !session ||
    typeof session.userId !== "string" ||
    typeof session.expiresAt !== "number" ||
    session.expiresAt <= Date.now()
  ) {
    try {
      browserStorage()?.removeItem(SESSION_KEY);
    } catch {
      /* Storage may be disabled. */
    }
    return null;
  }
  return session;
}
export function saveSession(session: DemoSession | null) {
  if (!session) {
    try {
      browserStorage()?.removeItem(SESSION_KEY);
      return true;
    } catch {
      return false;
    }
  }
  return writeJson(SESSION_KEY, session);
}
export function listReports(): DemoReport[] {
  const value: unknown = readJson<unknown>(REPORTS_KEY, SEED_REPORTS);
  return Array.isArray(value) ? (value as DemoReport[]) : [];
}
export function saveReports(reports: DemoReport[]) {
  const ok = writeJson(REPORTS_KEY, reports);
  if (ok) notifyDemoChange();
  return ok;
}
export function listAnnouncements(): Announcement[] {
  const value: unknown = readJson<unknown>(ANNOUNCEMENTS_KEY, SEED_ANNOUNCEMENTS);
  return Array.isArray(value) ? (value as Announcement[]) : SEED_ANNOUNCEMENTS;
}
export function saveAnnouncements(items: Announcement[]) {
  const ok = writeJson(ANNOUNCEMENTS_KEY, items);
  if (ok) notifyDemoChange();
  return ok;
}
export function listEmergencyContacts(): EmergencyContact[] {
  const value: unknown = readJson<unknown>(EMERGENCY_KEY, SEED_EMERGENCY);
  return Array.isArray(value) ? (value as EmergencyContact[]) : SEED_EMERGENCY;
}
export function saveEmergencyContacts(items: EmergencyContact[]) {
  const ok = writeJson(EMERGENCY_KEY, items);
  if (ok) notifyDemoChange();
  return ok;
}
export function signupUser(input: {
  name: string;
  email: string;
  neighborhood: string;
  password: string;
}): User {
  if (input.name.trim().length < 2) throw new Error("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(input.email.trim()))
    throw new Error("Enter a valid email address.");
  if (input.password.length < 8) throw new Error("Use a password with at least 8 characters.");
  if (findUserByEmail(input.email)) throw new Error("An account already uses that email.");
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    neighborhood: input.neighborhood,
    role: "resident",
    joinedAt: new Date().toISOString(),
    active: true,
    password: input.password,
  };
  const users = listUsers();
  if (!saveUsers([...users, user]))
    throw new Error("Browser storage is unavailable. Enable site storage and try again.");
  return user;
}
export function loginUser(email: string, password: string): User {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) throw new Error("Email or password is incorrect.");
  if (!user.active) throw new Error("This account is inactive. Contact the demo administrator.");
  return user;
}
export function changeUserRole(userId: string, role: User["role"], actingUserId: string) {
  const users = listUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) throw new Error("User not found.");
  if (userId === actingUserId && role !== "admin")
    throw new Error("You cannot remove your own admin role.");
  if (
    target.role === "admin" &&
    role !== "admin" &&
    users.filter((user) => user.role === "admin" && user.active).length <= 1
  )
    throw new Error("At least one active administrator is required.");
  if (!saveUsers(users.map((user) => (user.id === userId ? { ...user, role } : user))))
    throw new Error("Could not save changes in browser storage.");
}
export function setUserActive(userId: string, active: boolean, actingUserId: string) {
  const users = listUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) throw new Error("User not found.");
  if (
    !active &&
    target.role === "admin" &&
    users.filter((user) => user.role === "admin" && user.active).length <= 1
  )
    throw new Error("At least one active administrator is required.");
  if (!active && userId === actingUserId)
    throw new Error("You cannot deactivate your own account.");
  saveUsers(users.map((user) => (user.id === userId ? { ...user, active } : user)));
}
export function deleteUser(userId: string, actingUserId: string) {
  const users = listUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) throw new Error("User not found.");
  if (userId === actingUserId) throw new Error("You cannot delete your own account.");
  if (
    target.role === "admin" &&
    users.filter((user) => user.role === "admin" && user.active).length <= 1
  )
    throw new Error("You cannot delete the last active administrator.");
  saveUsers(users.filter((user) => user.id !== userId));
}
export function makeReport(input: {
  ownerId: string;
  category: Category;
  neighborhood: string;
  location: string;
  description: string;
  photo?: string;
}): DemoReport {
  const report: DemoReport = {
    ...input,
    id: `UN-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
    date: new Date().toISOString(),
    status: "Submitted",
    internalNote: "",
  };
  const reports = listReports();
  if (!writeJson(REPORTS_KEY, [...reports, report]))
    throw new Error("Browser storage is full or unavailable. Try a smaller photo.");
  notifyDemoChange();
  return report;
}
export function changeReportStatus(id: string, status: Status) {
  const reports = listReports();
  if (!saveReports(reports.map((report) => (report.id === id ? { ...report, status } : report))))
    throw new Error("Could not save status in browser storage.");
}
export function editReport(
  id: string,
  changes: Partial<Pick<DemoReport, "internalNote" | "status">>,
) {
  const reports = listReports();
  saveReports(reports.map((report) => (report.id === id ? { ...report, ...changes } : report)));
}
export function deleteReport(id: string) {
  saveReports(listReports().filter((report) => report.id !== id));
}
export function resetDemoData() {
  try {
    const storage = browserStorage();
    if (!storage) return false;
    [USERS_KEY, SESSION_KEY, REPORTS_KEY, ANNOUNCEMENTS_KEY, EMERGENCY_KEY].forEach((key) =>
      storage.removeItem(key),
    );
  } catch {
    return false;
  }
  saveUsers([DEMO_ADMIN]);
  saveAnnouncements(SEED_ANNOUNCEMENTS);
  saveEmergencyContacts(SEED_EMERGENCY);
  saveReports(SEED_REPORTS);
  return true;
}
