/**
 * About Page — ICON ELECTROMATIC
 * Strictly containing the authentic content from https://iconelectromatic2.lbimedia.in/about-us/
 * Enhanced with interactive card animations, hover tilt & glow, radar pulse, and scroll reveals
 * Brand Theme: Deep Black, Electric Blue (#2563EB), Vibrant Red (#E11D48)
 */

export function renderAboutPage() {
  return `
    <div class="page-content about-page" style="min-height:100vh;">
      <!-- Unified Page Hero Banner (Blue in light theme) -->
      <section class="page-hero-banner" style="position:relative;overflow:hidden;">
        <!-- Ambient Lighting Effects -->
        <div style="position:absolute;top:0;left:10%;width:500px;height:500px;background:radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
        <div style="position:absolute;top:300px;right:5%;width:600px;height:600px;background:radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>

        <div class="container" style="position:relative;z-index:2;">
          <!-- Breadcrumb -->
          <nav class="breadcrumb-dark">
            <a data-route="/">Home</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <span style="color:var(--text-white);font-weight:600;">About Us</span>
          </nav>

          <!-- Section 1: Hero Header with Animated Ambient Radar -->
          <div class="page-header-unified" style="display:flex;align-items:center;padding:10px 0;margin-bottom:0;">
            <!-- Animated Radar Wave Component -->
            <div class="rf-radar-ambient" aria-hidden="true">
              <div class="rf-radar-ring"></div>
              <div class="rf-radar-ring"></div>
              <div class="rf-radar-ring"></div>
              <div class="rf-radar-ring"></div>
              <div class="rf-radar-sweep"></div>
            </div>

            <div style="position:relative;z-index:3;">
              <div class="page-eyebrow-pill">
                <span class="hub-dot-pulse"></span>
                <span>ABOUT ICON ELECTROMATIC</span>
              </div>
              
              <h1 class="page-title-unified">
                About Us
              </h1>
              
              <p class="page-lead-unified">
                Driven by decades of engineering expertise and global collaborations, Icon Electromatic Private Limited delivers advanced components and tailored solutions that transform design ambitions into reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Area -->
      <div class="page-main-body" style="padding-top:var(--space-12);padding-bottom:var(--space-20);">
        <div class="container">
          <!-- Section 2: Fulfillment Partners & Origin (with Interactive Feature Badges & Downloads) -->
          <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:40px;align-items:center;border-radius:24px;padding:44px 36px;margin-bottom:var(--space-16);" class="about-hero-feature-card about-interactive-card about-animate-fadeup">
          <div>
            <span style="font-size:0.75rem;font-weight:700;color:var(--logo-red-light);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;display:inline-block;">
              CORE CAPABILITIES
            </span>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.7rem, 2.6vw, 2.2rem);font-weight:800;line-height:1.25;margin-bottom:18px;">
              Fulfillment partners for your electronic ambitions
            </h2>
            <p style="font-size:0.95rem;line-height:1.75;margin-bottom:14px;">
              Icon Electromatic was founded in 2009 in Bengaluru by engineers with decades of expertise in RF, Microwave, Semiconductors, and allied service industries. In 2020, the company transitioned into <strong>Icon Electromatic Private Limited</strong> and expanded its presence across India, Israel, Singapore, and the USA.
            </p>
            <p style="font-size:0.95rem;line-height:1.75;margin-bottom:24px;">
              With deep experience in electronic research, development, and manufacturing ecosystems—spanning both public and private sectors—and strengthened by long-standing global partnerships, the company delivers more than advanced components. We also provide business consultancy and specialized RF design services to offer bespoke, high-performance solutions for its clients.
            </p>

            <!-- Authentic Action Downloads from the original page -->
            <div style="display:flex;flex-wrap:wrap;gap:14px;">
              <a href="https://iconelectromatic2.lbimedia.in/wp-content/uploads/2026/02/ICON-Corporate-Presentation-MAPCON23.pptx" target="_blank" class="btn-relay btn-relay-primary" style="padding:11px 22px;font-size:0.85rem;">
                <i class="fa-solid fa-file-powerpoint" style="margin-right:6px;"></i>Corporate Presentation &darr;
              </a>
              <a href="https://iconelectromatic2.lbimedia.in/wp-content/uploads/2026/01/ICON-ELECTROMATICv3-5-1.pdf" target="_blank" class="btn-relay btn-relay-secondary" style="padding:11px 22px;font-size:0.85rem;">
                <i class="fa-solid fa-file-pdf" style="color:var(--logo-red-light);margin-right:6px;"></i>Company Flyer &darr;
              </a>
            </div>
          </div>

          <!-- Feature Highlight Cards from original page -->
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="border-radius:16px;padding:24px 20px;display:flex;align-items:flex-start;gap:16px;" class="about-subcard-blue about-interactive-card about-animate-fadeup">
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--logo-blue-light);flex-shrink:0;">
                <i class="fa-solid fa-tower-broadcast"></i>
              </div>
              <div>
                <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:4px;line-height:1.3;">
                  Global Leader in RF & Electronic Solutions
                </h3>
                <p style="font-size:0.85rem;line-height:1.5;margin:0;">
                  Providing mission-critical components, assemblies, and custom microwave engineering for advanced applications.
                </p>
              </div>
            </div>

            <div style="border-radius:16px;padding:24px 20px;display:flex;align-items:flex-start;gap:16px;" class="about-subcard-red about-interactive-card red-glow about-animate-fadeup">
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(225,29,72,0.15);border:1px solid rgba(225,29,72,0.3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--logo-red-light);flex-shrink:0;">
                <i class="fa-solid fa-microchip"></i>
              </div>
              <div>
                <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:4px;line-height:1.3;">
                  Advanced Components, Consultancy & Bespoke Design Services
                </h3>
                <p style="font-size:0.85rem;line-height:1.5;margin:0;">
                  End-to-end design-in engineering, RF simulation review, and custom-tailored fulfillment for client success.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Some Quick Facts / The Numbers That Define Us (Animated Counters) -->
        <div class="about-stats-banner" id="about-stats-container">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg, transparent, var(--logo-blue), var(--logo-red), transparent);"></div>
          
          <div style="text-align:center;max-width:650px;margin:0 auto var(--space-10);">
            <div style="display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;font-weight:700;color:var(--logo-red-light);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">
              <i class="fa-solid fa-chart-simple"></i>
              Some Quick Facts
            </div>
            <h2 class="about-stats-h2" style="font-family:var(--font-display);font-size:clamp(1.8rem, 2.8vw, 2.4rem);font-weight:800;letter-spacing:-0.02em;">
              The Numbers That Define Us
            </h2>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:28px;text-align:center;" id="stats-grid-wrapper">
            
            <!-- Stat 1 -->
            <div class="about-interactive-card red-glow about-animate-fadeup" style="padding:32px 24px;">
              <div class="about-card-icon" style="font-size:2rem;color:var(--logo-red-light);margin-bottom:12px;display:inline-block;">
                <i class="fa-solid fa-boxes-stacked"></i>
              </div>
              <div style="font-family:var(--font-display);font-size:clamp(2.8rem, 4vw, 3.8rem);font-weight:900;color:var(--logo-red);line-height:1;margin-bottom:10px;">
                <span class="stat-counter" data-target="1200">0</span><span>+</span>
              </div>
              <div class="about-stat-label" style="font-size:1.1rem;font-weight:700;letter-spacing:-0.01em;">Products</div>
            </div>

            <!-- Stat 2 -->
            <div class="about-interactive-card about-animate-fadeup" style="padding:32px 24px;">
              <div class="about-card-icon" style="font-size:2rem;color:var(--logo-blue-light);margin-bottom:12px;display:inline-block;">
                <i class="fa-solid fa-calendar-check"></i>
              </div>
              <div style="font-family:var(--font-display);font-size:clamp(2.8rem, 4vw, 3.8rem);font-weight:900;color:var(--logo-blue-light);line-height:1;margin-bottom:10px;">
                <span class="stat-counter" data-target="120">0</span><span>+</span>
              </div>
              <div class="about-stat-label" style="font-size:1.1rem;font-weight:700;letter-spacing:-0.01em;">Years of combined experience</div>
            </div>

            <!-- Stat 3 -->
            <div class="about-interactive-card red-glow about-animate-fadeup" style="padding:32px 24px;">
              <div class="about-card-icon" style="font-size:2rem;color:var(--logo-red-light);margin-bottom:12px;display:inline-block;">
                <i class="fa-solid fa-handshake-angle"></i>
              </div>
              <div style="font-family:var(--font-display);font-size:clamp(2.8rem, 4vw, 3.8rem);font-weight:900;color:var(--logo-red);line-height:1;margin-bottom:10px;">
                <span class="stat-counter" data-target="12">0</span><span>+</span>
              </div>
              <div class="about-stat-label" style="font-size:1.1rem;font-weight:700;letter-spacing:-0.01em;">Partners</div>
            </div>

          </div>
        </div>

        <!-- Section 4: Our Vision & Our Mission (Exact Text with Radiant Cards) -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:var(--space-16);">
               <!-- Our Vision Card -->
          <div class="about-vision-card about-interactive-card red-glow about-animate-fadeup" style="padding:36px;display:flex;flex-direction:column;justify-content:space-between;border-top:3px solid var(--logo-red);">
            <div>
              <div class="about-card-icon" style="width:52px;height:52px;border-radius:12px;background:rgba(225,29,72,0.12);border:1px solid rgba(225,29,72,0.3);color:var(--logo-red-light);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:20px;">
                <i class="fa-solid fa-eye"></i>
              </div>
              <h2 style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;margin-bottom:14px;">
                Our Vision
              </h2>
              <p style="font-size:1rem;line-height:1.75;margin:0;">
                To be India’s foremost and most trusted source of essential electronics components for research, development, and manufacturing across both public and private sectors.
              </p>
            </div>
          </div>

          <!-- Our Mission Card -->
          <div class="about-mission-card about-interactive-card about-animate-fadeup" style="padding:36px;display:flex;flex-direction:column;justify-content:space-between;border-top:3px solid var(--logo-blue);">
            <div>
              <div class="about-card-icon" style="width:52px;height:52px;border-radius:12px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.3);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:20px;">
                <i class="fa-solid fa-bullseye"></i>
              </div>
              <h2 style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;margin-bottom:14px;">
                Our Mission
              </h2>
              <p style="font-size:1rem;line-height:1.75;margin:0;">
                To introduce the world’s most cutting-edge technology solutions and components to India by forging strategic partnerships with global industry leaders, fostering indigenous product development and advancing “Make in India” initiatives.
              </p>
            </div>
          </div>

        </div>

        <!-- Section 5: Our Journey (Chronological Timeline Format) -->
        <div style="margin-bottom:var(--space-16);">
          <div style="text-align:center;max-width:600px;margin:0 auto var(--space-8);">
            <div style="display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;font-weight:700;color:var(--logo-blue-light);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">
              <i class="fa-solid fa-timeline"></i>
              CHRONOLOGY
            </div>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem, 2.8vw, 2.4rem);font-weight:800;letter-spacing:-0.02em;">
              Our Journey
            </h2>
          </div>

          <div class="relay-timeline-wrapper">
            <!-- Timeline Connecting Rail on Desktop -->
            <div class="relay-timeline-rail">
              <div class="relay-timeline-rail-line"></div>
              
              <!-- Node 1: 2009 -->
              <div class="relay-timeline-node">
                <div class="timeline-node-circle">
                  <i class="fa-solid fa-flag"></i>
                </div>
                <div class="timeline-node-year">2009</div>
                <div class="timeline-stem-connector"></div>
              </div>

              <!-- Node 2: 2020 -->
              <div class="relay-timeline-node">
                <div class="timeline-node-circle blue-node">
                  <i class="fa-solid fa-building-circle-check"></i>
                </div>
                <div class="timeline-node-year blue-text">2020</div>
                <div class="timeline-stem-connector blue-stem"></div>
              </div>
            </div>

            <!-- Milestone Cards Connected Along the Timeline -->
            <div class="journey-grid-two">
              
              <!-- 2009 Milestone Card -->
              <div class="journey-step-card red-step about-interactive-card red-glow about-animate-fadeup" style="border-top:3px solid var(--logo-red);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                  <span class="timeline-badge red" style="font-size:0.95rem;padding:6px 16px;">2009 • THE INCEPTION</span>
                  <span class="hub-dot-pulse red"></span>
                </div>
                <h3 style="font-family:var(--font-display);font-size:1.35rem;font-weight:800;margin-bottom:10px;line-height:1.3;">
                  Founded in Bengaluru, India
                </h3>
                <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                  Established by veteran engineers with decades of expertise in RF, Microwave, Semiconductors, and allied service industries.
                </p>
              </div>

              <!-- 2020 Milestone Card -->
              <div class="journey-step-card blue-step about-interactive-card about-animate-fadeup" style="border-top:3px solid var(--logo-blue);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                  <span class="timeline-badge blue" style="font-size:0.95rem;padding:6px 16px;">2020 • GLOBAL TRANSFORMATION</span>
                  <span class="hub-dot-pulse"></span>
                </div>
                <h3 style="font-family:var(--font-display);font-size:1.35rem;font-weight:800;margin-bottom:10px;line-height:1.3;">
                  ICON Electromatic transitions into Icon Electromatic Private Limited
                </h3>
                <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                  Expanded international footprint and global technology partnership operations across India, Israel, Singapore, and the USA.
                </p>
              </div>

            </div>
          </div>
        </div>

        <!-- Section 6: Why Us (Exact 5 Points from Original Site with Interactive 3D Glow Cards) -->
        <div style="margin-bottom:var(--space-12);">
          <div style="text-align:center;max-width:600px;margin:0 auto var(--space-10);">
            <div style="display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;font-weight:700;color:var(--logo-red-light);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">
              <i class="fa-solid fa-award"></i>
              OUR ADVANTAGE
            </div>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem, 2.8vw, 2.4rem);font-weight:800;letter-spacing:-0.02em;">
              Why Us
            </h2>
          </div>

          <div class="why-us-grid-dark">
            
            <!-- Why Us Card 1 -->
            <div class="why-us-card about-interactive-card red-accent red-glow about-animate-fadeup" style="border-top:3px solid var(--logo-red);">
              <span class="why-card-number">01</span>
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(225,29,72,0.12);border:1px solid rgba(225,29,72,0.3);color:var(--logo-red-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:20px;">
                <i class="fa-solid fa-bullseye"></i>
              </div>
              <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:800;margin-bottom:12px;line-height:1.35;">
                We Help Customers Achieve Their Goals Without Compromise
              </h3>
              <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                Access an expanding portfolio of high-performance RF and Microwave components, mmWave, and Semiconductor components. Whether simple or highly complex, our solutions integrate seamlessly into your designs—saving time, reducing effort, and accelerating project success.
              </p>
            </div>

            <!-- Why Us Card 2 -->
            <div class="why-us-card about-interactive-card about-animate-fadeup" style="border-top:3px solid var(--logo-blue);">
              <span class="why-card-number">02</span>
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.3);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:20px;">
                <i class="fa-solid fa-microchip"></i>
              </div>
              <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:800;margin-bottom:12px;line-height:1.35;">
                Empowering You With Cutting-Edge Technology
              </h3>
              <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                From advanced ICs to mission-critical subsystems, we provide the technologies that unlock new possibilities. Our expertise helps you build smarter, faster, and more capable electronic systems across every application.
              </p>
            </div>

            <!-- Why Us Card 3 -->
            <div class="why-us-card about-interactive-card red-accent red-glow about-animate-fadeup" style="border-top:3px solid var(--logo-red);">
              <span class="why-card-number">03</span>
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(225,29,72,0.12);border:1px solid rgba(225,29,72,0.3);color:var(--logo-red-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:20px;">
                <i class="fa-solid fa-gears"></i>
              </div>
              <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:800;margin-bottom:12px;line-height:1.35;">
                Engineered Solutions Tailored to Your Needs
              </h3>
              <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                Combining engineering insight with best-in-class global products, we deliver solutions that balance innovation, performance, and reliability. Every recommendation is customised to your technical, commercial, and operational requirements.
              </p>
            </div>

            <!-- Why Us Card 4 -->
            <div class="why-us-card about-interactive-card about-animate-fadeup" style="border-top:3px solid var(--logo-blue);">
              <span class="why-card-number">04</span>
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.3);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:20px;">
                <i class="fa-solid fa-bolt"></i>
              </div>
              <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:800;margin-bottom:12px;line-height:1.35;">
                Access to Advanced Technology
              </h3>
              <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                Stay ahead with timely access to the latest RF, Microwave, mmWave, and Semiconductor innovations sourced from world-leading OEMs.
              </p>
            </div>

            <!-- Why Us Card 5 -->
            <div class="why-us-card about-interactive-card red-accent red-glow about-animate-fadeup" style="border-top:3px solid var(--logo-red);grid-column:1/-1;max-width:680px;margin:0 auto;width:100%;">
              <span class="why-card-number">05</span>
              <div class="about-card-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(225,29,72,0.12);border:1px solid rgba(225,29,72,0.3);color:var(--logo-red-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:20px;">
                <i class="fa-solid fa-headset"></i>
              </div>
              <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:800;margin-bottom:12px;line-height:1.35;">
                Dedicated Support
              </h3>
              <p style="font-size:0.9rem;line-height:1.7;margin:0;">
                Our team is always available to help you with technical queries, product guidance, and project requirements—whenever you need us.
              </p>
            </div>
            </div>

          </div>
        </div>

        </div>
      </div>
    </div>
  `;
}

export function initAboutPage() {
  // 1. Mouse Spotlight Glow Effect on Cards
  const cards = document.querySelectorAll('.about-interactive-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 2. Animated Stats Number Counter on Scroll
  const statsContainer = document.getElementById('about-stats-container');
  if (statsContainer) {
    let animated = false;
    const counters = statsContainer.querySelectorAll('.stat-counter');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
            const duration = 1800; // ms
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOut = 1 - Math.pow(1 - progress, 4);
              const currentVal = Math.floor(easeOut * target);

              counter.textContent = currentVal.toLocaleString();

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = target.toLocaleString();
              }
            }

            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.25 });

    observer.observe(statsContainer);
  }

  // 3. Staggered Scroll Reveal Animation for Cards
  const animatedCards = document.querySelectorAll('.about-animate-fadeup');
  if (animatedCards.length) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, idx * 60);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    animatedCards.forEach(c => cardObserver.observe(c));
  }
}
