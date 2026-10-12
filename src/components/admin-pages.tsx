import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CATEGORIES, STATUSES, type Status } from "@/lib/report-model";
import {
  changeReportStatus,
  deleteReport,
  editReport,
  listAnnouncements,
  listEmergencyContacts,
  listReports,
  listUsers,
  saveAnnouncements,
  saveEmergencyContacts,
  changeUserRole,
  setUserActive,
  deleteUser,
  resetDemoData,
  type EmergencyContact,
} from "@/lib/demo-store";
import { useAuth } from "@/lib/auth-context";
import { DemoBadge, PageTitle, StatusPill, input } from "@/components/ui-kit";
import type { Announcement, DemoReport, User } from "@/lib/demo-types";

function useDemoRefresh() {
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((n) => n + 1), []);
  useEffect(() => {
    window.addEventListener("unison-demo-changed", refresh);
    return () => window.removeEventListener("unison-demo-changed", refresh);
  }, [refresh]);
  return refresh;
}
export function AdminOverview() {
  useDemoRefresh();
  const reports = listReports();
  const users = listUsers();
  const counts = [
    { label: "Total users", value: users.length },
    { label: "Total reports", value: reports.length },
    {
      label: "Pending",
      value: reports.filter((r) => r.status === "Submitted" || r.status === "Verified").length,
    },
    { label: "In progress", value: reports.filter((r) => r.status === "In Progress").length },
    { label: "Resolved", value: reports.filter((r) => r.status === "Resolved").length },
  ];
  return (
    <div>
      <PageTitle title="Overview" subtitle="A snapshot of activity in this browser demo." />
      <div className="mb-5">
        <DemoBadge>Demo data</DemoBadge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {counts.map((item) => (
          <div key={item.label} className="card-base p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card-base p-5">
          <h2 className="font-bold">Reports by category</h2>
          <div className="mt-4 space-y-3">
            {CATEGORIES.map((category) => {
              const count = reports.filter((r) => r.category === category).length;
              return (
                <div key={category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{category}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${reports.length ? Math.max((count / reports.length) * 100, 3) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 className="mt-6 border-t pt-4 font-semibold">Reports by status</h3>
          <div className="mt-3 space-y-3">
            {STATUSES.map((status: Status) => {
              const count = reports.filter((report) => report.status === status).length;
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${reports.length ? Math.max((count / reports.length) * 100, 3) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card-base p-5">
          <h2 className="font-bold">Latest reports</h2>
          {reports.length ? (
            <ul className="mt-3 divide-y">
              {[...reports]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((report) => (
                  <li key={report.id} className="flex justify-between gap-3 py-3 text-sm">
                    <span>
                      {report.category} · {report.neighborhood}
                    </span>
                    <StatusPill status={report.status} />
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No demo reports have been submitted yet.
            </p>
          )}
          <h3 className="mt-5 border-t pt-4 font-semibold">Latest sign-ups</h3>
          {users.filter((u) => u.role === "resident").length ? (
            <ul className="mt-2 space-y-2 text-sm">
              {users
                .filter((u) => u.role === "resident")
                .slice(-5)
                .reverse()
                .map((u) => (
                  <li key={u.id} className="flex justify-between gap-2">
                    <span>{u.name}</span>
                    <span className="text-muted-foreground">
                      {new Date(u.joinedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No resident accounts yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminReports() {
  const refresh = useDemoRefresh();
  window.addEventListener("unison-demo-changed", refresh, { once: true });
  const reports = listReports();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<DemoReport | null>(null);
  const visible = reports
    .filter(
      (r) =>
        (status === "All" || r.status === status) &&
        (category === "All" || r.category === category) &&
        (!dateFrom || r.date.slice(0, 10) >= dateFrom) &&
        (!dateTo || r.date.slice(0, 10) <= dateTo) &&
        (!query ||
          `${r.id} ${r.location} ${r.description} ${r.neighborhood}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
    .sort((a, b) =>
      sort === "oldest"
        ? a.date.localeCompare(b.date)
        : sort === "category"
          ? a.category.localeCompare(b.category)
          : b.date.localeCompare(a.date),
    );
  return (
    <div>
      <PageTitle
        title="Reports"
        subtitle="Review all resident demo reports and update their status."
      />
      <div className="mb-4">
        <DemoBadge>Browser demo records</DemoBadge>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <input
          className={`${input} min-h-11`}
          aria-label="Search reports"
          placeholder="Search reports"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={input}
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          {STATUSES.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <label className="text-xs font-semibold text-muted-foreground">
          From
          <input
            className={`${input} mt-1 min-h-11`}
            type="date"
            aria-label="From date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          To
          <input
            className={`${input} mt-1 min-h-11`}
            type="date"
            aria-label="To date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
        <select
          className={input}
          aria-label="Sort reports"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="category">Category A–Z</option>
        </select>
        <select
          className={input}
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All</option>
          {CATEGORIES.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      {visible.length === 0 ? (
        <div className="card-base p-8 text-center text-muted-foreground">
          {reports.length
            ? "No reports match these filters."
            : "No demo reports yet. Submit one from the resident site."}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onChange={refresh}
              onDetails={() => setSelected(report)}
            />
          ))}
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-detail-heading"
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="report-detail-heading" className="text-xl font-bold">
                  {selected.category} · {selected.id}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.location} · {selected.neighborhood} ·{" "}
                  {new Date(selected.date).toLocaleString()}
                </p>
              </div>
              <button className="min-h-11 rounded-lg border px-3" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <p className="mt-5 whitespace-pre-wrap">{selected.description}</p>
            {selected.photo && (
              <img
                src={selected.photo}
                alt={`Report photo for ${selected.id}`}
                className="mt-4 max-h-96 rounded-xl object-contain"
              />
            )}
            {selected.internalNote && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-sm">
                <strong>Internal note:</strong> {selected.internalNote}
              </p>
            )}
            <StatusPill status={selected.status} />
          </section>
        </div>
      )}
    </div>
  );
}
function ReportCard({
  report,
  onChange,
  onDetails,
}: {
  report: DemoReport;
  onChange: () => void;
  onDetails: () => void;
}) {
  const [note, setNote] = useState(report.internalNote);
  return (
    <article className="card-base p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">
            {report.category} · {report.id}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.location} · {report.neighborhood} · {new Date(report.date).toLocaleString()}
          </p>
        </div>
        <StatusPill status={report.status} />
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{report.description}</p>
      <button
        className="mt-2 min-h-10 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-secondary"
        onClick={onDetails}
      >
        View details
      </button>
      {report.photo && (
        <img
          src={report.photo}
          alt={`Report ${report.id}`}
          className="mt-3 max-h-64 rounded-xl object-contain"
        />
      )}
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <select
          className={input}
          aria-label={`Status for ${report.id}`}
          value={report.status}
          onChange={(e) => {
            changeReportStatus(report.id, e.target.value as DemoReport["status"]);
            onChange();
          }}
        >
          {STATUSES.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <input
          className={input}
          aria-label={`Internal note for ${report.id}`}
          value={note}
          placeholder="Internal demo note"
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          className="min-h-11 rounded-xl border px-4 text-sm font-semibold"
          onClick={() => {
            editReport(report.id, { internalNote: note });
            onChange();
          }}
        >
          Save note
        </button>
      </div>
      <button
        className="mt-3 min-h-11 rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive"
        onClick={() => {
          if (
            window.confirm(
              `Delete report ${report.id}? This only removes this browser's demo copy.`,
            )
          ) {
            deleteReport(report.id);
            onChange();
          }
        }}
      >
        Delete report
      </button>
    </article>
  );
}

export function AdminUsers() {
  const refresh = useDemoRefresh();
  window.addEventListener("unison-demo-changed", refresh, { once: true });
  const { user: actor } = useAuth();
  const users = listUsers();
  const reports = listReports();
  return (
    <div>
      <PageTitle title="Users" subtitle="Manage accounts saved in this browser." />
      <div className="mb-4">
        <DemoBadge>Demo accounts</DemoBadge>
      </div>
      <div className="space-y-3">
        {users.map((u: User) => (
          <article
            key={u.id}
            className="card-base flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <h2 className="font-semibold">
                {u.name}{" "}
                {u.id === actor?.id && <span className="text-xs text-muted-foreground">(you)</span>}
              </h2>
              <p className="text-sm text-muted-foreground">
                {u.email} · {u.neighborhood} · {new Date(u.joinedAt).toLocaleDateString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {reports.filter((r) => r.ownerId === u.id).length} reports ·{" "}
                {u.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                aria-label={`Role for ${u.email}`}
                className="min-h-11 rounded-xl border bg-background px-3"
                value={u.role}
                onChange={(e) => {
                  try {
                    changeUserRole(u.id, e.target.value as User["role"], actor?.id ?? "");
                    refresh();
                  } catch (err) {
                    window.alert(err instanceof Error ? err.message : "Could not update role.");
                  }
                }}
              >
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
              <button
                className="min-h-11 rounded-xl border px-3 text-sm"
                onClick={() => {
                  try {
                    setUserActive(u.id, !u.active, actor?.id ?? "");
                    refresh();
                  } catch (err) {
                    window.alert(err instanceof Error ? err.message : "Could not update account.");
                  }
                }}
              >
                {u.active ? "Deactivate" : "Reactivate"}
              </button>
              <button
                className="min-h-11 rounded-xl border border-destructive/30 px-3 text-sm text-destructive"
                onClick={() => {
                  if (window.confirm(`Delete ${u.name}?`)) {
                    try {
                      deleteUser(u.id, actor?.id ?? "");
                      refresh();
                    } catch (err) {
                      window.alert(err instanceof Error ? err.message : "Could not delete user.");
                    }
                  }
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminAnnouncements() {
  const refresh = useDemoRefresh();
  const [items, setItems] = useState(listAnnouncements());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("Community update");
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const item: Announcement = {
      id: crypto.randomUUID(),
      title: title.trim(),
      body: body.trim(),
      type: type.trim(),
      date: new Date().toLocaleDateString(),
    };
    const next = [item, ...items];
    saveAnnouncements(next);
    setItems(next);
    refresh();
    setTitle("");
    setBody("");
  };
  const edit = (item: Announcement) => {
    const nextTitle = window.prompt("Edit announcement title", item.title);
    if (nextTitle === null) return;
    const nextBody = window.prompt("Edit announcement message", item.body);
    if (nextBody === null) return;
    const next = items.map((a) =>
      a.id === item.id
        ? { ...a, title: nextTitle.trim() || a.title, body: nextBody.trim() || a.body }
        : a,
    );
    saveAnnouncements(next);
    setItems(next);
    refresh();
  };
  return (
    <div>
      <PageTitle title="Announcements" subtitle="These notices appear on the resident site." />
      <div className="mb-4">
        <DemoBadge>Demo data</DemoBadge>
      </div>
      <form className="card-base mb-5 grid gap-3 p-4 sm:grid-cols-2" onSubmit={save}>
        <input
          className={input}
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className={input}
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <textarea
          className={`${input} sm:col-span-2`}
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button className="min-h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground sm:col-span-2">
          Publish announcement
        </button>
      </form>
      <div className="space-y-3">
        {items.map((a) => (
          <article
            className="card-base flex flex-wrap items-start justify-between gap-3 p-4"
            key={a.id}
          >
            <div>
              <p className="text-xs font-semibold text-primary">
                {a.type} · {a.date}
              </p>
              <h2 className="font-bold">{a.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            </div>
            <div className="flex gap-2">
              <button className="min-h-11 rounded-xl border px-3 text-sm" onClick={() => edit(a)}>
                Edit
              </button>
              <button
                className="min-h-11 rounded-xl border px-3 text-sm text-destructive"
                onClick={() => {
                  if (window.confirm("Delete this announcement?")) {
                    const next = items.filter((item) => item.id !== a.id);
                    saveAnnouncements(next);
                    setItems(next);
                    refresh();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminEmergency() {
  const [items, setItems] = useState(listEmergencyContacts());
  const update = (id: string, key: "name" | "number" | "kind", value: string) =>
    setItems((old) => old.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  return (
    <div>
      <PageTitle
        title="Map & emergency data"
        subtitle="Edit sample contact details shown in the resident emergency page."
      />
      <div className="mb-4">
        <DemoBadge>Sample data</DemoBadge>
      </div>
      <section className="card-base divide-y p-4">
        {items.map((item: EmergencyContact) => (
          <div key={item.id} className="grid gap-2 py-3 sm:grid-cols-3">
            <input
              className={input}
              aria-label={`${item.id} name`}
              value={item.name}
              onChange={(e) => update(item.id, "name", e.target.value)}
            />
            <input
              className={input}
              aria-label={`${item.id} number`}
              value={item.number}
              onChange={(e) => update(item.id, "number", e.target.value)}
            />
            <input
              className={input}
              aria-label={`${item.id} type`}
              value={item.kind}
              onChange={(e) => update(item.id, "kind", e.target.value)}
            />
          </div>
        ))}
        <button
          className="mt-4 min-h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
          onClick={() => saveEmergencyContacts(items)}
        >
          Save sample contacts
        </button>
      </section>
      <p className="mt-5 text-sm text-muted-foreground">
        Community map markers are generated from demo reports. Their locations are approximate and
        are not a real map.
      </p>
    </div>
  );
}

export function AdminSettings() {
  const [message, setMessage] = useState("");
  return (
    <div>
      <PageTitle title="Settings" subtitle="Restore the original browser demo sample data." />
      <section className="card-base max-w-2xl space-y-4 p-5">
        <h2 className="font-bold">Reset demo data</h2>
        <p className="text-sm text-muted-foreground">
          This removes resident accounts and reports from this browser, restores the demo admin and
          sample announcements, and signs you out. This cannot be undone.
        </p>
        <button
          className="min-h-12 rounded-xl bg-destructive px-5 font-semibold text-destructive-foreground"
          onClick={() => {
            if (window.confirm("Reset all UNISON browser demo data? You will be signed out.")) {
              if (resetDemoData()) {
                setMessage("Demo data reset. Sign in again with the demo admin account.");
                window.location.assign("/login");
              } else setMessage("Could not reset data. Browser storage may be disabled.");
            }
          }}
        >
          Reset browser demo data
        </button>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
