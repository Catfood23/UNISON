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
} from "lucide-react";
import {
  ANNOUNCEMENTS,
  NEIGHBORHOODS,
  filterByHood,
  WEATHER,
  useNeighborhood,
  useReports,
} from "@/lib/data";
import { DemoBadge, input } from "@/components/ui-kit";

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
  const { reports: all, loading, error } = useReports();
  const reports = filterByHood(all, hood);
  const w = WEATHER[hood] ?? { temp: 29, cond: "Partly cloudy", humidity: 68 };
  const pending = reports.filter((r) => r.status !== "Resolved").length;
  const resolved = reports.length - pending;

  const stats = [
    { label: "Total reports", value: reports.length, icon: ClipboardList },
    { label: "Pending issues", value: pending, icon: AlertTriangle },
    { label: "Resolved issues", value: resolved, icon: CheckCircle2 },
  ];
  const actions = [
    { to: "/report", label: "Report a Problem", icon: Megaphone },
    { to: "/map", label: "Community Map", icon: Map },
    { to: "/emergency", label: "Emergency Services", icon: Siren },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card-base bg-secondary p-6 md:col-span-2">
          <p className="text-sm font-semibold text-primary">Welcome, neighbor 👋</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Building a cleaner, safer community together
          </h1>
          <label className="mt-5 block text-sm font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> Your neighborhood
            </span>
            <select
              className={`${input} mt-1 max-w-xs`}
              value={hood}
              onChange={(e) => setHood(e.target.value)}
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Weather</span>
            <DemoBadge>Sample</DemoBadge>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <CloudSun size={48} className="text-primary" />
            <div>
              <p className="text-4xl font-bold">{w.temp}°C</p>
              <p className="text-muted-foreground">{w.cond}</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <Droplets size={14} /> Humidity {w.humidity}%
          </p>
        </div>
      </section>

      <p className="-mb-4 text-sm text-muted-foreground">
        Report summary for <strong>{hood}</strong>
      </p>
      {error && (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-base flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <s.icon />
            </span>
            <div>
              <p className="text-3xl font-bold">{loading ? "…" : s.value}</p>
              <p className="text-sm text-muted-foreground">
                {s.label} <span className="sr-only">in {hood}</span>
              </p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="card-base flex items-center gap-3 p-5 font-semibold transition hover:-translate-y-0.5 hover:border-primary"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                <a.icon size={20} />
              </span>
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Recent announcements <DemoBadge />
          </h2>
          <Link to="/announcements" className="text-sm font-semibold text-primary">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} className="card-base p-5">
              <p className="text-xs font-semibold uppercase text-primary">
                {a.type} · {a.date}
              </p>
              <h3 className="mt-1 font-bold">{a.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
