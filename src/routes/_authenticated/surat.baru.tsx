import { createFileRoute } from "@tanstack/react-router";
import { SuratForm } from "@/components/surat-form";

export const Route = createFileRoute("/_authenticated/surat/baru")({
  head: () => ({ meta: [
    { title: "Buat Surat Perintah — Polres Situbondo" }, { name: "description", content: "Buat Surat Perintah baru." },
    { property: "og:title", content: "Buat Surat Perintah — Polres Situbondo" }, { property: "og:description", content: "Buat Surat Perintah baru." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: () => <SuratForm />,
});