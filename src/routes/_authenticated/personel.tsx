import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { requireKriteria } from "@/lib/akses";
import { validasiPersonil, type PersonilInput } from "@/lib/personil-validasi";

export const Route = createFileRoute("/_authenticated/personel")({
  beforeLoad: () => requireKriteria(["admin"]),
  head: () => ({ meta: [
    { title: "Manajemen Data Personil — Polres Situbondo" }, { name: "description", content: "Kelola personil, kriteria, dan status akses aplikasi." },
    { property: "og:title", content: "Manajemen Data Personil — Polres Situbondo" }, { property: "og:description", content: "Kelola personil, kriteria, dan status akses aplikasi." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: PersonelPage,
});

type Row = PersonilInput & { id: string; auth_user_id: string | null; updated_at: string };
const kosong: PersonilInput = { nrp: "", nama: "", pangkat: "", jabatan: "", email: "", kriteria: "user", status: "aktif" };
const selectCls = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function PersonelPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [fk, setFk] = useState("");
  const [fs, setFs] = useState("");
  const [form, setForm] = useState<(PersonilInput & { asalNrp?: string }) | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const muat = async () => {
    const { data, error } = await supabase.from("personel").select("id,nrp,nama,pangkat,jabatan,email,kriteria,status,auth_user_id,updated_at").order("nama");
    if (error) toast.error("Gagal memuat personil: " + error.message);
    setRows((data ?? []).map((r) => ({ ...r, email: r.email ?? "" })) as Row[]);
  };
  useEffect(() => { muat(); }, []);

  const simpan = async () => {
    if (!form) return;
    const v = validasiPersonil(form);
    if (v) { setErr(v); return; }
    setSaving(true); setErr(null);
    const row = { nrp: form.nrp.trim(), nama: form.nama.trim(), pangkat: form.pangkat.trim() || "-", jabatan: form.jabatan.trim() || "-", email: form.email.trim().toLowerCase(), kriteria: form.kriteria, status: form.status };
    const res = form.asalNrp
      ? await supabase.from("personel").update(row).eq("nrp", form.asalNrp)
      : await supabase.from("personel").insert(row);
    setSaving(false);
    if (res.error) {
      const m = res.error.message;
      setErr(/duplicate|unique/i.test(m) ? "NRP atau email sudah dipakai personil lain." : m);
      return;
    }
    toast.success("Data personil tersimpan.");
    setForm(null); muat();
  };

  const hapus = async (nrp: string) => {
    const { error } = await supabase.from("personel").delete().eq("nrp", nrp);
    if (error) toast.error(error.message); else { toast.success("Personil dihapus."); muat(); }
  };

  const term = q.trim().toLowerCase();
  const tampil = rows.filter((r) => (!term || r.nama.toLowerCase().includes(term) || r.nrp.toLowerCase().includes(term)) && (!fk || r.kriteria === fk) && (!fs || r.status === fs));

  return <AppShell title="Manajemen Data Personil" description="Hanya admin yang dapat mengubah data dan hak akses" action={<Button onClick={() => { setErr(null); setForm({ ...kosong }); }}><Plus />Tambah personil</Button>}>
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Cari nama atau NRP" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <select aria-label="Filter kriteria" className={selectCls} value={fk} onChange={(e) => setFk(e.target.value)}><option value="">Semua kriteria</option><option value="admin">Admin</option><option value="maintenance">Maintenance</option><option value="user">User</option></select>
      <select aria-label="Filter status" className={selectCls} value={fs} onChange={(e) => setFs(e.target.value)}><option value="">Semua status</option><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select>
    </div>

    {form ? <section className="mb-4 rounded-md border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{form.asalNrp ? "Ubah personil" : "Tambah personil"}</h2><Button variant="ghost" size="icon" aria-label="Tutup" onClick={() => setForm(null)}><X /></Button></div>
      <div className="grid gap-3 md:grid-cols-2">
        {(["nrp", "nama", "pangkat", "jabatan", "email"] as const).map((k) => <label key={k} className="block"><span className="mb-1 block text-sm font-semibold">{k === "nrp" ? "NRP" : k.charAt(0).toUpperCase() + k.slice(1)}</span><Input type={k === "email" ? "email" : "text"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>)}
        <label className="block"><span className="mb-1 block text-sm font-semibold">Kriteria</span><select className={selectCls + " w-full"} value={form.kriteria} onChange={(e) => setForm({ ...form, kriteria: e.target.value as PersonilInput["kriteria"] })}><option value="admin">Admin</option><option value="maintenance">Maintenance</option><option value="user">User</option></select></label>
        <label className="block"><span className="mb-1 block text-sm font-semibold">Status</span><select className={selectCls + " w-full"} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PersonilInput["status"] })}><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select></label>
      </div>
      {err ? <p role="alert" className="mt-3 text-sm text-destructive">{err}</p> : null}
      <Button className="mt-4" onClick={simpan} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />}Simpan</Button>
    </section> : null}

    {detail ? <section className="mb-4 rounded-md border border-border bg-card p-5 text-sm">
      <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">{detail.pangkat} {detail.nama}</h2><Button variant="ghost" size="icon" aria-label="Tutup detail" onClick={() => setDetail(null)}><X /></Button></div>
      <p>NRP: {detail.nrp}</p><p>Jabatan: {detail.jabatan}</p><p>Email: {detail.email || "— (belum bisa login)"}</p><p>Kriteria: {detail.kriteria}</p><p>Status: {detail.status}</p><p>Akun login: {detail.auth_user_id ? "Sudah tertaut" : "Belum pernah login"}</p>
    </section> : null}

    <div className="overflow-x-auto rounded-md border border-border bg-card"><table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">NRP</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Kriteria</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Tindakan</th></tr></thead>
      <tbody className="divide-y divide-border">{tampil.map((r) => <tr key={r.id}>
        <td className="px-4 py-3"><button className="font-semibold hover:underline" onClick={() => setDetail(r)}>{r.nama}</button></td>
        <td className="px-4 py-3">{r.nrp}</td>
        <td className="px-4 py-3 text-muted-foreground">{r.email || <span className="text-destructive">Email belum diisi</span>}</td>
        <td className="px-4 py-3 capitalize">{r.kriteria}</td>
        <td className="px-4 py-3 capitalize">{r.status}</td>
        <td className="px-4 py-2"><div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title="Ubah" onClick={() => { setErr(null); setForm({ nrp: r.nrp, nama: r.nama, pangkat: r.pangkat, jabatan: r.jabatan, email: r.email, kriteria: r.kriteria, status: r.status, asalNrp: r.nrp }); }}><Pencil /></Button>
          <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Hapus" className="text-destructive hover:text-destructive"><Trash2 /></Button></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus personil ini?</AlertDialogTitle><AlertDialogDescription>{r.nama} (NRP {r.nrp}) akan dihapus dan tidak bisa login lagi.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => hapus(r.nrp)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div></td>
      </tr>)}</tbody>
    </table>{tampil.length ? null : <p className="p-8 text-center text-sm text-muted-foreground">Tidak ada personil yang cocok.</p>}</div>
  </AppShell>;
}
