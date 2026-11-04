-- New Supabase projects require explicit Data API table privileges.
-- Keep grants aligned with the existing row-level security policies.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Public catalog reads; CMS public reads go through a filtered RPC migration.
REVOKE ALL ON TABLE public.oems, public.categories, public.products,
  public.product_images
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.oems, public.categories, public.products,
  public.product_images
  TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.oems, public.categories,
  public.products, public.product_images, public.cms_content
  TO authenticated;

-- Staff role lookups and role administration remain controlled by RLS.
REVOKE ALL ON TABLE public.user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;

-- The Edge Function returns inserted enquiry rows; only admins use the browser UI.
REVOKE ALL ON TABLE public.enquiries FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, DELETE ON TABLE public.enquiries TO authenticated;
GRANT SELECT, INSERT ON TABLE public.enquiries TO service_role;

-- The Edge Function requests the persisted career row in its insert response.
REVOKE ALL ON TABLE public.career_applications FROM service_role;
GRANT SELECT, INSERT ON TABLE public.career_applications TO service_role;

-- Keep direct browser access to the retained legacy table disabled.
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rate_limits TO service_role;

-- Rate-limit events are accessed through the SECURITY DEFINER RPC.
REVOKE ALL ON TABLE public.contact_rate_limit_events
  FROM PUBLIC, anon, authenticated, service_role;


