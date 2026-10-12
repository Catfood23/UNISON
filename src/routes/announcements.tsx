import { createFileRoute } from "@tanstack/react-router";
import { Construction, Droplet, Trash2, Megaphone, Bell, Calendar, Info } from "lucide-react";
import { ANNOUNCEMENTS } from "@/lib/data";
import { DemoBadge, PageTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — UNISON" },
      {
        name: "description",
        content: "Road repairs, water supply updates and garbage collection schedules.",
      },
      { property: "og:title", content: "Announcements — UNISON" },
      {
        property: "og:description",
        content: "Road repairs, water supply updates and garbage collection schedules.",
      },
    ],
  }),
  component: AnnouncementsPage,
});

const ICONS = [Construction, Droplet, Trash2];

function AnnouncementsPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        title="Community Announcements & Advisories"
        subtitle="Simulated municipal notices illustrating how local governance teams communicate schedules and updates to residents."
        actions={<DemoBadge>Prototype Demo Feed</DemoBadge>}
      />

      {/* Advisory Banner */}
      <div className="card-base bg-background p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-muted-foreground border border-primary/20">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Demonstration Data:</strong> The announcements below
          represent sample road work, water utility schedules, and sanitation guidelines for the
          UNISON educational prototype.
        </p>
      </div>

      <div className="space-y-5">
        {ANNOUNCEMENTS.map((a, i) => {
          const Icon = ICONS[i] ?? Construction;
          return (
            <article
              key={a.title}
              className="card-base p-6 sm:p-7 flex flex-col sm:flex-row items-start gap-5 transition hover:-translate-y-0.5"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-background shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.9)] border border-white/60 text-primary">
                <Icon size={26} />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                      {a.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Calendar size={12} /> {a.date}
                    </span>
                  </div>
                  <DemoBadge>Sample Post</DemoBadge>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {a.title}
                </h2>

                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{a.body}</p>

                <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Bell size={12} className="text-primary" /> Affected: All Neighborhood Sectors
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
