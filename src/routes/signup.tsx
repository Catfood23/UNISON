import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/components/auth-ui";
export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [{ title: "Create account — UNISON" }, { name: "robots", content: "noindex" }],
  }),
});
