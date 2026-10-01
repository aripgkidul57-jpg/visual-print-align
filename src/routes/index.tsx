import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Surat Perintah — Polres Situbondo" },
      {
        name: "description",
        content:
          "Aplikasi penyusunan, pengarsipan, dan pencetakan Surat Perintah Polres Situbondo.",
      },
      { property: "og:title", content: "Surat Perintah — Polres Situbondo" },
      {
        property: "og:description",
        content:
          "Aplikasi penyusunan, pengarsipan, dan pencetakan Surat Perintah Polres Situbondo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        setChecking(false);
      }
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Surat Perintah</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aplikasi penyusunan, pengarsipan, dan pencetakan Surat Perintah
          Polres Situbondo.
        </p>
        <Button asChild size="lg" className="mt-6 w-full" disabled={checking}>
          <Link to="/auth">
            <LogIn aria-hidden="true" />
            Masuk untuk melanjutkan
          </Link>
        </Button>
      </div>
    </main>
  );
}
