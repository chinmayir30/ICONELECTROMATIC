-- ==============================================================================
-- 005_cms_content_versioning.sql
-- Optimistic Concurrency Control (OCC) Integer Versioning for public.cms_content
-- Idempotent DDL compatible with PostgreSQL 15+ and Supabase
--
-- STATUS: UNAPPLIED ON DISK (Reference only - execute on Supabase when authorized)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Add integer version column (defaults to 1 for existing & new rows)
-- ------------------------------------------------------------------------------
ALTER TABLE public.cms_content 
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1 NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. Server-controlled monotonic version increment trigger function
--    Strictly forces NEW.version := OLD.version + 1 on every row update
--    and refreshes updated_at using PostgreSQL standard now()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_cms_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version := OLD.version + 1;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. Bind trigger to public.cms_content (BEFORE UPDATE)
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_cms_content_bump_version ON public.cms_content;
CREATE TRIGGER trg_cms_content_bump_version
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW EXECUTE FUNCTION public.bump_cms_version();

-- ------------------------------------------------------------------------------
-- 4. PostgREST Schema Cache Reload Instruction
--    When applying this migration in PostgreSQL or Supabase SQL Editor, reload
--    the schema cache so PostgREST immediately exposes the 'version' column:
--      NOTIFY pgrst, 'reload schema';
-- ------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------
-- 5. Safe Rollback Reference Notes (DO NOT EXECUTE AS PART OF MIGRATION)
-- ------------------------------------------------------------------------------
-- If rollback of migration 005 is ever required, execute manually:
--   DROP TRIGGER IF EXISTS trg_cms_content_bump_version ON public.cms_content;
--   DROP FUNCTION IF EXISTS public.bump_cms_version();
--   ALTER TABLE public.cms_content DROP COLUMN IF EXISTS version;
--   NOTIFY pgrst, 'reload schema';

