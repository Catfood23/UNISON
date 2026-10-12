import type { Announcement, DemoReport, User } from "@/lib/demo-types";

// Demo credentials are intentionally seeded for this educational prototype. Never hardcode credentials in a real app.
export const DEMO_ADMIN: User = {
  id: "user-demo-admin",
  name: "UNISON Admin",
  email: "admin@unison.demo",
  neighborhood: "Green Park (demo)",
  role: "admin",
  joinedAt: "2026-10-12T00:00:00.000Z",
  active: true,
  password: "Admin@123",
};

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "announcement-road",
    type: "Road repair",
    title: "Main Street resurfacing",
    body: "Road repair work between 10 AM and 5 PM on Monday–Wednesday. Please use the bypass lane.",
    date: "Oct 12",
  },
  {
    id: "announcement-water",
    type: "Water supply",
    title: "Scheduled water interruption",
    body: "Water supply will be paused on Saturday 9 AM–1 PM for pipeline maintenance. Store water in advance.",
    date: "Oct 14",
  },
  {
    id: "announcement-garbage",
    type: "Garbage",
    title: "New garbage collection schedule",
    body: "Wet waste: daily 7 AM. Dry waste: Tuesdays and Fridays. Please segregate waste at home.",
    date: "Oct 15",
  },
];

export const SEED_REPORTS: DemoReport[] = [
  {
    id: "UN-DEMO00001",
    ownerId: DEMO_ADMIN.id,
    category: "Garbage",
    neighborhood: "Green Park (demo)",
    location: "Community square (sample)",
    description: "Sample report showing how a neighborhood issue appears in the admin workspace.",
    date: "2026-10-10T08:30:00.000Z",
    status: "In Progress",
    internalNote: "Sample data for the IDT demonstration.",
  },
];
