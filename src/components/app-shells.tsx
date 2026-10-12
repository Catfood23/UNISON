import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  ClipboardPlus,
  Home,
  LogOut,
  Map,
  Menu,
  PhoneCall,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { canAccessRole } from "@/lib/demo-store";
import { AUTH_FOOTER } from "@/components/auth-ui";

const residentLinks = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/report", label: "Report", icon: ClipboardPlus },
  { to: "/track", label: "Track", icon: Activity },
  { to: "/map", label: "Map", icon: Map },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;
const adminLinks = [
  ["overview", "Overview", Home],
  ["reports", "Reports", ClipboardPlus],
  ["users", "Users", Users],
  ["announcements", "Announcements", Bell],
  ["emergency", "Map & emergency", PhoneCall],
  ["settings", "Settings", Activity],
] as const;

export function ResidentGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);
  if (loading || !user)
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Checking your demo session…
      </div>
    );
  return <>{children}</>;
}
export function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);
  if (loading || !user)
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Checking your demo session…
      </div>
    );
  if (!canAccessRole(user, "admin"))
    return (
      <div className="mx-auto max-w-lg py-14 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">This workspace is for demo administrators.</p>
        <Link
          className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground"
          to="/app"
        >
          Back to resident home
        </Link>
      </div>
    );
  return <>{children}</>;
}
export function ResidentLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  return (
    <ResidentGate>
      <div className="min-h-screen bg-muted/40 pb-20 md:pb-0">
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-background p-5 md:flex">
          <Link to="/app" className="mb-8 flex items-center gap-3">
            <img src="/unison-mark.svg" alt="" className="h-10 w-10" />
            <span>
              <b className="block text-lg">UNISON</b>
              <small className="text-muted-foreground">Resident space</small>
            </span>
          </Link>
          <nav className="space-y-1">
            {residentLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <Link
              to="/announcements"
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              <Bell size={18} />
              Announcements
            </Link>
            <Link
              to="/emergency"
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              <PhoneCall size={18} />
              Emergency
            </Link>
          </nav>
          <div className="mt-auto border-t pt-4">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.neighborhood}</p>
            <button
              className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-muted"
              onClick={() => {
                logout();
                void navigate({ to: "/login", replace: true });
              }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>
        <div className="md:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
            <button
              className="grid min-h-11 min-w-11 place-items-center rounded-lg hover:bg-muted md:hidden"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
            <span className="font-semibold md:hidden">UNISON</span>
            <span className="hidden text-sm text-muted-foreground md:block">
              Your neighborhood, together
            </span>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm sm:inline">{user?.name}</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                Resident
              </span>
            </div>
          </header>
          {menu && (
            <nav className="grid gap-1 border-b bg-background p-3 md:hidden">
              {[
                ...residentLinks,
                { to: "/announcements", label: "Announcements", icon: Bell },
                { to: "/emergency", label: "Emergency", icon: PhoneCall },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenu(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-secondary"
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            {children}
            <p className="mt-10 border-t pt-4 text-center text-xs text-muted-foreground">
              {AUTH_FOOTER} · Reports are not sent to a real municipality.
            </p>
          </main>
        </div>
        <nav
          aria-label="Resident navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {residentLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </ResidentGate>
  );
}
export function AdminLayout({
  children,
  tab,
  onTab,
}: {
  children: ReactNode;
  tab: string;
  onTab: (tab: string) => void;
}) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <AdminGate>
      <div className="min-h-screen bg-muted/40">
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-[#173f32] p-5 text-white md:flex">
          <Link to="/admin" search={{ view: "overview" }} className="mb-8 flex items-center gap-3">
            <img src="/unison-mark.svg" alt="" className="h-10 w-10 rounded-xl bg-white p-1" />
            <span>
              <b className="block text-lg">UNISON</b>
              <small className="text-white/70">Admin workspace</small>
            </span>
          </Link>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
            Management
          </p>
          <nav className="space-y-1">
            {adminLinks.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => onTab(id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium ${tab === id ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"}`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
          <Link
            to="/app"
            className="mt-5 flex min-h-12 items-center rounded-xl border border-white/20 px-3 text-sm font-semibold hover:bg-white/10"
          >
            View resident site
          </Link>
          <div className="mt-auto border-t border-white/20 pt-4">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-white/70">Admin</p>
            <button
              className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-white/10"
              onClick={() => {
                logout();
                void navigate({ to: "/login", replace: true });
              }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>
        <div className="md:pl-64">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
            <button
              className="grid min-h-11 min-w-11 place-items-center rounded-lg hover:bg-muted md:hidden"
              aria-label="Open admin menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Admin</p>
              <p className="text-sm font-semibold">
                {adminLinks.find(([id]) => id === tab)?.[1] ?? "Overview"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm sm:inline">{user?.name}</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                Administrator
              </span>
              <button
                className="min-h-11 rounded-xl border px-3 text-sm font-semibold"
                onClick={() => {
                  logout();
                  void navigate({ to: "/login", replace: true });
                }}
              >
                Log out
              </button>
            </div>
          </header>
          {open && (
            <nav className="grid gap-1 border-b bg-background p-3 md:hidden">
              {adminLinks.map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => {
                    onTab(id);
                    setOpen(false);
                  }}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-left hover:bg-secondary"
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
              <Link
                to="/app"
                className="flex min-h-12 items-center rounded-xl px-3 hover:bg-secondary"
              >
                View resident site
              </Link>
            </nav>
          )}
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
            {children}
            <p className="mt-10 border-t pt-4 text-center text-xs text-muted-foreground">
              {AUTH_FOOTER}
            </p>
          </main>
        </div>
      </div>
    </AdminGate>
  );
}
