import { describe, expect, it } from "vitest";
import { ALL_HOODS, filterByHood, isAllowedImage, type Report } from "@/lib/data";

const r = (id: string, neighborhood?: string): Report => ({ id, neighborhood, category: "Pothole", location: "x", description: "y", date: "", status: "Submitted" });

describe("neighborhood filter", () => {
  const list = [r("a", "Lakeview (demo)"), r("b", "Riverside (demo)"), r("c")];
  it("shows only the selected neighborhood plus legacy reports", () => {
    expect(filterByHood(list, "Lakeview (demo)").map((x) => x.id)).toEqual(["a", "c"]);
  });
  it("shows everything for All neighborhoods", () => {
    expect(filterByHood(list, ALL_HOODS)).toHaveLength(3);
  });
});

describe("photo type check", () => {
  it("rejects SVG", () => expect(isAllowedImage("image/svg+xml")).toBe(false));
  it("accepts JPEG", () => expect(isAllowedImage("image/jpeg")).toBe(true));
});
