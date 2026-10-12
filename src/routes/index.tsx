import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Droplets,
  MapPin,
  Megaphone,
  Siren,
  Map,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  ANNOUNCEMENTS,
  NEIGHBORHOODS,
  filterByHood,
  WEATHER,
  useNeighborhood,
  useReports,
} from "@/lib/data";
import { DemoBadge, input, btnOutline } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — UNISON" },
      {
        name: "description",
        content: "Your neighborhood at a glance: weather, report summaries and announcements.",
      },
      { property: "og:title", content: "Dashboard — UNISON" },
      {
        property: "og:description",
        content: "Your neighborhood at a glance: weather, report summaries and announcements.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [hood, setHood] = useNeighborhood();
  const { reports: all, loading, isRefetching, lastUpdated, error, refresh } = useReports();
  const reports = filterByHood(all, hood);
  const w = WEATHER[hood] ?? { temp: 29, cond: "Partly cloudy", humidity: 68 };
  const pending = reports.filter((r) => r.status !== "Resolved").length;
  const resolved = reports.length - pending;

  const stats = [
    {
      label: "Total reports",
      value: reports.length,
      icon: ClipboardList,
      accent: "text-primary",
      bg: "bg-primary/15",
    },
    {
      label: "Pending issues",
      value: pending,
      icon: AlertTriangle,
      accent: "text-amber-600",
      bg: "bg-amber-500/15",
    },
    {
      label: "Resolved issues",
      value: resolved,
      icon: CheckCircle2,
      accent: "text-teal-600",
      bg: "bg-teal-500/15",
    },
  ];

  const actions = [
    {
      to: "/report",
      label: "Report a Problem",
      desc: "Submit a new neighborhood complaint with photo",
      icon: Megaphone,
    },
    {
      to: "/track",
      label: "Track & Browse Complaints",
      desc: "Search reference IDs and browse public community reports",
      icon: Search,
    },
    {
      to: "/map",
      label: "Community Map",
      desc: "View reported issues on the neighborhood map",
      icon: Map,
    },
    {
      to: "/emergency",
      label: "Emergency Services",
      desc: "Quick emergency helpline numbers and nearest facilities",
      icon: Siren,
    },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Prototype Context Banner */}
      <div className="card-base border-primary/20 bg-background p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              IDT Prototype & Concept Demo
            </p>
            <p className="text-xs sm:text-sm text-foreground/80">
              UN SDG 11: Sustainable Cities. Complaints are stored in a demo prototype database.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] font-medium text-muted-foreground">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => void refresh()}
            disabled={isRefetching}
            className={`${btnOutline} min-h-[38px] px-3.5 py-1.5 text-xs`}
            title="Refresh community report statistics"
          >
            <RefreshCw size={13} className={isRefetching ? "animate-spin text-primary" : ""} />
            {isRefetching ? "Syncing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Hero Welcome & Weather Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="card-base p-6 sm:p-8 md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              👋 Welcome, Neighbor
            </span>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl text-foreground tracking-tight leading-tight">
              Building a cleaner, safer community together
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Report local civic infrastructure defects, browse verified neighborhood issues, and
              track resolutions.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
            <label className="block text-sm font-semibold text-foreground">
              <span className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                <MapPin size={14} className="text-primary" /> Active Neighborhood Filter
              </span>
              <select
                className={`${input} max-w-xs font-semibold`}
                value={hood}
                onChange={(e) => setHood(e.target.value)}
                aria-label="Filter active neighborhood"
              >
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Link
              to="/report"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[6px_6px_14px_rgba(108,99,255,0.35),-4px_-4px_10px_rgba(255,255,255,0.7)] hover:opacity-95 transition"
            >
              <Megaphone size={16} /> File New Complaint
            </Link>
          </div>
        </div>

        {/* Weather Card */}
        <div className="card-base p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Local Weather
              </span>
              <DemoBadge>Sample Weather</DemoBadge>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-background shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.9)]">
                <CloudSun size={36} className="text-primary" />
              </div>
              <div>
                <p className="text-4xl font-extrabold tracking-tight text-foreground">{w.temp}°C</p>
                <p className="text-sm font-medium text-muted-foreground">{w.cond}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border/40">
            <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Droplets size={14} className="text-primary" /> Humidity: {w.humidity}% · {hood}
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Complaint Overview for <span className="text-primary">{hood}</span>
          </h2>
          <DemoBadge>Prototype Store</DemoBadge>
        </div>

        {error && (
          <div
            className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card-base p-5 flex items-center gap-4">
              <span
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${s.bg} ${s.accent}`}
              >
                <s.icon size={26} />
              </span>
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-foreground">
                  {loading ? "…" : s.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="card-base p-5 flex flex-col justify-between gap-3 group transition-all duration-200 hover:-translate-y-1 hover:border-primary/50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-[4px_4px_10px_rgba(108,99,255,0.35),-3px_-3px_8px_rgba(255,255,255,0.7)] group-hover:scale-105 transition">
                  <a.icon size={22} />
                </span>
                <span className="font-bold text-foreground group-hover:text-primary transition leading-tight">
                  {a.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Recent Announcements <DemoBadge>Sample Notices</DemoBadge>
            </h2>
            <p className="text-xs text-muted-foreground">Civic maintenance alerts for residents</p>
          </div>
          <Link to="/announcements" className="text-sm font-bold text-primary hover:underline">
            View all ({ANNOUNCEMENTS.length}) →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} className="card-base p-5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {a.type} · {a.date}
                </p>
                <h3 className="mt-1.5 text-base font-bold text-foreground">{a.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-3">
                  {a.body}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Demo notice · Fictional schedule
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
