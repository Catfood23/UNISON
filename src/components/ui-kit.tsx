import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import type { Status } from "@/lib/data";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/report", label: "Report" },
  { to: "/track", label: "Track" },
  { to: "/map", label: "Map" },
  { to: "/emergency", label: "Emergency" },
  { to: "/announcements", label: "Announcements" },
  { to: "/admin", label: "Admin" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          aria-label="UNISON — Different Minds. One Vision."
          className="flex items-center gap-2.5"
        >
          <img src="/unison-mark.svg" alt="" className="h-10 w-10 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tight" aria-label="UNISON">
              <span className="text-[#8111a4]">U</span>
              <span className="text-[#e43d32]">N</span>
              <span className="text-[#f17800]">I</span>
              <span className="text-[#f1bd00]">S</span>
              <span className="text-[#36a92d]">O</span>
              <span className="text-[#138fc2]">N</span>
            </span>
            <span className="mt-1 text-[9px] font-medium tracking-wide text-muted-foreground">
              Different Minds. One Vision.
            </span>
          </span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden rounded-lg p-2 hover:bg-secondary"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="grid gap-1 border-t px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">
          UNISON — Different Minds. One Vision.
        </strong>{" "}
        An educational prototype for an IDT group project (UN SDG 11: Sustainable Cities and
        Communities). Reports are stored by the UNISON demo server and are <strong>not</strong> sent
        to any real municipality.
      </div>
    </footer>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function DemoBadge({ children = "Demo data" }: { children?: ReactNode }) {
  return (
    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
      {children}
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  Submitted: "bg-muted text-muted-foreground",
  Verified: "bg-info/15 text-info",
  "In Progress": "bg-warning/20 text-foreground",
  Resolved: "bg-accent text-accent-foreground",
};
export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-primary" />
    </div>
  );
}

export const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50";
export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary";
export const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
