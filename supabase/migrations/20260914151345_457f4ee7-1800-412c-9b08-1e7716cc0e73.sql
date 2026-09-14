DROP POLICY IF EXISTS "public read clubs" ON public.clubs;
DROP POLICY IF EXISTS "public read leaders" ON public.leaders;

CREATE POLICY "panel read clubs" ON public.clubs
FOR SELECT TO authenticated
USING (public.has_panel_access(auth.uid()));