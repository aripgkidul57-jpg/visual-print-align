import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_surat",
  title: "Daftar Surat Perintah",
  description: "Menampilkan arsip Surat Perintah terbaru (nomor, tanggal, tugas, NRP penerima).",
  inputSchema: { limit: z.number().int().min(1).max(100).optional().describe("Jumlah maksimum, default 20.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("surat_perintah")
      .select("id, nomor, tanggal, tugas, penerima_nrp")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const surat = (data ?? []).map((s) => ({
      id: s.id, nomor: s.nomor, tanggal: s.tanggal, tugas: s.tugas, penerima_nrp: s.penerima_nrp ?? [],
    }));
    return { content: [{ type: "text", text: JSON.stringify(surat) }], structuredContent: { surat } };
  },
});
