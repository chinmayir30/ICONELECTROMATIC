/**
 * Partners Page — ICON ELECTROMATIC
 * High-End Dark Relay-styled layout matching authentic Icon Electromatic partners.
 * Features alternating animated multi-row streams (Row 1 right, Row 2 left, Row 3 right, Row 4 left).
 * Completely clean cards showcasing authorized OEM partnerships without clutter.
 */

const PARTNERS = [
  {
    id: 'rogers',
    name: 'Rogers Corporation',
    domain: 'High-Frequency Laminates & Prepregs',
    category: 'materials',
    accentColor: 'red',
    glowColor: 'rgba(204, 0, 0, 0.45)',
    logoImg: '/images/oem-logos/Rogers_Logo_no_bg.png',
    description: 'A global leader in engineered materials, Rogers provides high-frequency laminates and prepregs widely used in radar, aerospace, defence, and high-speed communication systems where signal integrity and reliability are critical.',
  },
  {
    id: 'mini-circuits',
    name: 'Mini-Circuits',
    domain: 'RF & Microwave Components',
    category: 'components',
    accentColor: 'red',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    logoImg: '/images/oem-logos/mini-circuits-seeklogo.png',
    description: 'Mini-Circuits offers an extensive portfolio of RF and microwave components supporting design, prototyping, and production across defence, SATCOM, test & measurement, and advanced communication platforms.',
  },
  {
    id: 'qorvo',
    name: 'Qorvo',
    domain: 'RF, mmWave & Active Antenna Solutions',
    category: 'semiconductors',
    accentColor: 'blue',
    glowColor: 'rgba(0, 200, 83, 0.4)',
    logoImg: '/images/oem-logos/Qorvo_logo_wb.png',
    description: 'Qorvo develops advanced RF and mmWave technologies including RFICs, Power amplifiers, Switches, Converters, and Active antenna ASICs, enabling high-performance Radar, SATCOM, and next-generation Wireless systems.',
  },
  {
    id: 'tecdia',
    name: 'Tecdia',
    domain: 'Precision Capacitors & Thin-Film Components',
    category: 'components',
    accentColor: 'blue',
    glowColor: 'rgba(2, 132, 199, 0.45)',
    logoImg: '/images/oem-logos/Tecdia_cropped.png',
    description: 'Tecdia manufactures single-layer capacitors, thin-film chip resistors, mmWave varactors, and ground blocks for demanding aerospace, defence, medical, and RF applications.',
  },
  {
    id: 'tri-teq',
    name: 'Tri-TeQ',
    domain: 'Tunable Filters & RF Assemblies',
    category: 'components',
    accentColor: 'red',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    logoImg: '/images/oem-logos/TriTeq_logo_wb.png',
    description: 'Tri-TeQ is a leader in harmonic switch filter banks, high/low and tunable band-pass filters, and multifunction RF assemblies used in defence, SATCOM, and electronic warfare systems.',
  },
  {
    id: 'rfuw',
    name: 'RFuW Engineering',
    domain: 'High-Performance RF Switches & Modules',
    category: 'components',
    accentColor: 'red',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    logoImg: '/images/oem-logos/RFuW_Logo.png',
    description: 'RFuW Engineering specialises in rugged RF switches, limiters, and integrated microwave modules designed for high-power, wideband, and mission-critical aerospace and defence applications.',
  },
  {
    id: 'yttek',
    name: 'YTTEK',
    domain: 'Software-Defined Radio (SDR) Platforms',
    category: 'semiconductors',
    accentColor: 'blue',
    glowColor: 'rgba(37, 99, 235, 0.45)',
    logoImg: '/images/oem-logos/YTTEK_Logo_wb.png',
    description: 'YTTEK builds flexible and reconfigurable software-defined radio platforms supporting research, defence, and advanced wireless communication applications.',
  },
  {
    id: 'quantic-eulex',
    name: 'Quantic Eulex / Evans',
    domain: 'Advanced Ceramic Microwave & Hybrid Capacitors',
    category: 'components',
    accentColor: 'blue',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    logoImg: '/images/oem-logos/Evans_logo.png',
    description: 'Quantic Eulex & Evans Hybrid Capacitors engineer high-energy, high-frequency ceramic capacitors and hybrid capacitor banks supporting radar, SATCOM, aerospace, and space platforms.',
  },
  {
    id: 'quantic-ohmega',
    name: 'Quantic Ohmega-Ticer',
    domain: 'Embedded Thin-Film Resistive Materials',
    category: 'materials',
    accentColor: 'blue',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    logoImg: '/images/oem-logos/OhmegaTicer_Black.png',
    description: 'Ohmega-Ticer provides embedded thin-film resistive copper foils that enable compact, high-performance digital and RF PCB designs for defence, aerospace, and advanced electronics.',
  },
  {
    id: 'thermosen',
    name: 'Thermosen Technologies',
    domain: 'Temperature Sensors for Hi-Rel Applications',
    category: 'sensors',
    accentColor: 'blue',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    logoImg: '/images/oem-logos/Thermosen_logo.png',
    description: 'Thermosen develops temperature sensing solutions focused on Hi-Rel, aerospace, and defence sectors, ensuring accurate thermal monitoring in extreme environments.',
  },
  {
    id: 'fortify',
    name: 'Fortify',
    domain: 'Dielectric 3D Printing for RF & Microwave Devices',
    category: 'materials',
    accentColor: 'blue',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    logoImg: '/images/oem-logos/Fortify_Logo_Black_Bg.png',
    description: 'Fortify enables advanced dielectric 3D printing materials for RF and microwave components, supporting complex geometries, rapid prototyping, and next-generation device development.',
  },
  {
    id: 'powerfactor',
    name: 'PowerFactor Electronics (PowerRF)',
    domain: 'Power Electronics & RF Microwave Domains',
    category: 'components',
    accentColor: 'blue',
    glowColor: 'rgba(234, 88, 12, 0.45)',
    logoImg: '',
    description: 'Specialized in R&D, design, testing, consultancy, and product development in Power Electronics and RF Microwave domains under the Make in India initiative.',
  },
  {
    id: 'nee',
    name: 'NEE International (New Era Electronics)',
    domain: 'Application PCBs for Microwave & Satellite Communication',
    category: 'sensors',
    accentColor: 'red',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    logoImg: '/images/oem-logos/NEE_Logo_wb.png',
    description: 'NEE International is a leading fabricator of microwave and satellite communication PCBs, supporting high-frequency and space-grade electronic applications.',
  },
];

// Helper: Running OEM Logos Ticker (Unconfined, full-width continuous flow of only large OEM logos)
function renderRunningLogoTicker(partners) {
  // Duplicate partners with available logos 3 times for a completely seamless, continuous loop
  const tickerPartners = partners.filter(p => Boolean(p.logoImg));
  const loopList = [...tickerPartners, ...tickerPartners, ...tickerPartners];
  const itemsMarkup = loopList.map((p, idx) => `
    <div class="oem-running-logo-item" data-partner-id="${p.id}" title="${p.name}">
      <div class="oem-running-logo-box">
        <img src="${p.logoImg}" alt="${p.name} Official Logo" class="oem-running-logo-img" loading="eager" />
      </div>
    </div>
  `).join('');

  return `
    <div class="oem-running-ticker-runthrough">
      <div class="oem-running-ticker-track">
        ${itemsMarkup}
      </div>
    </div>
  `;
}

// Clean Static Card Component (No badges, purely clean presentation)
function renderPartnerCardMarkup(partner) {
  const isRed = partner.accentColor === 'red';
  const accentClass = isRed ? 'accent-red' : '';

  const logoMarkup = partner.logoImg
    ? `<img src="${partner.logoImg}" alt="${partner.name} Official Logo" class="partner-logo-img" loading="eager" />`
    : (partner.logoSvg || '');

  return `
    <div class="partner-static-card ${accentClass}" data-partner-id="${partner.id}" data-category="${partner.category}" title="${partner.name}">
      <!-- Card Top: Centered Brand Logo Box -->
      <div class="partner-stream-card-top" style="justify-content:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.07);">
        <div class="partner-stream-card-logo-box" style="width:100%;display:flex;justify-content:center;align-items:center;">
          ${logoMarkup}
        </div>
      </div>

      <!-- Partner Name & Domain -->
      <h3 class="partner-stream-card-name">${partner.name}</h3>
      <div class="partner-stream-card-domain">${partner.domain}</div>

      <!-- Description of the Partner Association -->
      <p class="partner-stream-card-desc" style="margin-bottom:0;">${partner.description}</p>
    </div>
  `;
}

export function renderPartnersPage() {
  return `
    <div class="page-content partners-page" style="min-height:100vh;">
      <!-- Unified Page Hero Banner (Blue in light theme) -->
      <section class="page-hero-banner">
        <div class="container">
          
          <!-- Breadcrumb -->
          <nav class="breadcrumb-dark">
            <a data-route="/">Home</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <span class="crumb-current" style="color:var(--text-white);font-weight:600;">Partners</span>
          </nav>

          <!-- Unified Page Header -->
          <div class="page-header-unified" style="margin-bottom:0;">
            <div class="page-eyebrow-pill">
              <span class="hub-dot-pulse"></span>
              <span>GLOBAL TECHNOLOGY ECOSYSTEM</span>
            </div>
            <h1 class="page-title-unified">
              Authorized Technology Partners
            </h1>
            <p class="page-lead-unified">
              We represent a diverse portfolio of OEMs across sectors, industries and application.<br />
              To know more about their products, make an enquiry or request samples just get in touch with us.
            </p>
          </div>

          <!-- Trust Badges Strip (Matching Services Page 1:1 in Spacing & Design) -->
          <div class="services-trust-strip partners-trust-strip" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:24px;margin-bottom:0;padding-bottom:0;border-bottom:none;">
            <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#93C5FD;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-handshake-angle" style="color:var(--logo-blue-light);"></i>
              <span><strong>13+</strong> Global Technology Partners</span>
            </div>
            <div style="background:rgba(225,29,72,0.08);border:1px solid rgba(225,29,72,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#FDA4AF;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-shield-halved" style="color:var(--logo-red-light);"></i>
              <span>Direct Factory Warranties &amp; CoCs</span>
            </div>
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#FCD34D;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-certificate" style="color:#F59E0B;"></i>
              <span>Space &amp; Mil-Spec Screening Support</span>
            </div>
            <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#6EE7B7;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-location-dot" style="color:#10B981;"></i>
              <span>India Distribution Hub (Bengaluru)</span>
            </div>
          </div>

        </div>
      </section>

      <!-- Main Content Body -->
      <div class="page-main-body" style="padding-top:var(--space-12);padding-bottom:var(--space-24);">
        <div class="container">
          <!-- Running OEM Logos Ticker (Full container-width, bounded between left and right card edges) -->
          ${renderRunningLogoTicker(PARTNERS)}

          <!-- Down Part: 100% STATIC Grid of Partner Cards (No moving rows) -->
          <div id="partners-static-grid" class="partners-static-grid">
            ${PARTNERS.map(p => renderPartnerCardMarkup(p)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initPartnersPage() {
  // Clicking any ticker logo scrolls to and highlights that partner's static card
  document.querySelectorAll('.oem-running-logo-item').forEach(item => {
    item.addEventListener('click', () => {
      const pid = item.getAttribute('data-partner-id');
      const targetCard = document.querySelector(`#partners-static-grid .partner-static-card[data-partner-id="${pid}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('card-highlight-pulse');
        setTimeout(() => {
          targetCard.classList.remove('card-highlight-pulse');
        }, 2000);
      }
    });
  });

  // Interactive click on any partner card to explore related OEM blogs or catalog
  document.querySelectorAll('.partner-static-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-partner-id');
      if (pid) {
        window.location.hash = `#/blogs?oem=${pid === 'rogers' ? 'rogers-corporation' : pid}`;
      }
    });
  });
}
