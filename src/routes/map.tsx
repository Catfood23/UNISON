import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  ALL_HOODS,
  NEIGHBORHOODS,
  filterByHood,
  useNeighborhood,
  useReports,
  type Report,
} from "@/lib/data";
import { DemoBadge, PageTitle, Spinner, StatusPill, input } from "@/components/ui-kit";

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

// Places markers at a stable pseudo-position derived from the location text (demo only).
function pos(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { x: 8 + (h % 84), y: 10 + ((h >> 8) % 78) };
}

function MapPage() {
  const { reports: all, loading, error } = useReports();
  const [hood, setHood] = useNeighborhood();
  const reports = filterByHood(all, hood);
  const [sel, setSel] = useState<Report>();
  // Nudge pins that would land on top of each other so every report stays clickable.
  const placed: { x: number; y: number }[] = [];
  const positions = reports.map((r) => {
    const p = pos(r.location + r.id);
    while (placed.some((q) => Math.abs(q.x - p.x) < 5 && Math.abs(q.y - p.y) < 6)) {
      p.x = 8 + ((p.x + 7) % 84);
      p.y = 10 + ((p.y + 5) % 78);
    }
    placed.push(p);
    return p;
  });

  return (
    <div>
      <PageTitle
        title="Community Map"
        subtitle="Each pin is a reported issue. Positions are approximate for demonstration."
      />
      {error && (
        <p
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      <label className="mb-4 block text-sm font-semibold">
        Neighborhood
        <select
          className={`${input} mt-1 max-w-xs`}
          value={hood}
          onChange={(e) => setHood(e.target.value)}
        >
          {[ALL_HOODS, ...NEIGHBORHOODS].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-base relative aspect-[4/3] overflow-hidden bg-secondary lg:col-span-2">
          <div className="absolute left-3 top-3 z-10">
            <DemoBadge>Demo map — not a real map</DemoBadge>
          </div>
          <svg
            aria-hidden
            viewBox="0 0 100 75"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <rect x="60" y="8" width="25" height="18" rx="3" className="fill-accent" />
            <ellipse cx="22" cy="58" rx="14" ry="9" className="fill-info/30" />
            {[20, 45, 70].map((v) => (
              <line
                key={"h" + v}
                x1="0"
                x2="100"
                y1={v * 0.75}
                y2={v * 0.75}
                className="stroke-background"
                strokeWidth="2.5"
              />
            ))}
            {[25, 50, 78].map((v) => (
              <line
                key={"v" + v}
                y1="0"
                y2="75"
                x1={v}
                x2={v}
                className="stroke-background"
                strokeWidth="2.5"
              />
            ))}
          </svg>
          <span className="absolute left-[64%] top-[18%] text-xs font-semibold text-accent-foreground">
            Park
          </span>
          <span className="absolute left-[16%] top-[76%] text-xs font-semibold text-info">
            Lake
          </span>
          {loading ? (
            <div className="absolute inset-0 grid place-items-center">
              <Spinner />
            </div>
          ) : (
            reports.map((r, i) => {
              const p = positions[i] ?? { x: 50, y: 50 };
              return (
                <button
                  key={r.id}
                  onClick={() => setSel(r)}
                  title={r.category}
                  aria-label={`${r.category} at ${r.location}, status ${r.status}`}
                  aria-pressed={sel?.id === r.id}
                  className={`absolute -translate-x-1/2 -translate-y-full transition hover:scale-125 ${r.status === "Resolved" ? "text-primary" : "text-destructive"}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <MapPin size={30} fill="currentColor" className="stroke-background" aria-hidden />
                </button>
              );
            })
          )}
          {!loading && !error && reports.length === 0 && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="rounded-xl bg-background px-4 py-2 text-sm font-medium">
                No reports to show yet
              </p>
            </div>
          )}
        </div>
        <div className="card-base p-5">
          <h2 className="font-bold">Details</h2>
          {sel ? (
            <div className="mt-3 space-y-2" aria-live="polite">
              <StatusPill status={sel.status} />
              <p className="font-semibold">{sel.category}</p>
              <p className="text-sm text-muted-foreground">{sel.location}</p>
              <p className="break-words text-sm">{sel.description}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Tap a pin to see the issue.</p>
          )}
          <div className="mt-6 space-y-1 border-t pt-4 text-sm">
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-destructive" /> Open issue
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Resolved
            </p>
          </div>
          {reports.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold">All pins ({reports.length})</h3>
              <ul className="mt-2 max-h-56 space-y-1 overflow-auto text-sm">
                {reports.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSel(r)}
                      className="w-full truncate rounded-lg px-2 py-1.5 text-left hover:bg-muted"
                    >
                      {r.category} — {r.location} ({r.status})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
