DROP POLICY IF EXISTS "public read clubs" ON public.clubs;
CREATE POLICY "authenticated read clubs" ON public.clubs FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.clubs FROM anon;