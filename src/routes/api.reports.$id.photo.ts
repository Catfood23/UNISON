import { createFileRoute } from "@tanstack/react-router";
import { getReportPhoto } from "@/lib/server/report-store";

export const Route = createFileRoute("/api/reports/$id/photo")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const photo = await getReportPhoto(params.id);
          return photo
            ? new Response(new Uint8Array(photo.bytes).buffer as ArrayBuffer, {
                headers: {
                  "Content-Type": photo.mimeType,
                  "Cache-Control": "private, max-age=300",
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
