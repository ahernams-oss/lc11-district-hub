ALTER VIEW public.clubs_public SET (security_invoker = off);
ALTER VIEW public.leaders_public SET (security_invoker = off);

REVOKE SELECT ON public.clubs FROM anon;
REVOKE SELECT ON public.leaders FROM anon;

GRANT SELECT ON public.clubs_public TO anon, authenticated;
GRANT SELECT ON public.leaders_public TO anon, authenticated;