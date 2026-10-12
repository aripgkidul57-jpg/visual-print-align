import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireKriteria } from "@/lib/akses";

export const Route = createFileRoute("/_authenticated/surat")({
  beforeLoad: () => requireKriteria(["admin", "maintenance", "user"]),
  component: () => <Outlet />,
});
