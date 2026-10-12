import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  CATEGORIES,
  MAX_DESCRIPTION,
  MAX_LOCATION,
  MAX_PHOTO_DATA_URL,
  NEIGHBORHOODS,
} from "@/lib/report-model";
import { createReport, listPublicReports } from "@/lib/server/report-store";

const newReportSchema = z
  .object({
    category: z.enum(CATEGORIES),
    neighborhood: z.enum(NEIGHBORHOODS),
    location: z.string().trim().min(1).max(MAX_LOCATION),
    description: z.string().trim().min(1).max(MAX_DESCRIPTION),
    photo: z
      .string()
      .regex(/^data:image\/jpeg;base64,/)
      .max(MAX_PHOTO_DATA_URL)
      .optional(),
  })
  .strict();

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/reports")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await listPublicReports(), {
            headers: { "Cache-Control": "no-store" },
          });
        } catch (error) {
          console.error("Could not read reports", error);
          return errorResponse("Reports are temporarily unavailable.", 500);
        }
      },
      POST: async ({ request }) => {
        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > 2_500_000) return errorResponse("The report is too large.", 413);

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return errorResponse("Request body must be valid JSON.", 400);
        }

        const parsed = newReportSchema.safeParse(body);
        if (!parsed.success)
          return errorResponse("Please check the report fields and try again.", 400);

        try {
          const { photo, ...reportFields } = parsed.data;
          return Response.json(
            await createReport({
              ...reportFields,
              ...(photo === undefined ? {} : { photo }),
            }),
            {
              status: 201,
              headers: { "Cache-Control": "no-store" },
            },
          );
        } catch (error) {
          console.error("Could not create report", error);
          return errorResponse("The report could not be saved. Please try again.", 500);
        }
      },
    },
  },
});
