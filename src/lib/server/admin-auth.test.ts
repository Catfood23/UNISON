import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  adminCookie,
  createAdminSession,
  isAdminConfigured,
  isAdminRequest,
  isSameOrigin,
} from "./admin-auth";

const originalPassword = process.env["UNISON_ADMIN_PASSWORD"];
const testPassword = "unison-test-admin-password-32chars";

beforeEach(() => {
  process.env["UNISON_ADMIN_PASSWORD"] = testPassword;
});

afterEach(() => {
  if (originalPassword === undefined) delete process.env["UNISON_ADMIN_PASSWORD"];
  else process.env["UNISON_ADMIN_PASSWORD"] = originalPassword;
});

describe("admin session security", () => {
  it("signs and verifies an admin session cookie", async () => {
    const token = await createAdminSession(testPassword);
    expect(token).toBeTruthy();
    const request = new Request("https://unison.example/api/admin/reports", {
      headers: { cookie: adminCookie(token!).split(";")[0]! },
    });
    await expect(isAdminRequest(request)).resolves.toBe(true);
  });

  it("rejects missing or tampered session cookies", async () => {
    const request = new Request("https://unison.example/api/admin/reports", {
      headers: { cookie: "__Host-unison-admin=1234567890.invalid" },
    });
    await expect(isAdminRequest(request)).resolves.toBe(false);
    await expect(
      isAdminRequest(new Request("https://unison.example/api/admin/reports")),
    ).resolves.toBe(false);
  });

  it("requires a long configured password", () => {
    process.env["UNISON_ADMIN_PASSWORD"] = "too-short";
    expect(isAdminConfigured()).toBe(false);
  });

  it("accepts only same-origin mutation requests", () => {
    expect(
      isSameOrigin(
        new Request("https://unison.example/api/admin/session", {
          headers: { origin: "https://unison.example" },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOrigin(
        new Request("https://unison.example/api/admin/session", {
          headers: { origin: "https://attacker.example" },
        }),
      ),
    ).toBe(false);
  });
});
