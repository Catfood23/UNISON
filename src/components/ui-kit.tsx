import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Clock, CheckCircle2, AlertCircle, Wrench, Info, Sparkles } from "lucide-react";
import type { Status } from "@/lib/data";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/report", label: "Report" },
  { to: "/track", label: "Track & Browse" },
  { to: "/map", label: "Map" },
  { to: "/emergency", label: "Emergency" },
  { to: "/announcements", label: "Announcements" },
  { to: "/admin", label: "Admin" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          aria-label="UNISON — Different Minds. One Vision."
          className="flex items-center gap-3 group"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-background shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.9)] border border-white/60 transition group-hover:scale-105">
            <img src="/unison-mark.svg" alt="UNISON Logo" className="h-7 w-7 shrink-0" />
          </div>
          <span className="flex flex-col leading-none">
            <span
              className="text-xl font-extrabold tracking-tight flex items-center gap-1.5"
              aria-label="UNISON"
            >
              <span className="text-[#8111a4]">U</span>
              <span className="text-[#e43d32]">N</span>
              <span className="text-[#f17800]">I</span>
              <span className="text-[#f1bd00]">S</span>
              <span className="text-[#36a92d]">O</span>
              <span className="text-[#138fc2]">N</span>
              <span className="ml-1 rounded-md bg-[#6C63FF]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6C63FF]">
                Prototype
              </span>
            </span>
            <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground">
              Different Minds. One Vision.
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main Navigation">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="min-h-[40px] inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-medium text-foreground/80 transition-all hover:text-primary hover:shadow-[3px_3px_8px_rgba(163,177,198,0.5),-3px_-3px_8px_rgba(255,255,255,0.85)] focus-visible:outline-2 focus-visible:outline-primary"
              activeProps={{
                className:
                  "shadow-[inset_2px_2px_5px_rgba(163,177,198,0.65),inset_-2px_-2px_5px_rgba(255,255,255,0.95)] text-primary font-semibold bg-background",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          className="lg:hidden grid h-11 w-11 place-items-center rounded-2xl bg-background shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.65)] text-foreground transition"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav
          id="mobile-nav"
          className="grid gap-1.5 border-t border-border/40 bg-background/95 p-4 lg:hidden backdrop-blur-md"
          aria-label="Mobile Navigation"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="min-h-[44px] flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/90 transition hover:bg-muted"
              activeProps={{
                className:
                  "shadow-[inset_2px_2px_5px_rgba(163,177,198,0.65),inset_-2px_-2px_5px_rgba(255,255,255,0.95)] text-primary font-semibold bg-background",
              }}
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
    <footer className="mt-20 border-t border-border/50 bg-background/80 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="card-base p-6 text-center text-sm text-muted-foreground sm:p-8">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={13} /> Educational Prototype
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38B2AC]/15 px-3 py-1 text-xs font-semibold text-[#2C7A7B]">
              UN SDG 11: Sustainable Cities
            </span>
          </div>
          <p className="font-semibold text-foreground">UNISON — Different Minds. One Vision.</p>
          <p className="mt-1 text-xs sm:text-sm">
            Developed for an Innovation & Design Thinking (IDT) college project. Reports submitted
            here are stored in a demo prototype database and are{" "}
            <strong className="text-foreground">not</strong> transmitted to any real municipal
            authority.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function DemoBadge({
  children = "Sample Data",
  variant = "sample",
}: {
  children?: ReactNode;
  variant?: "sample" | "prototype" | "simulated";
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-white/60 bg-background shadow-[inset_1px_1px_3px_rgba(163,177,198,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] text-muted-foreground"
      title="This information is demonstration content for this educational prototype."
    >
      <Info size={11} className="text-primary/70" />
      {children}
    </span>
  );
}

const STATUS_CONFIG: Record<
  Status,
  { bg: string; text: string; border: string; icon: typeof CheckCircle2 }
> = {
  Submitted: {
    bg: "bg-slate-200/80",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: Clock,
  },
  Verified: {
    bg: "bg-blue-100/90",
    text: "text-blue-800",
    border: "border-blue-300",
    icon: AlertCircle,
  },
  "In Progress": {
    bg: "bg-amber-100/90",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: Wrench,
  },
  Resolved: {
    bg: "bg-teal-100/90",
    text: "text-teal-800",
    border: "border-teal-300",
    icon: CheckCircle2,
  },
};

export function StatusPill({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Submitted;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.text} border ${cfg.border} shadow-sm`}
    >
      <Icon size={12} aria-hidden />
      {status}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <span className="text-xs font-medium text-muted-foreground">Loading information…</span>
    </div>
  );
}

export const btn =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[6px_6px_14px_rgba(108,99,255,0.35),-4px_-4px_10px_rgba(255,255,255,0.7)] hover:opacity-95 active:translate-y-0.5 active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:pointer-events-none";

export const btnOutline =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-background border border-white/60 px-5 py-2.5 text-sm font-semibold text-foreground shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.85)] hover:shadow-[6px_6px_14px_rgba(163,177,198,0.7),-6px_-6px_14px_rgba(255,255,255,0.95)] active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.6)] transition-all disabled:opacity-50";

export const btnSecondary = btnOutline;

export const input =
  "w-full min-h-[44px] rounded-2xl bg-background px-4 py-2.5 text-sm text-foreground shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] outline-none border border-transparent focus:border-primary/40 focus:ring-2 focus:ring-primary/40 transition-all";
