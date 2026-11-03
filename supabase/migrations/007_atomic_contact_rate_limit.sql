-- ==============================================================================
-- 007_atomic_contact_rate_limit.sql
-- Atomic sliding-window rate limiting for contact enquiries.
-- Legacy public.rate_limits is deliberately retained for compatibility/data safety.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_rate_limit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL CHECK (ip_hash ~ '^[0-9a-f]{64}$'),
    action TEXT NOT NULL CHECK (action = 'contact_submission'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_events_window
    ON public.contact_rate_limit_events (ip_hash, action, created_at DESC);

ALTER TABLE public.contact_rate_limit_events ENABLE ROW LEVEL SECURITY;

-- The table is accessed only through the SECURITY DEFINER RPC below.
REVOKE ALL ON TABLE public.contact_rate_limit_events FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_contact_rate_limit(
    p_ip_hash TEXT,
    p_action TEXT DEFAULT 'contact_submission',
    p_limit INTEGER DEFAULT 5,
    p_window_seconds INTEGER DEFAULT 3600
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_attempt_count INTEGER;
BEGIN
    IF p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid rate-limit identifier' USING ERRCODE = '22023';
    END IF;

    IF p_action IS DISTINCT FROM 'contact_submission'
       OR p_limit IS NULL OR p_limit < 1 OR p_limit > 20
       OR p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
        RAISE EXCEPTION 'Invalid rate-limit parameters' USING ERRCODE = '22023';
    END IF;

    -- Serialize attempts for this identifier/action so concurrent requests
    -- cannot all pass the count-before-insert check.
    PERFORM pg_advisory_xact_lock(
        hashtextextended(p_ip_hash || ':' || p_action, 0)
    );

    SELECT count(*)::INTEGER
      INTO v_attempt_count
      FROM public.contact_rate_limit_events
     WHERE ip_hash = p_ip_hash
       AND action = p_action
       AND created_at > now() - make_interval(secs => p_window_seconds);

    IF v_attempt_count >= p_limit THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.contact_rate_limit_events (ip_hash, action)
    VALUES (p_ip_hash, p_action);

    -- Bounded opportunistic cleanup; no extension/scheduler dependency.
    DELETE FROM public.contact_rate_limit_events
     WHERE id IN (
        SELECT id
          FROM public.contact_rate_limit_events
         WHERE created_at < now() - INTERVAL '24 hours'
         ORDER BY created_at
         LIMIT 100
     );

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_contact_rate_limit(TEXT, TEXT, INTEGER, INTEGER)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_rate_limit(TEXT, TEXT, INTEGER, INTEGER)
    TO service_role;

NOTIFY pgrst, 'reload schema';
