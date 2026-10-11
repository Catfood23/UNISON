import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { STATUSES } from "@/lib/report-model";
import { deleteReport, updateReportStatus } from "@/lib/server/report-store";

const statusSchema = z.object({ status: z.enum(STATUSES) }).strict();

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/reports/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return errorResponse("Request body must be valid JSON.", 400);
        }

        const parsed = statusSchema.safeParse(body);
        if (!parsed.success) return errorResponse("Choose a valid report status.", 400);

        try {
          const report = await updateReportStatus(params.id, parsed.data.status);
          return report
            ? Response.json(report, { headers: { "Cache-Control": "no-store" } })
            : errorResponse("Report not found.", 404);
        } catch (error) {
          console.error("Could not update report", error);
          return errorResponse("The report could not be updated. Please try again.", 500);
        }
      },
      DELETE: async ({ params }) => {
        try {
          const deleted = await deleteReport(params.id);
          return deleted
            ? new Response(null, { status: 204 })
            : errorResponse("Report not found.", 404);
        } catch (error) {
          console.error("Could not delete report", error);
          return errorResponse("The report could not be deleted. Please try again.", 500);
        }
      },
    },
  },
});
