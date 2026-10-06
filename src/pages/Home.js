/**
 * Home Page — ICON ELECTROMATIC
 * Sleek Cinematic Dark Aesthetic directly modeled after the Relay Framer reference
 */
import { getPopularProducts } from '../data/catalogData.js';
import { renderProductCard } from '../components/ProductCard.js';

export function renderHomePage() {
  const popular = getPopularProducts();

  return `
    <!-- RELAY CINEMATIC HERO -->
    <section class="hero-relay">
      <!-- Background Video/Image -->
      <div class="hero-relay-bg">
        <video id="hero-bg-video" src="/icon-video.mp4" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"></video>
        <div class="hero-relay-vignette"></div>
      </div>

      <div class="container" style="position:relative;z-index:3;width:100%;">
        <div class="hero-relay-content">
          <div class="hero-eyebrow-tag" style="margin-bottom: var(--space-6);">
            <span class="hero-eyebrow-line" style="display:inline-block; width:24px; height:2px; background:var(--logo-red);"></span> 
            <span><span class="slash"></span> ICON ELECTROMATIC</span>
          </div>

          <h1 class="hero-title-giant" style="font-size: clamp(2.2rem, 4.5vw, 4.2rem);">
            ICON ELECTROMATIC turns 
            complex high-frequency requirements into <span class="accent-red" style="color: var(--logo-red);">mission-ready hardware.</span>
          </h1>

          <p class="hero-description-clean">
            Delivering precision RF, microwave, and electronic components for 
            defense, aerospace, SATCOM, and telecommunications.
          </p>

          <div class="hero-actions-row">
            <a class="btn-relay-red" data-route="/products">
              Explore Products <i class="fa-solid fa-arrow-right"></i>
            </a>
            <a class="btn-relay-dark" style="background:#ffffff; color:#000000;" data-route="/contact">
              Request a Quote
            </a>
          </div>

          <!-- Integrated Stats -->
          <div class="hero-inline-stats" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between; align-items: center; max-width: 900px; gap: 20px;">
            <div class="hero-stat-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
              <span class="hero-stat-number" style="color: var(--logo-red);">4,000<span class="hero-stat-suffix" style="color: var(--logo-red);">+</span></span>
              <span class="hero-stat-label" style="color: #cbd5e1;">PRODUCTS AVAILABLE</span>
            </div>
            
            <div class="hero-stat-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
              <span class="hero-stat-number" style="color: var(--logo-red);">24<span class="hero-stat-suffix" style="color: var(--logo-red);">+</span></span>
              <span class="hero-stat-label" style="color: #cbd5e1;">COMPONENT LINES</span>
            </div>

            <div class="hero-stat-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
              <span class="hero-stat-number" style="color: var(--logo-red);">86 <span class="hero-stat-suffix" style="color: var(--logo-red);">GHz</span></span>
              <span class="hero-stat-label" style="color: #cbd5e1;">MAX FREQUENCY</span>
            </div>

            <div class="hero-stat-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
              <span class="hero-stat-number" style="color: var(--logo-red);">100<span class="hero-stat-suffix" style="color: var(--logo-red);">%</span></span>
              <span class="hero-stat-label" style="color: #cbd5e1;">ROHS & ISO 9001</span>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- CORE CAPABILITIES (Relay Dark Minimal Cards) -->
    <section class="section-dark">
      <div class="container">
        <div class="section-head-minimal">
          <h2 class="section-tag-mono red-section-title" style="text-transform: uppercase; font-size: 2.75rem; font-weight: 800; letter-spacing: 0.05em; margin: 0; line-height: 1.2;">Core Capabilities</h2>
          <h3 class="section-h2" style="font-size: 2rem; font-weight: 600; line-height: 1.3; margin-top: 8px; margin-bottom: 16px;">Engineered for extreme performance.</h3>
          <p class="section-lead" style="font-size: 1.25rem; max-width: 800px; margin: 0;">
            From millimeter-wave defense radar to satellite ground infrastructure, we provide the verified hardware engineers depend on.
          </p>
        </div>

        <div class="capabilities-grid-dark">
          <div class="capability-card-dark">
            <div class="capability-icon-box"><i class="fa-solid fa-wave-square"></i></div>
            <h3>RF & Microwave Active</h3>
            <p>High-linearity power amplifiers, ultra-low noise LNAs, active frequency mixers, and voltage-controlled oscillators.</p>
            <a data-route="/products?category=amplifiers">Explore Amplifiers &rarr;</a>
          </div>

          <div class="capability-card-dark">
            <div class="capability-icon-box"><i class="fa-solid fa-filter"></i></div>
            <h3>Passive & Waveguides</h3>
            <p>High-Q cavity bandpass filters, low-loss waveguide transitions, directional couplers, and coaxial terminations.</p>
            <a data-route="/products?category=filters">Explore Filters &rarr;</a>
          </div>

          <div class="capability-card-dark">
            <div class="capability-icon-box"><i class="fa-solid fa-shield-halved"></i></div>
            <h3>Defense & Aerospace</h3>
            <p>Mil-Spec screening, extreme-temperature reliability, and radiation-tolerant solutions for tactical EW and SATCOM.</p>
            <a data-route="/about">Learn More &rarr;</a>
          </div>

          <div class="capability-card-dark">
            <div class="capability-icon-box"><i class="fa-solid fa-flask-vial"></i></div>
            <h3>Test & Measurement</h3>
            <p>Precision calibration adapters, armored low-loss RF test cables, and laboratory attenuator modules up to 86 GHz.</p>
            <a data-route="/products?category=test-solutions">Explore Solutions &rarr;</a>
          </div>
        </div>
      </div>
    </section>

    <!-- POPULAR PRODUCTS SECTION -->
    <section class="products-dark-section">
      <div class="container">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:var(--space-8);flex-wrap:wrap;gap:var(--space-4);">
          <div>
            <div class="popular-header" style="margin-bottom: 24px;">
              <h2 class="section-tag-mono red-section-title" style="text-transform: uppercase; font-size: 2.75rem; font-weight: 800; letter-spacing: 0.05em; margin: 0; line-height: 1.2;">Popular Products &amp; Components</h2>
            </div>
            <p class="section-lead" style="font-size: 1.25rem; max-width: 850px; color: #e2e8f0; margin: 0;">
              High-frequency laminates, precision GaN semiconductors, 3D metamaterial optics, and microwave modules from our global OEM partners.
            </p>
          </div>
          <div>
            <a class="btn-relay-dark" data-route="/products">
              Explore Full Catalog (15 OEMs) &rarr;
            </a>
          </div>
        </div>

        <!-- Filter Chips -->
        <div class="products-nav-bar" id="home-category-tabs" style="margin-bottom:var(--space-8);">
          <button class="filter-chip-dark active" data-filter="all">All Popular (${popular.length})</button>
          <button class="filter-chip-dark" data-filter="rogers">Rogers Laminates</button>
          <button class="filter-chip-dark" data-filter="qorvo">Qorvo GaN &amp; ICs</button>
          <button class="filter-chip-dark" data-filter="ohmega">Ohmega-Ticer</button>
          <button class="filter-chip-dark" data-filter="fortify">Fortify 3D Optics</button>
          <button class="filter-chip-dark" data-filter="components">Mini-Circuits &amp; RFuW</button>
          <button class="filter-chip-dark" data-filter="sensors">Sensors &amp; PCB</button>
        </div>

        <!-- Product Cards Grid -->
        <div class="products-grid-dark" id="home-products-grid">
          ${popular.map((p, i) => renderProductCard(p, i)).join('')}
        </div>
      </div>
    </section>


    <!-- INSIGHTS: Latest Blogs -->
    <section class="insights-dark-section">
      <div class="container">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:var(--space-10);flex-wrap:wrap;gap:var(--space-4);">
          <div>
            <h2 class="section-tag-mono red-section-title" style="text-transform: uppercase; font-size: 2.75rem; font-weight: 800; letter-spacing: 0.05em; margin: 0; line-height: 1.2;">Insights</h2>
            <h3 class="section-h2" style="font-size: 2rem; font-weight: 600; line-height: 1.3; margin-top: 8px; margin-bottom: 0;">Latest Blogs</h3>
            <p class="section-lead">
              Engineering articles, application notes, and microwave design breakthroughs from our technical team.
            </p>
          </div>
          <div>
            <a class="btn-relay-dark" data-route="/about">
              Explore Research & About Us &rarr;
            </a>
          </div>
        </div>

        <div class="insights-grid-dark">
          <!-- Blog Card 1 -->
          <article class="blog-card-relay" data-route="/products?category=amplifiers">
            <div class="blog-card-relay-img">
              <img src="/images/hero-amplifier.jpg" alt="GaN Amplifiers" loading="lazy" />
              <span class="blog-badge-tag">GaN Amplifiers</span>
              <span class="blog-read-time"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>5 min</span>
            </div>
            <div class="blog-card-relay-body">
              <div class="blog-date-meta">
                <i class="fa-regular fa-calendar"></i>
                <span>October 2026 · Technical Whitepaper</span>
              </div>
              <h3 class="blog-card-title">
                High-Efficiency GaN Solid-State Power Amplifiers in Next-Gen AESA Radar
              </h3>
              <p class="blog-card-excerpt">
                A technical analysis of thermal dissipation techniques, harmonic suppression, and pulse droop mitigation across multi-kilowatt phased array radar systems.
              </p>
              <div class="blog-card-footer">
                <div class="blog-author-info">
                  <div class="blog-author-avatar">VN</div>
                  <span class="blog-author-name">Dr. Vikram Nair</span>
                </div>
                <span class="blog-read-link">
                  Read Article &rarr;
                </span>
              </div>
            </div>
          </article>

          <!-- Blog Card 2 -->
          <article class="blog-card-relay" data-route="/products?category=filters">
            <div class="blog-card-relay-img">
              <img src="/images/rf-filter.webp" alt="Cavity Filters" loading="lazy" />
              <span class="blog-badge-tag">Cavity Filters</span>
              <span class="blog-read-time"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>4 min</span>
            </div>
            <div class="blog-card-relay-body">
              <div class="blog-date-meta">
                <i class="fa-regular fa-calendar"></i>
                <span>September 2026 · Design Guide</span>
              </div>
              <h3 class="blog-card-title">
                Mitigating Insertion Loss in Sub-40 GHz Waveguide & Cavity Bandpass Filters
              </h3>
              <p class="blog-card-excerpt">
                Practical strategies for maintaining high loaded Q-factors, thermal stability, and steep out-of-band rejection in aerospace satellite transponders.
              </p>
              <div class="blog-card-footer">
                <div class="blog-author-info">
                  <div class="blog-author-avatar" style="background:rgba(225,29,72,0.2);border-color:rgba(225,29,72,0.4);color:#FDA4AF;">SR</div>
                  <span class="blog-author-name">Siddharth Rao</span>
                </div>
                <span class="blog-read-link">
                  Read Article &rarr;
                </span>
              </div>
            </div>
          </article>

          <!-- Blog Card 3 -->
          <article class="blog-card-relay" data-route="/products?category=attenuators">
            <div class="blog-card-relay-img">
              <img src="/images/rf-switch.jpg" alt="Coaxial Components" loading="lazy" />
              <span class="blog-badge-tag">Test & Measurement</span>
              <span class="blog-read-time"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>6 min</span>
            </div>
            <div class="blog-card-relay-body">
              <div class="blog-date-meta">
                <i class="fa-regular fa-calendar"></i>
                <span>August 2026 · Industry Standards</span>
              </div>
              <h3 class="blog-card-title">
                Sub-THz Coaxial Transitions and Repeatability in Precision RF Test Benches
              </h3>
              <p class="blog-card-excerpt">
                Calibration best practices, VSWR measurement tolerances, and mechanical longevity when selecting precision gold SMA & 2.92mm terminations.
              </p>
              <div class="blog-card-footer">
                <div class="blog-author-info">
                  <div class="blog-author-avatar">PS</div>
                  <span class="blog-author-name">Priya Swaminathan</span>
                </div>
                <span class="blog-read-link">
                  Read Article &rarr;
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- RELAY CONTACT & FAST QUERY -->
    <section class="contact-relay-section">
      <div class="container">
        <div class="section-head-minimal">
          <h2 class="section-tag-mono red-section-title" style="text-transform: uppercase; font-size: 2.75rem; font-weight: 800; letter-spacing: 0.05em; margin: 0; line-height: 1.2;">Connect with Engineering</h2>
          <h3 class="section-h2" style="font-size: 2rem; font-weight: 600; line-height: 1.3; margin-top: 8px; margin-bottom: 16px;">Initiate an inquiry or request pricing.</h3>
          <p class="section-lead">
            Direct access to our senior RF applications team in Bengaluru. Fast turnarounds on quotations and custom requirements.
          </p>
        </div>

        <div class="contact-relay-grid">
          <div class="contact-relay-info">
            <div class="contact-relay-card">
              <h3>Direct Engineering Reach</h3>
              <p>
                Founded in 2009 in Bengaluru with expanded presence across Singapore, Israel, and the United States.
              </p>

              <div class="contact-meta-list">
                <div class="contact-meta-row">
                  <div class="contact-meta-icon"><i class="fa-solid fa-location-dot"></i></div>
                  <div class="contact-meta-text">
                    <h5>Registered Headquarters</h5>
                    <p>Bengaluru, Karnataka 560001, India</p>
                  </div>
                </div>

                <div class="contact-meta-row">
                  <div class="contact-meta-icon"><i class="fa-solid fa-phone"></i></div>
                  <div class="contact-meta-text">
                    <h5>Telephone</h5>
                    <p>+91 80 4123 4567 / +91 98450 12345</p>
                  </div>
                </div>

                <div class="contact-meta-row">
                  <div class="contact-meta-icon"><i class="fa-solid fa-envelope"></i></div>
                  <div class="contact-meta-text">
                    <h5>Official Communications</h5>
                    <p>sales@iconelectromatic.com · support@iconelectromatic.com</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Requirement Presets -->
            <div class="contact-relay-card">
              <h4 style="font-size:1.05rem;font-weight:700;color:var(--text-white);margin-bottom:var(--space-2);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-bolt" style="color:var(--logo-red);"></i> Quick Requirement Presets
              </h4>
              <p style="font-size:0.85rem;color:var(--text-gray-400);margin-bottom:var(--space-3);">Click any preset to prefill your inquiry message:</p>
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about High Frequency Laminates & Prepregs.">High Frequency Laminates</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Embedded Resistive Film.">Embedded Resistive Film</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about 3D Printed Dielectric Parts.">3D Printed Dielectrics</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about High Power GaN Device and Beamforming IC.">GaN & Beamforming IC</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about High Power Switches and Limiter.">High Power Switches</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about RF and MW Components.">RF & MW Components</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Tunable Filters.">Tunable Filters</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Software Defined Radios.">Software Defined Radios</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about high voltage power supplies.">HV Power Supplies</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Temperature Sensors.">Temperature Sensors</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Thin Film Capacitors.">Thin Film Capacitors</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Ceramic Capacitors.">Ceramic Capacitors</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about PCB Fabrication.">PCB Fabrication</button>
                <button class="filter-chip-dark quick-preset" data-preset="Inquiring about Perimeter Intrusion Detection System (PIDS).">PIDS</button>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-relay-form">
            <h3>Send Us a Message</h3>
            <p class="subtitle">Complete the form below. Technical responses provided within 24 hours.</p>

            <form id="home-contact-form">
              <div class="relay-form-row">
                <div class="relay-field">
                  <label for="h-name">Full Name *</label>
                  <input type="text" id="h-name" placeholder="Dr. Rajesh Kumar" required />
                </div>
                <div class="relay-field">
                  <label for="h-company">Organization / Company *</label>
                  <input type="text" id="h-company" placeholder="Defense Lab / R&D Institute" required />
                </div>
              </div>

              <div class="relay-form-row">
                <div class="relay-field">
                  <label for="h-email">Work Email *</label>
                  <input type="email" id="h-email" placeholder="name@organization.com" required />
                </div>
                <div class="relay-field">
                  <label for="h-phone">Phone Number *</label>
                  <input type="tel" id="h-phone" placeholder="+91 98765 43210" required />
                </div>
              </div>

              <div class="relay-field">
                <label for="h-topic">Inquiry Type</label>
                <select id="h-topic">
                  <option value="quote">Formal Request for Quotation (RFQ)</option>
                  <option value="technical">Technical Support & Datasheet Request</option>
                  <option value="bespoke">Bespoke RF Design & Custom Sourcing</option>
                  <option value="general">General Corporate Inquiry</option>
                </select>
              </div>

              <div class="relay-field">
                <label for="h-message">Message / Technical Requirement *</label>
                <textarea id="h-message" placeholder="Please specify frequency range, model numbers, quantities, or target application..." required></textarea>
              </div>

              <button type="submit" class="btn-relay-blue" style="width:100%;margin-top:var(--space-2);">
                <i class="fa-solid fa-paper-plane"></i> Submit Inquiry to Engineering Team
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initHomePage() {
  // Ensure background video plays smoothly & muted
  const video = document.getElementById('hero-bg-video');
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    const attemptPlay = () => {
      if (video.paused) {
        video.muted = true;
        video.play().catch(() => {});
      }
    };
    attemptPlay();
    // Re-verify after a short tick in case DOM insertion was immediate
    setTimeout(attemptPlay, 100);
    setTimeout(attemptPlay, 400);

    // Fallback if browser requires interaction
    window.addEventListener('click', attemptPlay, { once: true });
    window.addEventListener('scroll', attemptPlay, { once: true, passive: true });
  }

  // Category tabs on home page
  const tabButtons = document.querySelectorAll('#home-category-tabs .filter-chip-dark');
  const productsGrid = document.getElementById('home-products-grid');

  if (tabButtons.length && productsGrid) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter') || 'all';
        const allPopular = getPopularProducts();
        
        let filtered = allPopular;
        if (filter === 'rogers') {
          filtered = allPopular.filter(p => p.oemId === 'rogers-corporation');
        } else if (filter === 'qorvo') {
          filtered = allPopular.filter(p => p.oemId === 'qorvo');
        } else if (filter === 'ohmega') {
          filtered = allPopular.filter(p => p.oemId === 'ohmega-ticer');
        } else if (filter === 'fortify') {
          filtered = allPopular.filter(p => p.oemId === 'fortify');
        } else if (filter === 'components') {
          filtered = allPopular.filter(p => p.oemId === 'minicircuits' || p.oemId === 'rfuw-engineering' || p.oemId === 'triteq');
        } else if (filter === 'sensors') {
          filtered = allPopular.filter(p => p.oemId === 'thermosen' || p.oemId === 'nee' || p.oemId === 'transline-technology');
        }

        if (filtered.length === 0) {
          productsGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:var(--space-8);color:var(--text-gray-500);">
              No popular items currently in this view. <a data-route="/products" style="color:var(--logo-blue-light);font-weight:600;">View full catalog &rarr;</a>
            </div>
          `;
        } else {
          productsGrid.innerHTML = filtered.map((p, i) => renderProductCard(p, i)).join('');
        }
      });
    });
  }

  // Quick preset pills
  const presets = document.querySelectorAll('.quick-preset');
  const messageInput = document.getElementById('h-message');
  if (presets.length && messageInput) {
    presets.forEach(p => {
      p.addEventListener('click', () => {
        messageInput.value = p.getAttribute('data-preset');
        messageInput.focus();
      });
    });
  }

  // Contact form submission
  const form = document.getElementById('home-contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('h-name').value;
      const refId = 'ICON-' + Math.floor(100000 + Math.random() * 900000);

      form.innerHTML = `
        <div style="text-align:center;padding:var(--space-8) var(--space-4);">
          <div style="width:60px;height:60px;border-radius:50%;background:rgba(37,99,235,0.15);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto var(--space-4);">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 style="font-size:1.4rem;font-weight:800;color:var(--text-white);margin-bottom:8px;">Thank You, ${name}!</h3>
          <p style="color:var(--text-gray-400);font-size:0.95rem;margin-bottom:var(--space-4);">
            Your message has been logged. A specialized RF application engineer will review your inquiry and contact you within 24 hours.
          </p>
          <div style="display:inline-block;padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid var(--border-card);border-radius:var(--radius-md);font-family:var(--font-display);font-size:0.85rem;color:var(--text-white);">
            Inquiry Tracking Ref: <strong style="color:var(--logo-red-light);">${refId}</strong>
          </div>
        </div>
      `;
    });
  }
}
