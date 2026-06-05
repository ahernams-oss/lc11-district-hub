
-- Add new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'basico';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'intermediario';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'avancado';

-- Helper: any panel access (any of the 4 roles)
CREATE OR REPLACE FUNCTION public.has_panel_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin','avancado','intermediario','basico')
  )
$$;

-- Helper: can edit content (intermediario, avancado, admin)
CREATE OR REPLACE FUNCTION public.can_edit_content(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin','avancado','intermediario')
  )
$$;

-- Helper: can view users panel (avancado, admin)
CREATE OR REPLACE FUNCTION public.can_view_users(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin','avancado')
  )
$$;

-- Update write policies on content tables to use can_edit_content
DROP POLICY IF EXISTS "admin write clubs" ON public.clubs;
CREATE POLICY "editors write clubs" ON public.clubs FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin write divisions" ON public.divisions;
CREATE POLICY "editors write divisions" ON public.divisions FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin write events" ON public.events;
CREATE POLICY "editors write events" ON public.events FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin write leaders" ON public.leaders;
CREATE POLICY "editors write leaders" ON public.leaders FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin read leaders" ON public.leaders;
CREATE POLICY "panel read leaders" ON public.leaders FOR SELECT
  USING (public.has_panel_access(auth.uid()));

DROP POLICY IF EXISTS "admin write news" ON public.news;
CREATE POLICY "editors write news" ON public.news FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin write projects" ON public.projects;
CREATE POLICY "editors write projects" ON public.projects FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin write regions" ON public.regions;
CREATE POLICY "editors write regions" ON public.regions FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin write content" ON public.site_content;
CREATE POLICY "editors write content" ON public.site_content FOR ALL
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

-- user_roles: only admin can manage; allow avancado to view list
DROP POLICY IF EXISTS "admins view all roles" ON public.user_roles;
CREATE POLICY "panel users view all roles" ON public.user_roles FOR SELECT
  USING (public.can_view_users(auth.uid()));
