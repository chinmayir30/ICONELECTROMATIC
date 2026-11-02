-- ==============================================================================
-- 006_align_enquiries_and_rate_limits.sql
-- Aligns enquiries and rate_limits schemas with Supabase Edge Function payloads
-- Adds career_applications table for recruitment pipeline
-- Idempotent DDL compatible with PostgreSQL 15+ and Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Align public.enquiries table
-- ------------------------------------------------------------------------------
ALTER TABLE public.enquiries
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS office TEXT,
    ADD COLUMN IF NOT EXISTS product_model TEXT,
    ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Relax NOT NULL constraint on legacy columns to support modern payloads
ALTER TABLE public.enquiries
    ALTER COLUMN name DROP NOT NULL,
    ALTER COLUMN destination_office DROP NOT NULL,
    ALTER COLUMN destination_email DROP NOT NULL;

-- Update status constraint to accept both Edge function and legacy statuses
ALTER TABLE public.enquiries
    DROP CONSTRAINT IF EXISTS enquiries_status_check;

ALTER TABLE public.enquiries
    ADD CONSTRAINT enquiries_status_check
    CHECK (status IN ('new', 'received', 'emailed', 'failed', 'archived'));

-- Dual-column auto-synchronization trigger
CREATE OR REPLACE FUNCTION public.sync_enquiry_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize full_name <-> name
    IF NEW.full_name IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
        NEW.name := NEW.full_name;
    ELSIF NEW.name IS NOT NULL AND (NEW.full_name IS NULL OR NEW.full_name = '') THEN
        NEW.full_name := NEW.name;
    END IF;

    -- Synchronize office <-> destination_office
    IF NEW.office IS NOT NULL AND (NEW.destination_office IS NULL OR NEW.destination_office = '') THEN
        NEW.destination_office := NEW.office;
    ELSIF NEW.destination_office IS NOT NULL AND (NEW.office IS NULL OR NEW.office = '') THEN
        NEW.office := NEW.destination_office;
    END IF;

    -- Default destination_email if omitted
    IF NEW.destination_email IS NULL OR NEW.destination_email = '' THEN
        NEW.destination_email := 'sales@iconelectromatic.com';
    END IF;

    -- Compute ip_hash if ip_address is provided
    IF NEW.ip_address IS NOT NULL AND (NEW.ip_hash IS NULL OR NEW.ip_hash = '') THEN
        NEW.ip_hash := md5(NEW.ip_address);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_enquiry_columns ON public.enquiries;
CREATE TRIGGER trg_sync_enquiry_columns
    BEFORE INSERT OR UPDATE ON public.enquiries
    FOR EACH ROW EXECUTE FUNCTION public.sync_enquiry_columns();

-- ------------------------------------------------------------------------------
-- 2. Align public.rate_limits table
-- ------------------------------------------------------------------------------
ALTER TABLE public.rate_limits
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'contact_submission',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Relax NOT NULL on ip_hash for queries that use ip_address
-- Keep legacy ip_hash NOT NULL: it is the existing primary key. New atomic
-- rate limiting is implemented in contact_rate_limit_events by migration 007.

-- Performance index for edge function sliding window checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_sliding_window
    ON public.rate_limits (ip_address, action, created_at);

-- ------------------------------------------------------------------------------
-- 3. Career Applications Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_ref TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    message TEXT,
    resume_url TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view career applications" ON public.career_applications;
CREATE POLICY "Staff can view career applications"
    ON public.career_applications FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Service role insert career applications" ON public.career_applications;
CREATE POLICY "Service role insert career applications"
    ON public.career_applications FOR INSERT
    WITH CHECK (true);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

