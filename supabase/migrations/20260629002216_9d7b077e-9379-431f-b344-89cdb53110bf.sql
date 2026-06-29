CREATE OR REPLACE VIEW public.leaders_public WITH (security_invoker = on) AS
SELECT id, category, name, role, bio, message, photo_url, pin_url, year_label, motto, order_index, gallery_urls, created_at, updated_at,
  CASE WHEN category IN ('governador','vice1','vice2','secretario','tesoureiro') THEN email ELSE NULL END AS email,
  CASE WHEN category IN ('governador','vice1','vice2','secretario','tesoureiro') THEN phone ELSE NULL END AS phone
FROM public.leaders;

GRANT SELECT ON public.leaders_public TO anon, authenticated;