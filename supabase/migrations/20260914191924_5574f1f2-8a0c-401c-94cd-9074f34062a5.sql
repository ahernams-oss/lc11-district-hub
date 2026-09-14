-- Remove permissive anon policies and column grants on base tables
DROP POLICY IF EXISTS "anon read clubs (public columns)" ON public.clubs;
DROP POLICY IF EXISTS "anon read leaders (public columns)" ON public.leaders;

REVOKE ALL ON public.clubs FROM anon;
REVOKE ALL ON public.leaders FROM anon;

-- Public views become owner-executed so they can expose only public columns
ALTER VIEW public.clubs_public SET (security_invoker = off);
ALTER VIEW public.leaders_public SET (security_invoker = off);

ALTER VIEW public.clubs_public OWNER TO postgres;
ALTER VIEW public.leaders_public OWNER TO postgres;

GRANT SELECT ON public.clubs_public TO anon, authenticated;
GRANT SELECT ON public.leaders_public TO anon, authenticated;

-- divisions/regions joins used by public club listing stay readable
GRANT SELECT ON public.divisions TO anon;
GRANT SELECT ON public.regions TO anon;