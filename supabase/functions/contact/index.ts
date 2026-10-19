/**
 * Supabase Edge Function: contact
 * Host-independent contact form & RFQ submission handler.
 * Features:
 * - Server-side validation
 * - Honeypot spam trap (_honey)
 * - Anti-bot timestamp check (_rendered_at)
 * - Database-backed IP rate limiting (rate_limits table, max 5/hr)
 * - Database persistence (enquiries table)
 * - Multi-office regional email routing via Resend API (India, Singapore, USA)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Regional office email routing map
const OFFICE_ROUTING: Record<string, string> = {
  india: Deno.env.get("OFFICE_EMAIL_INDIA") || "sales.india@iconelectromatic.com",
  singapore: Deno.env.get("OFFICE_EMAIL_SINGAPORE") || "sales.apac@iconelectromatic.com",
  usa: Deno.env.get("OFFICE_EMAIL_USA") || "sales.usa@iconelectromatic.com",
};

serve(async (req: Request) => {
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
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 2. Anti-Spam: Honeypot check (_honey must be empty)
    if (body._honey && String(body._honey).trim().length > 0) {
      // Silently return success to waste bot resources without sending email
      return new Response(
        JSON.stringify({
          success: true,
          message: "Enquiry submitted successfully.",
          ticket_id: "REQ-" + Math.floor(100000 + Math.random() * 900000),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Anti-Spam: Bot submission speed check (must take >= 2.5 seconds to fill out)
    const renderedAt = Number(body._rendered_at) || 0;
    const now = Date.now();
    if (renderedAt > 0 && now - renderedAt < 2500) {
      return new Response(
        JSON.stringify({ error: "Submission was too fast. Please take your time to complete the form." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Server-Side Input Validation
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

    // 5. Connect to Supabase Database via PostgREST
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let savedToDb = false;
    let enquiryId: string | number = "REQ-" + Math.floor(100000 + Math.random() * 900000);

    if (supabaseUrl && supabaseServiceKey) {
      // Check database rate limit (max 5 per hour per IP)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const rateLimitCheckUrl = `${supabaseUrl}/rest/v1/rate_limits?ip_address=eq.${encodeURIComponent(
        clientIp
      )}&action=eq.contact_submission&created_at=gte.${encodeURIComponent(oneHourAgo)}&select=id`;

      const rateRes = await fetch(rateLimitCheckUrl, {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      });

      if (rateRes.ok) {
        const attempts = await rateRes.json();
        if (attempts && attempts.length >= 5) {
          return new Response(
            JSON.stringify({
              error: "Rate limit reached. Maximum 5 inquiries allowed per hour. Please try again later or call our office.",
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Record rate limit attempt
      await fetch(`${supabaseUrl}/rest/v1/rate_limits`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          ip_address: clientIp,
          action: "contact_submission",
        }),
      }).catch(() => {});

      // Insert into enquiries table
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
          email,
          phone: phone || null,
          company: company || null,
          office,
          subject,
          product_model: productModel || null,
          message,
          ip_address: clientIp,
          status: "new",
        }),
      });

      if (insertRes.ok) {
        const inserted = await insertRes.json();
        if (inserted && inserted[0] && inserted[0].id) {
          enquiryId = inserted[0].id;
          savedToDb = true;
        }
      }
    }

    // 6. Regional Office Routing & Resend Email Dispatch
    const targetOfficeEmail = OFFICE_ROUTING[office] || OFFICE_ROUTING.india;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    let emailSent = false;
    let emailMessage = "";

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

      const resendRes = await fetch("https://api.resend.com/emails", {
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
      });

      if (resendRes.ok) {
        emailSent = true;
      } else {
        const resendErr = await resendRes.text();
        emailMessage = `Resend response: ${resendErr}`;
      }
    } else {
      emailMessage = "RESEND_API_KEY is not configured in Supabase secrets (Simulation mode).";
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket_id: enquiryId,
        office_routed: office,
        target_email: targetOfficeEmail,
        saved_to_db: savedToDb,
        email_dispatched: emailSent,
        debug_note: emailMessage || undefined,
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
