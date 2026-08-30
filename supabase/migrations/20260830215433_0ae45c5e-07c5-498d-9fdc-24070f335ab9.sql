-- 1) Column-level SELECT for anon on clubs (excludes email/phone)
GRANT SELECT (id, division_id, name, city, state, address, meetings, website, instagram, facebook, president, logo_url, order_index, created_at, updated_at)
  ON public.clubs TO anon;

-- 2) Editor write policies must not be evaluated for anon
DROP POLICY IF EXISTS "editors write clubs" ON public.clubs;
CREATE POLICY "editors write clubs" ON public.clubs FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write divisions" ON public.divisions;
CREATE POLICY "editors write divisions" ON public.divisions FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write regions" ON public.regions;
CREATE POLICY "editors write regions" ON public.regions FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write events" ON public.events;
CREATE POLICY "editors write events" ON public.events FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write leaders" ON public.leaders;
CREATE POLICY "editors write leaders" ON public.leaders FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write news" ON public.news;
CREATE POLICY "editors write news" ON public.news FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write projects" ON public.projects;
CREATE POLICY "editors write projects" ON public.projects FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "editors write content" ON public.site_content;
CREATE POLICY "editors write content" ON public.site_content FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

-- 3) Panel read on leaders only for authenticated
DROP POLICY IF EXISTS "panel read leaders" ON public.leaders;
CREATE POLICY "panel read leaders" ON public.leaders FOR SELECT TO authenticated
  USING (public.has_panel_access(auth.uid()));

-- 4) Documents: split anon vs authenticated so helper functions are never called as anon
DROP POLICY IF EXISTS "Public documents readable by everyone" ON public.documents;
CREATE POLICY "Anon reads unrestricted documents" ON public.documents FOR SELECT TO anon
  USING (COALESCE(is_restricted, false) = false);
CREATE POLICY "Authenticated reads permitted documents" ON public.documents FOR SELECT TO authenticated
  USING (
    COALESCE(is_restricted, false) = false
    OR CASE COALESCE(required_role, 'membro')
         WHEN 'admin' THEN public.has_role(auth.uid(), 'admin'::app_role)
         WHEN 'diretoria' THEN public.has_panel_access(auth.uid())
         ELSE true
       END
  );