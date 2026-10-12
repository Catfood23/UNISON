import type { Category, Status } from "@/lib/report-model";

export type Role = "resident" | "admin";
export type User = {
  id: string;
  name: string;
  email: string;
  neighborhood: string;
  role: Role;
  joinedAt: string;
  active: boolean;
  password: string;
};
export type Announcement = {
  id: string;
  type: string;
  title: string;
  body: string;
  date: string;
};
export type DemoReport = {
  id: string;
  ownerId: string;
  category: Category;
  neighborhood: string;
  location: string;
  description: string;
  photo?: string;
  date: string;
  status: Status;
  internalNote: string;
};
