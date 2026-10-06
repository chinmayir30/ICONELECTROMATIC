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
            <span>Indian Govt Tender Portals (GeM &amp; CPPP)</span>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#E2E8F0;display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-coins" style="color:#F59E0B;"></i>
            <span>Global Multi-Currency Supply Logistics</span>
          </div>
        </div>

        <!-- 4 Core Services Pillars -->
        <div style="display:flex;flex-direction:column;gap:var(--space-16);margin-bottom:0;">
          
          <!-- Service 1: Global Distribution & Sourcing -->
          <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div>
              <div class="service-badge-pill service-badge-blue">
                <i class="fa-solid fa-globe"></i>
                <span>Tier-1 Global Representation</span>
              </div>
              
              <h2 class="service-primary-title">
                Global Distribution &amp; Sourcing
              </h2>
              
              <h3 class="service-secondary-title blue-accent">
                Representation of Global Leaders
              </h3>
              
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

              <a class="btn-relay-red" data-route="/products">
                Explore Represented Products <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            <!-- Auto-Changing Media Showcase (Card 1) -->
            <div class="service-media-showcase" data-service-index="0">
              <div class="service-slides-wrapper">
                <div class="service-slide active" data-index="0">
                  <img src="/images/hero-amplifier.jpg" alt="RF Component Representation — Microwave Amplifier" />
                </div>
                <div class="service-slide" data-index="1">
                  <img src="/images/gan-power-chip.jpg" alt="Active Antenna GaN MMIC Semiconductor" />
                </div>
                <div class="service-slide" data-index="2">
                  <img src="/images/rf-attenuator.jpg" alt="Precision RF Attenuator Module" />
                </div>
                <div class="service-slide" data-index="3">
                  <img src="/images/rf-mixer.jpg" alt="Microwave Frequency Mixer Subsystem" />
                </div>
              </div>
              <div class="service-slide-indicators">
                <button class="service-slide-dot active" data-slide="0" aria-label="Slide 1"></button>
                <button class="service-slide-dot" data-slide="1" aria-label="Slide 2"></button>
                <button class="service-slide-dot" data-slide="2" aria-label="Slide 3"></button>
                <button class="service-slide-dot" data-slide="3" aria-label="Slide 4"></button>
              </div>
            </div>
          </div>

          <!-- Service 2: Supply Chain & Logistics -->
          <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div style="order:1;" class="service-img-col">
              <!-- Auto-Changing Media Showcase (Card 2) -->
              <div class="service-media-showcase" data-service-index="1">
                <div class="service-slides-wrapper">
                  <div class="service-slide active" data-index="0">
                    <img src="/images/defense-satcom.jpg" alt="Product Supply and Logistics — Aerospace &amp; Defense SATCOM" />
                  </div>
                  <div class="service-slide" data-index="1">
                    <img src="/images/rf-waveguide.jpg" alt="Waveguide Assemblies &amp; Hardware Logistics" />
                  </div>
                  <div class="service-slide" data-index="2">
                    <img src="/images/rf-microwave-pcb.jpg" alt="High-Frequency Space-Grade PCB Supply" />
                  </div>
                  <div class="service-slide" data-index="3">
                    <img src="/images/dielectric-3d-lens.jpg" alt="Specialized Dielectric Component Logistics" />
                  </div>
                </div>
                <div class="service-slide-indicators">
                  <button class="service-slide-dot active" data-slide="0" aria-label="Slide 1"></button>
                  <button class="service-slide-dot" data-slide="1" aria-label="Slide 2"></button>
                  <button class="service-slide-dot" data-slide="2" aria-label="Slide 3"></button>
                  <button class="service-slide-dot" data-slide="3" aria-label="Slide 4"></button>
                </div>
              </div>
            </div>

            <div style="order:2;" class="service-text-col">
              <div class="service-badge-pill service-badge-red">
                <i class="fa-solid fa-truck-fast"></i>
                <span>End-to-End Fulfillment</span>
              </div>
              
              <h2 class="service-primary-title">
                Supply Chain &amp; Logistics
              </h2>
              
              <h3 class="service-secondary-title red-accent">
                Product Supply and Logistics
              </h3>
              
              <p style="font-size:1rem;color:var(--text-gray-300);line-height:1.75;margin-bottom:14px;">
                We offer end-to-end product supply and logistics support across global shipping locations and multiple currencies, with strong expertise in import and export operations. Our team is experienced across Indian Government tender portals, enabling seamless engagement in public-sector and strategic procurement.
              </p>
              
              <p style="font-size:0.95rem;color:var(--text-gray-400);line-height:1.7;margin-bottom:20px;">
                Supported by resources across geographies, we provide technical demonstrations, component selection, stack-up design verification, and application support throughout the design lifecycle. We also assist in fabrication and assembly consultations, helping reduce BOM cost, lead time, and overall procurement complexity.
              </p>

              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;color:#CBD5E1;background:#080D1A;border:1px solid rgba(255,255,255,0.07);padding:6px 12px;border-radius:6px;">
                  <i class="fa-solid fa-circle-check" style="color:var(--success);"></i> GeM &amp; CPPP Portal Bidding
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;color:#CBD5E1;background:#080D1A;border:1px solid rgba(255,255,255,0.07);padding:6px 12px;border-radius:6px;">
                  <i class="fa-solid fa-circle-check" style="color:var(--success);"></i> Customs &amp; Duty Optimization
                </span>
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;color:#CBD5E1;background:#080D1A;border:1px solid rgba(255,255,255,0.07);padding:6px 12px;border-radius:6px;">
                  <i class="fa-solid fa-circle-check" style="color:var(--success);"></i> Multi-Currency Billing
                </span>
              </div>
            </div>
          </div>

          <!-- Service 3: RF Engineering & Advisory -->
          <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div>
              <div class="service-badge-pill service-badge-blue">
                <i class="fa-solid fa-compass-drafting"></i>
                <span>Technical Simulation &amp; Advisory</span>
              </div>
              
              <h2 class="service-primary-title">
                RF Engineering &amp; Advisory
              </h2>
              
              <h3 class="service-secondary-title blue-accent">
                Design Services
              </h3>
              
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
                    <h4 style="font-size:0.95rem;font-weight:700;color:#FFFFFF;margin-bottom:2px;">Stack-Up &amp; S-Parameter Verification</h4>
                    <p style="font-size:0.85rem;color:var(--text-gray-400);line-height:1.5;margin:0;">Rigorous simulation data verification, substrate material recommendations, and impedance modeling.</p>
                  </div>
                </div>
              </div>

              <a class="btn-relay-border" data-route="/contact">
                Schedule Engineering Consultation &rarr;
              </a>
            </div>

            <!-- Auto-Changing Media Showcase (Card 3) -->
            <div class="service-media-showcase" data-service-index="2">
              <div class="service-slides-wrapper">
                <div class="service-slide active" data-index="0">
                  <img src="/images/rf-filter.webp" alt="RF Design Services — Tunable Cavity Filter" />
                </div>
                <div class="service-slide" data-index="1">
                  <img src="/images/rf-laminate.jpg" alt="High-Frequency Substrate Simulation &amp; Stack-Up" />
                </div>
                <div class="service-slide" data-index="2">
                  <img src="/images/rf-filter.jpg" alt="Custom Microwave Filter Design &amp; Testing" />
                </div>
                <div class="service-slide" data-index="3">
                  <img src="/images/rf-switch.jpg" alt="Solid-State RF Switch Prototype" />
                </div>
              </div>
              <div class="service-slide-indicators">
                <button class="service-slide-dot active" data-slide="0" aria-label="Slide 1"></button>
                <button class="service-slide-dot" data-slide="1" aria-label="Slide 2"></button>
                <button class="service-slide-dot" data-slide="2" aria-label="Slide 3"></button>
                <button class="service-slide-dot" data-slide="3" aria-label="Slide 4"></button>
              </div>
            </div>
          </div>

          <!-- Service 4: Strategic Partnerships -->
          <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:var(--space-12);align-items:center;" class="service-row-block">
            <div style="order:1;" class="service-img-col">
              <!-- Auto-Changing Media Showcase (Card 4) -->
              <div class="service-media-showcase" data-service-index="3">
                <div class="service-slides-wrapper">
                  <div class="service-slide active" data-index="0">
                    <img src="/images/rf-switch.jpg" alt="Strategic Partnership Consultancy &amp; Hi-Rel Technology" />
                  </div>
                  <div class="service-slide" data-index="1">
                    <img src="/images/rf-microwave-pcb.jpg" alt="Make in India Manufacturing Support &amp; Local FAB" />
                  </div>
                  <div class="service-slide" data-index="2">
                    <img src="/images/defense-satcom.jpg" alt="Aerospace Program Consultancy" />
                  </div>
                  <div class="service-slide" data-index="3">
                    <img src="/images/gan-power-chip.jpg" alt="Semiconductor Industry Modernization &amp; BPO" />
                  </div>
                </div>
                <div class="service-slide-indicators">
                  <button class="service-slide-dot active" data-slide="0" aria-label="Slide 1"></button>
                  <button class="service-slide-dot" data-slide="1" aria-label="Slide 2"></button>
                  <button class="service-slide-dot" data-slide="2" aria-label="Slide 3"></button>
                  <button class="service-slide-dot" data-slide="3" aria-label="Slide 4"></button>
                </div>
              </div>
            </div>

            <div style="order:2;" class="service-text-col">
              <div class="service-badge-pill service-badge-red">
                <i class="fa-solid fa-briefcase"></i>
                <span>Enterprise Growth &amp; Advisory</span>
              </div>
              
              <h2 class="service-primary-title">
                Strategic Partnerships
              </h2>
              
              <h3 class="service-secondary-title red-accent">
                Business Consultancy
              </h3>
              
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

              <a class="btn-relay-red" data-route="/contact">
                Initiate Business Discussion <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function initServicesPage() {
  const showcases = document.querySelectorAll('.service-media-showcase');
  if (!showcases.length) return;

  showcases.forEach(showcase => {
    const slides = showcase.querySelectorAll('.service-slide');
    const dots = showcase.querySelectorAll('.service-slide-dot');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let timer = null;
    let isHovered = false;

    function goToSlide(targetIdx) {
      if (slides[currentIndex]) slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (targetIdx + slides.length) % slides.length;

      if (slides[currentIndex]) slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(() => {
        if (!isHovered) {
          goToSlide(currentIndex + 1);
        }
      }, 3500);
    }

    function stopAutoPlay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // Dot click interaction
    dots.forEach((dot, dotIdx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(dotIdx);
        startAutoPlay();
      });
    });

    // Pause on hover
    showcase.addEventListener('mouseenter', () => { isHovered = true; });
    showcase.addEventListener('mouseleave', () => { isHovered = false; });

    startAutoPlay();
  });
}
