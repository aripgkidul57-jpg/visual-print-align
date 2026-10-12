import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type Kriteria = "admin" | "maintenance" | "user";

// Kriteria dibaca dari database (personil aktif yang tertaut ke akun login).
export function useIsAdmin() {
  const [kriteria, setKriteria] = useState<Kriteria | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.rpc("current_kriteria").then(({ data }) => {
      if (!active) return;
      setKriteria((data as Kriteria | null) ?? null);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  return {
    kriteria,
    isAdmin: kriteria === "admin",
    canConfigure: kriteria === "admin" || kriteria === "maintenance",
    loading,
  };
}

export function homeFor(k: Kriteria | null) {
  return k === "admin" ? "/admin" : k === "maintenance" ? "/maintenance" : "/dashboard";
}
