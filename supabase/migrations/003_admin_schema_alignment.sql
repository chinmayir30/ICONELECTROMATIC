-- ==============================================================================
-- 003_admin_schema_alignment.sql
-- Schema alignment and storage configuration for Icon Electromatic Admin CMS
-- Idempotent DDL compatible with PostgreSQL 15+ and Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Align OEMs Table with CMS Data Attributes
-- ------------------------------------------------------------------------------
ALTER TABLE public.oems 
    ADD COLUMN IF NOT EXISTS short_name TEXT,
    ADD COLUMN IF NOT EXISTS specialty TEXT,
    ADD COLUMN IF NOT EXISTS tagline TEXT,
    ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#2563EB',
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_oems_published ON public.oems(is_published);

-- ------------------------------------------------------------------------------
-- 2. Align Categories Table and Replace Global Slug Constraint
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories 
    ADD COLUMN IF NOT EXISTS label TEXT,
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_categories_published ON public.categories(is_published);

-- Drop legacy global unique constraint on category slug if present
-- Replaces with scoped per-OEM uniqueness so different OEMs can share standard category names (e.g. 'amplifiers', 'general')
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_oem_category_slug'
    ) THEN
        ALTER TABLE public.categories ADD CONSTRAINT unique_oem_category_slug UNIQUE (oem_id, slug);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Align Products Table with Denormalized Hero Image Support
-- ------------------------------------------------------------------------------
ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ------------------------------------------------------------------------------
-- 4. Security Hardening: Pin search_path & Secure Function Privileges
-- ------------------------------------------------------------------------------
-- Recreate is_staff() with pinned search_path to prevent search-path injection
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    );
END;
$$;

-- Recreate is_admin() with pinned search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$;

-- Restrict function execution to authenticated users and service_role (revoking from public/anon)
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. Tightened Public Visibility & Staff RLS Policies
-- ------------------------------------------------------------------------------
-- OEMs: Public views only published OEMs; staff views all
DROP POLICY IF EXISTS "Public can view OEMs" ON public.oems;
DROP POLICY IF EXISTS "Public can view published OEMs" ON public.oems;
CREATE POLICY "Public can view published OEMs"
    ON public.oems FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Staff can view all OEMs" ON public.oems;
CREATE POLICY "Staff can view all OEMs"
    ON public.oems FOR SELECT
    TO authenticated
    USING (public.is_staff());

-- Categories: Public views only published categories under published OEMs (or global categories if unassigned)
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view published categories" ON public.categories;
CREATE POLICY "Public can view published categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (
        is_published = true
        AND (
            oem_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.oems o
                WHERE o.id = oem_id AND o.is_published = true
            )
        )
    );

DROP POLICY IF EXISTS "Staff can view all categories" ON public.categories;
CREATE POLICY "Staff can view all categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (public.is_staff());

-- Products: Public views only published products under published OEMs
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM public.oems o
            WHERE o.id = oem_id AND o.is_published = true
        )
    );

-- Product Images: Public views only images belonging to published products under published OEMs
DROP POLICY IF EXISTS "Public can view published product images" ON public.product_images;
CREATE POLICY "Public can view published product images"
    ON public.product_images FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.oems o ON o.id = p.oem_id
            WHERE p.id = product_id 
              AND p.is_published = true 
              AND o.is_published = true
        )
    );

-- ------------------------------------------------------------------------------
-- 6. Canonical Storage Bucket Declaration (catalog-images)
-- ------------------------------------------------------------------------------
-- Unifies storage with existing public/catalog-images/ convention
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'catalog-images',
    'catalog-images',
    true,
    10485760, -- 10 MB per file limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

-- ------------------------------------------------------------------------------
-- 7. Storage Row-Level Security Policies
-- ------------------------------------------------------------------------------
-- Ensure RLS is active on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access for catalog-images" ON storage.objects;
CREATE POLICY "Public Access for catalog-images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "Staff Manage catalog-images" ON storage.objects;
CREATE POLICY "Staff Manage catalog-images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'catalog-images' AND public.is_staff())
    WITH CHECK (bucket_id = 'catalog-images' AND public.is_staff());

-- ------------------------------------------------------------------------------
-- 8. Safe Rollback Reference Notes (DO NOT EXECUTE AS PART OF MIGRATION)
-- ------------------------------------------------------------------------------
-- If rollback of migration 003 is ever required, execute the following manually.
-- MANDATORY DATA PRESERVATION & SAFETY SAFEGUARDS:
-- 1. NEVER DROP storage bucket 'catalog-images' or delete storage.objects during rollback.
-- 2. Do NOT unconditionally restore global UNIQUE (slug) on categories if existing data
--    contains shared slugs across different OEMs (e.g. multiple OEMs having 'general').
--
-- Safe Manual Rollback DDL:
--   DROP POLICY IF EXISTS "Staff Manage catalog-images" ON storage.objects;
--   DROP POLICY IF EXISTS "Public Access for catalog-images" ON storage.objects;
--   ALTER TABLE public.products DROP COLUMN IF EXISTS image_url;
--   ALTER TABLE public.categories DROP COLUMN IF EXISTS label, DROP COLUMN IF EXISTS is_published;
--   ALTER TABLE public.oems DROP COLUMN IF EXISTS short_name, DROP COLUMN IF EXISTS specialty,
--       DROP COLUMN IF EXISTS tagline, DROP COLUMN IF EXISTS accent_color, DROP COLUMN IF EXISTS is_published;
--   -- Only re-apply categories_slug_key if verified that no duplicate slugs exist:
--   -- DO $$ BEGIN
--   --   IF NOT EXISTS (SELECT 1 FROM public.categories GROUP BY slug HAVING COUNT(*) > 1) THEN
--   --     ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS unique_oem_category_slug;
--   --     ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
--   --   END IF;
--   -- END $$;
