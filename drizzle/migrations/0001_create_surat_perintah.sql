CREATE TABLE public.surat_perintah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor text NOT NULL,
  tanggal date NOT NULL,
  tugas text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  penerima_nrp text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surat_perintah TO anon, authenticated;
GRANT ALL ON public.surat_perintah TO service_role;
ALTER TABLE public.surat_perintah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Surat dapat dibaca" ON public.surat_perintah FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Surat dapat dibuat" ON public.surat_perintah FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Surat dapat diubah" ON public.surat_perintah FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Surat dapat dihapus" ON public.surat_perintah FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE ON public.personel TO anon, authenticated;
GRANT ALL ON public.personel TO service_role;
CREATE POLICY "Personel dapat ditambah" ON public.personel FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Personel dapat diubah" ON public.personel FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);