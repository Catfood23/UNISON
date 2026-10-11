import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Inbox, MapPin, Trash2 } from "lucide-react";
import {
  ALL_HOODS,
  NEIGHBORHOODS,
  STATUSES,
  filterByHood,
  removeReport,
  updateReport,
  useNeighborhood,
  useReports,
  type Status,
} from "@/lib/data";
import { PageTitle, Spinner, StatusPill, btn, input } from "@/components/ui-kit";

type Filter = Status | "All";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { status?: Filter } =>
    (STATUSES as readonly string[]).includes(String(s["status"]))
      ? { status: s["status"] as Status }
      : {},
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
  const { reports, loading, error: loadError } = useReports();
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [hood, setHood] = useNeighborhood();
  const filter: Filter = Route.useSearch().status ?? "All";
  const navigate = Route.useNavigate();
  const byHood = filterByHood(reports, hood);
  const list = filter === "All" ? byHood : byHood.filter((r) => r.status === filter);

  const advance = async (id: string, currentStatus: Status) => {
    setBusyId(id);
    setActionError("");
    try {
      const nextStatus = STATUSES[Math.min(STATUSES.indexOf(currentStatus) + 1, 3)] ?? "Resolved";
      await updateReport(id, nextStatus);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "The status could not be updated.");
    } finally {
      setBusyId("");
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm(`Delete complaint ${id}? This cannot be undone.`)) return;
    setBusyId(id);
    setActionError("");
    try {
      await removeReport(id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "The report could not be deleted.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <PageTitle title="Track Complaints" subtitle="Complaints saved by the UNISON demo server." />
      {(loadError || actionError) && (
        <p
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {actionError || loadError}
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-semibold">
          Neighborhood
          <select
            className={`${input} mt-1 max-w-xs`}
            value={hood}
            onChange={(e) => setHood(e.target.value)}
          >
            {[ALL_HOODS, ...NEIGHBORHOODS].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            aria-pressed={filter === s}
            onClick={() => navigate({ search: s === "All" ? {} : { status: s } })}
            className={`min-h-11 rounded-full border px-4 py-1.5 text-sm font-medium ${filter === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <Spinner />
      ) : loadError ? null : list.length === 0 ? (
        <div className="card-base p-10 text-center">
          <Inbox size={44} className="mx-auto text-muted-foreground" aria-hidden />
          <p className="mt-3 font-semibold">
            No complaints {filter !== "All" && `with status “${filter}”`} yet
          </p>
          <Link to="/report" className={`${btn} mt-4`}>
            Report a Problem
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => (
            <article key={r.id} className="card-base flex min-w-0 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-bold">{r.category}</h2>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={14} className="shrink-0" aria-hidden />{" "}
                    <span className="break-words min-w-0">
                      {r.location}
                      {r.neighborhood && ` · ${r.neighborhood}`}
                    </span>
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="mt-3 whitespace-pre-line break-words text-sm">{r.description}</p>
              {r.photo && (
                <img
                  src={r.photo}
                  alt={`Photo of ${r.category.toLowerCase()} at ${r.location}`}
                  className="mt-3 h-36 w-full rounded-xl object-cover"
                />
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={13} aria-hidden /> {new Date(r.date).toLocaleDateString()} ·{" "}
                  <span className="font-mono">{r.id}</span>
                </span>
                <span className="flex items-center gap-2">
                  {r.status !== "Resolved" && (
                    <button
                      onClick={() => void advance(r.id, r.status)}
                      disabled={busyId === r.id}
                      className="rounded-lg border border-dashed px-2 py-1 font-semibold text-primary hover:bg-secondary disabled:opacity-50"
                      title="Demo only: simulates the municipality updating the status"
                    >
                      {busyId === r.id ? "Saving…" : "Demo control: advance status"}
                    </button>
                  )}
                  <button
                    onClick={() => void remove(r.id)}
                    disabled={busyId === r.id}
                    aria-label={`Delete complaint ${r.id}`}
                    className="grid min-h-11 min-w-11 place-items-center rounded-lg hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        “Demo control” buttons exist only for the presentation. In a real system, only verified
        officials could change a complaint's status.
      </p>
    </div>
  );
}
