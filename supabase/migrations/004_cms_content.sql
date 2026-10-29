-- ==============================================================================
-- 004_cms_content.sql
-- Centralized Key-Value Content Storage for Icon Electromatic CMS
-- Idempotent DDL compatible with PostgreSQL 15+ and Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create cms_content Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_content (
    key TEXT PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_content_updated_at ON public.cms_content(updated_at);

-- ------------------------------------------------------------------------------
-- 2. Automated updated_at Trigger
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_cms_content_updated_at ON public.cms_content;
CREATE TRIGGER trg_cms_content_updated_at
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. Row-Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Public can read all site content
DROP POLICY IF EXISTS "Public can view cms_content" ON public.cms_content;
CREATE POLICY "Public can view cms_content"
    ON public.cms_content FOR SELECT
    TO anon, authenticated
    USING (true);

-- Staff only can insert, update, or delete site content
DROP POLICY IF EXISTS "Staff can manage cms_content" ON public.cms_content;
CREATE POLICY "Staff can manage cms_content"
    ON public.cms_content FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- 4. Safe Rollback Reference Notes (DO NOT EXECUTE AS PART OF MIGRATION)
-- ------------------------------------------------------------------------------
-- If rollback of migration 004 is ever required, execute manually:
--   DROP POLICY IF EXISTS "Staff can manage cms_content" ON public.cms_content;
--   DROP POLICY IF EXISTS "Public can view cms_content" ON public.cms_content;
--   DROP TRIGGER IF EXISTS trg_cms_content_updated_at ON public.cms_content;
--   DROP TABLE IF EXISTS public.cms_content;
