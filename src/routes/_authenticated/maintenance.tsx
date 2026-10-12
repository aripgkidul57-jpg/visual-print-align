import { createFileRoute } from "@tanstack/react-router";

import { DashboardView } from "@/components/dashboard-view";
import { requireKriteria } from "@/lib/akses";

export const Route = createFileRoute("/_authenticated/maintenance")({
  beforeLoad: () => requireKriteria(["maintenance"]),
  head: () => ({ meta: [
    { title: "Dashboard Maintenance — Surat Perintah Polres Situbondo" }, { name: "description", content: "Dashboard maintenance aplikasi Surat Perintah." },
    { property: "og:title", content: "Dashboard Maintenance — Surat Perintah Polres Situbondo" }, { property: "og:description", content: "Dashboard maintenance aplikasi Surat Perintah." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <DashboardView title="Dashboard Maintenance" description="Pemeliharaan dan konfigurasi isi Surat Perintah" />,
});
