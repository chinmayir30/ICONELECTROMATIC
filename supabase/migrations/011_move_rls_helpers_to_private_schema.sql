-- Keep SECURITY DEFINER authorization helpers out of Supabase's exposed
-- public API schema. RLS policies can still invoke them with explicit grants.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
  );
$function$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$function$;

REVOKE ALL ON FUNCTION private.is_staff() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_staff() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

ALTER POLICY "Staff can manage categories" ON public.categories
  USING (private.is_staff()) WITH CHECK (private.is_staff());
ALTER POLICY "Staff can view all categories" ON public.categories
  USING (private.is_staff());
ALTER POLICY "Staff can manage cms_content" ON public.cms_content
  USING (private.is_staff()) WITH CHECK (private.is_staff());
ALTER POLICY "Admins can manage enquiries" ON public.enquiries
  USING (private.is_admin());
ALTER POLICY "Admins can view enquiries" ON public.enquiries
  USING (private.is_admin());
ALTER POLICY "Staff can manage OEMs" ON public.oems
  USING (private.is_staff()) WITH CHECK (private.is_staff());
ALTER POLICY "Staff can view all OEMs" ON public.oems
  USING (private.is_staff());
ALTER POLICY "Staff can manage product images" ON public.product_images
  USING (private.is_staff()) WITH CHECK (private.is_staff());
ALTER POLICY "Staff can manage products" ON public.products
  USING (private.is_staff()) WITH CHECK (private.is_staff());
ALTER POLICY "Staff can view all products" ON public.products
  USING (private.is_staff());
ALTER POLICY "Admins can manage roles" ON public.user_roles
  USING (private.is_admin()) WITH CHECK (private.is_admin());
ALTER POLICY "Staff can view career applications" ON public.career_applications
  USING (private.is_staff());
ALTER POLICY "Staff Manage catalog-images" ON storage.objects
  USING (bucket_id = 'catalog-images' AND private.is_staff())
  WITH CHECK (bucket_id = 'catalog-images' AND private.is_staff());

DROP FUNCTION public.is_staff();
DROP FUNCTION public.is_admin();
