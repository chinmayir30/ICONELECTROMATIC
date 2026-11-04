#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_URL:-}" || -z "${SUPABASE_KEY:-}" ]]; then
  echo "::error::Supabase URL and API key are required; keep-alive ping cannot run." >&2
  exit 1
fi

CLEAN_URL="${SUPABASE_URL%/}"
ENDPOINT="${CLEAN_URL}/rest/v1/cms_content?select=key&limit=1"

echo "Sending keep-alive ping to configured Supabase REST endpoint."
HTTP_STATUS="$(curl --silent --show-error --output /dev/null --write-out "%{http_code}" \
  --request GET "${ENDPOINT}" \
  --header "apikey: ${SUPABASE_KEY}" \
  --header "Authorization: Bearer ${SUPABASE_KEY}" \
  --header "Content-Type: application/json" \
  --connect-timeout 10 \
  --max-time 20)"

if [[ ! "${HTTP_STATUS}" =~ ^2[0-9][0-9]$ ]]; then
  echo "::error::Supabase keep-alive request failed with HTTP ${HTTP_STATUS}." >&2
  exit 1
fi

echo "Supabase keep-alive request succeeded (HTTP ${HTTP_STATUS})."
