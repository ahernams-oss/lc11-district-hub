
-- 1. Fix SECURITY DEFINER view: leaders_public should use security invoker
ALTER VIEW public.leaders_public SET (security_invoker = on);

-- 2. Restrict execution of SECURITY DEFINER helper functions to authenticated callers only
REVOKE EXECUTE ON FUNCTION public.can_view_users(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_panel_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_content(uuid) FROM PUBLIC, anon;

-- 3. Hide club email/phone from anonymous visitors via column grants + a public view
REVOKE SELECT ON public.clubs FROM anon;
GRANT SELECT (
  id, division_id, name, city, state, address, meetings,
  website, instagram, facebook, president, logo_url,
  order_index, created_at, updated_at
) ON public.clubs TO anon;

CREATE OR REPLACE VIEW public.clubs_public
WITH (security_invoker = on) AS
SELECT
  id, division_id, name, city, state, address, meetings,
  website, instagram, facebook, president, logo_url,
  order_index, created_at, updated_at
FROM public.clubs;

GRANT SELECT ON public.clubs_public TO anon, authenticated;
