import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AdminLayout } from "@/components/app-shells";
import { Spinner } from "@/components/ui-kit";

type AdminView = "overview" | "reports" | "users" | "announcements" | "emergency" | "settings";
export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): { view: AdminView } => ({
    view: ["overview", "reports", "users", "announcements", "emergency", "settings"].includes(
      String(search["view"]),
    )
      ? (search["view"] as AdminView)
      : "overview",
  }),
  head: () => ({
    meta: [{ title: "Admin workspace — UNISON" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});
const Overview = lazy(() =>
  import("@/components/admin-pages").then((module) => ({ default: module.AdminOverview })),
);
const Reports = lazy(() =>
  import("@/components/admin-pages").then((module) => ({ default: module.AdminReports })),
);
const Users = lazy(() =>
  import("@/components/admin-pages").then((module) => ({ default: module.AdminUsers })),
);
const Announcements = lazy(() =>
  import("@/components/admin-pages").then((module) => ({ default: module.AdminAnnouncements })),
);
const Emergency = lazy(() =>
  import("@/components/admin-pages").then((module) => ({ default: module.AdminEmergency })),
);
const Settings = lazy(() =>
  import("@/components/admin-pages").then((module) => ({ default: module.AdminSettings })),
);
function AdminPage() {
  const { view } = Route.useSearch();
  const navigate = Route.useNavigate();
  const changeView = (next: string) => {
    void navigate({ search: { view: next as AdminView }, replace: true });
  };
  const page =
    view === "reports" ? (
      <Reports />
    ) : view === "users" ? (
      <Users />
    ) : view === "announcements" ? (
      <Announcements />
    ) : view === "emergency" ? (
      <Emergency />
    ) : view === "settings" ? (
      <Settings />
    ) : (
      <Overview />
    );
  return (
    <AdminLayout tab={view} onTab={changeView}>
      <Suspense fallback={<Spinner />}>{page}</Suspense>
    </AdminLayout>
  );
}
