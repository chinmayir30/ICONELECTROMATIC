#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"
: "${PGDATABASE:=postgres}"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

psql -v ON_ERROR_STOP=1 -f supabase/tests/bootstrap_supabase.sql

for migration in supabase/migrations/[0-9][0-9][0-9]_*.sql; do
  echo "Applying ${migration}"
  psql -v ON_ERROR_STOP=1 -f "${migration}"
done

echo "Checking migration contracts and permissions"
psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='cms_content' AND column_name='version'
  ) THEN RAISE EXCEPTION 'cms_content.version missing'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.rate_limits'::regclass AND contype='p'
  ) THEN RAISE EXCEPTION 'legacy rate_limits primary key missing'; END IF;

  IF (SELECT attnotnull FROM pg_attribute
      WHERE attrelid='public.rate_limits'::regclass AND attname='ip_hash') IS DISTINCT FROM TRUE
  THEN RAISE EXCEPTION 'legacy rate_limits.ip_hash must remain NOT NULL'; END IF;

  IF has_table_privilege('anon', 'public.contact_rate_limit_events', 'SELECT')
     OR has_table_privilege('authenticated', 'public.contact_rate_limit_events', 'SELECT')
  THEN RAISE EXCEPTION 'rate-limit event table is exposed to client roles'; END IF;

  IF has_function_privilege('anon', 'public.consume_contact_rate_limit(text,text,integer,integer)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.consume_contact_rate_limit(text,text,integer,integer)', 'EXECUTE')
  THEN RAISE EXCEPTION 'rate-limit RPC is executable by client roles'; END IF;

  IF NOT has_function_privilege('service_role', 'public.consume_contact_rate_limit(text,text,integer,integer)', 'EXECUTE')
  THEN RAISE EXCEPTION 'service_role cannot execute rate-limit RPC'; END IF;
END $$;
SQL

echo "Checking atomic concurrency limit (six simultaneous calls)"
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
hash="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
for i in 1 2 3 4 5 6; do
  (
    psql -X -A -t -v ON_ERROR_STOP=1 -c \
      "SELECT public.consume_contact_rate_limit('$hash', 'contact_submission', 5, 3600);" \
      > "$tmpdir/result-$i"
  ) &
done
wait

allowed="$(grep -hxc 't' "$tmpdir"/result-* | awk '{s+=$1} END {print s+0}')"
denied="$(grep -hxc 'f' "$tmpdir"/result-* | awk '{s+=$1} END {print s+0}')"
rows="$(psql -X -A -t -c "SELECT count(*) FROM public.contact_rate_limit_events WHERE ip_hash='$hash';" | tr -d '[:space:]')"

if [[ "$allowed" != "5" || "$denied" != "1" || "$rows" != "5" ]]; then
  echo "Concurrency assertion failed: allowed=$allowed denied=$denied rows=$rows"
  cat "$tmpdir"/result-*
  exit 1
fi

echo "Checking rolling-window expiry"
psql -v ON_ERROR_STOP=1 -c "UPDATE public.contact_rate_limit_events SET created_at = now() - interval '2 hours' WHERE ip_hash='$hash';" >/dev/null
expired="$(psql -X -A -t -c "SELECT public.consume_contact_rate_limit('$hash', 'contact_submission', 5, 3600);" | tr -d '[:space:]')"
if [[ "$expired" != "t" ]]; then
  echo "Expected a new request to be allowed after the rolling window expires"
  exit 1
fi

echo "Database migration and rate-limit integration tests passed."
