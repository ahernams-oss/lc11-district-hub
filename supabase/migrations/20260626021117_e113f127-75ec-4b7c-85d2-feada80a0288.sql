
-- Restrict clubs SELECT to editors; public reads use clubs_public view
DROP POLICY IF EXISTS "authenticated read clubs" ON public.clubs;
CREATE POLICY "editors read clubs" ON public.clubs FOR SELECT TO authenticated USING (can_edit_content(auth.uid()));

-- Scope user_roles view-all policy to authenticated role only
DROP POLICY IF EXISTS "panel users view all roles" ON public.user_roles;
CREATE POLICY "panel users view all roles" ON public.user_roles FOR SELECT TO authenticated USING (can_view_users(auth.uid()));

-- Allow content editors to manage site-images storage
DROP POLICY IF EXISTS "editors upload site-images" ON storage.objects;
DROP POLICY IF EXISTS "editors update site-images" ON storage.objects;
DROP POLICY IF EXISTS "editors delete site-images" ON storage.objects;
CREATE POLICY "editors upload site-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND can_edit_content(auth.uid()));
CREATE POLICY "editors update site-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND can_edit_content(auth.uid()));
CREATE POLICY "editors delete site-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND can_edit_content(auth.uid()));
