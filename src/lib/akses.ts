import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { homeFor, type Kriteria } from "@/hooks/use-is-admin";

// Gerbang halaman berdasarkan kriteria dari database. Perlindungan utama tetap RLS.
export async function requireKriteria(allowed: Kriteria[]) {
  const { data } = await supabase.rpc("link_personel");
  const k = (data as Kriteria | null) ?? null;
  if (!k) {
    await supabase.auth.signOut();
    throw redirect({ to: "/auth", search: { error: "ditolak" } });
  }
  if (!allowed.includes(k)) throw redirect({ to: homeFor(k) });
  return { kriteria: k };
}
