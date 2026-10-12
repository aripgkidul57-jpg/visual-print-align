ALTER TABLE public.personel
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS kriteria text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'aktif',
  ADD COLUMN IF NOT EXISTS auth_user_id uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.personel ADD CONSTRAINT personel_id_key UNIQUE (id);
ALTER TABLE public.personel ADD CONSTRAINT personel_auth_user_id_key UNIQUE (auth_user_id);
ALTER TABLE public.personel ADD CONSTRAINT personel_kriteria_check CHECK (kriteria IN ('admin','maintenance','user'));
ALTER TABLE public.personel ADD CONSTRAINT personel_status_check CHECK (status IN ('aktif','nonaktif'));
ALTER TABLE public.personel ADD CONSTRAINT personel_nrp_format CHECK (nrp ~ '^[0-9A-Za-z.\-]{3,30}$');
ALTER TABLE public.personel ADD CONSTRAINT personel_email_format CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
CREATE UNIQUE INDEX personel_email_lower_key ON public.personel (lower(email));
CREATE INDEX personel_kriteria_status_idx ON public.personel (kriteria, status);

-- Identitas aktif pengguna yang login (tanpa rekursi RLS)
CREATE OR REPLACE FUNCTION public.current_kriteria()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT kriteria FROM public.personel
  WHERE auth_user_id = auth.uid() AND status = 'aktif' LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_active_personel(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.personel WHERE auth_user_id = _user_id AND status = 'aktif')
$$;

-- has_role kini bersumber dari data personil (admin = kriteria admin & aktif)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.personel
    WHERE auth_user_id = _user_id AND status = 'aktif'
      AND (_role::text = 'operator' OR kriteria = _role::text)
  )
$$;

-- Pengaitan akun: email diambil dari auth.users (terverifikasi), bukan dari frontend
CREATE OR REPLACE FUNCTION public.link_personel()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text; _k text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT lower(email::text) INTO _email FROM auth.users
   WHERE id = auth.uid() AND (email_confirmed_at IS NOT NULL OR last_sign_in_at IS NOT NULL);
  IF _email IS NULL THEN RETURN NULL; END IF;
  UPDATE public.personel SET auth_user_id = auth.uid()
   WHERE lower(email) = _email AND status = 'aktif' AND auth_user_id IS NULL;
  SELECT kriteria INTO _k FROM public.personel
   WHERE auth_user_id = auth.uid() AND status = 'aktif' AND lower(email) = _email;
  RETURN _k;
END $$;

REVOKE ALL ON FUNCTION public.link_personel() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_personel() TO authenticated;
REVOKE ALL ON FUNCTION public.current_kriteria() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_kriteria() TO authenticated;
REVOKE ALL ON FUNCTION public.is_active_personel(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_personel(uuid) TO authenticated;

-- Penjaga: auth_user_id tidak bisa diubah klien, ganti email memutus tautan, admin terakhir dilindungi
CREATE OR REPLACE FUNCTION public.personel_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.auth_user_id IS NOT NULL AND current_user IN ('authenticated','anon') THEN
      RAISE EXCEPTION 'auth_user_id tidak boleh diisi dari aplikasi';
    END IF;
    NEW.email := lower(NEW.email);
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id AND current_user IN ('authenticated','anon') THEN
      RAISE EXCEPTION 'auth_user_id tidak boleh diubah dari aplikasi';
    END IF;
    NEW.email := lower(NEW.email);
    IF NEW.email IS DISTINCT FROM OLD.email THEN NEW.auth_user_id := NULL; END IF;
    NEW.updated_at := now();
    IF OLD.kriteria = 'admin' AND OLD.status = 'aktif'
       AND (NEW.kriteria <> 'admin' OR NEW.status <> 'aktif')
       AND NOT EXISTS (SELECT 1 FROM public.personel WHERE nrp <> OLD.nrp AND kriteria='admin' AND status='aktif') THEN
      RAISE EXCEPTION 'Admin aktif terakhir tidak boleh diturunkan atau dinonaktifkan';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.kriteria = 'admin' AND OLD.status = 'aktif'
     AND NOT EXISTS (SELECT 1 FROM public.personel WHERE nrp <> OLD.nrp AND kriteria='admin' AND status='aktif') THEN
    RAISE EXCEPTION 'Admin aktif terakhir tidak boleh dihapus';
  END IF;
  RETURN OLD;
END $$;

CREATE TRIGGER personel_guard_trg BEFORE INSERT OR UPDATE OR DELETE ON public.personel
FOR EACH ROW EXECUTE FUNCTION public.personel_guard();

-- RLS personel: hanya personil aktif yang membaca; admin terverifikasi yang menulis
DROP POLICY IF EXISTS "Personel dibaca pengguna login" ON public.personel;
CREATE POLICY "Personel dibaca personil aktif" ON public.personel FOR SELECT TO authenticated
  USING (public.is_active_personel(auth.uid()));

-- RLS surat: hanya personil aktif
DROP POLICY IF EXISTS "Surat dibaca pengguna login" ON public.surat_perintah;
DROP POLICY IF EXISTS "Surat dibuat pengguna login" ON public.surat_perintah;
DROP POLICY IF EXISTS "Surat diubah pengguna login" ON public.surat_perintah;
CREATE POLICY "Surat dibaca personil aktif" ON public.surat_perintah FOR SELECT TO authenticated
  USING (public.is_active_personel(auth.uid()));
CREATE POLICY "Surat dibuat personil aktif" ON public.surat_perintah FOR INSERT TO authenticated
  WITH CHECK (public.is_active_personel(auth.uid()));
CREATE POLICY "Surat diubah personil aktif" ON public.surat_perintah FOR UPDATE TO authenticated
  USING (public.is_active_personel(auth.uid())) WITH CHECK (public.is_active_personel(auth.uid()));

REVOKE ALL ON public.personel FROM anon;
REVOKE ALL ON public.surat_perintah FROM anon;