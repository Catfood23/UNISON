import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Upload, Copy, Check, Sparkles, Image as ImageIcon, X } from "lucide-react";
import {
  CATEGORIES,
  MAX_DESCRIPTION,
  MAX_LOCATION,
  NEIGHBORHOODS,
  compressImage,
  isAllowedImage,
  createReport,
  useNeighborhood,
  type Category,
} from "@/lib/data";
import { PageTitle, DemoBadge, btn, btnOutline, input } from "@/components/ui-kit";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Problem — UNISON" },
      {
        name: "description",
        content: "Report potholes, broken streetlights, garbage, drainage and more.",
      },
      { property: "og:title", content: "Report a Problem — UNISON" },
      {
        property: "og:description",
        content: "Report potholes, broken streetlights, garbage, drainage and more.",
      },
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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const onPhoto = async (f?: File) => {
    if (!f) return setPhoto(undefined);
    if (!isAllowedImage(f.type)) return setError("Please choose a JPG, PNG, WEBP, or GIF photo.");
    if (f.size > 15 * 1024 * 1024) return setError("Photo too large (max 15 MB).");
    try {
      setPhoto(await compressImage(f));
      setError("");
    } catch {
      setError("That photo couldn't be read. Try another image.");
    }
  };

  const copyRef = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      return setError("Please fill in both the location and description fields.");
    }
    setBusy(true);
    try {
      const created = await createReport({
        category,
        neighborhood: hood,
        location: location.trim(),
        description: description.trim(),
        ...(photo ? { photo } : {}),
      });
      setDoneId(created.id);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The report could not be saved. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (doneId) {
    return (
      <div className="card-base mx-auto max-w-lg p-8 sm:p-10 text-center" role="status">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-teal-100 text-teal-700 shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.9)]">
          <CheckCircle2 size={44} aria-hidden />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
          Report Submitted!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Your complaint has been successfully stored in the prototype database.
        </p>

        <div className="mt-5 rounded-2xl bg-background p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
          <p className="text-xs font-semibold text-muted-foreground">Complaint Reference ID</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="font-mono text-lg font-extrabold text-primary tracking-wider">
              {doneId}
            </span>
            <button
              onClick={() => copyRef(doneId)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Copy Reference ID"
            >
              {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Educational Prototype: This report is stored by UNISON's server and is{" "}
          <strong>not</strong> transmitted to real city emergency dispatch.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/track" search={{ id: doneId }} className={btn}>
            Track This Complaint
          </Link>
          <button
            className={btnOutline}
            onClick={() => {
              setDoneId(undefined);
              setError("");
              setLocation("");
              setDescription("");
              setPhoto(undefined);
            }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle
        title="Report a Neighborhood Problem"
        subtitle="Submit a civic defect to help improve community safety and infrastructure."
        actions={<DemoBadge>Civic Logging Prototype</DemoBadge>}
      />

      <form onSubmit={submit} className="card-base p-6 sm:p-8 space-y-6" noValidate>
        {/* Category Picker */}
        <fieldset>
          <legend className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
            1. Issue Category
          </legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {CATEGORIES.map((c) => {
              const isSelected = category === c;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={isSelected}
                  className={`min-h-[46px] rounded-2xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? "shadow-[inset_2px_2px_5px_rgba(108,99,255,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] bg-[#6C63FF]/15 text-[#6C63FF] border border-primary/50"
                      : "shadow-[3px_3px_8px_rgba(163,177,198,0.5),-3px_-3px_8px_rgba(255,255,255,0.85)] bg-background text-foreground/90 hover:text-primary border border-white/60"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Neighborhood Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            2. Neighborhood Sector
          </label>
          <select className={input} value={hood} onChange={(e) => setHood(e.target.value)}>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Location Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Specific Location or Landmark
            </label>
            <span className="text-[11px] text-muted-foreground font-medium">
              {location.length}/{MAX_LOCATION}
            </span>
          </div>
          <input
            className={input}
            placeholder="e.g., Near Green Park bus stop, 4th Cross Road"
            maxLength={MAX_LOCATION}
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-describedby={error ? "form-error" : undefined}
          />
        </div>

        {/* Description Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              4. Description of Problem
            </label>
            <span className="text-[11px] text-muted-foreground font-medium">
              {description.length}/{MAX_DESCRIPTION}
            </span>
          </div>
          <textarea
            className={`${input} min-h-[120px] py-3 leading-relaxed`}
            placeholder="Describe the severity, hazard, or approximate size of the defect…"
            maxLength={MAX_DESCRIPTION}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-describedby={error ? "form-error" : undefined}
          />
        </div>

        {/* Photo Upload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              5. Photo Upload{" "}
              <span className="text-muted-foreground/70 lowercase font-normal">(optional)</span>
            </p>
            <span className="text-[11px] text-muted-foreground">Max 15MB · Auto-compressed</span>
          </div>

          {!photo ? (
            <label className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 bg-background/50 p-6 text-center shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] hover:border-primary/60 transition group">
              <Upload
                size={22}
                className="text-muted-foreground group-hover:text-primary transition"
              />
              <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition">
                Click or drag photo here to attach
              </span>
              <span className="text-[11px] text-muted-foreground">
                JPG, PNG, WEBP, or GIF. GPS coordinates are stripped before upload.
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="relative rounded-2xl bg-background p-3 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={photo}
                  alt="Uploaded defect preview"
                  className="h-16 w-16 rounded-xl object-cover border border-white/60"
                />
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-primary" /> Image Ready
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Compressed & sanitized for prototype storage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhoto(undefined)}
                className="rounded-xl p-2 text-destructive hover:bg-destructive/10 transition"
                title="Remove photo"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div
            id="form-error"
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs sm:text-sm font-medium text-destructive"
          >
            {error}
          </div>
        )}

        <button type="submit" className={`${btn} w-full min-h-[48px]`} disabled={busy}>
          <Sparkles size={16} />
          {busy ? "Validating & Submitting…" : "Submit Community Report"}
        </button>

        <p className="text-[11px] text-center text-muted-foreground">
          Notice: Submitted reports are stored on the educational demo server for review and IDT
          project demonstration.
        </p>
      </form>
    </div>
  );
}
