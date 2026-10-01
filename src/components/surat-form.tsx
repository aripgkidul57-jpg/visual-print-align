import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { buildNumber, hydrateLetterData, initialLetterData, type LetterData, type Personel } from "@/lib/surat";

const fields: Array<{ key: keyof LetterData; label: string; multiline?: boolean; hint?: string }> = [
  { key: "agency", label: "Instansi" }, { key: "region", label: "Daerah" }, { key: "resort", label: "Kesatuan" },
  { key: "tugas", label: "Tugas", multiline: true, hint: "Dipakai pada bagian Pertimbangan dan butir pertama Untuk" },
  { key: "bases", label: "Dasar", multiline: true, hint: "Satu butir per baris" },
  { key: "duties", label: "Untuk", multiline: true, hint: "Satu butir per baris" },
  { key: "city", label: "Dikeluarkan di" }, { key: "authority", label: "Atas nama" },
  { key: "office", label: "Jabatan penanda tangan" }, { key: "signer", label: "Nama penanda tangan" },
  { key: "signerRank", label: "Pangkat / NRP" }, { key: "copyTo", label: "Tembusan" },
];

export function SuratForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [data, setData] = useState(initialLetterData);
  const [personel, setPersonel] = useState<Personel[]>([]);
  const [selectedNrp, setSelectedNrp] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("personel").select("nrp, nama, pangkat, jabatan").order("nama"),
      id ? supabase.from("surat_perintah").select("data, penerima_nrp").eq("id", id).single() : Promise.resolve({ data: null, error: null }),
    ]).then(([people, letter]) => {
      if (!active) return;
      if (people.data) setPersonel(people.data);
      if (letter.data) {
        setData(hydrateLetterData(letter.data.data));
        setSelectedNrp(letter.data.penerima_nrp ?? []);
      } else if (id) setError("Surat tidak ditemukan atau tidak dapat dibuka.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  const update = (key: keyof LetterData, value: string) => setData((current) => ({ ...current, [key]: value }));
  const toggle = (nrp: string) => setSelectedNrp((current) => current.includes(nrp) ? current.filter((item) => item !== nrp) : [...current, nrp]);
  const simpan = async () => {
    setSaving(true); setError("");
    const row = { nomor: buildNumber(data), tanggal: data.issueDate, tugas: data.tugas ?? "", data: data as unknown as Record<string, string>, penerima_nrp: selectedNrp, updated_at: new Date().toISOString() };
    const result = id
      ? await supabase.from("surat_perintah").update(row).eq("id", id).select("id").single()
      : await supabase.from("surat_perintah").insert(row).select("id").single();
    setSaving(false);
    if (result.error) { setError("Surat gagal disimpan. Silakan coba lagi."); return; }
    navigate({ to: "/surat/$id", params: { id: result.data.id }, replace: true });
  };

  return (
    <AppShell title={id ? "Edit Surat Perintah" : "Buat Surat Perintah"} description={id ? "Perbarui isi surat yang tersimpan" : "Lengkapi data untuk membuat surat baru"} action={<Button variant="outline" onClick={() => history.back()}><ArrowLeft />Kembali</Button>}>
      {loading ? <div className="flex min-h-80 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Memuat surat…</div> : (
        <div className="mx-auto max-w-5xl space-y-6">
          {error ? <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
          <FormSection title="Identitas surat" description="Nomor surat tersusun otomatis dari tanggal yang dipilih.">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Awalan"><Input value={data.numberPrefix} onChange={(e) => update("numberPrefix", e.target.value)} /></Field>
              <Field label="Nomor urut"><Input inputMode="numeric" value={data.numberSequence} onChange={(e) => update("numberSequence", e.target.value)} /></Field>
              <Field label="Akhiran"><Input value={data.numberSuffix} onChange={(e) => update("numberSuffix", e.target.value)} /></Field>
              <Field label="Tanggal surat"><Input type="date" value={data.issueDate} onChange={(e) => update("issueDate", e.target.value)} /></Field>
            </div>
            <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm"><span className="text-muted-foreground">Nomor lengkap</span><strong className="mt-1 block">{buildNumber(data)}</strong></div>
          </FormSection>
          <FormSection title="Penerima perintah" description="Pilih satu atau beberapa personel dari data yang tersedia.">
            <div className="grid gap-2 md:grid-cols-2">{personel.map((p) => <label key={p.nrp} className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-accent"><input type="checkbox" className="mt-1" checked={selectedNrp.includes(p.nrp)} onChange={() => toggle(p.nrp)} /><span><strong className="block text-sm">{p.pangkat} {p.nama}</strong><span className="text-xs text-muted-foreground">NRP {p.nrp} · {p.jabatan}</span></span></label>)}</div>
          </FormSection>
          <FormSection title="Isi dan penandatangan" description="Gunakan satu baris untuk setiap butir pada kolom Dasar dan Untuk.">
            <div className="grid gap-4 md:grid-cols-2">{fields.map((field) => <Field key={field.key} label={field.label} hint={field.hint ?? ""} wide={field.multiline ?? false}>{field.multiline ? <Textarea className="min-h-28" value={data[field.key]} onChange={(e) => update(field.key, e.target.value)} /> : <Input value={data[field.key]} onChange={(e) => update(field.key, e.target.value)} />}</Field>)}</div>
          </FormSection>
          <div className="sticky bottom-4 flex justify-end rounded-md border border-border bg-card p-3 shadow-sm"><Button size="lg" onClick={simpan} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />}{saving ? "Menyimpan…" : "Simpan surat"}</Button></div>
        </div>
      )}
    </AppShell>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><div className="p-5">{children}</div></section>;
}

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "block md:col-span-2" : "block"}><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}{hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}</label>;
}