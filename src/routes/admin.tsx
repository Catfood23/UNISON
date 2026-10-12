import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Lock,
  Search,
  ZoomIn,
  X,
  Sparkles,
} from "lucide-react";
import { STATUSES, type Report, type Status } from "@/lib/report-model";
import { dispatchReportsChanged } from "@/lib/data";
import {
  PageTitle,
  Spinner,
  StatusPill,
  DemoBadge,
  input,
  btn,
  btnOutline,
} from "@/components/ui-kit";

type SessionState = "loading" | "unconfigured" | "signed-out" | "signed-in";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — UNISON" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

async function loadAdminReports() {
  const response = await fetch("/api/admin/reports", {
    cache: "no-store",
    credentials: "same-origin",
  });
  const body = (await response.json().catch(() => null)) as Report[] | { error?: string } | null;
  if (!response.ok || !Array.isArray(body)) {
    throw new Error(
      (body && !Array.isArray(body) ? body.error : null) || "Could not load reports.",
    );
  }
  return body;
}

function AdminPage() {
  const [session, setSession] = useState<SessionState>("loading");
  const [reports, setReports] = useState<Report[]>([]);
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, Status>>({});
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activePhoto, setActivePhoto] = useState<{ url: string; id: string } | null>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      setReports(await loadAdminReports());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load reports.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        const state = (await response.json()) as { configured?: boolean; authenticated?: boolean };
        if (!active) return;
        if (!state.configured) setSession("unconfigured");
        else if (!state.authenticated) setSession("signed-out");
        else {
          setSession("signed-in");
          await refresh();
        }
      })
      .catch(() => {
        if (active) {
          setSession("signed-out");
          setError("Could not check the admin session.");
        }
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  const visibleReports = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return reports.filter(
      (report) =>
        !query ||
        [report.id, report.category, report.location, report.neighborhood, report.description].some(
          (value) => value?.toLowerCase().includes(query),
        ),
    );
  }, [filter, reports]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Sign-in failed.");
      setPassword("");
      setSession("signed-in");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.");
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" });
    setReports([]);
    setSession("signed-out");
    setNotice("You are signed out.");
  };

  const updateStatus = async (report: Report) => {
    const status = statusDrafts[report.id] ?? report.status;
    if (status === report.status) return;
    setBusyId(report.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(report.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => ({}))) as Report | { error?: string };
      if (!response.ok || "error" in body)
        throw new Error("error" in body ? body.error : "Status update failed.");
      const updated = body as Report;
      setReports((previous) => previous.map((item) => (item.id === report.id ? updated : item)));
      setNotice(`Report ${report.id} updated to ${status}.`);
      dispatchReportsChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Status update failed.");
    } finally {
      setBusyId("");
    }
  };

  const deleteReport = async (report: Report) => {
    if (
      !window.confirm(`Permanently delete report ${report.id} and move its photo to Drive trash?`)
    )
      return;
    setBusyId(report.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(report.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const body =
        response.status === 204
          ? null
          : ((await response.json().catch(() => ({}))) as { error?: string });
      if (!response.ok) throw new Error(body?.error || "Report could not be deleted.");
      setReports((previous) => previous.filter((item) => item.id !== report.id));
      setNotice(`Report ${report.id} was deleted.`);
      dispatchReportsChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report could not be deleted.");
    } finally {
      setBusyId("");
    }
  };

  if (session === "loading") {
    return (
      <div className="py-16">
        <Spinner />
      </div>
    );
  }

  if (session === "unconfigured") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageTitle
          title="Admin Access Setup Required"
          subtitle="This dashboard is locked until the server admin secret is configured."
        />
        <section className="card-base p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Lock size={18} /> Configuration Required
          </div>
          <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
            In your deployment environment or local{" "}
            <code className="bg-background px-2 py-0.5 rounded font-mono font-bold text-primary">
              .env
            </code>{" "}
            file, set{" "}
            <code className="bg-background px-2 py-0.5 rounded font-mono font-bold text-primary">
              UNISON_ADMIN_PASSWORD
            </code>{" "}
            to a password of at least 24 characters.
          </p>
          <p className="text-xs text-muted-foreground">
            This password authenticates staff to review private descriptions, triage reports, and
            access unredacted defect photos.
          </p>
          <a
            className="inline-flex items-center gap-2 font-semibold text-primary underline text-xs sm:text-sm"
            href="https://github.com/Catfood23/UNISON/settings/secrets/actions"
            target="_blank"
            rel="noreferrer"
          >
            Open GitHub Actions Secrets <ArrowRight size={15} />
          </a>
        </section>
      </div>
    );
  }

  if (session === "signed-out") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <PageTitle
          title="Staff & Admin Sign In"
          subtitle="Authorized personnel only. Review private descriptions, triage reports, and update statuses."
        />
        <form onSubmit={signIn} className="card-base p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Admin Password
            </label>
            <input
              className={input}
              type="password"
              autoComplete="current-password"
              required
              minLength={1}
              maxLength={256}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••••••••••••••••"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs sm:text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs sm:text-sm font-medium text-primary"
            >
              {notice}
            </div>
          )}

          <button className={`${btn} w-full min-h-[46px]`}>
            <ShieldCheck size={16} /> Sign In Securely
          </button>

          <p className="text-[11px] text-center text-muted-foreground leading-normal">
            Sign-in establishes an encrypted, HTTP-only session cookie expiring after 8 hours.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          title="Admin Control Center"
          subtitle="Private complaint records, photo triage, and status lifecycle management."
          actions={
            <div className="flex gap-2">
              <button
                onClick={() => void refresh()}
                className={`${btnOutline} min-h-[42px] text-xs px-3.5`}
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => void signOut()}
                className={`${btnOutline} min-h-[42px] text-xs px-3.5`}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          }
        />
      </div>

      {/* Staff Status Pill Bar */}
      <div className="card-base p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-100 text-teal-800">
            <ShieldCheck size={18} />
          </span>
          <span className="font-bold text-foreground">Signed in as Authorized Staff</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-xs">
            {reports.length} Total Registered {reports.length === 1 ? "Report" : "Reports"}
          </span>
          <DemoBadge>Privileged Store</DemoBadge>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={`rounded-2xl border p-4 text-xs sm:text-sm font-medium ${
            error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/30 bg-primary/10 text-primary"
          }`}
          role={error ? "alert" : "status"}
        >
          {error || notice}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="card-base p-4 sm:p-5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className={`${input} pl-10`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search reference ID, category, location, or description text…"
          />
        </div>
      </div>

      {visibleReports.length === 0 ? (
        <div className="card-base p-12 text-center text-sm text-muted-foreground">
          No reports match your search query.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleReports.map((report) => (
            <article
              key={report.id}
              className="card-base p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{report.category}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-semibold text-foreground">{report.location}</span>
                      {report.neighborhood ? ` · ${report.neighborhood}` : ""}
                    </p>
                  </div>
                  <StatusPill status={report.status} />
                </div>

                <div className="rounded-xl bg-background p-3.5 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Citizen Description:
                  </p>
                  <p className="whitespace-pre-line break-words text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {report.photo && (
                  <div className="relative rounded-2xl overflow-hidden group">
                    <img
                      src={report.photo}
                      alt={`Report photo for ${report.id}`}
                      className="max-h-64 w-full rounded-2xl object-cover bg-background border border-border/40"
                    />
                    <button
                      onClick={() => setActivePhoto({ url: report.photo!, id: report.id })}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-xl bg-background/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-md backdrop-blur hover:bg-background transition"
                      title="Inspect full image"
                    >
                      <ZoomIn size={14} /> Full View
                    </button>
                  </div>
                )}
              </div>

              {/* Status Change & Deletion Controls */}
              <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {report.id} · {new Date(report.date).toLocaleDateString()}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Status for ${report.id}`}
                    className="min-h-[40px] rounded-xl border border-border/60 bg-background px-3 text-xs font-semibold text-foreground shadow-[inset_1px_1px_3px_rgba(163,177,198,0.4)]"
                    value={statusDrafts[report.id] ?? report.status}
                    onChange={(event) =>
                      setStatusDrafts((previous) => ({
                        ...previous,
                        [report.id]: event.target.value as Status,
                      }))
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    disabled={
                      busyId === report.id ||
                      (statusDrafts[report.id] ?? report.status) === report.status
                    }
                    onClick={() => void updateStatus(report)}
                    className={`${btn} min-h-[40px] px-3.5 py-1.5 text-xs`}
                  >
                    {busyId === report.id ? "Saving…" : "Save Status"}
                  </button>

                  <button
                    disabled={busyId === report.id}
                    onClick={() => void deleteReport(report)}
                    aria-label={`Delete ${report.id}`}
                    className="grid min-h-[40px] min-w-[40px] place-items-center rounded-xl border border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 transition disabled:opacity-50"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Photo Modal Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-3xl w-full card-base bg-background p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
              <span className="font-mono text-xs font-bold text-primary">
                Defect Image: {activePhoto.id}
              </span>
              <button
                onClick={() => setActivePhoto(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close photo preview"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={activePhoto.url}
              alt={`Full size defect for ${activePhoto.id}`}
              className="max-h-[75vh] w-full rounded-2xl object-contain bg-black/5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
