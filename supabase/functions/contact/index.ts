/**
 * Supabase Edge Function: contact
 * Host-independent contact form, RFQ submission & career applications handler.
 * Features:
 * - Server-side validation
 * - Honeypot spam trap (_honey)
 * - Anti-bot timestamp check (_rendered_at)
 * - Database-backed IP rate limiting (rate_limits table, max 5/hr)
 * - Database persistence (enquiries and career_applications tables)
 * - Multi-office regional email routing via Resend API (India, Singapore, USA)
 * - Career application routing to recruitment committee
 * - Strict CORS with automatic production & preview domain fallback
 * - Dual-field schema alignment for forward/backward database compatibility
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { consumeContactRateLimit, hashClientIp } from "./rateLimit.ts";

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const rawAllowed = Deno.env.get("ALLOWED_ORIGINS") || "";
  let allowed = rawAllowed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // If ALLOWED_ORIGINS is not set, provide verified default origins
  if (allowed.length === 0) {
    allowed = [
      "https://iconelectromatic.com",
      "https://www.iconelectromatic.com",
      "https://iconelectromatic.vercel.app",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://localhost:3000",
    ];
  }

  let allowOrigin = "";
  if (allowed.includes(origin) || (origin && origin.endsWith(".vercel.app"))) {
    allowOrigin = origin;
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (allowOrigin) {
    headers["Access-Control-Allow-Origin"] = allowOrigin;
  }

  return headers;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // 2. Anti-Spam: Honeypot check (_honey must be empty)
    if (body._honey && String(body._honey).trim().length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Submission received.",
          ticket_id: "REQ-" + Math.floor(100000 + Math.random() * 900000),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Anti-Spam: Bot submission speed check (must take >= 2 seconds to fill out)
    const renderedAt = Number(body._rendered_at) || 0;
    const now = Date.now();
    if (renderedAt > 0 && now - renderedAt < 2000) {
      return new Response(
        JSON.stringify({ error: "Submission was too fast. Please take your time to complete the form." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const action = String(body.action || "enquiry").trim().toLowerCase();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // ─── ROUTE A: CAREER APPLICATION ──────────────────────────────────────────
    if (action === "career_application" || action === "career") {
      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const position = String(body.position || "Engineering Position").trim();
      const message = String(body.message || "").trim();
      const resumeUrl = String(body.resumeUrl || "").trim();

      if (!fullName || fullName.length < 2 || fullName.length > 100) {
        return new Response(
          JSON.stringify({ error: "Full Name is required (2–100 characters)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: "A valid email address is required for recruitment correspondence." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const appRef = "ICON-CAREER-" + Math.floor(100000 + Math.random() * 900000);
      let savedToDb = false;

      if (supabaseUrl && supabaseServiceKey) {
        const insertAppRes = await fetch(`${supabaseUrl}/rest/v1/career_applications`, {
          method: "POST",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            application_ref: appRef,
            full_name: fullName,
            email,
            phone: phone || null,
            position,
            message: message || null,
            resume_url: resumeUrl || null,
            status: "new",
          }),
        }).catch(() => null);

        if (insertAppRes && insertAppRes.ok) {
          savedToDb = true;
        }
      }

      const careersEmail = Deno.env.get("CAREERS_EMAIL") || "careers@iconelectromatic.com";

      if (resendApiKey) {
        const careerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; color: #ffffff;">ICON ELECTROMATIC</h2>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.85rem;">New Engineering Career Application</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 20px;">
                <strong>Application Ref:</strong> #${appRef}<br/>
                <strong>Position Applied:</strong> ${position}
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 20px;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Candidate Name:</strong></td><td style="padding: 8px 0; color: #0f172a;">${fullName}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #0f172a;">${phone || "Not specified"}</td></tr>
                ${resumeUrl ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Resume Link:</strong></td><td style="padding: 8px 0; color: #2563eb;"><a href="${resumeUrl}" target="_blank">View Uploaded Resume</a></td></tr>` : ""}
              </table>
              <h4 style="margin: 0 0 8px 0; color: #0f172a;">Candidate Cover Note:</h4>
              <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; font-size: 0.9rem; line-height: 1.5; color: #334155; white-space: pre-wrap;">${message || "No cover note provided."}</div>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Icon Electromatic <notifications@iconelectromatic.com>",
            to: [careersEmail],
            reply_to: email,
            subject: `[Career Application] ${position}: ${fullName}`,
            html: careerEmailHtml,
          }),
        }).catch(() => {});
      }

      return new Response(
        JSON.stringify({
          success: true,
          application_ref: appRef,
          saved_to_db: savedToDb,
          message: "Application submitted successfully to Technical Evaluation Committee.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── ROUTE B: GENERAL CONTACT & RFQ ENQUIRIES ─────────────────────────────
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const company = String(body.company || "").trim();
    const office = String(body.office || "india").trim().toLowerCase();
    const subject = String(body.subject || "rfq").trim();
    const productModel = String(body.productModel || "").trim();
    const message = String(body.message || "").trim();

    if (!fullName || fullName.length < 2 || fullName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Full Name is required (2–100 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "A valid corporate or personal email address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || message.length < 10 || message.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Message is required (between 10 and 3,000 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let savedToDb = false;
    let enquiryId: string | number = "REQ-" + Math.floor(100000 + Math.random() * 900000);

    const officeEmails: Record<string, string | undefined> = {
      india: Deno.env.get("OFFICE_EMAIL_INDIA"),
      singapore: Deno.env.get("OFFICE_EMAIL_SINGAPORE"),
      usa: Deno.env.get("OFFICE_EMAIL_USA"),
    };
    const targetOfficeEmail = officeEmails[office] || "sales@iconelectromatic.com";

    // Rate limiting is mandatory: fail closed if server-side dependencies
    // or a client address supplied by the edge proxy are unavailable.
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Enquiry service is temporarily unavailable." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")?.trim()
      || req.headers.get("x-real-ip")?.trim();
    const hashSecret = Deno.env.get("RATE_LIMIT_HASH_SECRET");

    if (!clientIp || !hashSecret || new TextEncoder().encode(hashSecret).byteLength < 32) {
      console.error("Contact rate limiting is not configured with a trusted client IP and strong HMAC secret.");
      return new Response(JSON.stringify({ error: "Enquiry service is temporarily unavailable." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const ipHash = await hashClientIp(clientIp, hashSecret);
      const allowed = await consumeContactRateLimit(supabaseUrl, supabaseServiceKey, ipHash);
      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: "Rate limit reached. Maximum 5 inquiries allowed per hour. Please try again later or call our office.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (rateLimitError) {
      console.error("Contact rate-limit check failed:", rateLimitError);
      return new Response(JSON.stringify({ error: "Enquiry service is temporarily unavailable." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Insert into enquiries table with dual-field compatibility
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      full_name: fullName,
      name: fullName,
      email,
      phone: phone || null,
      company: company || null,
      office,
      destination_office: office,
      destination_email: targetOfficeEmail,
      subject,
      product_model: productModel || null,
      message,
      ip_address: clientIp,
      status: "received",
    }),
  }).catch(() => null);

  if (insertRes && insertRes.ok) {
    const inserted = await insertRes.json();
    if (inserted && inserted[0] && inserted[0].id) {
      enquiryId = inserted[0].id;
      savedToDb = true;
    }
  }

    // 3. Dispatch Email Notification via Resend (if configured)
    if (resendApiKey) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff;">ICON ELECTROMATIC</h2>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.85rem;">New Customer Technical & RFQ Enquiry</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin-bottom: 20px;">
              <strong>Ticket ID:</strong> #${enquiryId}<br/>
              <strong>Regional Desk:</strong> ${office.toUpperCase()} Office (${targetOfficeEmail})<br/>
              <strong>Subject Type:</strong> ${subject.toUpperCase()}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Client Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${phone || "Not specified"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Company / Lab:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${company || "Direct Individual"}</td>
              </tr>
              ${
                productModel
                  ? `<tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Target Hardware:</strong></td>
                <td style="padding: 8px 0; color: #2563eb; font-weight: bold;">${productModel}</td>
              </tr>`
                  : ""
              }
            </table>

            <h4 style="margin: 0 0 8px 0; color: #0f172a;">Technical Requirements & Message:</h4>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; font-size: 0.9rem; line-height: 1.5; color: #334155; white-space: pre-wrap;">${message}</div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; font-size: 0.75rem; color: #94a3b8; text-align: center;">
            Sent securely via Icon Electromatic Edge Service. IP: ${clientIp}
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Icon Electromatic <notifications@iconelectromatic.com>",
          to: [targetOfficeEmail],
          reply_to: email,
          subject: `[Icon Electromatic] ${subject.toUpperCase()} Enquiry: ${fullName} (${company || "Direct"})`,
          html: emailHtml,
        }),
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket_id: enquiryId,
        office_routed: office,
        target_email: targetOfficeEmail,
        saved_to_db: savedToDb,
        message: "Thank you! Your engineering enquiry has been dispatched to our regional applications desk.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Internal server error: ${errorMsg}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
