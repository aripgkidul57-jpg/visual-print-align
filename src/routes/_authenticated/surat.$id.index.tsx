import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggal, hydrateLetterData, type SuratRecord } from "@/lib/surat";

export const Route = createFileRoute("/_authenticated/surat/$id/")({
  head: () => ({ meta: [
    { title: "Detail Surat Perintah — Polres Situbondo" }, { name: "description", content: "Detail Surat Perintah yang tersimpan." },
    { property: "og:title", content: "Detail Surat Perintah — Polres Situbondo" }, { property: "og:description", content: "Detail Surat Perintah yang tersimpan." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: SuratDetailPage,
});

function SuratDetailPage() {
  const { id } = Route.useParams();
  const [surat, setSurat] = useState<SuratRecord | null>(null);
  const [penerima, setPenerima] = useState<Personel[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([supabase.from("surat_perintah").select("*").eq("id", id).single(), supabase.from("personel").select("nrp, nama, pangkat, jabatan")]).then(([letter, people]) => { setSurat((letter.data as SuratRecord | null) ?? null); setPenerima((people.data ?? []).filter((p) => ((letter.data as SuratRecord | null)?.penerima_nrp ?? []).includes(p.nrp))); setLoading(false); }); }, [id]);
  if (loading) return <AppShell title="Detail Surat Perintah"><div className="flex min-h-80 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Memuat surat…</div></AppShell>;
  if (!surat) return <AppShell title="Surat tidak ditemukan"><div className="rounded-md border border-border bg-card p-10 text-center"><p className="text-muted-foreground">Surat ini tidak tersedia.</p><Button asChild className="mt-4"><Link to="/surat">Kembali ke daftar</Link></Button></div></AppShell>;
  const data = hydrateLetterData(surat.data);
  return <AppShell title="Detail Surat Perintah" description={surat.nomor} action={<Button asChild variant="outline"><Link to="/surat"><ArrowLeft />Daftar surat</Link></Button>}>
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-md border border-border bg-card p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase text-muted-foreground">Nomor surat</p><h2 className="mt-2 text-xl font-bold">{surat.nomor}</h2><p className="mt-2 text-sm text-muted-foreground">Dikeluarkan {formatTanggal(surat.tanggal)}</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link to="/surat/$id/edit" params={{ id }}><Pencil />Edit</Link></Button><Button asChild><Link to="/surat/$id/cetak" params={{ id }}><Printer />Cetak</Link></Button></div></div></section>
      <section className="grid gap-4 md:grid-cols-2"><Info label="Tugas" value={data.tugas} /><Info label="Penerima" value={`${surat.penerima_nrp.length} personel`}>{penerima.map((p) => <div key={p.nrp} className="mt-2 text-sm leading-relaxed"><span className="font-semibold">{p.pangkat} {p.nama}</span><span className="block text-xs text-muted-foreground">NRP {p.nrp} · {p.jabatan}</span></div>)}</Info></section>
      <section className="rounded-md border border-border bg-card p-6"><h3 className="font-bold">Dasar</h3><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{data.bases}</p></section>
    </div>
  </AppShell>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-border bg-card p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-2 text-sm font-medium leading-relaxed">{value || "—"}</p></div>; }
