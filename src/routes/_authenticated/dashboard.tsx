import { createFileRoute } from "@tanstack/react-router";

import { DashboardView } from "@/components/dashboard-view";
import { requireKriteria } from "@/lib/akses";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: () => requireKriteria(["user"]),
  head: () => ({ meta: [
    { title: "Dashboard User — Surat Perintah Polres Situbondo" }, { name: "description", content: "Ringkasan Surat Perintah untuk personil." },
    { property: "og:title", content: "Dashboard User — Surat Perintah Polres Situbondo" }, { property: "og:description", content: "Ringkasan Surat Perintah untuk personil." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <DashboardView title="Dashboard" description="Ringkasan administrasi Surat Perintah" />,
});
