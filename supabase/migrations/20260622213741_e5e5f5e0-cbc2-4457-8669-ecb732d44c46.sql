ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}';

DROP VIEW IF EXISTS public.leaders_public;
CREATE VIEW public.leaders_public AS
SELECT id, category, name, role, bio, message, photo_url, pin_url, year_label, motto, order_index, gallery_urls, created_at, updated_at
FROM public.leaders;

GRANT SELECT ON public.leaders_public TO anon, authenticated;