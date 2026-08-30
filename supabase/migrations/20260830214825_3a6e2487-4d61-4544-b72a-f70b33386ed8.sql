CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.can_read_storage_object(_name text)
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
REVOKE ALL ON FUNCTION private.can_read_storage_object(text) FROM public;
GRANT EXECUTE ON FUNCTION private.can_read_storage_object(text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "public read site-images" ON storage.objects;
CREATE POLICY "public read site-images" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-images' AND private.can_read_storage_object(name));

DROP FUNCTION IF EXISTS public.can_read_storage_object(text);