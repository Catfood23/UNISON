import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { useReports, type Report } from "@/lib/data";
import { DemoBadge, PageTitle, Spinner, StatusPill } from "@/components/ui-kit";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Community Map — Smart Community" },
      { name: "description", content: "See reported neighborhood issues on a demo map." },
      { property: "og:title", content: "Community Map — Smart Community" },
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
  const { reports, loading } = useReports();
  const [sel, setSel] = useState<Report>();

  return (
    <div>
      <PageTitle title="Community Map" subtitle="Each pin is a reported issue. Positions are approximate for demonstration." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-base relative aspect-[4/3] overflow-hidden bg-secondary lg:col-span-2">
          <div className="absolute left-3 top-3 z-10"><DemoBadge>Demo map — not a real map</DemoBadge></div>
          <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <rect x="60" y="8" width="25" height="18" rx="3" className="fill-accent" />
            <ellipse cx="22" cy="58" rx="14" ry="9" className="fill-info/30" />
            {[20, 45, 70].map((v) => <line key={"h" + v} x1="0" x2="100" y1={v * 0.75} y2={v * 0.75} className="stroke-background" strokeWidth="2.5" />)}
            {[25, 50, 78].map((v) => <line key={"v" + v} y1="0" y2="75" x1={v} x2={v} className="stroke-background" strokeWidth="2.5" />)}
          </svg>
          <span className="absolute left-[64%] top-[18%] text-xs font-semibold text-accent-foreground">Park</span>
          <span className="absolute left-[16%] top-[76%] text-xs font-semibold text-info">Lake</span>
          {loading ? <div className="absolute inset-0 grid place-items-center"><Spinner /></div> : reports.map((r) => {
            const p = pos(r.location);
            return (
              <button key={r.id} onClick={() => setSel(r)} title={r.category}
                className={`absolute -translate-x-1/2 -translate-y-full transition hover:scale-125 ${r.status === "Resolved" ? "text-primary" : "text-destructive"}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <MapPin size={30} fill="currentColor" className="stroke-background" />
              </button>
            );
          })}
          {!loading && reports.length === 0 && (
            <div className="absolute inset-0 grid place-items-center"><p className="rounded-xl bg-background px-4 py-2 text-sm font-medium">No reports to show yet</p></div>
          )}
        </div>
        <div className="card-base p-5">
          <h2 className="font-bold">Details</h2>
          {sel ? (
            <div className="mt-3 space-y-2">
              <StatusPill status={sel.status} />
              <p className="font-semibold">{sel.category}</p>
              <p className="text-sm text-muted-foreground">{sel.location}</p>
              <p className="text-sm">{sel.description}</p>
            </div>
          ) : <p className="mt-3 text-sm text-muted-foreground">Tap a pin to see the issue.</p>}
          <div className="mt-6 space-y-1 border-t pt-4 text-sm">
            <p className="flex items-center gap-2"><MapPin size={16} className="text-destructive" /> Open issue</p>
            <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Resolved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
