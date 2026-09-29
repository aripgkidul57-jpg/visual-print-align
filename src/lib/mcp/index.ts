import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPersonel from "./tools/list-personel";
import listSurat from "./tools/list-surat";
import addPersonel from "./tools/add-personel";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "layout-perfection-project",
  title: "Layout Perfection Project",
  version: "0.1.0",
  instructions:
    "Alat untuk aplikasi Surat Perintah Polres Situbondo. Gunakan list_personel dan list_surat untuk membaca data, add_personel untuk menambah personel.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPersonel, listSurat, addPersonel],
});
