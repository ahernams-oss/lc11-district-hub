import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/regioes/$id")({
  component: () => <Outlet />,
});
