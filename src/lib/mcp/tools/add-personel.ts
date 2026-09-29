import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_personel",
  title: "Tambah/ubah personel",
  description: "Menambah atau memperbarui data personel berdasarkan NRP.",
  inputSchema: {
    nrp: z.string().trim().min(1),
    nama: z.string().trim().min(1),
    pangkat: z.string().trim().min(1),
    jabatan: z.string().trim().min(1),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const { error } = await supabaseForUser(ctx).from("personel").upsert(input);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Personel ${input.nama} (NRP ${input.nrp}) tersimpan.` }] };
  },
});
