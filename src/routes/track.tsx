import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Inbox, MapPin, Trash2 } from "lucide-react";
import { STATUSES, loadReports, saveReports, useReports, type Status } from "@/lib/data";
import { PageTitle, Spinner, StatusPill, btn } from "@/components/ui-kit";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Complaints — Smart Community" },
      { name: "description", content: "View and filter submitted complaints by status." },
      { property: "og:title", content: "Track Complaints — Smart Community" },
      { property: "og:description", content: "View and filter submitted complaints by status." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { reports, loading } = useReports();
  const [filter, setFilter] = useState<Status | "All">("All");
  const list = filter === "All" ? reports : reports.filter((r) => r.status === filter);

  const advance = (id: string) =>
    saveReports(loadReports().map((r) => r.id === id ? { ...r, status: STATUSES[Math.min(STATUSES.indexOf(r.status) + 1, 3)] } : r));
  const remove = (id: string) => saveReports(loadReports().filter((r) => r.id !== id));

  return (
    <div>
      <PageTitle title="Track Complaints" subtitle="Complaints saved in this browser. Use “Advance status” to simulate progress during the demo." />
      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${filter === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{s}</button>
        ))}
      </div>
      {loading ? <Spinner /> : list.length === 0 ? (
        <div className="card-base p-10 text-center">
          <Inbox size={44} className="mx-auto text-muted-foreground" />
          <p className="mt-3 font-semibold">No complaints {filter !== "All" && `with status “${filter}”`} yet</p>
          <Link to="/report" className={`${btn} mt-4`}>Report a Problem</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => (
            <article key={r.id} className="card-base flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold">{r.category}</h3>
                  <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><MapPin size={14} className="shrink-0" /> {r.location}</p>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="mt-3 text-sm">{r.description}</p>
              {r.photo && <img src={r.photo} alt="Reported issue" className="mt-3 h-36 w-full rounded-xl object-cover" />}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(r.date).toLocaleDateString()} · <span className="font-mono">{r.id}</span></span>
                <span className="flex gap-2">
                  {r.status !== "Resolved" && <button onClick={() => advance(r.id)} className="font-semibold text-primary hover:underline">Advance status</button>}
                  <button onClick={() => remove(r.id)} aria-label="Delete" className="hover:text-destructive"><Trash2 size={15} /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
