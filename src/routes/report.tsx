import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { CATEGORIES, loadReports, makeId, saveReports, type Category } from "@/lib/data";
import { PageTitle, btn, btnOutline, input } from "@/components/ui-kit";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Problem — Smart Community" },
      { name: "description", content: "Report potholes, broken streetlights, garbage, drainage and more." },
      { property: "og:title", content: "Report a Problem — Smart Community" },
      { property: "og:description", content: "Report potholes, broken streetlights, garbage, drainage and more." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string>();
  const [error, setError] = useState("");

  const onPhoto = (f?: File) => {
    if (!f) return setPhoto(undefined);
    if (f.size > 1.5 * 1024 * 1024) return setError("Photo too large (max 1.5 MB for the demo).");
    setError("");
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return setError("Please fill in location and description.");
    setBusy(true);
    setTimeout(() => {
      const id = makeId();
      try {
        saveReports([{ id, category, location: location.trim(), description: description.trim(), photo, date: new Date().toISOString(), status: "Submitted" }, ...loadReports()]);
        setDoneId(id);
      } catch {
        setError("Could not save — browser storage may be full. Try without a photo.");
      }
      setBusy(false);
    }, 700);
  };

  if (doneId)
    return (
      <div className="card-base mx-auto max-w-lg p-8 text-center">
        <CheckCircle2 size={56} className="mx-auto text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Report submitted!</h1>
        <p className="mt-2 text-muted-foreground">Your complaint reference ID is</p>
        <p className="mt-2 inline-block rounded-xl bg-secondary px-4 py-2 font-mono text-lg font-bold text-secondary-foreground">{doneId}</p>
        <p className="mt-4 text-xs text-muted-foreground">Saved in this browser for demo purposes only — not sent to a real municipality.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/track" className={btn}>Track complaints</Link>
          <button className={btnOutline} onClick={() => { setDoneId(undefined); setLocation(""); setDescription(""); setPhoto(undefined); }}>Report another</button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Report a Problem" subtitle="Tell us what needs fixing in your neighborhood." />
      <form onSubmit={submit} className="card-base space-y-5 p-6">
        <div>
          <p className="mb-2 text-sm font-semibold">Issue category</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button type="button" key={c} onClick={() => setCategory(c)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${category === c ? "border-primary bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
        </div>
        <label className="block text-sm font-semibold">Location
          <input className={`${input} mt-1`} placeholder="e.g. Near Green Park bus stop" value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">Description
          <textarea className={`${input} mt-1 min-h-28`} placeholder="Describe the problem…" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div>
          <p className="text-sm font-semibold">Photo <span className="font-normal text-muted-foreground">(optional)</span></p>
          <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted">
            <Upload size={18} /> {photo ? "Photo selected — click to change" : "Click to upload a photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {photo && <img src={photo} alt="Preview" className="mt-2 h-32 rounded-xl object-cover" />}
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <button className={`${btn} w-full`} disabled={busy}>{busy ? "Submitting…" : "Submit Report"}</button>
      </form>
    </div>
  );
}
