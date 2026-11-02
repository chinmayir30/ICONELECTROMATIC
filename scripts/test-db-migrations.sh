#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"
: "${PGDATABASE:=postgres}"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

psql -v ON_ERROR_STOP=1 -f supabase/tests/bootstrap_supabase.sql

first_migration="supabase/migrations/001_initial_schema.sql"
echo "Applying ${first_migration}"
psql -v ON_ERROR_STOP=1 -f "${first_migration}"

echo "Seeding representative legacy rows before alignment migrations"
psql -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO public.oems (id, name, slug)
VALUES ('10000000-0000-4000-8000-000000000001', 'Legacy OEM', 'legacy-oem');

INSERT INTO public.categories (id, name, slug, oem_id)
VALUES ('20000000-0000-4000-8000-000000000001', 'Legacy Category', 'legacy-category',
        '10000000-0000-4000-8000-000000000001');

INSERT INTO public.products (id, name, slug, oem_id, category_id, is_published)
VALUES ('30000000-0000-4000-8000-000000000001', 'Legacy Product', 'legacy-product',
        '10000000-0000-4000-8000-000000000001',
        '20000000-0000-4000-8000-000000000001', true);

INSERT INTO public.enquiries
    (id, name, email, destination_office, destination_email, message, ip_hash, status)
VALUES
    ('40000000-0000-4000-8000-000000000001', 'Legacy Contact', 'legacy@example.test',
     'india', 'legacy@example.test', 'Legacy enquiry retained through alignment',
     'legacy-ip-hash', 'received');

INSERT INTO public.rate_limits (ip_hash, request_count)
VALUES ('legacy-rate-limit-hash', 3);
SQL

for migration in supabase/migrations/[0-9][0-9][0-9]_*.sql; do
  [[ "${migration}" == "${first_migration}" ]] && continue
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
    SELECT 1 FROM public.enquiries
    WHERE id='40000000-0000-4000-8000-000000000001'
      AND name='Legacy Contact'
      AND destination_office='india'
      AND status='received'
  ) THEN RAISE EXCEPTION 'legacy enquiry row was not preserved'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.rate_limits
    WHERE ip_hash='legacy-rate-limit-hash' AND request_count=3
  ) THEN RAISE EXCEPTION 'legacy rate-limit row was not preserved'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE id='30000000-0000-4000-8000-000000000001'
      AND name='Legacy Product' AND is_published
  ) THEN RAISE EXCEPTION 'legacy product row was not preserved'; END IF;

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

  IF has_function_privilege('anon', 'public.is_staff()', 'EXECUTE')
     OR has_function_privilege('anon', 'public.is_admin()', 'EXECUTE')
  THEN RAISE EXCEPTION 'anonymous role can execute admin helper functions'; END IF;

  IF NOT has_function_privilege('authenticated', 'public.is_staff()', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE')
  THEN RAISE EXCEPTION 'authenticated RLS policies cannot execute admin helper functions'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE oid='public.is_staff()'::regprocedure
      AND proconfig @> ARRAY['search_path=public, auth, pg_temp']
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE oid='public.is_admin()'::regprocedure
      AND proconfig @> ARRAY['search_path=public, auth, pg_temp']
  ) THEN RAISE EXCEPTION 'admin helper search_path is not pinned'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    WHERE oid='storage.objects'::regclass AND relrowsecurity
  ) THEN RAISE EXCEPTION 'Storage objects RLS prerequisite missing'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='Public Access for catalog-images'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='Staff Manage catalog-images'
  ) THEN RAISE EXCEPTION 'catalog-images Storage policies missing'; END IF;
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
