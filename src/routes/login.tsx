import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth-ui";
export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Log in — UNISON" }, { name: "robots", content: "noindex" }] }),
});
