ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS leonic_year text;

GRANT SELECT (leonic_year) ON public.leaders TO anon;

DROP VIEW public.leaders_public;

CREATE VIEW public.leaders_public
WITH (security_invoker = on) AS
SELECT id,
    category,
    name,
    role,
    bio,
    message,
    photo_url,
    pin_url,
    year_label,
    motto,
    leonic_year,
    order_index,
    gallery_urls,
    created_at,
    updated_at,
    public_email AS email,
    public_phone AS phone,
    club_name
   FROM public.leaders;

GRANT SELECT ON public.leaders_public TO anon, authenticated;
GRANT ALL ON public.leaders_public TO service_role;