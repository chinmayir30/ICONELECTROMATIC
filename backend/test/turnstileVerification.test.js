import test from "node:test";
import assert from "node:assert/strict";
import {
  getAllowedTurnstileHostnames,
  TurnstileVerificationError,
  verifyTurnstileToken,
} from "../src/services/turnstileVerification.js";

const commonOptions = {
  token: "mock-token",
  action: "contact_enquiry",
  frontendUrl:
    "https://iconelectromatic.com,https://www.iconelectromatic.com",
  isProduction: true,
  secretKey: "mock-secret",
};

function providerResponse(
  body = {
    success: true,
    hostname: "iconelectromatic.com",
    action: "contact_enquiry",
  },
  { ok = true } = {}
) {
  return {
    ok,
    json: async () => body,
  };
}

async function expectVerificationError(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof TurnstileVerificationError);
    assert.equal(error.code, code);
    return true;
  });
}

test("Siteverify posts the token and accepts the configured hostname and action", async () => {
  let requestUrl;
  let requestOptions;
  const result = await verifyTurnstileToken({
    ...commonOptions,
    fetchImpl: async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return providerResponse();
    },
  });

  assert.equal(
    requestUrl,
    "https://challenges.cloudflare.com/turnstile/v0/siteverify"
  );
  assert.equal(requestOptions.method, "POST");
  assert.equal(requestOptions.signal instanceof AbortSignal, true);
  assert.deepEqual(JSON.parse(requestOptions.body), {
    secret: "mock-secret",
    response: "mock-token",
  });
  assert.deepEqual(result, { success: true });
});

test("Siteverify rejects missing and malformed tokens without calling provider", async () => {
  let fetchCalls = 0;
  const fetchImpl = async () => {
    fetchCalls += 1;
    return providerResponse();
  };

  await expectVerificationError(
    verifyTurnstileToken({ ...commonOptions, token: "", fetchImpl }),
    "TURNSTILE_REQUIRED"
  );
  await expectVerificationError(
    verifyTurnstileToken({ ...commonOptions, token: " token ", fetchImpl }),
    "TURNSTILE_INVALID"
  );
  await expectVerificationError(
    verifyTurnstileToken({
      ...commonOptions,
      token: "x".repeat(2049),
      fetchImpl,
    }),
    "TURNSTILE_INVALID"
  );
  assert.equal(fetchCalls, 0);
});

test("Siteverify rejects invalid, expired, and reused provider tokens", async () => {
  for (const errorCode of [
    "invalid-input-response",
    "timeout-or-duplicate",
  ]) {
    await expectVerificationError(
      verifyTurnstileToken({
        ...commonOptions,
        fetchImpl: async () =>
          providerResponse({ success: false, "error-codes": [errorCode] }),
      }),
      "TURNSTILE_REJECTED"
    );
  }
});

test("Siteverify rejects wrong and unconfigured hostnames and wrong actions", async () => {
  for (const body of [
    {
      success: true,
      hostname: "attacker.example",
      action: "contact_enquiry",
    },
    {
      success: true,
      hostname: "alternate.iconelectromatic.com",
      action: "contact_enquiry",
    },
    {
      success: true,
      hostname: "iconelectromatic.com",
      action: "careers_application",
    },
  ]) {
    await expectVerificationError(
      verifyTurnstileToken({
        ...commonOptions,
        fetchImpl: async () => providerResponse(body),
      }),
      "TURNSTILE_REJECTED"
    );
  }
});

test("hostname allowlist accepts only configured exact www and non-www hosts", () => {
  const hostnames = getAllowedTurnstileHostnames(
    "https://iconelectromatic.com,https://www.iconelectromatic.com",
    true
  );

  assert.deepEqual(
    [...hostnames],
    ["iconelectromatic.com", "www.iconelectromatic.com"]
  );
});

test("hostname configuration fails closed for empty, malformed, or insecure production origins", () => {
  for (const frontendUrl of [
    "",
    "https://iconelectromatic.com,",
    "not-a-url",
    "http://iconelectromatic.com",
    "https://iconelectromatic.com/path",
    "https://iconelectromatic.com:8443",
  ]) {
    assert.throws(
      () => getAllowedTurnstileHostnames(frontendUrl, true),
      (error) =>
        error instanceof TurnstileVerificationError &&
        error.code === "TURNSTILE_NOT_CONFIGURED"
    );
  }
});

test("missing secret fails closed without contacting Siteverify", async () => {
  let fetchCalls = 0;
  await expectVerificationError(
    verifyTurnstileToken({
      ...commonOptions,
      secretKey: "",
      fetchImpl: async () => {
        fetchCalls += 1;
        return providerResponse();
      },
    }),
    "TURNSTILE_NOT_CONFIGURED"
  );
  assert.equal(fetchCalls, 0);
});

test("Siteverify network and timeout failures fail closed without leaking credentials", async () => {
  const secretKey = "private-mock-secret";
  const token = "private-mock-token";
  for (const fetchImpl of [
    async () => {
      throw new Error(`${secretKey} ${token}`);
    },
    async (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        const keepAlive = setTimeout(() => {}, 100);
        if (signal.aborted) {
          clearTimeout(keepAlive);
          reject(signal.reason);
          return;
        }
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(keepAlive);
            reject(signal.reason);
          },
          { once: true }
        );
      }),
  ]) {
    await assert.rejects(
      verifyTurnstileToken({
        ...commonOptions,
        secretKey,
        token,
        timeoutMs: 5,
        fetchImpl,
      }),
      (error) => {
        assert.equal(error.code, "TURNSTILE_UNAVAILABLE");
        assert.equal(error.message.includes(secretKey), false);
        assert.equal(error.message.includes(token), false);
        return true;
      }
    );
  }
});

test("Siteverify HTTP and malformed response failures fail closed", async () => {
  const failedCases = [
    async () => providerResponse({}, { ok: false }),
    async () => ({
      ok: true,
      json: async () => {
        throw new Error("bad json");
      },
    }),
    async () => providerResponse(null),
    async () => providerResponse("not-an-object"),
  ];

  for (const fetchImpl of failedCases) {
    await expectVerificationError(
      verifyTurnstileToken({ ...commonOptions, fetchImpl }),
      "TURNSTILE_UNAVAILABLE"
    );
  }
});
