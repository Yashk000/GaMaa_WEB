import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  component: AdminDisabledPage,
});

function AdminDisabledPage() {
  return <div className="min-h-screen bg-background px-6 py-24 text-foreground">Admin panel disabled for now.</div>;
}
