ALTER VIEW public.clubs_public SET (security_invoker = on);
ALTER VIEW public.leaders_public SET (security_invoker = on);

CREATE POLICY "anon read clubs (public columns)" ON public.clubs
FOR SELECT TO anon USING (true);

CREATE POLICY "anon read leaders (public columns)" ON public.leaders
FOR SELECT TO anon USING (true);

GRANT SELECT (id, division_id, name, city, state, address, meetings, website, instagram, facebook, president, logo_url, order_index, created_at, updated_at)
ON public.clubs TO anon;

GRANT SELECT (id, category, name, role, bio, message, photo_url, pin_url, year_label, motto, order_index, gallery_urls, created_at, updated_at, club_name, public_email, public_phone)
ON public.leaders TO anon;