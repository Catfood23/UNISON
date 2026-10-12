import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({ component: IndexRedirect });
function IndexRedirect() {
  const { user, loading } = useAuth();
  const navigate = Route.useNavigate();
  useEffect(() => {
    if (!loading)
      void navigate({
        to: user ? (user.role === "admin" ? "/admin" : "/app") : "/login",
        replace: true,
      });
  }, [loading, user, navigate]);
  return (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      Opening your UNISON space…
    </div>
  );
}
