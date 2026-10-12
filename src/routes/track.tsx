import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { STATUSES } from "@/lib/report-model";
import { useReports } from "@/lib/data";
import { PageTitle, Spinner, StatusPill, input } from "@/components/ui-kit";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => {
    const id = typeof s["id"] === "string" ? s["id"].trim().toUpperCase() : "";
    return /^UN-[A-Z0-9-]{6,40}$/u.test(id) ? { id } : {};
  },
  head: () => ({
    meta: [
      { title: "My Reports — UNISON" },
      { name: "description", content: "View and filter your own demo reports." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { id: searchId } = Route.useSearch();
  const { reports, loading } = useReports();
  const [reference, setReference] = useState(searchId ?? "");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const navigate = Route.useNavigate();
  useEffect(() => {
    if (searchId) {
      setReference(searchId);
      setSelectedId(searchId);
    }
  }, [searchId]);
  const visible = useMemo(
    () => reports.filter((report) => filter === "All" || report.status === filter),
    [filter, reports],
  );
  const selected = reports.find((report) => report.id === selectedId);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const id = reference.trim().toUpperCase();
    if (!/^UN-[A-Z0-9-]{6,40}$/u.test(id)) {
      setError("Enter the report reference ID shown after submission.");
      return;
    }
    if (!reports.some((report) => report.id === id)) {
      setError("That report is not part of your account in this browser.");
      return;
    }
    setError("");
    setSelectedId(id);
    void navigate({ search: { id } });
  };
  return (
    <div>
      <PageTitle
        title="My Reports"
        subtitle="Only reports submitted from your account in this browser appear here."
      />
      <form
        onSubmit={search}
        className="card-base mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-sm font-semibold">
          Find by reference ID
          <input
            className={`${input} mt-1 min-h-11 font-mono uppercase`}
            value={reference}
            maxLength={43}
            placeholder="UN-XXXXXXXXXX"
            onChange={(event) => setReference(event.target.value)}
          />
        </label>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">
          <Search size={16} />
          Find report
        </button>
      </form>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">Your submissions ({visible.length})</h2>
        <label className="text-sm font-semibold">
          Filter status
          <select
            className="ml-2 min-h-11 rounded-xl border bg-background px-3"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <div className="card-base p-8 text-center">
          <p className="text-muted-foreground">
            {reports.length
              ? "No reports match this status."
              : "You have not submitted a report yet."}
          </p>
          <a href="/report" className="mt-3 inline-block font-semibold text-primary">
            Submit your first report
          </a>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((report) => (
            <article
              key={report.id}
              className={`card-base cursor-pointer p-4 transition hover:border-primary ${report.id === selectedId ? "border-primary ring-1 ring-primary" : ""}`}
              onClick={() => setSelectedId(report.id)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{report.category}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.location} · {report.neighborhood}
                  </p>
                </div>
                <StatusPill status={report.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm">{report.description}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar size={13} />
                {new Date(report.date).toLocaleDateString()} ·{" "}
                <span className="font-mono">{report.id}</span>
              </p>
              {report.id === selectedId && (
                <p className="mt-3 border-t pt-3 text-sm font-medium">
                  Current status: {report.status}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      {selected && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Selected report {selected.id} · {selected.status}
        </p>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Demo reports are saved only in this browser. Status changes are managed in the demo admin
        workspace and update here immediately.
      </p>
    </div>
  );
}
