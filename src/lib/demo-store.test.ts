import { beforeEach, describe, expect, it } from "vitest";
import {
  canAccessRole,
  changeUserRole,
  getSession,
  homeRouteForRole,
  listUsers,
  loginUser,
  saveSession,
  saveUsers,
  SESSION_KEY,
  SESSION_TTL,
  signupUser,
} from "@/lib/demo-store";
import { DEMO_ADMIN } from "@/lib/demo-constants";

describe("browser demo accounts and sessions", () => {
  beforeEach(() => localStorage.clear());

  it("validates sign-up and always creates a resident", () => {
    expect(() =>
      signupUser({ name: "A", email: "bad", neighborhood: "Green Park (demo)", password: "short" }),
    ).toThrow();
    expect(
      signupUser({
        name: "Riya Rao",
        email: "RIYA@example.test",
        neighborhood: "Green Park (demo)",
        password: "Resident123",
      }).role,
    ).toBe("resident");
  });

  it("rejects duplicate emails case-insensitively", () => {
    signupUser({
      name: "Riya Rao",
      email: "riya@example.test",
      neighborhood: "Green Park (demo)",
      password: "Resident123",
    });
    expect(() =>
      signupUser({
        name: "Riya Two",
        email: "RIYA@example.test",
        neighborhood: "Lakeview (demo)",
        password: "Resident123",
      }),
    ).toThrow(/already uses/u);
  });

  it("authenticates the stored account and rejects wrong credentials", () => {
    expect(loginUser(DEMO_ADMIN.email, DEMO_ADMIN.password).role).toBe("admin");
    expect(() => loginUser(DEMO_ADMIN.email, "wrong-password")).toThrow(/incorrect/u);
  });

  it("chooses the destination from the stored role, not the sign-in tab", () => {
    expect(homeRouteForRole("resident")).toBe("/app");
    expect(homeRouteForRole("admin")).toBe("/admin");
  });

  it("guards protected and admin-only access", () => {
    const resident = signupUser({
      name: "Riya Rao",
      email: "riya@example.test",
      neighborhood: "Green Park (demo)",
      password: "Resident123",
    });
    expect(canAccessRole(null)).toBe(false);
    expect(canAccessRole(resident)).toBe(true);
    expect(canAccessRole(resident, "admin")).toBe(false);
    expect(canAccessRole(DEMO_ADMIN, "admin")).toBe(true);
  });

  it("prevents demoting the last administrator", () => {
    const resident = signupUser({
      name: "Riya Rao",
      email: "riya@example.test",
      neighborhood: "Green Park (demo)",
      password: "Resident123",
    });
    saveUsers([...listUsers(), resident]);
    expect(() => changeUserRole(DEMO_ADMIN.id, "resident", resident.id)).toThrow(
      /at least one active administrator/iu,
    );
    expect(listUsers().find((user) => user.id === DEMO_ADMIN.id)?.role).toBe("admin");
  });

  it("expires sessions after 24 hours and safely removes invalid sessions", () => {
    saveSession({ userId: DEMO_ADMIN.id, expiresAt: Date.now() + SESSION_TTL });
    expect(getSession()?.userId).toBe(DEMO_ADMIN.id);
    saveSession({ userId: DEMO_ADMIN.id, expiresAt: Date.now() - 1 });
    expect(getSession()).toBeNull();
    localStorage.setItem(SESSION_KEY, "not valid JSON");
    expect(getSession()).toBeNull();
  });
});
