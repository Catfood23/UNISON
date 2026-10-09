import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import {
  CATEGORIES, MAX_DESCRIPTION, MAX_LOCATION, NEIGHBORHOODS, compressImage, isAllowedImage,
  loadReports, makeId, saveReports, useNeighborhood, type Category,
} from "@/lib/data";
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
  const [hood, setHood] = useNeighborhood();
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string>();
  const [error, setError] = useState("");

  const onPhoto = async (f?: File) => {
    if (!f) return setPhoto(undefined);
    if (!isAllowedImage(f.type)) return setError("Please choose a JPG, PNG, WEBP or GIF photo.");
    if (f.size > 15 * 1024 * 1024) return setError("Photo too large (max 15 MB).");
    try {
      setPhoto(await compressImage(f));
      setError("");
    } catch {
      setError("That photo couldn't be read. Try another one.");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return setError("Please fill in location and description.");
    setBusy(true);
    const id = makeId();
    const report = { id, category, neighborhood: hood, location: location.trim(), description: description.trim(), photo, date: new Date().toISOString(), status: "Submitted" as const };
    try {
      saveReports([report, ...loadReports()]);
      setDoneId(id);
    } catch {
      try {
        saveReports([{ ...report, photo: undefined }, ...loadReports()]);
        setDoneId(id);
        setError("Browser storage was full, so the report was saved without its photo.");
      } catch {
        setError("Browser storage is full. Delete some old reports on the Track page and try again.");
      }
    }
    setBusy(false);
  };

  if (doneId)
    return (
      <div className="card-base mx-auto max-w-lg p-8 text-center" role="status">
        <CheckCircle2 size={56} className="mx-auto text-primary" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold">Report submitted!</h1>
        <p className="mt-2 text-muted-foreground">Your complaint reference ID is</p>
        <p className="mt-2 inline-block rounded-xl bg-secondary px-4 py-2 font-mono text-lg font-bold text-secondary-foreground">{doneId}</p>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-xs text-muted-foreground">Saved in this browser for demo purposes only — not sent to a real municipality.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/track" className={btn}>Track complaints</Link>
          <button className={btnOutline} onClick={() => { setDoneId(undefined); setError(""); setLocation(""); setDescription(""); setPhoto(undefined); }}>Report another</button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Report a Problem" subtitle="Tell us what needs fixing in your neighborhood." />
      <form onSubmit={submit} className="card-base space-y-5 p-6" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Issue category</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button type="button" key={c} onClick={() => setCategory(c)} aria-pressed={category === c}
                className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-medium ${category === c ? "border-primary bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-semibold">Neighborhood
          <select className={`${input} mt-1`} value={hood} onChange={(e) => setHood(e.target.value)}>
            {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Location
          <input className={`${input} mt-1`} placeholder="e.g. Near Green Park bus stop" maxLength={MAX_LOCATION} required
            value={location} onChange={(e) => setLocation(e.target.value)} aria-describedby={error ? "form-error" : undefined} />
          <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">{location.length}/{MAX_LOCATION}</span>
        </label>
        <label className="block text-sm font-semibold">Description
          <textarea className={`${input} mt-1 min-h-28`} placeholder="Describe the problem…" maxLength={MAX_DESCRIPTION} required
            value={description} onChange={(e) => setDescription(e.target.value)} aria-describedby={error ? "form-error" : undefined} />
          <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">{description.length}/{MAX_DESCRIPTION}</span>
        </label>
        <div>
          <p className="text-sm font-semibold">Photo <span className="font-normal text-muted-foreground">(optional)</span></p>
          <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted">
            <Upload size={18} aria-hidden /> {photo ? "Photo selected — click to change" : "Click to upload a photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {photo && <img src={photo} alt="Preview of your uploaded photo" className="mt-2 h-32 rounded-xl object-cover" />}
          <p className="mt-2 text-xs text-muted-foreground">Privacy: photos are resized and their hidden location (GPS) data is removed. Everything stays in this browser only.</p>
        </div>
        {error && <p id="form-error" role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <button className={`${btn} w-full`} disabled={busy}>{busy ? "Submitting…" : "Submit Report"}</button>
      </form>
    </div>
  );
}
