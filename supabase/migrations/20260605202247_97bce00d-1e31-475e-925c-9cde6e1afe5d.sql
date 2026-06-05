ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS pin_url TEXT;

DROP VIEW IF EXISTS public.leaders_public;
CREATE VIEW public.leaders_public
WITH (security_invoker=on) AS
SELECT id, category, name, role, bio, message, photo_url, pin_url,
       year_label, motto, order_index, created_at, updated_at
FROM public.leaders;

GRANT SELECT ON public.leaders_public TO anon, authenticated;