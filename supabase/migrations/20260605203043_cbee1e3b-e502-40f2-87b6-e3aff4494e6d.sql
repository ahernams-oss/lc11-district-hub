ALTER VIEW public.leaders_public SET (security_invoker = off);
GRANT SELECT ON public.leaders_public TO anon, authenticated;