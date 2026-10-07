import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, FilePlus2, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggal, hydrateLetterData } from "@/lib/surat";

type Recent = { id: string; nomor: string; tanggal: string; tugas: string; startDate: string; endDate: string; penerimaNrp: string[] };

const today = () => new Date().toISOString().slice(0, 10);

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Surat Perintah Polres Situbondo" }, { name: "description", content: "Ringkasan arsip dan aktivitas Surat Perintah Polres Situbondo." },
    { property: "og:title", content: "Dashboard — Surat Perintah Polres Situbondo" }, { property: "og:description", content: "Ringkasan arsip dan aktivitas Surat Perintah Polres Situbondo." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: DashboardPage,
});

function DashboardPage() {
  const [all, setAll] = useState<Recent[]>([]);
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());

  useEffect(() => {
    supabase
      .from("surat_perintah")
      .select("id, nomor, tanggal, tugas, data, penerima_nrp")
      .order("created_at", { ascending: false })
      .then((letters) => {
        setAll((letters.data ?? []).map((s) => {
          const d = hydrateLetterData(s.data);
          return { id: s.id, nomor: s.nomor, tanggal: s.tanggal, tugas: s.tugas, startDate: d.startDate, endDate: d.endDate, penerimaNrp: s.penerima_nrp ?? [] };
        }));
      });
  }, []);

  const filtered = all.filter((s) => {
    const start = s.startDate || s.tanggal;
    const end = s.endDate || s.startDate || s.tanggal;
    return start <= toDate && end >= fromDate;
  });

  const personelAktif = new Set(
    filtered.flatMap((s) => s.penerimaNrp),
  ).size;

  return <AppShell title="Dashboard" description="Ringkasan administrasi Surat Perintah" action={<Button asChild><Link to="/surat/baru"><FilePlus2 />Buat surat</Link></Button>}>
    <div className="grid gap-4 md:grid-cols-3">
      <Stat icon={FileText} label="Total surat" value={String(all.length)} note="Tersimpan dalam arsip" />
      <Stat icon={CalendarDays} label="Surat dalam periode" value={String(filtered.length)} note="Berdasarkan waktu pelaksanaan tugas" />
      <Stat icon={Users} label="Personil menerima tugas hari ini" value={String(personelAktif)} note="Total personil dengan tugas aktif hari ini" />
    </div>
    <section className="mt-6 rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div><h2 className="font-bold">Surat dalam periode</h2><p className="mt-1 text-sm text-muted-foreground">Waktu pelaksanaan tugas dari tanggal sampai dengan tanggal</p></div>
        <Button asChild variant="ghost"><Link to="/surat">Lihat semua<ArrowRight /></Link></Button>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-b border-border px-5 py-4">
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Dari tanggal</span><Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
        <span className="pb-2 text-sm font-semibold text-muted-foreground">sampai dengan</span>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Sampai tanggal</span><Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
        <Button variant="outline" onClick={() => { const t = today(); setFromDate(t); setToDate(t); }}>Hari ini</Button>
      </div>
      {filtered.length ? <div className="divide-y divide-border">{filtered.map((item) => <Link key={item.id} to="/surat/$id" params={{ id: item.id }} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"><div className="min-w-0"><strong className="block truncate text-sm">{item.nomor}</strong><span className="mt-1 block truncate text-sm text-muted-foreground">{item.tugas}</span></div><span className="shrink-0 text-right text-xs text-muted-foreground">{item.startDate ? <>{formatTanggal(item.startDate)}{item.endDate && item.endDate !== item.startDate ? <> — {formatTanggal(item.endDate)}</> : null}</> : formatTanggal(item.tanggal)}</span></Link>)}</div> : <p className="p-10 text-center text-sm text-muted-foreground">Tidak ada surat dengan waktu pelaksanaan tugas pada periode ini.</p>}
    </section>
  </AppShell>;
}

function Stat({ icon: Icon, label, value, note }: { icon: typeof FileText; label: string; value: string; note: string }) { return <section className="rounded-md border border-border bg-card p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-xs text-muted-foreground">{note}</p></section>; }
