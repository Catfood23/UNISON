import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  adminCookie,
  clearedAdminCookie,
  createAdminSession,
  isAdminConfigured,
  isAdminRequest,
  sameOriginRequired,
} from "@/lib/server/admin-auth";

const loginSchema = z.object({ password: z.string().min(1).max(256) }).strict();

function unavailable() {
  return Response.json(
    { configured: false, authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAdminConfigured()) return unavailable();
        return Response.json(
          { configured: true, authenticated: await isAdminRequest(request) },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
      POST: async ({ request }) => {
        const originError = sameOriginRequired(request);
        if (originError) return originError;
        if (!isAdminConfigured()) {
          return Response.json(
            { error: "Admin access is not configured. Set a 24-character minimum Worker secret." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
        }
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Enter the admin password." }, { status: 400 });
        }
        const token = await createAdminSession(parsed.data.password);
        if (!token) {
          return Response.json(
            { error: "The password was not accepted." },
            { status: 401, headers: { "Cache-Control": "no-store" } },
          );
        }
        return Response.json(
          { authenticated: true },
          { headers: { "Cache-Control": "no-store", "Set-Cookie": adminCookie(token) } },
        );
      },
      DELETE: async ({ request }) => {
        const originError = sameOriginRequired(request);
        if (originError) return originError;
        return Response.json(
          { authenticated: false },
          { headers: { "Cache-Control": "no-store", "Set-Cookie": clearedAdminCookie() } },
        );
      },
    },
  },
});
