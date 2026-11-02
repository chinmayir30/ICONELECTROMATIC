import { consumeContactRateLimit, getTrustedClientIp, hashClientIp } from "./rateLimit.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("trusted client IP comes only from the single-value CF-Connecting-IP header", () => {
  const headers = new Headers({
    "cf-connecting-ip": "203.0.113.10",
    "x-forwarded-for": "198.51.100.77, 203.0.113.10",
    "x-real-ip": "198.51.100.88",
  });
  assert(getTrustedClientIp(headers) === "203.0.113.10", "CF-Connecting-IP must be preferred");
});

Deno.test("spoofed X-Forwarded-For is never used when CF-Connecting-IP is missing", () => {
  const headers = new Headers({ "x-forwarded-for": "198.51.100.77" });
  assert(getTrustedClientIp(headers) === null, "must fail closed without trusted ingress header");
});

Deno.test("malformed multi-value CF-Connecting-IP is rejected", () => {
  const headers = new Headers({ "cf-connecting-ip": "203.0.113.10, 198.51.100.77" });
  assert(getTrustedClientIp(headers) === null, "single-value header required");
});

Deno.test("HMAC IP hashes are deterministic and do not expose the IP", async () => {
  const ip = "203.0.113.10";
  const first = await hashClientIp(ip, "0123456789abcdef0123456789abcdef");
  const second = await hashClientIp(ip, "0123456789abcdef0123456789abcdef");
  assert(first === second, "same input must produce same hash");
  assert(first.length === 64 && /^[0-9a-f]{64}$/.test(first), "expected SHA-256 hex");
  assert(first !== ip && !first.includes(ip), "raw IP must not be present");
});

Deno.test("HMAC IP hashes differ when the secret changes", async () => {
  const a = await hashClientIp("203.0.113.10", "0123456789abcdef0123456789abcdef");
  const b = await hashClientIp("203.0.113.10", "abcdef0123456789abcdef0123456789");
  assert(a !== b, "different secrets must produce different hashes");
});

Deno.test("missing or weak HMAC secret fails closed", async () => {
  let failed = false;
  try { await hashClientIp("203.0.113.10", "short"); } catch { failed = true; }
  assert(failed, "weak secret must be rejected");
});

Deno.test("RPC sends the fixed five-per-hour policy and accepts boolean true", async () => {
  let requestBody: Record<string, unknown> | undefined;
  const allowed = await consumeContactRateLimit(
    "https://project.supabase.co",
    "service-role-key",
    "a".repeat(64),
    async (_input, init) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    },
  );
  assert(allowed, "true response should allow request");
  assert(requestBody?.p_limit === 5 && requestBody?.p_window_seconds === 3600, "policy must be 5 per hour");
  assert(requestBody?.p_ip_hash === "a".repeat(64), "hashed identifier must be sent");
});

Deno.test("RPC false response denies the request", async () => {
  const allowed = await consumeContactRateLimit(
    "https://project.supabase.co",
    "service-role-key",
    "b".repeat(64),
    async () => new Response("false", { status: 200 }),
  );
  assert(!allowed, "false response should deny request");
});

Deno.test("RPC errors fail closed", async () => {
  let failed = false;
  try {
    await consumeContactRateLimit(
      "https://project.supabase.co",
      "service-role-key",
      "c".repeat(64),
      async () => new Response("unavailable", { status: 503 }),
    );
  } catch { failed = true; }
  assert(failed, "non-2xx response must throw");
});
