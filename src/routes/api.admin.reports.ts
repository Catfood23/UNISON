import { createFileRoute } from "@tanstack/react-router";
import { adminUnauthorized, isAdminRequest } from "@/lib/server/admin-auth";
import { listReports } from "@/lib/server/report-store";

export const Route = createFileRoute("/api/admin/reports")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAdminRequest(request))) return adminUnauthorized();
        try {
          return Response.json(await listReports(), { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("Could not read admin reports", error);
          return Response.json(
            { error: "Reports are temporarily unavailable." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
