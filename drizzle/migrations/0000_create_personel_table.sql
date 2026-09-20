CREATE TABLE public.personel (
  nrp text PRIMARY KEY,
  nama text NOT NULL,
  pangkat text NOT NULL,
  jabatan text NOT NULL
);

GRANT SELECT ON public.personel TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personel TO authenticated;
GRANT ALL ON public.personel TO service_role;

ALTER TABLE public.personel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Personel dapat dibaca siapa saja"
ON public.personel
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.personel (nrp, nama, pangkat, jabatan) VALUES
  ('79120041', 'SURYANTO, SH.', 'AIPDA', 'Ps. KANIT I INTELKAM'),
  ('83040626', 'FAJRI WAHYUDIONO, SH.', 'BRIGADIR', 'ANGGOTA UNIT I INTELKAM');