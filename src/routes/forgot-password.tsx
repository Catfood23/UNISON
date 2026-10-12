import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/components/auth-ui";
export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [{ title: "Password help — UNISON" }, { name: "robots", content: "noindex" }],
  }),
});
