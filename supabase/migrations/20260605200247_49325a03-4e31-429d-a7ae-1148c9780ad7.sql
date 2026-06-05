
-- Restrict public reads of leaders to non-sensitive columns via a view
DROP POLICY IF EXISTS "public read leaders" ON public.leaders;

CREATE POLICY "admin read leaders"
  ON public.leaders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.leaders_public
WITH (security_invoker = on) AS
SELECT id, category, name, role, bio, message, photo_url, year_label, motto, order_index, created_at, updated_at
FROM public.leaders;

GRANT SELECT ON public.leaders_public TO anon, authenticated;

-- Trigger functions don't need to be executable by end-users
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_initial_admin() FROM PUBLIC, anon, authenticated;
