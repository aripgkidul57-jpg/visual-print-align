import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GAGAL = "NRP atau kata sandi salah, atau personil tidak aktif.";

function bersihNrp(v: unknown) {
  const nrp = String(v ?? "").trim();
  if (!/^[0-9A-Za-z.-]{3,30}$/.test(nrp)) throw new Error(GAGAL);
  return nrp;
}

// Login dengan NRP + kata sandi. Email tidak pernah dikirim ke browser.
export const masukNrp = createServerFn({ method: "POST" })
  .inputValidator((d: { nrp: string; sandi: string }) => {
    const sandi = String(d?.sandi ?? "");
    if (sandi.length < 1 || sandi.length > 72) throw new Error(GAGAL);
    return { nrp: bersihNrp(d?.nrp), sandi };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin
      .from("personel").select("email").ilike("nrp", data.nrp).eq("status", "aktif").maybeSingle();
    if (!p?.email) return { ok: false as const, pesan: GAGAL };
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const pub = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: s, error } = await pub.auth.signInWithPassword({ email: p.email, password: data.sandi });
    if (error || !s.session) {
      if (error?.status === 429) return { ok: false as const, pesan: "Terlalu banyak percobaan. Tunggu beberapa menit." };
      return { ok: false as const, pesan: GAGAL };
    }
    return { ok: true as const, access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });

// Admin mengatur kata sandi personil (dibuatkan akun bila belum ada).
export const aturSandi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nrp: string; sandi: string }) => {
    const sandi = String(d?.sandi ?? "");
    if (sandi.length < 8 || sandi.length > 72) throw new Error("Kata sandi minimal 8 karakter.");
    return { nrp: bersihNrp(d?.nrp), sandi };
  })
  .handler(async ({ data, context }) => {
    const { data: k } = await context.supabase.rpc("current_kriteria");
    if (k !== "admin") throw new Error("Hanya admin yang dapat mengatur kata sandi.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin
      .from("personel").select("email,auth_user_id").eq("nrp", data.nrp).maybeSingle();
    if (!p?.email) throw new Error("Personil belum punya email.");
    let uid = p.auth_user_id as string | null;
    if (!uid) {
      const { data: c, error } = await supabaseAdmin.auth.admin.createUser({ email: p.email, password: data.sandi, email_confirm: true });
      if (c?.user) return { ok: true };
      if (error && !/already|registered|exists/i.test(error.message)) throw new Error(error.message);
      for (let page = 1; page <= 20 && !uid; page++) {
        const { data: l } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        uid = l.users.find((u) => u.email?.toLowerCase() === p.email!.toLowerCase())?.id ?? null;
        if (l.users.length < 200) break;
      }
      if (!uid) throw new Error("Akun tidak ditemukan.");
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: data.sandi, email_confirm: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
