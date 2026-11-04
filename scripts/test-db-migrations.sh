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

for migration in supabase/migrations/*.sql; do
  [[ "${migration}" == "${first_migration}" ]] && continue
  echo "Applying ${migration}"
  psql -v ON_ERROR_STOP=1 -f "${migration}"
done

echo "Checking migration contracts and permissions"
psql -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO public.cms_content (key, content)
VALUES
  ('public_filter_products_test', '[
    {"id":"visible-oem","visible":true,"categories":[
      {"id":"visible-category","visible":true,"products":[
        {"id":"visible-product","visible":true},
        {"id":"draft-product","visible":false}
      ]},
      {"id":"draft-category","visible":false,"products":[{"id":"hidden-product","visible":true}]}
    ]},
    {"id":"draft-oem","visible":false,"categories":[]}
  ]'::jsonb),
  ('public_filter_blogs_test', '{"oemBlogs":[
    {"id":"visible-oem","visible":true,"articles":[
      {"id":"visible-article","visible":true},
      {"id":"draft-article","visible":false}
    ]},
    {"id":"draft-oem","visible":false,"articles":[{"id":"hidden-article","visible":true}]}
  ]}'::jsonb),
  ('public_filter_root_test', '{"visible":false,"secret":"draft-root"}'::jsonb);

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

  IF has_table_privilege('anon', 'public.career_applications', 'SELECT')
     OR has_table_privilege('anon', 'public.career_applications', 'INSERT')
     OR has_table_privilege('authenticated', 'public.career_applications', 'INSERT')
  THEN RAISE EXCEPTION 'anonymous clients can read or browser roles can insert career applications'; END IF;

  IF NOT has_table_privilege('authenticated', 'public.career_applications', 'SELECT')
  THEN RAISE EXCEPTION 'authenticated staff cannot select career applications'; END IF;

  IF NOT has_table_privilege('service_role', 'public.career_applications', 'INSERT')
  THEN RAISE EXCEPTION 'service_role cannot insert career applications'; END IF;

  IF NOT has_schema_privilege('anon', 'public', 'USAGE')
     OR NOT has_schema_privilege('authenticated', 'public', 'USAGE')
     OR NOT has_schema_privilege('service_role', 'public', 'USAGE')
  THEN RAISE EXCEPTION 'API roles lack public schema usage'; END IF;

  IF NOT has_table_privilege('anon', 'public.oems', 'SELECT')
     OR NOT has_table_privilege('anon', 'public.categories', 'SELECT')
     OR NOT has_table_privilege('anon', 'public.products', 'SELECT')
     OR NOT has_table_privilege('anon', 'public.product_images', 'SELECT')
  THEN RAISE EXCEPTION 'anonymous catalog table reads are not granted'; END IF;

  IF has_table_privilege('anon', 'public.cms_content', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.cms_content', 'SELECT')
  THEN RAISE EXCEPTION 'unfiltered CMS table access is not restricted to staff RLS'; END IF;

  IF NOT has_function_privilege('anon', 'public.get_public_cms_content()', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.get_public_cms_content()', 'EXECUTE')
     OR has_function_privilege('anon', 'public.has_staff_cms_access()', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.has_staff_cms_access()', 'EXECUTE')
     OR has_function_privilege('anon', 'private.filter_public_cms_json(jsonb)', 'EXECUTE')
  THEN RAISE EXCEPTION 'public CMS RPC/helper execution grants are incorrect'; END IF;

  IF has_table_privilege('anon', 'public.products', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.oems', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.oems', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.oems', 'DELETE')
     OR NOT has_table_privilege('authenticated', 'public.categories', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.categories', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.categories', 'DELETE')
     OR NOT has_table_privilege('authenticated', 'public.products', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.products', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.products', 'DELETE')
     OR NOT has_table_privilege('authenticated', 'public.product_images', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.product_images', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.product_images', 'DELETE')
     OR NOT has_table_privilege('authenticated', 'public.cms_content', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.cms_content', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.cms_content', 'DELETE')
     OR NOT has_table_privilege('authenticated', 'public.user_roles', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.user_roles', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.user_roles', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.user_roles', 'DELETE')
  THEN RAISE EXCEPTION 'authenticated catalog/admin grants are incomplete'; END IF;

  IF has_table_privilege('anon', 'public.enquiries', 'SELECT')
     OR has_table_privilege('anon', 'public.enquiries', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.enquiries', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.enquiries', 'DELETE')
     OR NOT has_table_privilege('service_role', 'public.enquiries', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.enquiries', 'INSERT')
  THEN RAISE EXCEPTION 'enquiry table grants do not match app access'; END IF;

  IF NOT has_table_privilege('service_role', 'public.career_applications', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.career_applications', 'INSERT')
  THEN RAISE EXCEPTION 'career insert representation grants are incomplete'; END IF;

  IF has_table_privilege('service_role', 'public.contact_rate_limit_events', 'SELECT')
     OR has_table_privilege('service_role', 'public.contact_rate_limit_events', 'INSERT')
  THEN RAISE EXCEPTION 'service_role has direct rate-limit event-table access'; END IF;

  IF has_table_privilege('anon', 'public.rate_limits', 'SELECT')
     OR has_table_privilege('authenticated', 'public.rate_limits', 'SELECT')
     OR has_table_privilege('anon', 'public.rate_limits', 'INSERT')
     OR has_table_privilege('authenticated', 'public.rate_limits', 'INSERT')
  THEN RAISE EXCEPTION 'client roles retain direct access to legacy rate_limits'; END IF;

  IF to_regprocedure('public.is_staff()') IS NOT NULL
     OR to_regprocedure('public.is_admin()') IS NOT NULL
  THEN RAISE EXCEPTION 'SECURITY DEFINER helpers remain in the exposed public schema'; END IF;

  IF has_function_privilege('anon', 'private.is_staff()', 'EXECUTE')
     OR has_function_privilege('anon', 'private.is_admin()', 'EXECUTE')
  THEN RAISE EXCEPTION 'anonymous role can execute private admin helper functions'; END IF;

  IF NOT has_function_privilege('authenticated', 'private.is_staff()', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'private.is_admin()', 'EXECUTE')
  THEN RAISE EXCEPTION 'authenticated RLS policies cannot execute private admin helpers'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE oid='private.is_staff()'::regprocedure
      AND proconfig @> ARRAY['search_path=pg_catalog, public, auth']
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE oid='private.is_admin()'::regprocedure
      AND proconfig @> ARRAY['search_path=pg_catalog, public, auth']
  ) THEN RAISE EXCEPTION 'private admin helper search_path is not pinned'; END IF;

  IF (SELECT count(*) FROM pg_policies
      WHERE (coalesce(qual,'') || coalesce(with_check,'')) LIKE '%private.is_staff%'
         OR (coalesce(qual,'') || coalesce(with_check,'')) LIKE '%private.is_admin%') < 13
  THEN RAISE EXCEPTION 'RLS policies do not consistently use private authorization helpers'; END IF;

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

SET ROLE authenticated;
DO $$
DECLARE
  visible_rows INTEGER;
BEGIN
  SELECT count(*) INTO visible_rows FROM public.cms_content;
  IF visible_rows <> 0 THEN
    RAISE EXCEPTION 'non-staff authenticated role can read unfiltered CMS rows';
  END IF;
END $$;
RESET ROLE;

SET ROLE anon;
DO $$
DECLARE
  product_content JSONB;
  blog_content JSONB;
BEGIN
  SELECT content INTO product_content
    FROM public.get_public_cms_content()
   WHERE key = 'public_filter_products_test';
  IF product_content IS DISTINCT FROM '[
    {"id":"visible-oem","visible":true,"categories":[
      {"id":"visible-category","visible":true,"products":[{"id":"visible-product","visible":true}]}
    ]}
  ]'::jsonb THEN
    RAISE EXCEPTION 'public product response did not remove hidden OEMs, categories, and products: %', product_content;
  END IF;

  SELECT content INTO blog_content
    FROM public.get_public_cms_content()
   WHERE key = 'public_filter_blogs_test';
  IF blog_content IS DISTINCT FROM '{"oemBlogs":[
    {"id":"visible-oem","visible":true,"articles":[{"id":"visible-article","visible":true}]}
  ]}'::jsonb THEN
    RAISE EXCEPTION 'public blog response did not remove hidden entries: %', blog_content;
  END IF;

  SELECT content INTO blog_content
    FROM public.get_public_cms_content()
   WHERE key = 'public_filter_root_test';
  IF blog_content IS DISTINCT FROM 'null'::jsonb THEN
    RAISE EXCEPTION 'public response exposed a hidden root object: %', blog_content;
  END IF;

END $$;
RESET ROLE;
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


