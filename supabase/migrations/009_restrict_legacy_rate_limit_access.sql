-- The legacy rate_limits table is retained for historical compatibility,
-- but the current application uses the private HMAC event table and RPC.
-- Revoke direct Data API privileges from browser roles because this table
-- contains operational identifiers and is not part of the public client API.
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
