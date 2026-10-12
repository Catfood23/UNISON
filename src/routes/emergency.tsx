import { createFileRoute } from "@tanstack/react-router";
import {
  Ambulance,
  Hospital,
  Navigation,
  Phone,
  PhoneCall,
  Shield,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { DemoBadge, PageTitle, btnOutline } from "@/components/ui-kit";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Services — UNISON" },
      {
        name: "description",
        content: "Helpline numbers, hospitals, police and ambulance services.",
      },
      { property: "og:title", content: "Emergency Services — UNISON" },
      {
        property: "og:description",
        content: "Helpline numbers, hospitals, police and ambulance services.",
      },
    ],
  }),
  component: EmergencyPage,
});

// Official national helplines in India (verified public information).
const HELPLINES = [
  { name: "National Emergency Service", num: "112", primary: true },
  { name: "Police Control Room", num: "100", primary: false },
  { name: "Fire & Rescue Department", num: "101", primary: false },
  { name: "Medical Ambulance Emergency", num: "108", primary: false },
  { name: "Women's Safety Helpline", num: "1091", primary: false },
  { name: "Childline Emergency Support", num: "1098", primary: false },
];

// SAMPLE facilities — "Find Nearest" opens an actual live Google Maps query.
const SECTIONS = [
  {
    title: "Nearby Hospitals",
    icon: Hospital,
    query: "hospital near me",
    items: ["City General Hospital (Sample)", "Community Health Centre (Sample)"],
  },
  {
    title: "Police Stations",
    icon: Shield,
    query: "police station near me",
    items: ["Central Sector Police Station (Sample)", "Traffic Police Assistance Post (Sample)"],
  },
  {
    title: "Ambulance Units",
    icon: Ambulance,
    query: "ambulance service near me",
    items: ["National Ambulance Network — Dial 108", "Rapid Emergency Response — Dial 112"],
  },
];

function EmergencyPage() {
  return (
    <div className="space-y-10">
      <PageTitle
        title="Emergency Services & Helplines"
        subtitle="Immediate civic and safety contacts. In any critical life emergency, dial 112 immediately."
        actions={<DemoBadge>India Public Directory</DemoBadge>}
      />

      {/* Primary Emergency Banner */}
      <section className="card-base border-destructive/40 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-destructive/15 text-destructive">
              <PhoneCall size={20} />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Official National Helplines (India)
            </h2>
          </div>
          <span className="text-xs font-bold text-destructive flex items-center gap-1.5 bg-destructive/10 px-3 py-1 rounded-full">
            <AlertTriangle size={13} /> Immediate Life Threat: Dial 112
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {HELPLINES.map((h) => (
            <a
              key={h.num}
              href={`tel:${h.num}`}
              className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:-translate-y-1 ${
                h.primary
                  ? "bg-destructive/10 border border-destructive/40 shadow-[4px_4px_12px_rgba(229,62,62,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)]"
                  : "bg-background border border-white/60 shadow-[4px_4px_10px_rgba(163,177,198,0.55),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_14px_rgba(163,177,198,0.7),-6px_-6px_14px_rgba(255,255,255,0.95)]"
              }`}
              aria-label={`Call ${h.name} at ${h.num}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-destructive font-mono">
                  {h.num}
                </span>
                <Phone size={16} className="text-destructive/80" />
              </div>
              <p className="mt-3 text-xs sm:text-sm font-semibold text-foreground leading-snug">
                {h.name}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Facilities & Proximity Navigation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Emergency Care & Proximity Navigation
          </h2>
          <DemoBadge>Sample Facility Names</DemoBadge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <div key={s.title} className="card-base p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <s.icon size={18} className="text-primary" /> {s.title}
                  </h3>
                  <DemoBadge>Sample</DemoBadge>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
                  {s.items.map((i) => (
                    <li
                      key={i}
                      className="rounded-xl bg-background p-3 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.45),inset_-2px_-2px_4px_rgba(255,255,255,0.85)] text-foreground/90 font-medium"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex flex-wrap gap-2.5">
                <a
                  href="tel:112"
                  className={`${btnOutline} flex-1 min-h-[42px] text-xs`}
                  aria-label="Call national helpline 112"
                >
                  <Phone size={14} /> Call 112
                </a>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(s.query)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${btnOutline} flex-1 min-h-[42px] text-xs`}
                  aria-label={`Open Google Maps to find nearest ${s.title}`}
                >
                  <Navigation size={14} className="text-primary" /> Find Nearest{" "}
                  <ExternalLink size={11} className="text-muted-foreground" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="card-base bg-background p-4 sm:p-5 text-xs text-muted-foreground">
        <p>
          <strong>Note on emergency tools:</strong> Telephone call links trigger phone dialing on
          mobile devices. Facility names listed above are sample representations for this
          educational prototype. The "Find Nearest" button launches an actual Google Maps search
          centered on your device's live location.
        </p>
      </div>
    </div>
  );
}
