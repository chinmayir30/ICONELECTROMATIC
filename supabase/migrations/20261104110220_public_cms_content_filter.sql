-- Public CMS reads must not expose unpublished content kept in shared JSON rows.
-- Keep the unfiltered table for authenticated staff, and expose a sanitized RPC.

CREATE OR REPLACE FUNCTION private.filter_public_cms_json(p_value JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  IF jsonb_typeof(p_value) = 'object' AND p_value->>'visible' = 'false' THEN
    RETURN 'null'::jsonb;
  END IF;

  CASE jsonb_typeof(p_value)
    WHEN 'array' THEN
      SELECT COALESCE(
        jsonb_agg(private.filter_public_cms_json(item.value)),
        '[]'::jsonb
      )
      INTO v_result
      FROM jsonb_array_elements(p_value) AS item(value)
      WHERE jsonb_typeof(item.value) <> 'object'
         OR item.value->>'visible' IS DISTINCT FROM 'false';
      RETURN v_result;
    WHEN 'object' THEN
      SELECT COALESCE(
        jsonb_object_agg(field.key, private.filter_public_cms_json(field.value)),
        '{}'::jsonb
      )
      INTO v_result
      FROM jsonb_each(p_value) AS field(key, value)
      WHERE jsonb_typeof(field.value) <> 'object'
         OR field.value->>'visible' IS DISTINCT FROM 'false';
      RETURN v_result;
    ELSE
      RETURN p_value;
  END CASE;
END;
$function$;

REVOKE ALL ON FUNCTION private.filter_public_cms_json(JSONB)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_public_cms_content()
RETURNS TABLE (key TEXT, content JSONB, version INTEGER, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT cms.key,
         private.filter_public_cms_json(cms.content),
         cms.version,
         cms.updated_at
    FROM public.cms_content AS cms
   ORDER BY cms.key;
$function$;

REVOKE ALL ON FUNCTION public.get_public_cms_content()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_content() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_staff_cms_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
  SELECT auth.uid() IS NOT NULL AND private.is_staff();
$function$;

REVOKE ALL ON FUNCTION public.has_staff_cms_access()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_staff_cms_access() TO authenticated;

-- Only staff may query the unfiltered CMS table. Public clients use the RPC.
REVOKE SELECT ON TABLE public.cms_content FROM PUBLIC, anon;
DROP POLICY IF EXISTS "Public can view cms_content" ON public.cms_content;

NOTIFY pgrst, 'reload schema';

