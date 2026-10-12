import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { loadReport, type PublicReport } from "@/lib/data";
import { PageTitle, Spinner, StatusPill, input } from "@/components/ui-kit";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => {
    const id = typeof s["id"] === "string" ? s["id"].trim().toUpperCase() : "";
    return /^UN-[A-Z0-9-]{6,40}$/u.test(id) ? { id } : {};
  },
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
  const { id: searchId } = Route.useSearch();
  const [reference, setReference] = useState(searchId ?? "");
  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!searchId) {
      setReport(null);
      setError("");
      return;
    }
    let active = true;
    setReference(searchId);
    setLoading(true);
    setError("");
    void loadReport(searchId)
      .then((found) => {
        if (active) setReport(found);
      })
      .catch((cause: unknown) => {
        if (active) {
          setReport(null);
          setError(cause instanceof Error ? cause.message : "Could not find that report.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchId]);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const id = reference.trim().toUpperCase();
    if (!/^UN-[A-Z0-9-]{6,40}$/u.test(id)) {
      setReport(null);
      setError("Enter the report reference ID shown after submission.");
      return;
    }
    void navigate({ search: { id } });
  };

  return (
    <div>
      <PageTitle
        title="Track a Report"
        subtitle="Use your reference ID to check the latest status."
      />
      <form
        onSubmit={search}
        className="card-base mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-sm font-semibold">
          Report reference ID
          <input
            className={`${input} mt-1 font-mono uppercase`}
            value={reference}
            maxLength={43}
            placeholder="UN-XXXXXXXXXXXX"
            onChange={(event) => setReference(event.target.value)}
          />
        </label>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          disabled={loading}
        >
          <Search size={16} aria-hidden /> {loading ? "Searching…" : "Check status"}
        </button>
      </form>
      {error && (
        <p
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {loading ? (
        <Spinner />
      ) : report ? (
        <article className="card-base flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-bold">{report.category}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.neighborhood ?? "Neighborhood not listed"}
            </p>
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar size={13} aria-hidden /> {new Date(report.date).toLocaleDateString()} ·{" "}
              <span className="font-mono">{report.id}</span>
            </p>
          </div>
          <StatusPill status={report.status} />
        </article>
      ) : null}
      <p className="mt-6 text-xs text-muted-foreground">
        Report descriptions, locations, and photos are visible only to signed-in administrators.
      </p>
    </div>
  );
}
