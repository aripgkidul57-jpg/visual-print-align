import { createFileRoute } from "@tanstack/react-router";
import { SuratForm } from "@/components/surat-form";

export const Route = createFileRoute("/_authenticated/surat/$id/edit")({
  head: () => ({ meta: [
    { title: "Edit Surat Perintah — Polres Situbondo" }, { name: "description", content: "Edit Surat Perintah yang tersimpan." },
    { property: "og:title", content: "Edit Surat Perintah — Polres Situbondo" }, { property: "og:description", content: "Edit Surat Perintah yang tersimpan." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: EditSuratPage,
});

function EditSuratPage() { const { id } = Route.useParams(); return <SuratForm id={id} />; }