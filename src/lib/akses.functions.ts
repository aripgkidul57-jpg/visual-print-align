import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Kirim OTP hanya untuk personil aktif. Selalu membalas pesan umum agar
// tidak membocorkan email mana yang terdaftar.
export const mintaOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; redirectTo: string }) => {
    const email = String(d?.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) throw new Error("Format email tidak valid.");
    const redirectTo = String(d?.redirectTo ?? "");
    return { email, redirectTo: /^https?:\/\//.test(redirectTo) ? redirectTo : undefined };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin
      .from("personel")
      .select("nrp")
      .ilike("email", data.email)
      .eq("status", "aktif")
      .maybeSingle();
    if (!p) return { ok: true };

    // Akun Auth dibuat oleh backend hanya untuk personil aktif (pendaftaran mandiri dimatikan).
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
    });
    if (createErr && !/already|registered|exists/i.test(createErr.message)) {
      console.error("createUser", createErr.message);
      return { ok: true };
    }

    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const pub = createClient(process.env.SUPABASE_URL!, key, {
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
    const { error } = await pub.auth.signInWithOtp({
      email: data.email,
      options: { shouldCreateUser: false, emailRedirectTo: data.redirectTo },
    });
    if (error) {
      if (error.status === 429) return { ok: false, rateLimited: true };
      console.error("signInWithOtp", error.message);
    }
    return { ok: true };
  });
