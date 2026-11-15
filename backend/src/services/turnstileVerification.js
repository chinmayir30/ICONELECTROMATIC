const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_TIMEOUT_MS = 3000;
const MAX_TOKEN_LENGTH = 2048;

const ERROR_DETAILS = {
  TURNSTILE_REQUIRED: {
    status: 400,
    message: "Complete the verification challenge before submitting.",
  },
  TURNSTILE_INVALID: {
    status: 400,
    message: "The verification response is invalid. Please try again.",
  },
  TURNSTILE_REJECTED: {
    status: 400,
    message: "Verification failed or expired. Please try again.",
  },
  TURNSTILE_UNAVAILABLE: {
    status: 503,
    message: "Verification is temporarily unavailable. Please try again.",
  },
  TURNSTILE_NOT_CONFIGURED: {
    status: 503,
    message: "Verification is not configured. Please try again later.",
  },
};

export class TurnstileVerificationError extends Error {
  constructor(code) {
    const details = ERROR_DETAILS[code] || ERROR_DETAILS.TURNSTILE_UNAVAILABLE;
    super(details.message);
    this.name = "TurnstileVerificationError";
    this.code = ERROR_DETAILS[code] ? code : "TURNSTILE_UNAVAILABLE";
    this.status = details.status;
  }
}

export function getAllowedTurnstileHostnames(
  frontendUrl = process.env.FRONTEND_URL,
  isProduction = process.env.NODE_ENV === "production"
) {
  if (typeof frontendUrl !== "string" || !frontendUrl.trim()) {
    throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
  }

  const entries = frontendUrl.split(",").map((entry) => entry.trim());
  if (entries.some((entry) => !entry)) {
    throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
  }

  const hostnames = new Set();
  for (const entry of entries) {
    let url;
    try {
      url = new URL(entry);
    } catch {
      throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
    }

    const hasOriginOnlyPath =
      url.pathname === "/" && !url.search && !url.hash;
    const hasAllowedProtocol =
      isProduction
        ? url.protocol === "https:"
        : ["http:", "https:"].includes(url.protocol);

    if (
      !hasOriginOnlyPath ||
      !hasAllowedProtocol ||
      !url.hostname ||
      url.username ||
      url.password ||
      (isProduction && url.port)
    ) {
      throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
    }

    hostnames.add(url.hostname.toLowerCase());
  }

  if (hostnames.size === 0) {
    throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
  }

  return hostnames;
}

function isValidToken(token) {
  return (
    typeof token === "string" &&
    token.length > 0 &&
    token.length <= MAX_TOKEN_LENGTH &&
    token.trim() === token &&
    !/[\u0000-\u0020\u007f]/.test(token)
  );
}

export async function verifyTurnstileToken({
  token,
  action,
  frontendUrl = process.env.FRONTEND_URL,
  isProduction = process.env.NODE_ENV === "production",
  secretKey = process.env.TURNSTILE_SECRET_KEY,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (token === undefined || token === null || token === "") {
    throw new TurnstileVerificationError("TURNSTILE_REQUIRED");
  }
  if (!isValidToken(token) || typeof action !== "string" || !action) {
    throw new TurnstileVerificationError("TURNSTILE_INVALID");
  }
  if (typeof secretKey !== "string" || !secretKey.trim()) {
    throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
  }

  const allowedHostnames = getAllowedTurnstileHostnames(
    frontendUrl,
    isProduction
  );
  if (typeof fetchImpl !== "function" || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TurnstileVerificationError("TURNSTILE_NOT_CONFIGURED");
  }

  let response;
  try {
    response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new TurnstileVerificationError("TURNSTILE_UNAVAILABLE");
  }

  if (!response || !response.ok || typeof response.json !== "function") {
    throw new TurnstileVerificationError("TURNSTILE_UNAVAILABLE");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new TurnstileVerificationError("TURNSTILE_UNAVAILABLE");
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TurnstileVerificationError("TURNSTILE_UNAVAILABLE");
  }

  if (result.success !== true) {
    throw new TurnstileVerificationError("TURNSTILE_REJECTED");
  }

  if (
    typeof result.hostname !== "string" ||
    !allowedHostnames.has(result.hostname.toLowerCase()) ||
    result.action !== action
  ) {
    throw new TurnstileVerificationError("TURNSTILE_REJECTED");
  }

  return { success: true };
}
