import { createContactHandler } from "./index.ts";

type HarnessOptions = {
  insertStatus?: number;
  insertBody?: unknown;
  emailStatus?: number;
  rejectEmail?: boolean;
};

const testEnv: Record<string, string> = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key",
  RATE_LIMIT_HASH_SECRET: "0123456789abcdef0123456789abcdef",
  RESEND_API_KEY: "resend-test-key",
  ALLOWED_ORIGINS: "https://iconelectromatic.com",
  OFFICE_EMAIL_INDIA: "india@example.test",
  CAREERS_EMAIL: "careers@example.test",
};

function createHarness(options: HarnessOptions = {}) {
  const requests: Array<{ url: string; method: string; body?: Record<string, unknown> }> = [];
  const handler = createContactHandler({
    getEnv: (name) => testEnv[name],
    fetchImpl: async (input, init = {}) => {
      const url = String(input);
      const method = init.method || "GET";
      let body: Record<string, unknown> | undefined;
      if (typeof init.body === "string") body = JSON.parse(init.body);
      requests.push({ url, method, body });

      if (url.endsWith("/rpc/consume_contact_rate_limit")) {
        return new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.endsWith("/rest/v1/enquiries") || url.endsWith("/rest/v1/career_applications")) {
        const responseBody = options.insertBody === undefined
          ? url.endsWith("/rest/v1/enquiries")
            ? [{ id: "enquiry-db-id" }]
            : [{ id: "career-db-id", application_ref: "ICON-CAREER-persisted-ref" }]
          : options.insertBody;
        return new Response(JSON.stringify(responseBody), {
          status: options.insertStatus ?? 201,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url === "https://api.resend.com/emails") {
        if (options.rejectEmail) throw new Error("simulated email transport failure");
        return new Response(JSON.stringify({ id: "email-provider-id" }), {
          status: options.emailStatus ?? 202,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected test request: ${url}`);
    },
  });
  return { handler, requests };
}

function makeRequest(action: "enquiry" | "career_application") {
  const body = action === "enquiry"
    ? {
      action,
      fullName: "Test Buyer",
      email: "buyer@example.test",
      phone: "+1 555 0100",
      company: "Example Lab",
      office: "india",
      subject: "rfq",
      message: "Please provide a quotation for a test component.",
    }
    : {
      action,
      fullName: "Test Candidate",
      email: "candidate@example.test",
      position: "RF Engineer",
      message: "This is a valid test application message.",
    };

  return new Request("https://project.supabase.co/functions/v1/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://iconelectromatic.com",
      "CF-Connecting-IP": "203.0.113.10",
    },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>;
}

Deno.test("enquiry persistence HTTP failure never reports a saved success or sends email", async () => {
  const { handler, requests } = createHarness({ insertStatus: 503 });
  const response = await handler(makeRequest("enquiry"));
  const result = await readJson(response);

  if (response.status !== 503) throw new Error(`expected 503, got ${response.status}`);
  if (result.saved_to_db === true || result.ticket_id) throw new Error("failed insert must not claim a saved enquiry");
  if (requests.filter((request) => request.url.endsWith("/rest/v1/enquiries")).length !== 1) {
    throw new Error("failed enquiry must make exactly one insert request");
  }
  if (requests.some((request) => request.url === "https://api.resend.com/emails")) {
    throw new Error("email must not be sent before persistence is confirmed");
  }
});

Deno.test("enquiry insert without a returned row ID fails closed", async () => {
  const { handler, requests } = createHarness({ insertBody: [] });
  const response = await handler(makeRequest("enquiry"));
  const result = await readJson(response);

  if (response.status !== 503) throw new Error(`expected 503, got ${response.status}`);
  if (result.saved_to_db === true || result.ticket_id) throw new Error("missing row ID must not be reported as saved");
  if (requests.filter((request) => request.url.endsWith("/rest/v1/enquiries")).length !== 1) {
    throw new Error("enquiry persistence should be attempted once");
  }
});

Deno.test("persisted enquiry remains truthful when the email provider returns an error", async () => {
  const { handler, requests } = createHarness({ emailStatus: 503 });
  const response = await handler(makeRequest("enquiry"));
  const result = await readJson(response);

  if (response.status !== 200 || result.saved_to_db !== true || result.email_dispatched !== false) {
    throw new Error(`unexpected persisted-enquiry response: ${JSON.stringify(result)}`);
  }
  if (result.ticket_id !== "enquiry-db-id") throw new Error("response must use the persisted enquiry ID");
  if (requests.filter((request) => request.url.endsWith("/rest/v1/enquiries")).length !== 1) {
    throw new Error("successful enquiry must be inserted exactly once");
  }
  if (requests.filter((request) => request.url === "https://api.resend.com/emails").length !== 1) {
    throw new Error("email provider should be called once after persistence");
  }
});

Deno.test("persisted enquiry remains truthful when email transport throws", async () => {
  const { handler, requests } = createHarness({ rejectEmail: true });
  const response = await handler(makeRequest("enquiry"));
  const result = await readJson(response);

  if (response.status !== 200 || result.saved_to_db !== true || result.email_dispatched !== false) {
    throw new Error(`unexpected persisted-enquiry response: ${JSON.stringify(result)}`);
  }
  if (requests.filter((request) => request.url.endsWith("/rest/v1/enquiries")).length !== 1) {
    throw new Error("enquiry must be inserted exactly once despite email failure");
  }
});

Deno.test("career persistence HTTP failure returns no application reference and sends no email", async () => {
  const { handler, requests } = createHarness({ insertStatus: 503 });
  const response = await handler(makeRequest("career_application"));
  const result = await readJson(response);

  if (response.status !== 503 || result.application_ref) {
    throw new Error(`failed career insert must not return a reference: ${JSON.stringify(result)}`);
  }
  if (requests.filter((request) => request.url.endsWith("/rest/v1/career_applications")).length !== 1) {
    throw new Error("failed career application must make exactly one insert request");
  }
  if (requests.some((request) => request.url === "https://api.resend.com/emails")) {
    throw new Error("career notification must not be sent before persistence is confirmed");
  }
});

Deno.test("career insert without a persisted ID and reference fails closed", async () => {
  const { handler, requests } = createHarness({ insertBody: [{ id: "career-db-id" }] });
  const response = await handler(makeRequest("career_application"));
  const result = await readJson(response);

  if (response.status !== 503 || result.application_ref) {
    throw new Error(`unverified career insert must not return a reference: ${JSON.stringify(result)}`);
  }
  if (requests.some((request) => request.url === "https://api.resend.com/emails")) {
    throw new Error("career email must not be sent when the insert response lacks its persisted reference");
  }
});

Deno.test("persisted career application retains its reference when the email provider fails", async () => {
  const { handler, requests } = createHarness({ emailStatus: 503 });
  const response = await handler(makeRequest("career_application"));
  const result = await readJson(response);

  if (response.status !== 200 || result.saved_to_db !== true || result.email_dispatched !== false) {
    throw new Error(`unexpected persisted-career response: ${JSON.stringify(result)}`);
  }
  if (result.application_ref !== "ICON-CAREER-persisted-ref") {
    throw new Error("career response must use the persisted application reference");
  }
  if (requests.filter((request) => request.url.endsWith("/rest/v1/career_applications")).length !== 1) {
    throw new Error("career application must be inserted exactly once");
  }
});

Deno.test("persisted career application remains truthful when email transport throws", async () => {
  const { handler, requests } = createHarness({ rejectEmail: true });
  const response = await handler(makeRequest("career_application"));
  const result = await readJson(response);

  if (response.status !== 200 || result.saved_to_db !== true || result.email_dispatched !== false) {
    throw new Error(`unexpected persisted-career response: ${JSON.stringify(result)}`);
  }
  if (result.application_ref !== "ICON-CAREER-persisted-ref") {
    throw new Error("career response must preserve the persisted application reference");
  }
  if (requests.filter((request) => request.url.endsWith("/rest/v1/career_applications")).length !== 1) {
    throw new Error("career application must be inserted exactly once despite email failure");
  }
});
