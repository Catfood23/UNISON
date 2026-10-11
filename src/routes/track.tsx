import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Inbox, MapPin, Trash2 } from "lucide-react";
import {
  ALL_HOODS, NEIGHBORHOODS, STATUSES, filterByHood, loadReports, saveReports, useNeighborhood, useReports, type Status,
} from "@/lib/data";
import { PageTitle, Spinner, StatusPill, btn, input } from "@/components/ui-kit";

type Filter = Status | "All";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { status?: Filter } =>
    (STATUSES as readonly string[]).includes(String(s.status)) ? { status: s.status as Status } : {},
  head: () => ({
    meta: [
      { title: "Track Complaints — UNISON" },
      { name: "description", content: "View and filter submitted complaints by status." },
      { property: "og:title", content: "Track Complaints — UNISON" },
      { property: "og:description", content: "View and filter submitted complaints by status." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { reports, loading } = useReports();
  const [hood, setHood] = useNeighborhood();
  const filter: Filter = Route.useSearch().status ?? "All";
  const navigate = Route.useNavigate();
  const byHood = filterByHood(reports, hood);
  const list = filter === "All" ? byHood : byHood.filter((r) => r.status === filter);

  const advance = (id: string) =>
    saveReports(loadReports().map((r) => r.id === id ? { ...r, status: STATUSES[Math.min(STATUSES.indexOf(r.status) + 1, 3)] ?? "Resolved" } : r));
  const remove = (id: string) => {
    if (window.confirm(`Delete complaint ${id}? This cannot be undone.`)) saveReports(loadReports().filter((r) => r.id !== id));
  };

  return (
    <div>
      <PageTitle title="Track Complaints" subtitle="Complaints saved in this browser." />
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-semibold">Neighborhood
          <select className={`${input} mt-1 max-w-xs`} value={hood} onChange={(e) => setHood(e.target.value)}>
            {[ALL_HOODS, ...NEIGHBORHOODS].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(["All", ...STATUSES] as const).map((s) => (
          <button key={s} aria-pressed={filter === s} onClick={() => navigate({ search: s === "All" ? {} : { status: s } })}
            className={`min-h-11 rounded-full border px-4 py-1.5 text-sm font-medium ${filter === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{s}</button>
        ))}
      </div>
      {loading ? <Spinner /> : list.length === 0 ? (
        <div className="card-base p-10 text-center">
          <Inbox size={44} className="mx-auto text-muted-foreground" aria-hidden />
          <p className="mt-3 font-semibold">No complaints {filter !== "All" && `with status “${filter}”`} yet</p>
          <Link to="/report" className={`${btn} mt-4`}>Report a Problem</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => (
            <article key={r.id} className="card-base flex min-w-0 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-bold">{r.category}</h2>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={14} className="shrink-0" aria-hidden /> <span className="break-words min-w-0">{r.location}{r.neighborhood && ` · ${r.neighborhood}`}</span></p>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="mt-3 whitespace-pre-line break-words text-sm">{r.description}</p>
              {r.photo && <img src={r.photo} alt={`Photo of ${r.category.toLowerCase()} at ${r.location}`} className="mt-3 h-36 w-full rounded-xl object-cover" />}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={13} aria-hidden /> {new Date(r.date).toLocaleDateString()} · <span className="font-mono">{r.id}</span></span>
                <span className="flex items-center gap-2">
                  {r.status !== "Resolved" && (
                    <button onClick={() => advance(r.id)} className="rounded-lg border border-dashed px-2 py-1 font-semibold text-primary hover:bg-secondary" title="Demo only: simulates the municipality updating the status">
                      Demo control: advance status
                    </button>
                  )}
                  <button onClick={() => remove(r.id)} aria-label={`Delete complaint ${r.id}`} className="grid min-h-9 min-w-9 place-items-center rounded-lg hover:text-destructive"><Trash2 size={15} /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">“Demo control” buttons exist only for the presentation. In a real system, only verified officials could change a complaint's status.</p>
    </div>
  );
}
