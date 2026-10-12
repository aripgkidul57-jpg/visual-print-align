import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { homeFor, type Kriteria } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { mintaOtp } from "@/lib/akses.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — Surat Perintah Polres Situbondo" },
      { name: "description", content: "Masuk dengan kode OTP email untuk personil terdaftar." },
      { property: "og:title", content: "Masuk — Surat Perintah Polres Situbondo" },
      { property: "og:description", content: "Masuk dengan kode OTP email untuk personil terdaftar." },
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

const DITOLAK = "Akses ditolak. Email Anda tidak terdaftar sebagai personil aktif. Hubungi admin.";

function AuthPage() {
  const navigate = useNavigate();
  const { next, error: errParam } = Route.useSearch();
  const kirim = useServerFn(mintaOtp);
  const [tahap, setTahap] = useState<"email" | "kode">("email");
  const [email, setEmail] = useState("");
  const [kode, setKode] = useState("");
  const [busy, setBusy] = useState(false);
  const [pesan, setPesan] = useState<{ jenis: "error" | "info"; teks: string } | null>(errParam ? { jenis: "error", teks: DITOLAK } : null);
  const checking = useRef(false);

  // Setelah sesi ada: cocokkan dengan data personil di database.
  const periksaAkses = async () => {
    if (checking.current) return;
    checking.current = true;
    const { data } = await supabase.rpc("link_personel");
    const k = (data as Kriteria | null) ?? null;
    checking.current = false;
    if (!k) {
      await supabase.auth.signOut();
      setPesan({ jenis: "error", teks: DITOLAK });
      setTahap("email");
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

  const mintaKode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setPesan(null);
    try {
      const r = await kirim({ data: { email, redirectTo: window.location.origin + "/auth" + (next ? `?next=${encodeURIComponent(next)}` : "") } });
      if (r && "rateLimited" in r && r.rateLimited) {
        setPesan({ jenis: "error", teks: "Terlalu banyak permintaan kode. Tunggu beberapa menit lalu coba lagi." });
      } else {
        setTahap("kode");
        setPesan({ jenis: "info", teks: "Jika email terdaftar sebagai personil aktif, kode OTP telah dikirim. Cek kotak masuk (atau klik tautan di email)." });
      }
    } catch (err) {
      setPesan({ jenis: "error", teks: err instanceof Error ? err.message : "Gagal mengirim kode." });
    }
    setBusy(false);
  };

  const verifikasi = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setPesan(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: kode.trim(), type: "email" });
    if (error) {
      const m = error.message.toLowerCase();
      setPesan({ jenis: "error", teks: m.includes("expired") ? "Kode OTP sudah kedaluwarsa. Minta kode baru." : m.includes("invalid") ? "Kode OTP salah. Periksa kembali." : error.status === 429 ? "Terlalu banyak percobaan. Tunggu sebentar." : "Verifikasi gagal. Coba lagi." });
    }
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

        {tahap === "email" ? (
          <form onSubmit={mintaKode} className="mt-6 space-y-3">
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email personil</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            {pesan ? <p className={`text-sm ${pesan.jenis === "error" ? "text-destructive" : "text-muted-foreground"}`} role="status">{pesan.teks}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : null}Kirim kode OTP</Button>
          </form>
        ) : (
          <form onSubmit={verifikasi} className="mt-6 space-y-3">
            <label htmlFor="kode" className="mb-1 block text-sm font-medium">Kode OTP untuk {email}</label>
            <Input id="kode" inputMode="numeric" autoComplete="one-time-code" value={kode} onChange={(e) => setKode(e.target.value.replace(/\D/g, "").slice(0, 10))} required minLength={6} />
            {pesan ? <p className={`text-sm ${pesan.jenis === "error" ? "text-destructive" : "text-muted-foreground"}`} role="status">{pesan.teks}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : null}Verifikasi & masuk</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setTahap("email"); setKode(""); setPesan(null); }}>Ganti email / kirim ulang</Button>
          </form>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground">Akun hanya dibuat oleh admin. Tidak ada pendaftaran mandiri.</p>
      </div>
    </main>
  );
}
