import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, FilePlus2, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Recent = { id: string; nomor: string; tanggal: string; tugas: string };
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Surat Perintah Polres Situbondo" }, { name: "description", content: "Ringkasan arsip dan aktivitas Surat Perintah Polres Situbondo." },
    { property: "og:title", content: "Dashboard — Surat Perintah Polres Situbondo" }, { property: "og:description", content: "Ringkasan arsip dan aktivitas Surat Perintah Polres Situbondo." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: DashboardPage,
});
function DashboardPage() {
  const [recent, setRecent] = useState<Recent[]>([]); const [total, setTotal] = useState(0); const [personel, setPersonel] = useState(0);
  useEffect(() => { Promise.all([
    supabase.from("surat_perintah").select("id, nomor, tanggal, tugas", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
    supabase.from("personel").select("nrp", { count: "exact", head: true }),
  ]).then(([letters, people]) => { setRecent(letters.data ?? []); setTotal(letters.count ?? 0); setPersonel(people.count ?? 0); }); }, []);
  const month = new Date().toISOString().slice(0, 7);
  return <AppShell title="Dashboard" description="Ringkasan administrasi Surat Perintah" action={<Button asChild><Link to="/surat/baru"><FilePlus2 />Buat surat</Link></Button>}>
    <div className="grid gap-4 md:grid-cols-3"><Stat icon={FileText} label="Total surat" value={String(total)} note="Tersimpan dalam arsip" /><Stat icon={CalendarDays} label="Surat bulan ini" value={String(recent.filter((s) => s.tanggal.slice(0, 7) === month).length)} note="Berdasarkan surat terbaru" /><Stat icon={Users} label="Data personel" value={String(personel)} note="Tersedia sebagai penerima" /></div>
    <section className="mt-6 rounded-md border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-bold">Surat terbaru</h2><p className="mt-1 text-sm text-muted-foreground">Lima surat yang terakhir disimpan</p></div><Button asChild variant="ghost"><Link to="/surat">Lihat semua<ArrowRight /></Link></Button></div>
      {recent.length ? <div className="divide-y divide-border">{recent.map((item) => <Link key={item.id} to="/surat/$id" params={{ id: item.id }} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"><div className="min-w-0"><strong className="block truncate text-sm">{item.nomor}</strong><span className="mt-1 block truncate text-sm text-muted-foreground">{item.tugas}</span></div><span className="shrink-0 text-xs text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${item.tanggal}T00:00:00`))}</span></Link>)}</div> : <p className="p-10 text-center text-sm text-muted-foreground">Belum ada surat tersimpan.</p>}
    </section></AppShell>;
}
function Stat({ icon: Icon, label, value, note }: { icon: typeof FileText; label: string; value: string; note: string }) { return <section className="rounded-md border border-border bg-card p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-xs text-muted-foreground">{note}</p></section>; }
