-- Restrict career application writes to the server-side Supabase service role.
-- The Edge Function persists applications with the service-role credential.
-- Browser clients must never be able to insert candidate PII directly.
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view career applications" ON public.career_applications;
CREATE POLICY "Staff can view career applications"
    ON public.career_applications
    FOR SELECT
    TO authenticated
    USING (public.is_staff());

DROP POLICY IF EXISTS "Service role insert career applications" ON public.career_applications;
CREATE POLICY "Service role insert career applications"
    ON public.career_applications
    FOR INSERT
    TO service_role
    WITH CHECK (true);

REVOKE INSERT ON TABLE public.career_applications FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.career_applications TO service_role;
