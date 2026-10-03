DROP POLICY IF EXISTS "Personel ditambah pengguna login" ON public.personel;
DROP POLICY IF EXISTS "Personel diubah pengguna login" ON public.personel;
CREATE POLICY "Personel ditambah admin" ON public.personel FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Personel diubah admin" ON public.personel FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Personel dihapus admin" ON public.personel FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT DELETE ON public.personel TO authenticated;

DROP POLICY IF EXISTS "Surat dihapus pengguna login" ON public.surat_perintah;
CREATE POLICY "Surat dihapus admin" ON public.surat_perintah FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin membaca semua peran" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin menambah peran" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin menghapus peran" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY "Admin membaca semua profil" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, nama text, is_admin boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.email::text, coalesce(p.nama,''), public.has_role(u.id,'admin')
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY u.created_at
$$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;