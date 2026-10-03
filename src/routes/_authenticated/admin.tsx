import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import type { Personel } from "@/lib/surat";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Halaman Admin — Polres Situbondo" }, { name: "description", content: "Kelola personel dan peran pengguna." },
    { property: "og:title", content: "Halaman Admin — Polres Situbondo" }, { property: "og:description", content: "Kelola personel dan peran pengguna." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

type UserRow = { id: string; email: string; nama: string; is_admin: boolean };
const emptyP: Personel = { nrp: "", nama: "", pangkat: "", jabatan: "" };

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  const [personel, setPersonel] = useState<Personel[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState<Personel>(emptyP);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [p, u] = await Promise.all([
      supabase.from("personel").select("nrp, nama, pangkat, jabatan").order("nama"),
      supabase.rpc("admin_list_users"),
    ]);
    setPersonel(p.data ?? []);
    setUsers((u.data as UserRow[] | null) ?? []);
  }, []);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

  const simpanPersonel = async () => {
    if (!form.nrp.trim() || !form.nama.trim()) { setMsg("NRP dan nama wajib diisi."); return; }
    const { error } = await supabase.from("personel").upsert(form, { onConflict: "nrp" });
    setMsg(error ? "Personel gagal disimpan." : "Personel tersimpan.");
    if (!error) { setForm(emptyP); void load(); }
  };
  const hapusPersonel = async (nrp: string) => {
    if (!confirm("Hapus personel ini?")) return;
    const { error } = await supabase.from("personel").delete().eq("nrp", nrp);
    setMsg(error ? "Personel gagal dihapus." : "Personel dihapus."); void load();
  };
  const ubahPeran = async (u: UserRow) => {
    const { error } = u.is_admin
      ? await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin")
      : await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
    setMsg(error ? "Peran gagal diubah." : "Peran diperbarui."); void load();
  };

  if (loading) return <AppShell title="Halaman Admin"><div className="flex justify-center p-10 text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Memuat…</div></AppShell>;
  if (!isAdmin) return <AppShell title="Halaman Admin"><div className="mx-auto max-w-md rounded-md border border-border bg-card p-6 text-center"><p className="font-semibold">Halaman ini khusus admin.</p><Button asChild className="mt-4"><Link to="/dashboard">Kembali ke Dashboard</Link></Button></div></AppShell>;

  return (
    <AppShell title="Halaman Admin" description="Kelola personel, pengguna, dan surat perintah" action={<Button asChild><Link to="/surat/baru"><Plus />Buat surat</Link></Button>}>
      <div className="mx-auto max-w-5xl space-y-6">
        {msg ? <div role="status" className="rounded-md border border-border bg-muted px-4 py-3 text-sm">{msg}</div> : null}
        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-5 py-4"><h2 className="font-bold">Data personel</h2><p className="text-sm text-muted-foreground">Tambah atau ubah personel (NRP sama akan memperbarui data).</p></div>
          <div className="grid gap-3 p-5 md:grid-cols-5">
            {(["nrp", "nama", "pangkat", "jabatan"] as const).map((k) => <Input key={k} placeholder={k.toUpperCase()} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
            <Button onClick={simpanPersonel}><Plus />Simpan</Button>
          </div>
          <ul className="divide-y divide-border border-t border-border">{personel.map((p) => <li key={p.nrp} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><button type="button" className="text-left" onClick={() => setForm(p)}><strong>{p.pangkat} {p.nama}</strong><span className="block text-xs text-muted-foreground">NRP {p.nrp} · {p.jabatan}</span></button><Button variant="ghost" size="icon" className="text-destructive" title="Hapus" onClick={() => hapusPersonel(p.nrp)}><Trash2 /></Button></li>)}</ul>
        </section>
        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-5 py-4"><h2 className="font-bold">Pengguna</h2><p className="text-sm text-muted-foreground">Jadikan pengguna admin atau user biasa.</p></div>
          <ul className="divide-y divide-border">{users.map((u) => <li key={u.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><span><strong className="block">{u.nama || u.email}</strong><span className="text-xs text-muted-foreground">{u.email} · {u.is_admin ? "Admin" : "User biasa"}</span></span><Button variant="outline" size="sm" onClick={() => ubahPeran(u)}><ShieldCheck />{u.is_admin ? "Jadikan user biasa" : "Jadikan admin"}</Button></li>)}</ul>
        </section>
      </div>
    </AppShell>
  );
}
