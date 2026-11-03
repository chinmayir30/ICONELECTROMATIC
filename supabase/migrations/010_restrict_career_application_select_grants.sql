-- Grant authenticated staff read access only; do not expose candidate records
-- to anonymous clients or permit browser-side writes.
REVOKE ALL ON TABLE public.career_applications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.career_applications TO authenticated;
GRANT INSERT ON TABLE public.career_applications TO service_role;
