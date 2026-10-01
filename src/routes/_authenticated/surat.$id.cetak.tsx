import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { LetterPreview } from "@/components/letter-preview";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { hydrateLetterData, type Personel, type SuratRecord } from "@/lib/surat";

export const Route = createFileRoute("/_authenticated/surat/$id/cetak")({
  head: () => ({ meta: [
    { title: "Cetak Surat Perintah — Polres Situbondo" }, { name: "description", content: "Pratinjau cetak Surat Perintah dalam format A4." },
    { property: "og:title", content: "Cetak Surat Perintah — Polres Situbondo" }, { property: "og:description", content: "Pratinjau cetak Surat Perintah dalam format A4." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: PrintPage,
});
function PrintPage() {
  const { id } = Route.useParams();
  const [surat, setSurat] = useState<SuratRecord | null>(null);
  const [recipients, setRecipients] = useState<Personel[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([supabase.from("surat_perintah").select("*").eq("id", id).single(), supabase.from("personel").select("nrp, nama, pangkat, jabatan")]).then(([letter, people]) => { const record = letter.data as SuratRecord | null; setSurat(record); setRecipients((people.data ?? []).filter((p) => record?.penerima_nrp.includes(p.nrp))); setLoading(false); }); }, [id]);
  return <main className="min-h-screen bg-preview text-foreground"><header className="screen-only sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3"><Button asChild variant="outline"><Link to="/surat/$id" params={{ id }}><ArrowLeft />Kembali</Link></Button><div className="min-w-0 text-center"><h1 className="font-bold">Pratinjau Cetak</h1><p className="truncate text-xs text-muted-foreground">{surat?.nomor ?? "Surat Perintah"}</p></div><Button onClick={() => window.print()}><Printer />Cetak</Button></div></header>{loading ? <div className="flex min-h-96 items-center justify-center"><Loader2 className="mr-2 animate-spin" />Memuat pratinjau…</div> : surat ? <section className="preview-stage overflow-auto p-4 sm:p-8"><LetterPreview data={hydrateLetterData(surat.data)} recipients={recipients} /></section> : <p className="p-10 text-center">Surat tidak ditemukan.</p>}</main>;
}
