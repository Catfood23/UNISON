import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  CATEGORIES,
  NEIGHBORHOODS,
  STATUSES,
  useReports,
  loadReport,
  type Category,
  type PublicReport,
  type Status,
} from "@/lib/data";
import {
  PageTitle,
  Spinner,
  StatusPill,
  DemoBadge,
  input,
  btn,
  btnOutline,
} from "@/components/ui-kit";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => {
    const id = typeof s["id"] === "string" ? s["id"].trim().toUpperCase() : "";
    return /^UN-[A-Z0-9-]{6,40}$/u.test(id) ? { id } : {};
  },
  head: () => ({
    meta: [
      { title: "Track & Browse Complaints — UNISON" },
      {
        name: "description",
        content:
          "Search your reference ID and browse community complaints with real-time status filtering.",
      },
      { property: "og:title", content: "Track & Browse Complaints — UNISON" },
      {
        property: "og:description",
        content:
          "Search your reference ID and browse community complaints with real-time status filtering.",
      },
    ],
  }),
  component: TrackAndBrowsePage,
});

const PAGE_SIZE = 6;

function TrackAndBrowsePage() {
  const { id: searchId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { reports, loading, isRefetching, lastUpdated, error: listError, refresh } = useReports();

  // Search and filter states
  const [directRef, setDirectRef] = useState(searchId ?? "");
  const [trackedReport, setTrackedReport] = useState<PublicReport | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [hoodFilter, setHoodFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "status">("newest");
  const [expandedId, setExpandedId] = useState<string | null>(searchId ?? null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If searchId exists in URL, load direct tracking
  useEffect(() => {
    if (!searchId) {
      setTrackedReport(null);
      setTrackingError("");
      return;
    }
    let active = true;
    setDirectRef(searchId);
    setTrackingLoading(true);
    setTrackingError("");

    void loadReport(searchId)
      .then((found) => {
        if (active) {
          setTrackedReport(found);
          setExpandedId(found.id);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setTrackedReport(null);
          setTrackingError(
            cause instanceof Error
              ? cause.message
              : "Could not find a report with that reference ID.",
          );
        }
      })
      .finally(() => {
        if (active) setTrackingLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchId]);

  const handleDirectSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = directRef.trim().toUpperCase();
    if (!/^UN-[A-Z0-9-]{6,40}$/u.test(clean)) {
      setTrackedReport(null);
      setTrackingError("Please enter a valid reference ID starting with 'UN-'.");
      return;
    }
    void navigate({ search: { id: clean } });
  };

  const copyRef = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and sort public complaints list
  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => {
        const matchesQuery =
          !q ||
          r.id.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.neighborhood && r.neighborhood.toLowerCase().includes(q));

        const matchesStatus = statusFilter === "All" || r.status === statusFilter;
        const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
        const matchesHood =
          hoodFilter === "All" || !r.neighborhood || r.neighborhood === hoodFilter;

        return matchesQuery && matchesStatus && matchesCategory && matchesHood;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "status") {
          const rank: Record<Status, number> = {
            Submitted: 1,
            Verified: 2,
            "In Progress": 3,
            Resolved: 4,
          };
          return (rank[a.status] ?? 0) - (rank[b.status] ?? 0);
        }
        return 0;
      });
  }, [reports, query, statusFilter, categoryFilter, hoodFilter, sortBy]);

  const displayedReports = filteredReports.slice(0, visibleCount);

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setHoodFilter("All");
    setSortBy("newest");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-10">
      <PageTitle
        title="Complaint Tracking & Community Issues"
        subtitle="Track your specific complaint reference or explore reported issues across neighborhoods."
        actions={
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Synced at {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => void refresh()}
              disabled={isRefetching}
              className={`${btnOutline} min-h-[40px] px-3.5 py-1.5 text-xs`}
            >
              <RefreshCw size={14} className={isRefetching ? "animate-spin text-primary" : ""} />
              {isRefetching ? "Syncing…" : "Refresh List"}
            </button>
          </div>
        }
      />

      {/* Direct Reference Search Bar */}
      <section className="card-base p-6 sm:p-7">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Search size={18} className="text-primary" /> Track by Reference ID
          </h2>
          <DemoBadge>Instant Status</DemoBadge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          Enter the reference ID (e.g.,{" "}
          <code className="font-mono text-primary font-bold">UN-XXXXXXXX</code>) given when your
          report was submitted.
        </p>

        <form onSubmit={handleDirectSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              className={`${input} font-mono uppercase tracking-wider pl-4`}
              placeholder="UN-XXXXXXXXXXXXXXXX"
              value={directRef}
              onChange={(e) => setDirectRef(e.target.value)}
              aria-label="Complaint Reference ID"
              maxLength={42}
            />
          </div>
          <button type="submit" className={`${btn} min-w-[140px]`} disabled={trackingLoading}>
            <Search size={16} />
            {trackingLoading ? "Searching…" : "Track Issue"}
          </button>
        </form>

        {trackingError && (
          <div
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs sm:text-sm text-destructive font-medium"
            role="alert"
          >
            {trackingError}
          </div>
        )}

        {/* Focused Tracked Report Banner */}
        {trackedReport && (
          <div className="mt-6 rounded-2xl border border-primary/40 bg-background p-5 sm:p-6 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.85)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles size={13} /> Active Reference Match
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-foreground">
                  {trackedReport.id}
                </span>
              </div>
              <StatusPill status={trackedReport.status} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Issue Category</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{trackedReport.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Neighborhood</p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {trackedReport.neighborhood ?? "Unspecified Area"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Date Logged</p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {new Date(trackedReport.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="mt-6 pt-4 border-t border-border/30">
              <p className="text-xs font-bold text-foreground mb-3">Resolution Progress Timeline</p>
              <TimelineStepper currentStatus={trackedReport.status} />
            </div>
          </div>
        )}
      </section>

      {/* Community Complaints Explorer */}
      <section className="space-y-6">
        <div className="card-base p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <Filter size={20} className="text-primary" /> Browse Community Complaints
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Public feed of neighborhood defects reported across all demo sectors
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Showing {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "report" : "reports"}
              </span>
              <DemoBadge>Public Records</DemoBadge>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Keyword Search
              </label>
              <input
                type="text"
                className={input}
                placeholder="Search reference, type…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                className={input}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className={input}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Neighborhood Filter & Sort */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Neighborhood
              </label>
              <select
                className={input}
                value={hoodFilter}
                onChange={(e) => {
                  setHoodFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option value="All">All Neighborhoods</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort bar & Active filter indicators */}
          <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground">Sort by:</span>
              {(["newest", "oldest", "status"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`rounded-xl px-3 py-1.5 font-semibold transition ${
                    sortBy === s
                      ? "bg-primary text-white shadow-sm"
                      : "bg-background text-foreground/80 hover:bg-muted"
                  }`}
                >
                  {s === "newest" ? "Newest First" : s === "oldest" ? "Oldest First" : "By Status"}
                </button>
              ))}
            </div>

            {(query ||
              statusFilter !== "All" ||
              categoryFilter !== "All" ||
              hoodFilter !== "All") && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-primary hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <Spinner />
        ) : listError ? (
          <div className="card-base p-8 text-center" role="alert">
            <ShieldAlert size={36} className="mx-auto text-destructive" />
            <h3 className="mt-2 text-base font-bold text-foreground">Could not load complaints</h3>
            <p className="mt-1 text-sm text-muted-foreground">{listError}</p>
            <button onClick={() => void refresh()} className={`${btnOutline} mt-4`}>
              Try Again
            </button>
          </div>
        ) : displayedReports.length === 0 ? (
          <div className="card-base p-10 text-center space-y-3">
            <CheckCircle2 size={40} className="mx-auto text-muted-foreground/60" />
            <h3 className="text-base font-bold text-foreground">
              No complaints match your filters
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Try adjusting your category, status, or keyword search criteria to see other
              neighborhood issues.
            </p>
            <button onClick={resetFilters} className={`${btnOutline} mt-2`}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedReports.map((report) => {
              const isExpanded = expandedId === report.id;
              return (
                <article
                  key={report.id}
                  className="card-base p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {report.category}
                      </span>
                      <StatusPill status={report.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-foreground bg-background px-2.5 py-1 rounded-lg border border-border/50">
                        {report.id}
                      </span>
                      <button
                        onClick={() => copyRef(report.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                        title="Copy Reference ID"
                        aria-label={`Copy reference ID ${report.id}`}
                      >
                        {copiedId === report.id ? (
                          <Check size={14} className="text-teal-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={13} className="text-primary/70 shrink-0" />
                      {report.neighborhood ?? "Unspecified Area"}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={13} className="text-muted-foreground shrink-0" />
                      Submitted: {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Expandable Stepper Details */}
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-primary hover:text-primary/80 transition"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? "Hide Details" : "View Progress Timeline"}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-border/30">
                        <TimelineStepper currentStatus={report.status} compact />
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Exact citizen contact info and notes are protected for privacy.
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Load More Pagination */}
        {filteredReports.length > visibleCount && (
          <div className="text-center pt-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className={`${btnOutline} min-w-[200px]`}
            >
              Load More Issues ({filteredReports.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Privacy & Prototype Disclaimer Notice */}
        <div className="card-base bg-background p-4 sm:p-5 text-xs text-muted-foreground flex items-start gap-3">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground font-semibold">Civic Privacy Notice:</strong> Public
            complaint listings display the category, sector neighborhood, submission date, and
            progress status. To prevent doxxing or misuse, precise descriptions, personal phone
            numbers, and full-resolution damage photos are strictly accessible only to authorized
            municipal staff via the Admin Dashboard.
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineStepper({
  currentStatus,
  compact = false,
}: {
  currentStatus: Status;
  compact?: boolean;
}) {
  const steps: { status: Status; label: string; desc: string; icon: typeof CheckCircle2 }[] = [
    {
      status: "Submitted",
      label: "Submitted",
      desc: "Logged in community database",
      icon: Clock,
    },
    {
      status: "Verified",
      label: "Verified",
      desc: "Confirmed by civic team",
      icon: AlertCircle,
    },
    {
      status: "In Progress",
      label: "In Progress",
      desc: "Dispatched to repair crew",
      icon: Wrench,
    },
    {
      status: "Resolved",
      label: "Resolved",
      desc: "Fixed and inspected",
      icon: CheckCircle2,
    },
  ];

  const statusOrder: Record<Status, number> = {
    Submitted: 0,
    Verified: 1,
    "In Progress": 2,
    Resolved: 3,
  };
  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-2 sm:grid-cols-4 gap-3"}`}>
      {steps.map((st, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = st.icon;

        return (
          <div
            key={st.status}
            className={`rounded-xl p-2.5 sm:p-3 border transition-all ${
              isCurrent
                ? "border-primary/50 bg-primary/10 shadow-sm"
                : isDone
                  ? "border-border/60 bg-background"
                  : "border-border/30 bg-muted/40 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  isDone ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon size={12} />
              </span>
              <span
                className={`text-xs font-bold ${
                  isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {st.label}
              </span>
            </div>
            {!compact && (
              <p className="mt-1.5 text-[11px] text-muted-foreground leading-tight">{st.desc}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
