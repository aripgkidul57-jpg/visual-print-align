import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { DashboardView } from "@/components/dashboard-view";
import { Button } from "@/components/ui/button";
import { requireKriteria } from "@/lib/akses";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => requireKriteria(["admin"]),
  head: () => ({ meta: [
    { title: "Dashboard Admin — Surat Perintah Polres Situbondo" }, { name: "description", content: "Dashboard admin: surat dan manajemen personil." },
    { property: "og:title", content: "Dashboard Admin — Surat Perintah Polres Situbondo" }, { property: "og:description", content: "Dashboard admin: surat dan manajemen personil." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <DashboardView
      title="Dashboard Admin"
      description="Kelola surat, personil, kriteria, dan status akses"
      extra={<div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-border bg-card p-4"><div><strong className="block text-sm">Manajemen Data Personil</strong><span className="text-sm text-muted-foreground">Tambah, ubah, aktifkan atau nonaktifkan personil.</span></div><Button asChild><Link to="/personel"><Users />Buka</Link></Button></div>}
    />
  ),
});
