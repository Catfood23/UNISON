import { createFileRoute } from "@tanstack/react-router";
import { Ambulance, Hospital, Navigation, Phone, PhoneCall, Shield } from "lucide-react";
import { DemoBadge, PageTitle, btnOutline } from "@/components/ui-kit";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Services — Smart Community" },
      { name: "description", content: "Helpline numbers, hospitals, police and ambulance services." },
      { property: "og:title", content: "Emergency Services — Smart Community" },
      { property: "og:description", content: "Helpline numbers, hospitals, police and ambulance services." },
    ],
  }),
  component: EmergencyPage,
});

// Official national helplines in India (public information).
const HELPLINES = [
  { name: "National Emergency", num: "112" },
  { name: "Police", num: "100" },
  { name: "Fire", num: "101" },
  { name: "Ambulance", num: "108" },
  { name: "Women Helpline", num: "1091" },
  { name: "Child Helpline", num: "1098" },
];

// SAMPLE entries — Directions open a real Google Maps search for the nearest facility type.
const SECTIONS = [
  { title: "Nearby hospitals", icon: Hospital, query: "hospital near me", items: ["Sample City Hospital", "Sample Community Health Centre"] },
  { title: "Police stations", icon: Shield, query: "police station near me", items: ["Sample Police Station", "Sample Traffic Police Booth"] },
  { title: "Ambulance services", icon: Ambulance, query: "ambulance service near me", items: ["National ambulance — dial 108", "Emergency response — dial 112"] },
];

function EmergencyPage() {
  return (
    <div className="space-y-8">
      <PageTitle title="Emergency Services" subtitle="In an emergency, call 112 immediately." />

      <section className="card-base border-destructive/30 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><PhoneCall size={18} className="text-destructive" /> Emergency helpline numbers (India)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {HELPLINES.map((h) => (
            <a key={h.num} href={`tel:${h.num}`} className="rounded-xl bg-muted p-4 hover:bg-secondary">
              <p className="text-2xl font-bold text-destructive">{h.num}</p>
              <p className="text-sm text-muted-foreground">{h.name}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card-base p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold"><s.icon size={18} className="text-primary" /> {s.title}</h2>
              <DemoBadge>Sample</DemoBadge>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {s.items.map((i) => <li key={i} className="rounded-lg bg-muted px-3 py-2">{i}</li>)}
            </ul>
            <div className="mt-4 flex gap-2">
              <a href="tel:112" className={btnOutline}><Phone size={15} /> Call 112</a>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.query)}`} target="_blank" rel="noreferrer" className={btnOutline}><Navigation size={15} /> Find nearest</a>
            </div>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Facility names above are sample placeholders. “Find nearest” opens Google Maps to search real facilities near you.</p>
    </div>
  );
}
