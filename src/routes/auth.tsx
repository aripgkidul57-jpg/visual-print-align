import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { homeFor, type Kriteria } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { masukNrp } from "@/lib/sandi.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — Surat Perintah Polres Situbondo" },
      { name: "description", content: "Masuk dengan NRP dan kata sandi atau akun Google untuk personil terdaftar." },
      { property: "og:title", content: "Masuk — Surat Perintah Polres Situbondo" },
      { property: "og:description", content: "Masuk dengan NRP dan kata sandi atau akun Google untuk personil terdaftar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { next?: string; error?: string } => {
    const n = s["next"];
    const out: { next?: string; error?: string } = {};
    if (typeof n === "string" && n.startsWith("/") && !n.startsWith("//")) out.next = n;
    if (s["error"] === "ditolak") out.error = "ditolak";
    return out;
  },
  component: AuthPage,
});

const DITOLAK = "Akses ditolak. Akun Anda tidak terdaftar sebagai personil aktif. Hubungi admin.";

function AuthPage() {
  const navigate = useNavigate();
  const { next, error: errParam } = Route.useSearch();
  const masuk = useServerFn(masukNrp);
  const [nrp, setNrp] = useState("");
  const [sandi, setSandi] = useState("");
  const [busy, setBusy] = useState(false);
  const [pesan, setPesan] = useState<string | null>(errParam ? DITOLAK : null);
  const checking = useRef(false);

  const periksaAkses = async () => {
    if (checking.current) return;
    checking.current = true;
    const { data } = await supabase.rpc("link_personel");
    const k = (data as Kriteria | null) ?? null;
    checking.current = false;
    if (!k) {
      await supabase.auth.signOut();
      setPesan(DITOLAK);
      return;
    }
    if (next) window.location.href = next;
    else navigate({ to: homeFor(k), replace: true });
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setTimeout(periksaAkses, 0);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) periksaAkses(); });
    return () => sub.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setPesan(null);
    try {
      const r = await masuk({ data: { nrp, sandi } });
      if (!r.ok) setPesan(r.pesan);
      else await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
    } catch (err) {
      setPesan(err instanceof Error ? err.message : "Gagal masuk.");
    }
    setBusy(false);
  };

  const google = async () => {
    setBusy(true); setPesan(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) { setPesan("Masuk dengan Google gagal. Coba lagi."); setBusy(false); return; }
    if (!r.redirected) await periksaAkses();
    setBusy(false);
  };

  return (
    <main className="auth-shell flex min-h-screen items-center justify-center px-4 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Surat Perintah — Polres Situbondo</p>
        </div>

        <form onSubmit={kirim} className="mt-6 space-y-3">
          <div>
            <label htmlFor="nrp" className="mb-1 block text-sm font-medium">NRP</label>
            <Input id="nrp" value={nrp} onChange={(e) => setNrp(e.target.value)} required autoComplete="username" />
          </div>
          <div>
            <label htmlFor="sandi" className="mb-1 block text-sm font-medium">Kata sandi</label>
            <Input id="sandi" type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} required autoComplete="current-password" />
          </div>
          {pesan ? <p className="text-sm text-destructive" role="status">{pesan}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : null}Masuk</Button>
          <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />atau<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" size="lg" className="w-full" disabled={busy} onClick={google}>Masuk dengan Google</Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">Kata sandi dibuat oleh admin. Tidak ada pendaftaran mandiri.</p>
      </div>
    </main>
  );
}
