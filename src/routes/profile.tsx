import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageTitle, btn, input } from "@/components/ui-kit";
import { NEIGHBORHOODS } from "@/lib/report-model";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — UNISON" }] }),
});
function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [hood, setHood] = useState(user?.neighborhood ?? NEIGHBORHOODS[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password && password.length < 8)
      return setError("Use at least 8 characters for a new password.");
    if (password !== confirm) return setError("New passwords do not match.");
    try {
      updateProfile({ name: name.trim(), neighborhood: hood, ...(password ? { password } : {}) });
      setPassword("");
      setConfirm("");
      setMessage("Your profile is saved in this browser.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save profile.");
    }
  };
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Your profile" subtitle="Manage the details saved with your demo account." />
      <form className="card-base space-y-4 p-5" onSubmit={submit}>
        <label className="block text-sm font-semibold">
          Full name
          <input
            className={`${input} mt-1 min-h-12`}
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input className={`${input} mt-1 min-h-12`} readOnly value={user?.email ?? ""} />
        </label>
        <label className="block text-sm font-semibold">
          Neighborhood
          <select
            className={`${input} mt-1 min-h-12`}
            value={hood}
            onChange={(e) => setHood(e.target.value)}
          >
            {NEIGHBORHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          New password (optional)
          <input
            className={`${input} mt-1 min-h-12`}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Confirm new password
          <input
            className={`${input} mt-1 min-h-12`}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-primary">
            {message}
          </p>
        )}
        <button className={`${btn} min-h-12`}>Save profile</button>
      </form>
      <Link to="/app" className="mt-4 inline-block text-sm font-semibold text-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
