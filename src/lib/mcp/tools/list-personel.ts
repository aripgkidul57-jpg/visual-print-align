import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_personel",
  title: "Daftar personel",
  description: "Menampilkan daftar personel (NRP, nama, pangkat, jabatan).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("personel")
      .select("nrp, nama, pangkat, jabatan")
      .order("nama");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const personel = (data ?? []).map((p) => ({
      nrp: p.nrp, nama: p.nama, pangkat: p.pangkat, jabatan: p.jabatan,
    }));
    return { content: [{ type: "text", text: JSON.stringify(personel) }], structuredContent: { personel } };
  },
});
