import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, LogOut, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { STATUSES, type Report, type Status } from "@/lib/report-model";
import { PageTitle, Spinner, StatusPill, input } from "@/components/ui-kit";

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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report could not be deleted.");
    } finally {
      setBusyId("");
    }
  };

  if (session === "loading")
    return (
      <div className="py-12">
        <Spinner />
      </div>
    );

  if (session === "unconfigured") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageTitle
          title="Admin access needs setup"
          subtitle="This dashboard is locked until the Worker admin secret is configured."
        />
        <section className="card-base space-y-4 p-6">
          <p>
            In GitHub, add an Actions repository secret named <code>UNISON_ADMIN_PASSWORD</code>{" "}
            with at least 24 characters, then rerun the UNISON deployment workflow.
          </p>
          <p>
            Use a unique password generated by a password manager. It will be stored as a Cloudflare
            Worker secret; it is never included in the website files.
          </p>
          <a
            className="inline-flex items-center gap-2 font-semibold text-primary underline"
            href="https://github.com/Catfood23/UNISON/settings/secrets/actions"
            target="_blank"
            rel="noreferrer"
          >
            Open GitHub Actions secrets <ArrowRight size={15} />
          </a>
        </section>
      </div>
    );
  }

  if (session === "signed-out") {
    return (
      <div className="mx-auto max-w-md">
        <PageTitle title="Admin sign in" subtitle="Authorized staff only." />
        <form onSubmit={signIn} className="card-base space-y-4 p-6">
          <label className="block text-sm font-semibold">
            Admin password
            <input
              className={`${input} mt-1`}
              type="password"
              autoComplete="current-password"
              required
              minLength={1}
              maxLength={256}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          )}
          <button className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Sign in securely
          </button>
          <p className="text-xs text-muted-foreground">
            Sign-in uses an encrypted, secure, HTTP-only session cookie that expires after eight
            hours.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title="Admin Dashboard"
          subtitle="Private report details and status management."
        />
        <div className="flex gap-2">
          <button
            onClick={() => void refresh()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold hover:bg-secondary"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => void signOut()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold hover:bg-secondary"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/50 p-4 text-sm">
        <span className="inline-flex items-center gap-2 font-semibold">
          <ShieldCheck size={17} className="text-primary" /> Signed in as administrator
        </span>
        <span>
          {reports.length} report{reports.length === 1 ? "" : "s"}
        </span>
      </div>
      {(error || notice) && (
        <p
          className={`mb-4 rounded-xl border p-3 text-sm ${error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-primary/20 bg-secondary"}`}
          role={error ? "alert" : "status"}
        >
          {error || notice}
        </p>
      )}
      <label className="mb-4 block max-w-xl text-sm font-semibold">
        Search reports
        <input
          className={`${input} mt-1`}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Reference, category, location, or description"
        />
      </label>
      {visibleReports.length === 0 ? (
        <div className="card-base p-10 text-center text-sm text-muted-foreground">
          No reports match this search.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleReports.map((report) => (
            <article key={report.id} className="card-base min-w-0 space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{report.category}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.location}
                    {report.neighborhood ? ` · ${report.neighborhood}` : ""}
                  </p>
                </div>
                <StatusPill status={report.status} />
              </div>
              <p className="whitespace-pre-line break-words text-sm">{report.description}</p>
              {report.photo && (
                <img
                  src={report.photo}
                  alt={`Report photo for ${report.id}`}
                  className="max-h-72 w-full rounded-xl object-contain bg-muted"
                />
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {report.id} · {new Date(report.date).toLocaleString()}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Status for ${report.id}`}
                    className="min-h-10 rounded-lg border bg-background px-3 text-sm"
                    value={statusDrafts[report.id] ?? report.status}
                    onChange={(event) =>
                      setStatusDrafts((previous) => ({
                        ...previous,
                        [report.id]: event.target.value as Status,
                      }))
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    disabled={
                      busyId === report.id ||
                      (statusDrafts[report.id] ?? report.status) === report.status
                    }
                    onClick={() => void updateStatus(report)}
                    className="min-h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {busyId === report.id ? "Saving…" : "Save status"}
                  </button>
                  <button
                    disabled={busyId === report.id}
                    onClick={() => void deleteReport(report)}
                    aria-label={`Delete ${report.id}`}
                    className="grid min-h-10 min-w-10 place-items-center rounded-lg border text-destructive hover:bg-destructive/5 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Public tracking reveals only the reference ID, category, neighborhood, submission date, and
        current status. Report descriptions, exact locations, and photos require admin sign-in.
      </p>
    </div>
  );
}
