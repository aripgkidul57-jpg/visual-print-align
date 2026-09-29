import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — Surat Perintah Polres Situbondo" },
      {
        name: "description",
        content: "Masuk atau daftar untuk menyusun dan mengarsipkan Surat Perintah.",
      },
      { property: "og:title", content: "Masuk — Surat Perintah Polres Situbondo" },
      {
        property: "og:description",
        content: "Masuk atau daftar untuk menyusun dan mengarsipkan Surat Perintah.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { next?: string } => {
    const n = s["next"];
    return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? { next: n } : {};
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const lanjut = () => {
    if (next) window.location.href = next;
    else navigate({ to: "/surat", replace: true });
  };
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [pesan, setPesan] = useState<{ jenis: "error" | "info"; teks: string } | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") lanjut();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) lanjut();
    });
    return () => sub.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, next]);

  const kirimEmail = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setPesan(null);
    if (mode === "masuk") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setPesan({ jenis: "error", teks: "Email atau kata sandi salah." });
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nama },
          emailRedirectTo: window.location.origin + (next ?? ""),
        },
      });
      if (error) {
        setPesan({ jenis: "error", teks: error.message });
      } else if (!data.session) {
        setPesan({
          jenis: "info",
          teks: "Pendaftaran berhasil. Silakan cek email Anda untuk konfirmasi, lalu masuk.",
        });
        setMode("masuk");
      }
    }
    setBusy(false);
  };

  const masukGoogle = async () => {
    setBusy(true);
    setPesan(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (next ?? ""),
    });
    if (result?.error) {
      setPesan({ jenis: "error", teks: "Gagal masuk dengan Google. Coba lagi." });
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-bold">
            {mode === "masuk" ? "Masuk" : "Daftar akun baru"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Surat Perintah — Polres Situbondo</p>
        </div>

        <form onSubmit={kirimEmail} className="mt-6 space-y-3">
          {mode === "daftar" ? (
            <div>
              <label htmlFor="nama" className="mb-1 block text-sm font-medium">
                Nama lengkap
              </label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Kata sandi
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            />
          </div>

          {pesan ? (
            <p
              className={`text-sm ${pesan.jenis === "error" ? "text-destructive" : "text-muted-foreground"}`}
              role="status"
            >
              {pesan.teks}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {mode === "masuk" ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          atau
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={masukGoogle}
          disabled={busy}
        >
          Masuk dengan Google
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "masuk" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "masuk" ? "daftar" : "masuk");
              setPesan(null);
            }}
          >
            {mode === "masuk" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </main>
  );
}
