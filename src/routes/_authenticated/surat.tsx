import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, FilePlus2, Pencil, Printer, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { SuratRecord } from "@/lib/surat";

type Personel = {
  nrp: string;
  nama: string;
  pangkat: string;
  jabatan: string;
};

type LetterData = {
  agency: string;
  region: string;
  resort: string;
  numberPrefix: string;
  numberSequence: string;
  numberSuffix: string;
  issueDate: string;
  tugas: string;
  bases: string;
  duties: string;
  city: string;
  authority: string;
  office: string;
  signer: string;
  signerRank: string;
  copyTo: string;
};

const initialData: LetterData = {
  agency: "KEPOLISIAN NEGARA REPUBLIK INDONESIA",
  region: "DAERAH JAWA TIMUR",
  resort: "RESORT SITUBONDO",
  numberPrefix: "R/Sprin",
  numberSequence: "2487",
  numberSuffix: "Satintelkam",
  issueDate: "2016-02-21",
  tugas: "giat Lidik tentang Penunjukan Penjabat (Pj) Kepala Desa di wilayah Kab. Situbondo",
  bases:
    "Undang – Undang Negara Republik Indonesia Nomor 2 Tahun 2002 tgl 08 Januari 2002 tentang Kepolisian Negara Republik Indonesia;\nPeraturan Kepala Kepolisian Negara Republik Indonesia Nomor 15 Tahun 2007 tentang Naskah Dinas di lingkungan Kepolisian Negara Republik Indonesia;\nDisposisi Kasat Intelkam untuk Lidik dan Monitor",
  duties:
    "melaporkan hasil pelaksanaannya kepada pimpinan;\nmelaksanakan perintah ini dengan seksama dan penuh rasa tanggung jawab.",
  city: "Situbondo",
  authority: "a.n. KEPALA KEPOLISIAN RESORT SITUBONDO",
  office: "KASAT INTELKAM",
  signer: "MOHAMAD DJUPRI",
  signerRank: "INSPEKTUR POLISI SATU NRP 68020388",
  copyTo: "Kapolres Situbondo.",
};

const ROMAWI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const BULAN_ID = [
  "Januari",
  "Pebruari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "Nopember",
  "Desember",
];

function parseIssueDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function buildNumber(data: Pick<LetterData, "numberPrefix" | "numberSequence" | "numberSuffix" | "issueDate">) {
  const parsed = parseIssueDate(data.issueDate);
  const month = parsed ? ROMAWI[parsed.month - 1] : "…";
  const year = parsed ? String(parsed.year) : "…";
  const prefix = (data.numberPrefix ?? "").trim();
  const sequence = (data.numberSequence ?? "").trim() || "…";
  const suffix = (data.numberSuffix ?? "").trim();
  const head = prefix ? `${prefix}-${sequence}` : sequence;
  return suffix ? `${head}/${month}/${year}/${suffix}` : `${head}/${month}/${year}`;
}

function formatTanggal(value: string) {
  const parsed = parseIssueDate(value);
  if (!parsed) return "…";
  return `${parsed.day} ${BULAN_ID[parsed.month - 1]} ${parsed.year}`;
}

const fields: Array<{
  key: keyof LetterData;
  label: string;
  multiline?: boolean;
  hint?: string;
}> = [
  { key: "agency", label: "Instansi" },
  { key: "region", label: "Daerah" },
  { key: "resort", label: "Kesatuan" },
  { key: "tugas", label: "Tugas", multiline: true, hint: "Dipakai pada bagian Pertimbangan dan butir pertama Untuk" },
  { key: "bases", label: "Dasar", multiline: true, hint: "Satu butir per baris" },
  { key: "duties", label: "Untuk", multiline: true, hint: "Satu butir per baris" },
  { key: "city", label: "Dikeluarkan di" },
  { key: "authority", label: "Atas nama" },
  { key: "office", label: "Jabatan penanda tangan" },
  { key: "signer", label: "Nama penanda tangan" },
  { key: "signerRank", label: "Pangkat / NRP" },
  { key: "copyTo", label: "Tembusan" },
];

const lines = (value: string) => (value ?? "").split("\n").filter((line) => line.trim());

export const Route = createFileRoute("/_authenticated/surat")({
  head: () => ({
    meta: [
      { title: "Form Surat Perintah | Polres Situbondo" },
      {
        name: "description",
        content: "Form penyusunan dan pencetakan Surat Perintah Kepolisian Resort Situbondo.",
      },
      { property: "og:title", content: "Form Surat Perintah | Polres Situbondo" },
      {
        property: "og:description",
        content: "Susun dan cetak Surat Perintah dalam format A4 resmi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuratListPage,
});

function SuratListPage() {
  const [surat, setSurat] = useState<SuratRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from("surat_perintah").select("*").order("created_at", { ascending: false });
    if (fetchError) setError("Arsip surat tidak dapat dimuat.");
    else setSurat((data ?? []) as SuratRecord[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("id");
    if (!term) return surat;
    return surat.filter((item) => item.nomor.toLocaleLowerCase("id").includes(term) || item.tugas.toLocaleLowerCase("id").includes(term));
  }, [search, surat]);

  const hapus = async (id: string) => {
    const { error: deleteError } = await supabase.from("surat_perintah").delete().eq("id", id);
    if (deleteError) setError("Surat gagal dihapus.");
    else setSurat((current) => current.filter((item) => item.id !== id));
  };

  return (
    <AppShell title="Surat Perintah" description="Kelola seluruh arsip surat perintah" action={<Button asChild><Link to="/surat/baru"><FilePlus2 />Buat surat</Link></Button>}>
      <div className="rounded-md border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold">Daftar surat</h2><p className="mt-1 text-sm text-muted-foreground">{surat.length} surat tersimpan</p></div>
          <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nomor atau tugas…" aria-label="Cari surat" /></div>
        </div>
        {error ? <p role="alert" className="m-4 rounded-md bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
        {loading ? <p className="p-10 text-center text-sm text-muted-foreground">Memuat arsip surat…</p> : filtered.length === 0 ? <div className="p-12 text-center"><FileText className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-3 font-semibold">Belum ada surat</h3><p className="mt-1 text-sm text-muted-foreground">Buat surat pertama untuk memulai arsip.</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Nomor surat</th><th className="px-5 py-3 font-semibold">Tanggal</th><th className="px-5 py-3 font-semibold">Tugas</th><th className="px-5 py-3 text-right font-semibold">Tindakan</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((item) => <tr key={item.id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{item.nomor}</td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${item.tanggal}T00:00:00`))}</td><td className="max-w-md truncate px-5 py-4 text-muted-foreground">{item.tugas || "—"}</td><td className="px-5 py-3"><div className="flex justify-end gap-1"><Button asChild variant="ghost" size="icon" title="Lihat"><Link to="/surat/$id" params={{ id: item.id }}><Eye /></Link></Button><Button asChild variant="ghost" size="icon" title="Edit"><Link to="/surat/$id/edit" params={{ id: item.id }}><Pencil /></Link></Button><Button asChild variant="ghost" size="icon" title="Cetak"><Link to="/surat/$id/cetak" params={{ id: item.id }}><Printer /></Link></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Hapus" className="text-destructive hover:text-destructive"><Trash2 /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus surat ini?</AlertDialogTitle><AlertDialogDescription>Surat {item.nomor} akan dihapus permanen dari arsip.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => hapus(item.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></td></tr>)}</tbody></table></div>
        )}
      </div>
    </AppShell>
  );
}