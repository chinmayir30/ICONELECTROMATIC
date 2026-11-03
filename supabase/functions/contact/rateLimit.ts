const encoder = new TextEncoder();

/**
 * Hosted Supabase Edge Functions are fronted by Cloudflare. Use only the
 * single-value CF-Connecting-IP header for the hosted ingress path.
 * Do not trust the leftmost X-Forwarded-For value: callers can prepend it.
 * If this header is absent, fail closed instead of guessing an identity.
 */
function isIpLiteral(value: string): boolean {
  if (value.includes(":")) {
    try {
      const hostname = new URL(`http://[${value}]/`).hostname;
      return hostname.startsWith("[") && hostname.endsWith("]");
    } catch {
      return false;
    }
  }

  const octets = value.split(".");
  return octets.length === 4 && octets.every((octet) =>
    /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255
  );
}

export function getTrustedClientIp(headers: Headers): string | null {
  const value = headers.get("cf-connecting-ip")?.trim();
  if (!value || value.includes(",") || !isIpLiteral(value)) return null;
  return value;
}

export async function hashClientIp(ipAddress: string, secret: string): Promise<string> {
  if (!ipAddress || !secret || encoder.encode(secret).byteLength < 32) {
    throw new Error("RATE_LIMIT_HASH_SECRET must be configured with at least 32 bytes.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ipAddress));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function consumeContactRateLimit(
  supabaseUrl: string,
  serviceRoleKey: string,
  ipHash: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const response = await fetchImpl(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/consume_contact_rate_limit`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_ip_hash: ipHash,
      p_action: "contact_submission",
      p_limit: 5,
      p_window_seconds: 3600,
    }),
  });

  if (!response.ok) {
    throw new Error(`Rate-limit service failed with HTTP ${response.status}.`);
  }

  const allowed: unknown = await response.json();
  if (typeof allowed !== "boolean") {
    throw new Error("Rate-limit service returned an invalid response.");
  }
  return allowed;
}
