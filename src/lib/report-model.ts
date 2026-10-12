export const CATEGORIES = [
  "Pothole",
  "Damaged road",
  "Broken streetlight",
  "Garbage",
  "Drainage",
  "Waterlogging",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["Submitted", "Verified", "In Progress", "Resolved"] as const;
export type Status = (typeof STATUSES)[number];

export const NEIGHBORHOODS = [
  "Green Park (demo)",
  "Lakeview (demo)",
  "Riverside (demo)",
  "Old Town (demo)",
] as const;
export type Neighborhood = (typeof NEIGHBORHOODS)[number];

export type Report = {
  id: string;
  category: Category;
  neighborhood?: string;
  location: string;
  description: string;
  photo?: string;
  date: string;
  status: Status;
};

export type NewReport = {
  category: Category;
  neighborhood: Neighborhood;
  location: string;
  description: string;
  photo?: string;
};

/** Safe fields shown in public neighborhood summaries and reference lookups. */
export type PublicReport = Pick<Report, "id" | "category" | "neighborhood" | "date" | "status">;

export const MAX_LOCATION = 120;
export const MAX_DESCRIPTION = 1000;
export const MAX_PHOTO_DATA_URL = 2_000_000;
