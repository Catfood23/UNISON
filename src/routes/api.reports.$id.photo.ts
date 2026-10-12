import { createFileRoute } from "@tanstack/react-router";
import { getReportPhoto } from "@/lib/server/report-store";
import { adminUnauthorized, isAdminRequest } from "@/lib/server/admin-auth";

export const Route = createFileRoute("/api/reports/$id/photo")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (!(await isAdminRequest(request))) return adminUnauthorized();
        try {
          const photo = await getReportPhoto(params.id);
          return photo
            ? new Response(new Uint8Array(photo.bytes).buffer as ArrayBuffer, {
                headers: {
                  "Content-Type": photo.mimeType,
                  "Cache-Control": "no-store",
                  "X-Content-Type-Options": "nosniff",
                },
              })
            : Response.json(
                { error: "Photo not found." },
                { status: 404, headers: { "Cache-Control": "no-store" } },
              );
        } catch (error) {
          console.error("Could not read report photo", error);
          return Response.json(
            { error: "The photo is temporarily unavailable." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
