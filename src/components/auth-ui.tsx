import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Shield, Users } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { DEMO_ADMIN } from "@/lib/demo-constants";
import { useAuth } from "@/lib/auth-context";
import { NEIGHBORHOODS } from "@/lib/report-model";
import { btn, input } from "@/components/ui-kit";

export const AUTH_FOOTER =
  "UNISON is an educational prototype. Accounts and data are stored only in your browser.";
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-muted/50 px-4 py-8 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-3xl border bg-background shadow-sm lg:grid-cols-2">
        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          {children}
          <p className="mt-8 text-xs leading-5 text-muted-foreground">{AUTH_FOOTER}</p>
        </section>
        <aside className="hidden flex-col justify-between bg-secondary p-10 lg:flex">
          <Brand />
          <div>
            <p className="text-sm font-semibold text-primary">Different Minds. One Vision.</p>
            <h2 className="mt-3 max-w-md text-4xl font-bold leading-tight">
              A clearer way to care for your neighborhood.
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Share local concerns, follow progress and stay connected with your community.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border bg-background p-4">
                <Users className="text-primary" />
                <p className="mt-3 font-semibold">Resident space</p>
                <p className="text-sm text-muted-foreground">Report and follow issues</p>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <Shield className="text-primary" />
                <p className="mt-3 font-semibold">Admin tools</p>
                <p className="text-sm text-muted-foreground">Manage demo activity</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Demo experience · no real municipal service
          </p>
        </aside>
      </div>
    </main>
  );
}
export function Brand() {
  return (
    <Link to="/login" className="mb-8 inline-flex items-center gap-3">
      <img src="/unison-mark.svg" alt="" className="h-11 w-11" />
      <span>
        <span className="block text-xl font-extrabold tracking-tight">UNISON</span>
        <span className="text-xs text-muted-foreground">Different Minds. One Vision.</span>
      </span>
    </Link>
  );
}
export function DemoNotice() {
  return (
    <p className="mb-5 rounded-xl border border-primary/20 bg-secondary p-3 text-sm text-secondary-foreground">
      <strong>Demo only.</strong> Do not use a real password.
    </p>
  );
}
function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
function PasswordInput({
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <span className="relative mt-1 block">
      <input
        className={`${input} min-h-12 pr-12`}
        type={shown ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="absolute right-1 top-1 grid min-h-10 min-w-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
        aria-label={shown ? "Hide password" : "Show password"}
        onClick={() => setShown(!shown)}
      >
        {shown ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
}
function getRememberedEmail() {
  try {
    return localStorage.getItem("unison.demo.remembered-email.v1") ?? "";
  } catch {
    return "";
  }
}
export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"resident" | "admin">("resident");
  const [email, setEmail] = useState(getRememberedEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(Boolean(getRememberedEmail()));
  useEffect(() => {
    if (!loading && user)
      void navigate({ to: user.role === "admin" ? "/admin" : "/app", replace: true });
  }, [loading, user, navigate]);
  if (!loading && user) return null;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const logged = login(email, password);
      try {
        if (remember) localStorage.setItem("unison.demo.remembered-email.v1", email);
        else localStorage.removeItem("unison.demo.remembered-email.v1");
      } catch {
        /* Remember me is optional when storage is disabled. */
      }
      await navigate({ to: logged.role === "admin" ? "/admin" : "/app", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <Brand />
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 mt-1 text-muted-foreground">Sign in to continue to UNISON.</p>
      <DemoNotice />
      <div
        role="tablist"
        aria-label="Sign in type"
        className="mb-5 grid grid-cols-2 rounded-xl bg-muted p-1"
      >
        <button
          role="tab"
          aria-selected={tab === "resident"}
          className={`min-h-11 rounded-lg text-sm font-semibold ${tab === "resident" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          onClick={() => setTab("resident")}
        >
          Resident
        </button>
        <button
          role="tab"
          aria-selected={tab === "admin"}
          className={`min-h-11 rounded-lg text-sm font-semibold ${tab === "admin" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          onClick={() => setTab("admin")}
        >
          Admin
        </button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {tab === "admin" ? (
          <>
            Demo admin: <code>{DEMO_ADMIN.email}</code> · <code>{DEMO_ADMIN.password}</code>
          </>
        ) : (
          "Use your resident account. Your account role determines where you land."
        )}
      </p>
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        <Field label="Email">
          <input
            className={`${input} mt-1 min-h-12`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <button className={`${btn} min-h-12 w-full`} disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to UNISON?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
export function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [neighborhood, setNeighborhood] = useState<string>(NEIGHBORHOODS[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const strength = Math.min(
    4,
    Number(password.length >= 8) +
      Number(/[A-Z]/u.test(password)) +
      Number(/[0-9]/u.test(password)) +
      Number(/[^A-Za-z0-9]/u.test(password)),
  );
  if (user) {
    void navigate({ to: user.role === "admin" ? "/admin" : "/app", replace: true });
    return null;
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    if (!terms) return setError("Please accept the terms to continue.");
    setBusy(true);
    try {
      signup({ name, email, neighborhood, password });
      await navigate({ to: "/app", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Account could not be created.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <Brand />
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mb-5 mt-1 text-muted-foreground">Join your neighborhood demo space.</p>
      <DemoNotice />
      <form className="space-y-3" onSubmit={(event) => void submit(event)}>
        <Field label="Full name">
          <input
            className={`${input} mt-1 min-h-11`}
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            className={`${input} mt-1 min-h-11`}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Neighborhood">
          <select
            className={`${input} mt-1 min-h-11`}
            value={neighborhood}
            onChange={(event) => setNeighborhood(event.target.value)}
          >
            {NEIGHBORHOODS.map((hood) => (
              <option key={hood}>{hood}</option>
            ))}
          </select>
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
          <span className="mt-2 flex gap-1" aria-label={`Password strength ${strength} of 4`}>
            {[1, 2, 3, 4].map((v) => (
              <span
                key={v}
                className={`h-1.5 flex-1 rounded ${strength >= v ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </span>
        </Field>
        <Field label="Confirm password">
          <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </Field>
        <label className="flex items-start gap-2 text-sm">
          <input
            className="mt-1"
            type="checkbox"
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
          />
          <span>I understand this is an educational demo and my data stays in this browser.</span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button className={`${btn} min-h-12 w-full`} disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <AuthLayout>
      <Brand />
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mb-6 mt-1 text-muted-foreground">This demo does not send email.</p>
      <DemoNotice />
      {done ? (
        <p role="status" className="rounded-xl bg-secondary p-4 text-sm">
          In a real app we would email you a reset link.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setDone(true);
          }}
        >
          <Field label="Email">
            <input
              className={`${input} mt-1 min-h-12`}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <button className={`${btn} min-h-12 w-full`}>Continue</button>
        </form>
      )}
      <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-primary">
        Back to login
      </Link>
    </AuthLayout>
  );
}
