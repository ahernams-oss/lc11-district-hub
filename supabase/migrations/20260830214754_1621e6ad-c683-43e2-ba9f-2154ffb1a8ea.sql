-- 1) Views: stop bypassing RLS (security_invoker)
ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS public_email text
  GENERATED ALWAYS AS (CASE WHEN category = ANY (ARRAY['governador','vice1','vice2','secretario','tesoureiro']) THEN email ELSE NULL END) STORED;
ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS public_phone text
  GENERATED ALWAYS AS (CASE WHEN category = ANY (ARRAY['governador','vice1','vice2','secretario','tesoureiro']) THEN phone ELSE NULL END) STORED;

DROP VIEW IF EXISTS public.leaders_public;
CREATE VIEW public.leaders_public WITH (security_invoker = on) AS
SELECT id, category, name, role, bio, message, photo_url, pin_url, year_label, motto,
       order_index, gallery_urls, created_at, updated_at,
       public_email AS email, public_phone AS phone
FROM public.leaders;

DROP VIEW IF EXISTS public.clubs_public;
CREATE VIEW public.clubs_public WITH (security_invoker = on) AS
SELECT id, division_id, name, city, state, address, meetings, website, instagram, facebook,
       president, logo_url, order_index, created_at, updated_at
FROM public.clubs;

GRANT SELECT ON public.leaders_public TO anon, authenticated;
GRANT SELECT ON public.clubs_public TO anon, authenticated;

-- 2) Base tables: allow reads through the views, but keep private columns away from anon
REVOKE SELECT ON public.leaders FROM anon;
REVOKE SELECT ON public.clubs FROM anon;
GRANT SELECT (id, category, name, role, bio, message, photo_url, pin_url, year_label, motto,
              order_index, gallery_urls, created_at, updated_at, public_email, public_phone)
  ON public.leaders TO anon;
GRANT SELECT (id, division_id, name, city, state, address, meetings, website, instagram, facebook,
              president, logo_url, order_index, created_at, updated_at)
  ON public.clubs TO anon;
GRANT SELECT ON public.leaders TO authenticated;
GRANT SELECT ON public.clubs TO authenticated;

DROP POLICY IF EXISTS "public read leaders" ON public.leaders;
CREATE POLICY "public read leaders" ON public.leaders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public read clubs" ON public.clubs;
CREATE POLICY "public read clubs" ON public.clubs FOR SELECT TO anon, authenticated USING (true);

-- 3) Storage: do not serve files attached to restricted documents
CREATE OR REPLACE FUNCTION public.can_read_storage_object(_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.documents d
    WHERE COALESCE(d.is_restricted, false)
      AND d.file_url LIKE '%' || _name
      AND NOT (
        auth.uid() IS NOT NULL AND
        CASE COALESCE(d.required_role, 'membro')
          WHEN 'admin' THEN public.has_role(auth.uid(), 'admin'::app_role)
          WHEN 'diretoria' THEN public.has_panel_access(auth.uid())
          ELSE true
        END
      )
  )
$$;
REVOKE ALL ON FUNCTION public.can_read_storage_object(text) FROM public;
GRANT EXECUTE ON FUNCTION public.can_read_storage_object(text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "public read site-images" ON storage.objects;
CREATE POLICY "public read site-images" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-images' AND public.can_read_storage_object(name));