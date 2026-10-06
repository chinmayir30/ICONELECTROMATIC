/**
 * Services Page — ICON ELECTROMATIC
 * High-End Dark Relay-styled layout matching the authentic Icon Electromatic services
 * Source: https://iconelectromatic2.lbimedia.in/services/
 */

export function renderServicesPage() {
  return `
    <div class="page-content services-page" style="padding-top:calc(var(--header-height) + 24px);padding-bottom:var(--space-24);background:var(--bg-dark);min-height:100vh;">
      <div class="container">
        
        <!-- Breadcrumb -->
        <nav class="breadcrumb-dark">
          <a data-route="/">Home</a>
          <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
          <span style="color:var(--text-white);font-weight:600;">Services</span>
        </nav>

        <!-- Unified Page Header -->
        <div class="page-header-unified">
          <div class="page-eyebrow-pill">
            <span class="hub-dot-pulse"></span>
            <span>CAPABILITIES &amp; SERVICES</span>
          </div>
          <h1 class="page-title-unified">
            Engineering Services &amp; Global Representation
          </h1>
          <p class="page-lead-unified">
            We represent major RF, Microwave, mmWave, Semiconductors, Components, Subsystems and Power supplies manufacturers around the world, providing unparalleled support to electronic designers, manufacturers, engineers and researchers.
          </p>
        </div>

        <!-- Trust Badges Strip -->
        <div class="services-trust-strip" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:var(--space-16);padding-bottom:var(--space-8);border-bottom:1px solid var(--border-subtle);">
          <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#93C5FD;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-handshake-angle" style="color:var(--logo-blue-light);"></i>
            <span>Tier-1 Global Manufacturers Representation</span>
          </div>
          <div style="background:rgba(225,29,72,0.08);border:1px solid rgba(225,29,72,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#FDA4AF;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-landmark" style="color:var(--logo-red-light);"></i>
            <span>Indian Govt Tender Portals (GeM & CPPP)</span>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#E2E8F0;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-coins" style="color:#F59E0B;"></i>
            <span>Global Multi-Currency Supply Logistics</span>
          </div>
          <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#6EE7B7;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-certificate" style="color:#10B981;"></i>
            <span>ISO 9001:2015 Quality Verified</span>
          </div>
        </div>

        <!-- 4 Core Services Pillars -->
        <div style="display:flex;flex-direction:column;gap:var(--space-16);margin-bottom:0;">
          
          <!-- Service 1: Representation of Global Leaders -->
          <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.28);border-radius:20px;margin-bottom:12px;">
                <i class="fa-solid fa-globe" style="color:var(--logo-blue-light);font-size:0.75rem;"></i>
                <span style="font-family:var(--font-display);font-size:0.72rem;font-weight:700;color:var(--logo-blue-light);text-transform:uppercase;letter-spacing:0.08em;">Global Distribution & Sourcing</span>
              </div>
              
              <h2 style="font-size:clamp(1.7rem, 2.8vw, 2.2rem);font-weight:800;color:var(--text-white);letter-spacing:-0.02em;margin-bottom:14px;line-height:1.25;">
                Representation of Global Leaders
              </h2>
              
              <p style="font-size:1rem;color:var(--text-gray-300);line-height:1.75;margin-bottom:20px;">
                We represent major RF and Microwave components, mmWave, Semiconductors, Components, Subsystems and Power supplies manufacturers around the world, providing unparalleled support to electronic designers, manufacturers, engineers and researchers.
              </p>

              <!-- Capability tags -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                <div style="background:#080D1A;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;">
                  <i class="fa-solid fa-check" style="color:var(--logo-blue-light);font-size:0.85rem;"></i>
                  <span style="font-size:0.85rem;color:#E2E8F0;font-weight:500;">Direct OEM Warranty</span>
                </div>
                <div style="background:#080D1A;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;">
                  <i class="fa-solid fa-check" style="color:var(--logo-blue-light);font-size:0.85rem;"></i>
                  <span style="font-size:0.85rem;color:#E2E8F0;font-weight:500;">Mil-Spec Screened</span>
                </div>
                <div style="background:#080D1A;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;">
                  <i class="fa-solid fa-check" style="color:var(--logo-blue-light);font-size:0.85rem;"></i>
                  <span style="font-size:0.85rem;color:#E2E8F0;font-weight:500;">Bengaluru Stock Hub</span>
                </div>
                <div style="background:#080D1A;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;">
                  <i class="fa-solid fa-check" style="color:var(--logo-blue-light);font-size:0.85rem;"></i>
                  <span style="font-size:0.85rem;color:#E2E8F0;font-weight:500;">Traceable CoCs</span>
                </div>
              </div>

              <a class="btn-relay-blue" data-route="/products">
                Explore Represented Products <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#030712;aspect-ratio:4/3;box-shadow:0 20px 40px -15px rgba(0,0,0,0.8);">
              <img src="/images/hero-amplifier.jpg" alt="RF Component Representation" style="width:100%;height:100%;object-fit:cover;" />
            </div>
          </div>

          <!-- Service 2: Product Supply and Logistics -->
          <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div style="order:1;" class="service-img-col">
              <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#030712;aspect-ratio:4/3;box-shadow:0 20px 40px -15px rgba(0,0,0,0.8);">
                <img src="/images/defense-satcom.jpg" alt="Product Supply and Logistics" style="width:100%;height:100%;object-fit:cover;" />
              </div>
            </div>

            <div style="order:2;" class="service-text-col">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(225,29,72,0.12);border:1px solid rgba(225,29,72,0.28);border-radius:20px;margin-bottom:12px;">
                <i class="fa-solid fa-truck-fast" style="color:var(--logo-red-light);font-size:0.75rem;"></i>
                <span style="font-family:var(--font-display);font-size:0.72rem;font-weight:700;color:var(--logo-red-light);text-transform:uppercase;letter-spacing:0.08em;">Supply Chain & Logistics</span>
              </div>
              
              <h2 style="font-size:clamp(1.7rem, 2.8vw, 2.2rem);font-weight:800;color:var(--text-white);letter-spacing:-0.02em;margin-bottom:14px;line-height:1.25;">
                Product Supply and Logistics
              </h2>
              
              <p style="font-size:1rem;color:var(--text-gray-300);line-height:1.75;margin-bottom:14px;">
                We offer end-to-end product supply and logistics support across global shipping locations and multiple currencies, with strong expertise in import and export operations. Our team is experienced across Indian Government tender portals, enabling seamless engagement in public-sector and strategic procurement.
              </p>
              
              <p style="font-size:0.95rem;color:var(--text-gray-400);line-height:1.7;margin-bottom:20px;">
                Supported by resources across geographies, we provide technical demonstrations, component selection, stack-up design verification, and application support throughout the design lifecycle. We also assist in fabrication and assembly consultations, helping reduce BOM cost, lead time, and overall procurement complexity.
              </p>

              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;color:#CBD5E1;background:#080D1A;border:1px solid rgba(255,255,255,0.07);padding:6px 12px;border-radius:6px;">
                  <i class="fa-solid fa-circle-check" style="color:var(--success);"></i> GeM & CPPP Portal Bidding
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;color:#CBD5E1;background:#080D1A;border:1px solid rgba(255,255,255,0.07);padding:6px 12px;border-radius:6px;">
                  <i class="fa-solid fa-circle-check" style="color:var(--success);"></i> Customs & Duty Optimization
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;color:#CBD5E1;background:#080D1A;border:1px solid rgba(255,255,255,0.07);padding:6px 12px;border-radius:6px;">
                  <i class="fa-solid fa-circle-check" style="color:var(--success);"></i> Multi-Currency Billing
                </span>
              </div>
            </div>
          </div>

          <!-- Service 3: Design Services -->
          <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.28);border-radius:20px;margin-bottom:12px;">
                <i class="fa-solid fa-compass-drafting" style="color:var(--logo-blue-light);font-size:0.75rem;"></i>
                <span style="font-family:var(--font-display);font-size:0.72rem;font-weight:700;color:var(--logo-blue-light);text-transform:uppercase;letter-spacing:0.08em;">RF Engineering & Advisory</span>
              </div>
              
              <h2 style="font-size:clamp(1.7rem, 2.8vw, 2.2rem);font-weight:800;color:var(--text-white);letter-spacing:-0.02em;margin-bottom:14px;line-height:1.25;">
                Design Services
              </h2>
              
              <p style="font-size:1rem;color:var(--text-gray-300);line-height:1.75;margin-bottom:20px;">
                In order to help compliment our partners, we at Icon provide design services for designers and engineers looking for information and advice on our products. With our team available on call, we ensure that designers and engineers get all the information they need, when they need it.
              </p>

              <!-- Design Services Features -->
              <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <div style="width:28px;height:28px;border-radius:6px;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;margin-top:2px;">
                    <i class="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <h4 style="font-size:0.95rem;font-weight:700;color:#FFFFFF;margin-bottom:2px;">On-Call Senior RF Engineers</h4>
                    <p style="font-size:0.85rem;color:var(--text-gray-400);line-height:1.5;margin:0;">Instant access to component specialists for quick troubleshooting, frequency matching, and pin-compatible alternates.</p>
                  </div>
                </div>

                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <div style="width:28px;height:28px;border-radius:6px;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;margin-top:2px;">
                    <i class="fa-solid fa-microchip"></i>
                  </div>
                  <div>
                    <h4 style="font-size:0.95rem;font-weight:700;color:#FFFFFF;margin-bottom:2px;">Stack-Up & S-Parameter Verification</h4>
                    <p style="font-size:0.85rem;color:var(--text-gray-400);line-height:1.5;margin:0;">Rigorous simulation data verification, substrate material recommendations, and impedance modeling.</p>
                  </div>
                </div>
              </div>

              <a class="btn-relay-border" data-route="/contact">
                Schedule Engineering Consultation &rarr;
              </a>
            </div>

            <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#030712;aspect-ratio:4/3;box-shadow:0 20px 40px -15px rgba(0,0,0,0.8);">
              <img src="/images/rf-filter.webp" alt="RF Design Services" style="width:100%;height:100%;object-fit:cover;" />
            </div>
          </div>

          <!-- Service 4: Business Consultancy -->
          <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div style="order:1;" class="service-img-col">
              <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#030712;aspect-ratio:4/3;box-shadow:0 20px 40px -15px rgba(0,0,0,0.8);">
                <img src="/images/rf-switch.jpg" alt="Business Consultancy" style="width:100%;height:100%;object-fit:cover;" />
              </div>
            </div>

            <div style="order:2;" class="service-text-col">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(225,29,72,0.12);border:1px solid rgba(225,29,72,0.28);border-radius:20px;margin-bottom:12px;">
                <i class="fa-solid fa-briefcase" style="color:var(--logo-red-light);font-size:0.75rem;"></i>
                <span style="font-family:var(--font-display);font-size:0.72rem;font-weight:700;color:var(--logo-red-light);text-transform:uppercase;letter-spacing:0.08em;">Strategic Partnerships</span>
              </div>
              
              <h2 style="font-size:clamp(1.7rem, 2.8vw, 2.2rem);font-weight:800;color:var(--text-white);letter-spacing:-0.02em;margin-bottom:14px;line-height:1.25;">
                Business Consultancy
              </h2>
              
              <p style="font-size:1rem;color:var(--text-gray-300);line-height:1.75;margin-bottom:20px;">
                Our leadership collectively carries decades of professional expertise across various business domains. We further diversify this strength through meaningful partnerships with global leaders. We help organisations with Digital Transformation, next-generation Business Process Outsourcing, Make in India initiatives, and many more.
              </p>

              <!-- Strategic Focus Grid -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                <div style="background:#080D1A;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px;">
                  <h5 style="font-size:0.875rem;font-weight:700;color:#FFFFFF;margin-bottom:4px;">Make in India</h5>
                  <p style="font-size:0.78rem;color:var(--text-gray-400);margin:0;">Strategic guidance on indigenous defense and aerospace electronics offset fulfillment.</p>
                </div>
                <div style="background:#080D1A;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px;">
                  <h5 style="font-size:0.875rem;font-weight:700;color:#FFFFFF;margin-bottom:4px;">Supply Chain Digitalization</h5>
                  <p style="font-size:0.78rem;color:var(--text-gray-400);margin:0;">End-to-end modernization of electronic components procurement workflows.</p>
                </div>
              </div>

              <a class="btn-relay-dark" data-route="/contact">
                Initiate Business Discussion &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function initServicesPage() {}
