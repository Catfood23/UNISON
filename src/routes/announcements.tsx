import { createFileRoute } from "@tanstack/react-router";
import { Construction, Droplet, Trash2 } from "lucide-react";
import { ANNOUNCEMENTS } from "@/lib/data";
import { DemoBadge, PageTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — UNISON" },
      { name: "description", content: "Road repairs, water supply updates and garbage collection schedules." },
      { property: "og:title", content: "Announcements — UNISON" },
      { property: "og:description", content: "Road repairs, water supply updates and garbage collection schedules." },
    ],
  }),
  component: AnnouncementsPage,
});

const ICONS = [Construction, Droplet, Trash2];

function AnnouncementsPage() {
  return (
    <div>
      <PageTitle title="Community Announcements" subtitle="Example notices showing how residents would receive updates." />
      <div className="mb-4"><DemoBadge>All announcements are demo data</DemoBadge></div>
      <div className="space-y-4">
        {ANNOUNCEMENTS.map((a, i) => {
          const Icon = ICONS[i] ?? Construction;
          return (
            <article key={a.title} className="card-base flex gap-4 p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon /></span>
              <div>
                <p className="text-xs font-semibold uppercase text-primary">{a.type} · {a.date}</p>
                <h2 className="font-bold">{a.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
