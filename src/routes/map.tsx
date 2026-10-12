import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Info, ArrowRight, RefreshCw } from "lucide-react";
import {
  ALL_HOODS,
  NEIGHBORHOODS,
  filterByHood,
  useNeighborhood,
  useReports,
  type PublicReport,
} from "@/lib/data";
import { DemoBadge, PageTitle, Spinner, StatusPill, input, btnOutline } from "@/components/ui-kit";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Community Map — UNISON" },
      { name: "description", content: "See reported neighborhood issues on a demo map." },
      { property: "og:title", content: "Community Map — UNISON" },
      { property: "og:description", content: "See reported neighborhood issues on a demo map." },
    ],
  }),
  component: MapPage,
});

// Places markers at stable pseudo-positions derived from the reference ID (demo only).
function pos(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { x: 8 + (h % 84), y: 10 + ((h >> 8) % 78) };
}

function MapPage() {
  const { reports: all, loading, error } = useReports();
  const refresh = () => window.dispatchEvent(new Event("unison-demo-changed"));
  const [hood, setHood] = useNeighborhood();
  const reports = filterByHood(all, hood);
  const [sel, setSel] = useState<PublicReport>();

  // Nudge pins with loop guard (max 40 iterations) to guarantee zero browser freezes
  const placed: { x: number; y: number }[] = [];
  const positions = reports.map((r) => {
    const p = pos(r.id);
    let attempts = 0;
    while (
      placed.some((q) => Math.abs(q.x - p.x) < 5 && Math.abs(q.y - p.y) < 6) &&
      attempts < 40
    ) {
      p.x = 8 + ((p.x + 7) % 84);
      p.y = 10 + ((p.y + 5) % 78);
      attempts++;
    }
    placed.push(p);
    return p;
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="Community Issue Map"
        subtitle="Visual distribution of neighborhood defects. Pins represent logged issues."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge>Simulated Coordinates</DemoBadge>
            <button
              onClick={() => void refresh()}
              disabled={loading}
              className={`${btnOutline} min-h-[38px] px-3.5 py-1.5 text-xs`}
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-primary" : ""} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        }
      />

      {error && (
        <div
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm font-medium text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Neighborhood selector bar */}
      <div className="card-base p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-xs sm:text-sm font-bold text-foreground">
          <MapPin size={16} className="text-primary" /> Filter Map Sector:
          <select
            className={`${input} max-w-xs`}
            value={hood}
            onChange={(e) => setHood(e.target.value)}
          >
            {[ALL_HOODS, ...NEIGHBORHOODS].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs font-semibold text-muted-foreground">
          {reports.length} {reports.length === 1 ? "defect" : "defects"} plotted
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* SVG Neumorphic Map Canvas */}
        <div className="card-base relative aspect-[4/3] overflow-hidden bg-background lg:col-span-2 shadow-[inset_3px_3px_8px_rgba(163,177,198,0.5),inset_-3px_-3px_8px_rgba(255,255,255,0.85)] border border-border/40">
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold text-foreground border border-border/60 shadow-sm backdrop-blur">
              Demo Sector Map
            </span>
          </div>

          {/* Stylized vector map layer */}
          <svg
            aria-hidden
            viewBox="0 0 100 75"
            className="absolute inset-0 h-full w-full opacity-60"
            preserveAspectRatio="none"
          >
            {/* Sector zones */}
            <rect x="58" y="8" width="28" height="20" rx="4" fill="#38B2AC" fillOpacity="0.2" />
            <ellipse cx="22" cy="58" rx="14" ry="9" fill="#3182CE" fillOpacity="0.2" />

            {/* Grid street layout */}
            {[20, 45, 70].map((v) => (
              <line
                key={"h" + v}
                x1="0"
                x2="100"
                y1={v * 0.75}
                y2={v * 0.75}
                stroke="#A3B1C6"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}
            {[25, 50, 78].map((v) => (
              <line
                key={"v" + v}
                y1="0"
                y2="75"
                x1={v}
                x2={v}
                stroke="#A3B1C6"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}
          </svg>

          {/* Map Landmark Labels */}
          <span className="absolute left-[64%] top-[18%] text-xs font-bold text-teal-800 pointer-events-none">
            Green Park Zone
          </span>
          <span className="absolute left-[16%] top-[76%] text-xs font-bold text-blue-800 pointer-events-none">
            Lakeview Sector
          </span>

          {loading ? (
            <div className="absolute inset-0 grid place-items-center bg-background/50 backdrop-blur-sm">
              <Spinner />
            </div>
          ) : (
            reports.map((r, i) => {
              const p = positions[i] ?? { x: 50, y: 50 };
              const isSelected = sel?.id === r.id;
              const isResolved = r.status === "Resolved";

              return (
                <button
                  key={r.id}
                  onClick={() => setSel(r)}
                  title={`${r.category} (${r.status})`}
                  aria-label={`${r.category}, status ${r.status}`}
                  aria-pressed={isSelected}
                  className={`absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-primary ${
                    isSelected ? "scale-125 z-20" : "z-10"
                  } ${isResolved ? "text-teal-600" : "text-destructive"}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div className="grid h-11 w-11 place-items-center">
                    <MapPin
                      size={32}
                      fill="currentColor"
                      className="drop-shadow-md stroke-background"
                      aria-hidden
                    />
                  </div>
                </button>
              );
            })
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="card-base px-5 py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground">
                No active complaints reported in this sector.
              </p>
            </div>
          )}
        </div>

        {/* Selected Pin Details Card */}
        <div className="card-base p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h2 className="text-base font-bold text-foreground">Defect Details</h2>
              <DemoBadge>Inspector Pin</DemoBadge>
            </div>

            {sel ? (
              <div className="mt-4 space-y-3" aria-live="polite">
                <StatusPill status={sel.status} />
                <div>
                  <h3 className="text-lg font-bold text-foreground">{sel.category}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sector:{" "}
                    <span className="text-foreground font-semibold">
                      {sel.neighborhood ?? "General"}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-background p-3 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                  <p className="text-[11px] font-semibold text-muted-foreground">Reference ID</p>
                  <p className="font-mono text-xs font-bold text-primary mt-0.5">{sel.id}</p>
                </div>

                <Link
                  to="/track"
                  search={{ id: sel.id }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  Track progress timeline in detail <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="mt-8 text-center py-6 text-muted-foreground">
                <MapPin size={32} className="mx-auto text-primary/40 mb-2" />
                <p className="text-xs sm:text-sm font-medium">
                  Select any pin on the map to inspect defect details and progress.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-destructive" /> Active Issue
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-teal-600" /> Resolved Issue
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal flex items-start gap-1.5">
              <Info size={14} className="shrink-0 mt-0.5 text-primary" />
              Pins are plotted deterministically on this educational demo canvas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
