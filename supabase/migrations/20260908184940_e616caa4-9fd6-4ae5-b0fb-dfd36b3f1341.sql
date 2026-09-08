ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS club_name text;

DROP VIEW IF EXISTS public.leaders_public;
CREATE VIEW public.leaders_public
WITH (security_invoker = on) AS
SELECT id, category, name, role, bio, message, photo_url, pin_url, year_label, motto, order_index, gallery_urls, created_at, updated_at,
       public_email AS email, public_phone AS phone, club_name
FROM public.leaders;

GRANT SELECT ON public.leaders_public TO anon, authenticated;