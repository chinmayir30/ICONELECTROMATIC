/**
 * Contact & Careers Page — ICON ELECTROMATIC
 * Sleek Dark Aesthetic matching the Relay reference.
 * Features dual interactive forms:
 *   1. Technical & RFQ Inquiry Form (with dynamic prefill from product pages)
 *   2. Engineering Careers & Recruiting Form (talent acquisition for RF/Microwave engineers)
 */

export function getInquiryDetails() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  
  let queryString = '';
  if (hash.includes('?')) {
    queryString = hash.slice(hash.indexOf('?') + 1);
  } else if (search.includes('?')) {
    queryString = search.slice(search.indexOf('?') + 1);
  }

  const p = new URLSearchParams(queryString);
  const productParam = (p.get('product') || p.get('model') || '').trim();
  const oemParam = (p.get('oem') || '').trim();
  const rawSubject = (p.get('subject') || '').toLowerCase().trim();
  const rawTab = (p.get('tab') || p.get('type') || p.get('form') || '').toLowerCase().trim();

  let activeTab = 'inquiry';
  if (rawTab === 'careers' || rawTab === 'recruiting' || rawTab === 'career' || rawTab === 'jobs' || rawTab === 'hiring') {
    activeTab = 'recruiting';
  }

  let subjectVal = 'rfq';
  if (rawSubject.includes('tech')) {
    subjectVal = 'technical';
  } else if (rawSubject.includes('bespoke')) {
    subjectVal = 'bespoke';
  } else if (rawSubject.includes('delivery')) {
    subjectVal = 'delivery';
  } else if (rawSubject.includes('general') || rawSubject.includes('partner')) {
    subjectVal = 'general';
  } else if (rawSubject === 'rfq' || productParam) {
    subjectVal = 'rfq';
  }

  let targetModel = productParam;
  if (productParam && oemParam && !productParam.toLowerCase().includes(oemParam.toLowerCase())) {
    targetModel = `${productParam} (${oemParam})`;
  }

  let prefillMessage = '';
  if (targetModel) {
    if (subjectVal === 'technical') {
      prefillMessage = `Hello, I am requesting technical consultation and engineering specifications for ${targetModel}. Please connect me with an application engineer.`;
    } else {
      prefillMessage = `Hello, I would like to request a formal Request for Quotation (RFQ) for ${targetModel}. Please provide commercial pricing, minimum order quantities (MOQ), and estimated delivery schedules.`;
    }
  }

  return { productParam, oemParam, subjectVal, targetModel, prefillMessage, activeTab };
}

export function renderContactPage() {
  const { subjectVal, targetModel, prefillMessage, activeTab } = getInquiryDetails();
  const isRecruiting = activeTab === 'recruiting';

  return `
    <div class="page-content contact-page" style="min-height:100vh;">
      <!-- Unified Page Hero Banner (Blue in light theme) -->
      <section class="page-hero-banner">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb-dark">
            <a data-route="/">Home</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <span class="crumb-current" style="color:var(--text-white);font-weight:600;" id="contact-breadcrumb-active">
              ${isRecruiting ? 'Careers &amp; Recruiting' : 'Contact &amp; RFQ'}
            </span>
          </nav>

          <!-- Unified Page Header -->
          <div class="page-header-unified" style="margin-bottom:0;">
            <div class="page-eyebrow-pill" id="contact-eyebrow-pill">
              <span class="hub-dot-pulse"></span>
              <span id="contact-eyebrow-text">${isRecruiting ? 'ICON TALENT ACQUISITION' : 'CONNECT WITH ENGINEERING'}</span>
            </div>
            <h1 class="page-title-unified" id="contact-page-title">
              ${isRecruiting 
                ? 'Join India’s Foremost RF &amp; Microwave Engineering Hub' 
                : 'Send Us a Message &amp; Request Fast Quotes'}
            </h1>
            <p class="page-lead-unified" id="contact-page-lead">
              ${isRecruiting 
                ? 'Accelerate your career in millimeter-wave technology, defense electronics, and satellite communications. Explore engineering opportunities at ICON Electromatic.' 
                : 'Whether you require component data sheets, custom waveguide machining, or volume pricing, our application engineering team in Bengaluru is ready to assist.'}
            </p>
          </div>

          <!-- Highlights Strip (Matching Partners, Services, Blogs 1:1) -->
          <div class="services-trust-strip contact-trust-strip" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:24px;margin-bottom:0;padding-bottom:0;border-bottom:none;">
            <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#93C5FD;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-bolt" style="color:var(--logo-blue-light);"></i>
              <span>24-Hour RFQ Turnaround</span>
            </div>
            <div style="background:rgba(225,29,72,0.08);border:1px solid rgba(225,29,72,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#FDA4AF;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-users-gear" style="color:var(--logo-red-light);"></i>
              <span>Bengaluru Engineering Hub</span>
            </div>
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#FCD34D;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-dolly" style="color:#F59E0B;"></i>
              <span>Global Sourcing &amp; Logistics</span>
            </div>
            <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:10px 18px;font-size:0.85rem;color:#6EE7B7;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-shield-halved" style="color:#10B981;"></i>
              <span>Defense &amp; Commercial Pricing</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Area -->
      <div class="page-main-body" style="padding-top:var(--space-8);padding-bottom:var(--space-20);">
        <div class="container">
          <!-- Form Switcher Tabs -->
        <div class="contact-tabs-wrapper">
          <div class="contact-form-tabs" role="tablist">
            <button 
              class="contact-tab-btn ${!isRecruiting ? 'active' : ''}" 
              id="tab-btn-inquiry" 
              data-tab="inquiry" 
              role="tab" 
              aria-selected="${!isRecruiting}"
            >
              <i class="fa-solid fa-paper-plane"></i>
              <span>Sales &amp; RFQ Inquiry</span>
            </button>
            <button 
              class="contact-tab-btn ${isRecruiting ? 'active' : ''}" 
              id="tab-btn-recruiting" 
              data-tab="recruiting" 
              role="tab" 
              aria-selected="${isRecruiting}"
            >
              <i class="fa-solid fa-user-plus"></i>
              <span>Careers &amp; Recruiting</span>
              <span class="tab-hiring-pill"><span class="hiring-dot"></span> We're Hiring</span>
            </button>
          </div>
        </div>

        <div class="contact-relay-grid">
          <!-- Left Column: Information Cards (Context-aware) -->
          <div class="contact-relay-info">
            
            <!-- 1A. INQUIRY INFO CARDS (Default) -->
            <div id="inquiry-info-column" style="${isRecruiting ? 'display:none;' : 'display:block;'}">
              <div class="contact-relay-card">
                <h3>Office Addresses</h3>
                <p>
                  Direct access to our corporate headquarters in India and international liaison offices in Singapore and the United States.
                </p>

                <div class="contact-meta-list">
                  <!-- India Office -->
                  <div class="contact-meta-row" style="align-items:flex-start;">
                    <div class="contact-meta-icon" style="margin-top:2px;"><i class="fa-solid fa-location-dot"></i></div>
                    <div class="contact-meta-text">
                      <h5>Icon Electromatic Pvt. Ltd (India)</h5>
                      <p style="margin-bottom:4px;">#303/2, 5th ‘A’ Cross, HRBR Layout, III Block,<br/>Kalyan Nagar, Bengaluru – 560043</p>
                      <p style="font-size:0.84rem;margin-bottom:2px;"><i class="fa-solid fa-phone" style="color:var(--logo-red);width:14px;margin-right:4px;"></i> Tel: <a href="tel:+918025429452">+91 80 2542 9452</a></p>
                      <p style="font-size:0.84rem;"><i class="fa-solid fa-envelope" style="color:var(--logo-red);width:14px;margin-right:4px;"></i> Email: <a href="mailto:salesiepl@iconelectromatic.com" style="color:var(--logo-red-light);">salesiepl@iconelectromatic.com</a></p>
                    </div>
                  </div>

                  <!-- Singapore Office -->
                  <div class="contact-meta-row" style="align-items:flex-start;margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-subtle);">
                    <div class="contact-meta-icon" style="margin-top:2px;"><i class="fa-solid fa-globe"></i></div>
                    <div class="contact-meta-text">
                      <h5>Icon Electromatic Singapore Pte Ltd</h5>
                      <p style="margin-bottom:4px;">204D Compassvale Drive #08-409<br/>Singapore 544204</p>
                      <p style="font-size:0.84rem;"><i class="fa-solid fa-envelope" style="color:var(--logo-red);width:14px;margin-right:4px;"></i> Email: <a href="mailto:IESing@iconelectromatic.com" style="color:var(--logo-red-light);">IESing@iconelectromatic.com</a></p>
                    </div>
                  </div>

                  <!-- USA Office -->
                  <div class="contact-meta-row" style="align-items:flex-start;margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-subtle);">
                    <div class="contact-meta-icon" style="margin-top:2px;"><i class="fa-solid fa-building"></i></div>
                    <div class="contact-meta-text">
                      <h5>Icon Electromatic LLC (USA)</h5>
                      <p style="margin-bottom:4px;">15412 Meadow Vista Dr, Edmond,<br/>Oklahoma 73013, USA</p>
                      <p style="font-size:0.84rem;margin-bottom:2px;"><i class="fa-solid fa-phone" style="color:var(--logo-red);width:14px;margin-right:4px;"></i> Tel: <a href="tel:+14055935176">+1 405 593 5176</a></p>
                      <p style="font-size:0.84rem;"><i class="fa-solid fa-envelope" style="color:var(--logo-red);width:14px;margin-right:4px;"></i> Email: <a href="mailto:salesiellc@iconelectromatic.com" style="color:var(--logo-red-light);">salesiellc@iconelectromatic.com</a></p>
                    </div>
                  </div>

                  <!-- Hours -->
                  <div class="contact-meta-row" style="align-items:flex-start;margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-subtle);">
                    <div class="contact-meta-icon" style="margin-top:2px;"><i class="fa-solid fa-clock"></i></div>
                    <div class="contact-meta-text">
                      <h5>Business Operating Hours</h5>
                      <p style="font-size:0.84rem;margin-bottom:2px;">Monday – Friday: 9:00 AM – 6:00 PM IST</p>
                      <p style="font-size:0.84rem;">Saturday: 9:30 AM – 1:30 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fast Requirement Presets -->
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

            <!-- 1B. RECRUITING INFO CARDS (Shown on Careers tab) -->
            <div id="recruiting-info-column" style="${isRecruiting ? 'display:block;' : 'display:none;'}">
              <div class="contact-relay-card">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:var(--space-3);">
                  <div style="width:38px;height:38px;border-radius:10px;background:rgba(37,99,235,0.15);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:1.1rem;">
                    <i class="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <h3 style="font-size:1.25rem;font-weight:800;color:var(--text-white);margin:0;">Why Build Your Career at ICON?</h3>
                    <span style="font-size:0.75rem;color:var(--logo-blue-light);font-weight:700;">RF &amp; MICROWAVE EXCELLENCE</span>
                  </div>
                </div>

                <p style="font-size:0.88rem;color:var(--text-gray-300);line-height:1.6;margin-bottom:var(--space-4);">
                  ICON ELECTROMATIC represents the world’s foremost RF, microwave, and high-frequency component manufacturers in India. Our engineers work at the bleeding edge of radar, space satellites, defense EW systems, and 5G/6G research.
                </p>

                <div class="recruiting-perks-list">
                  <div class="recruiting-perk-item">
                    <i class="fa-solid fa-microchip" style="color:var(--logo-blue-light);"></i>
                    <div>
                      <strong>Global OEM Partnerships:</strong>
                      Direct technical engagement with leaders like Rogers Corporation, Qorvo, Spellman, Fortify, and YTTEK.
                    </div>
                  </div>
                  <div class="recruiting-perk-item">
                    <i class="fa-solid fa-satellite-dish" style="color:var(--logo-red-light);"></i>
                    <div>
                      <strong>Strategic Defense &amp; Space Missions:</strong>
                      Contribute to critical airborne radars, missile guidance receivers, SATCOM transponders, and ISRO payloads.
                    </div>
                  </div>
                  <div class="recruiting-perk-item">
                    <i class="fa-solid fa-flask-vial" style="color:#A855F7;"></i>
                    <div>
                      <strong>Advanced Microwave Measurement Lab:</strong>
                      Hands-on exposure to Vector Network Analyzers (VNA up to 67 GHz), noise figure meters, and RF anechoic test chambers.
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- Right Column: Interactive Forms -->
          <div class="contact-relay-form">
            
            <!-- ═══════════════════════════════════════════════════════════ -->
            <!-- FORM 1: SALES & TECHNICAL RFQ INQUIRY                       -->
            <!-- ═══════════════════════════════════════════════════════════ -->
            <div id="inquiry-form-panel" style="${isRecruiting ? 'display:none;' : 'display:block;'}">
              <h3>Send Us a Message</h3>
              <p class="subtitle">Complete the form below. Technical responses and RFQ quotes provided within 24 hours.</p>

              <form id="contact-full-form">
                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="c-fullname">Full Name *</label>
                    <input type="text" id="c-fullname" name="fullname" placeholder="Dr. Rajesh Kumar" required />
                  </div>
                  <div class="relay-field">
                    <label for="c-company">Company / Organization *</label>
                    <input type="text" id="c-company" name="company" placeholder="ISRO / DRDO / BEL / Private Lab" required />
                  </div>
                </div>

                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="c-email">Work Email *</label>
                    <input type="email" id="c-email" name="email" placeholder="name@organization.com" required />
                  </div>
                  <div class="relay-field">
                    <label for="c-phone">Phone / Mobile *</label>
                    <input type="tel" id="c-phone" name="phone" placeholder="+91 98765 43210" required />
                  </div>
                </div>

                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="c-subject">Subject / Inquiry Type</label>
                    <select id="c-subject" name="subject">
                      <option value="rfq" ${subjectVal === 'rfq' ? 'selected' : ''}>Formal Request for Quotation (RFQ)</option>
                      <option value="technical" ${subjectVal === 'technical' ? 'selected' : ''}>Technical Support &amp; Specifications</option>
                      <option value="bespoke" ${subjectVal === 'bespoke' ? 'selected' : ''}>Bespoke RF Component Engineering</option>
                      <option value="delivery" ${subjectVal === 'delivery' ? 'selected' : ''}>Lead Time &amp; Logistics Verification</option>
                      <option value="general" ${subjectVal === 'general' ? 'selected' : ''}>General Corporate Inquiry</option>
                    </select>
                  </div>
                  <div class="relay-field">
                    <label for="c-model">Target Model / Frequency Band</label>
                    <input type="text" id="c-model" name="model" value="${targetModel.replace(/"/g, '&quot;')}" placeholder="e.g. RT/duroid 5880 or ZX60-0433+ (2.4 - 5.8 GHz)" />
                  </div>
                </div>

                <div class="relay-field">
                  <label for="c-message">Technical Requirement / Message *</label>
                  <textarea id="c-message" name="message" placeholder="Please specify your project specifications, required quantities, target frequency band, and timeline..." required>${prefillMessage}</textarea>
                </div>

                <button type="submit" class="btn-relay-blue" style="width:100%;margin-top:var(--space-2);">
                  <i class="fa-solid fa-paper-plane"></i> Send Message to Engineering Team
                </button>
              </form>
            </div>

            <!-- ═══════════════════════════════════════════════════════════ -->
            <!-- FORM 2: ENGINEERING CAREERS & RECRUITING FORM               -->
            <!-- ═══════════════════════════════════════════════════════════ -->
            <div id="recruiting-form-panel" style="${isRecruiting ? 'display:block;' : 'display:none;'}">
              <div class="form-badge-recruiting">
                <i class="fa-solid fa-briefcase"></i> Talent Acquisition · Bengaluru &amp; Pan-India
              </div>
              <h3>Apply for an Engineering Career</h3>
              <p class="subtitle">Join ICON Electromatic's elite RF &amp; Microwave applications team. Fill out the application form below and our technical panel will review your profile.</p>

              <form id="recruiting-full-form">
                <!-- Row 1: Candidate Name & Email -->
                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="r-fullname">Full Name *</label>
                    <input type="text" id="r-fullname" name="fullname" placeholder="e.g. Vikram Sharma" required />
                  </div>
                  <div class="relay-field">
                    <label for="r-email">Email Address *</label>
                    <input type="email" id="r-email" name="email" placeholder="vikram.sharma@example.com" required />
                  </div>
                </div>

                <!-- Row 2: Position & Phone -->
                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="r-position">Position *</label>
                    <select id="r-position" name="position" required>
                      <option value="" disabled selected>Select Position...</option>
                      <option value="RF & Microwave Design Engineer (DC–110 GHz)">RF &amp; Microwave Design Engineer (DC – 110 GHz)</option>
                      <option value="Field Applications Engineer (FAE) - RF Components">Field Applications Engineer (FAE) – RF Components</option>
                      <option value="Technical Sales & OEM Account Manager">Technical Sales &amp; OEM Account Manager</option>
                      <option value="Radar, EW & SATCOM Systems Application Specialist">Radar, EW &amp; SATCOM Systems Application Specialist</option>
                      <option value="RF Lab Test & Measurement Specialist (VNA/Spectrum)">RF Lab Test &amp; Measurement Specialist (VNA/Spectrum)</option>
                      <option value="High-Frequency PCB & PTFE Substrates Specialist">High-Frequency PCB &amp; PTFE Substrates Specialist</option>
                      <option value="Graduate RF Engineering Trainee / Intern">Graduate RF Engineering Trainee / Intern</option>
                      <option value="Other Technical / Engineering Specialist">Other Technical / Engineering Role</option>
                    </select>
                  </div>
                  <div class="relay-field">
                    <label for="r-phone">Phone / Mobile Number *</label>
                    <input type="tel" id="r-phone" name="phone" placeholder="+91 98765 43210" required />
                  </div>
                </div>

                <!-- Row 3: Current Location & Experience Level -->
                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="r-city">Current Location / City *</label>
                    <input type="text" id="r-city" name="city" placeholder="e.g. Bengaluru, Hyderabad, Pune, Chennai" required />
                  </div>
                  <div class="relay-field">
                    <label for="r-experience">Total Experience *</label>
                    <select id="r-experience" name="experience" required>
                      <option value="" disabled selected>Select experience level...</option>
                      <option value="Fresh Graduate / Final Year (< 1 Year)">Fresh Graduate / Final Year (&lt; 1 Year)</option>
                      <option value="1 – 3 Years Experience">1 – 3 Years Experience</option>
                      <option value="3 – 5 Years (Mid-Level Engineer)">3 – 5 Years (Mid-Level Engineer)</option>
                      <option value="5 – 8 Years (Senior RF Specialist)">5 – 8 Years (Senior RF Specialist)</option>
                      <option value="8+ Years (Principal / Lead Engineer)">8+ Years (Principal / Lead Engineer)</option>
                    </select>
                  </div>
                </div>

                <!-- Row 4: Current Employer & Notice Period -->
                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="r-organization">Current Company or University *</label>
                    <input type="text" id="r-organization" name="organization" placeholder="e.g. BEL, DRDO, Astra Microwave, IISc, IIT" required />
                  </div>
                  <div class="relay-field">
                    <label for="r-notice">Notice Period / Earliest Availability *</label>
                    <select id="r-notice" name="notice" required>
                      <option value="Immediate / Less than 15 Days">Immediate / Less than 15 Days</option>
                      <option value="30 Days" selected>30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>
                </div>

                <!-- Row 5: Key Technical Skills & EDA Tools -->
                <div class="relay-field">
                  <label for="r-skills">Key Technical Skills &amp; RF EDA Tools *</label>
                  <input type="text" id="r-skills" name="skills" placeholder="e.g. Keysight ADS, Ansys HFSS, CST Microwave Studio, VNA S-Parameters, GaN Matching, Rogers RT/duroid" required />
                </div>

                <!-- Row 6: LinkedIn Profile & Resume Upload Dropzone -->
                <div class="relay-form-row">
                  <div class="relay-field">
                    <label for="r-linkedin">LinkedIn Profile or Online Portfolio</label>
                    <input type="url" id="r-linkedin" name="linkedin" placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div class="relay-field">
                    <label for="r-resume-file">Resume / Curriculum Vitae (PDF / DOCX) *</label>
                    <div class="resume-upload-box" id="resume-upload-dropzone">
                      <input type="file" id="r-resume-file" name="resume" accept=".pdf,.doc,.docx" class="resume-file-input" required />
                      <div class="resume-upload-content" id="resume-upload-content">
                        <i class="fa-solid fa-cloud-arrow-up resume-upload-icon"></i>
                        <span class="resume-upload-text" id="resume-upload-text">Click or drop resume file (PDF/DOCX, max 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Row 7: Candidate Cover Statement -->
                <div class="relay-field">
                  <label for="r-statement">Candidate Statement / Why ICON Electromatic? *</label>
                  <textarea id="r-statement" name="statement" placeholder="Briefly highlight your relevant RF, Microwave, or electronics experience, core projects, and why you are keen to join ICON Electromatic..." required></textarea>
                </div>

                <button type="submit" class="btn-relay-blue" style="width:100%;margin-top:var(--space-2);background:linear-gradient(135deg, var(--logo-blue), #1E40AF);">
                  <i class="fa-solid fa-briefcase"></i> Submit Engineering Application
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function initContactPage() {
  const inquiryTabBtn = document.getElementById('tab-btn-inquiry');
  const recruitingTabBtn = document.getElementById('tab-btn-recruiting');
  const inquiryPanel = document.getElementById('inquiry-form-panel');
  const recruitingPanel = document.getElementById('recruiting-form-panel');
  const inquiryInfoCol = document.getElementById('inquiry-info-column');
  const recruitingInfoCol = document.getElementById('recruiting-info-column');
  const breadcrumbActive = document.getElementById('contact-breadcrumb-active');
  const eyebrowText = document.getElementById('contact-eyebrow-text');
  const pageTitle = document.getElementById('contact-page-title');
  const pageLead = document.getElementById('contact-page-lead');

  // Form Elements
  const inquiryForm = document.getElementById('contact-full-form');
  const recruitingForm = document.getElementById('recruiting-full-form');
  const messageInput = document.getElementById('c-message');
  const subjectSelect = document.getElementById('c-subject');
  const modelInput = document.getElementById('c-model');
  const resumeInput = document.getElementById('r-resume-file');
  const resumeUploadText = document.getElementById('resume-upload-text');

  // Switch between Inquiry and Recruiting Tabs
  function switchTab(tab) {
    const isRecruiting = tab === 'recruiting';

    if (inquiryTabBtn && recruitingTabBtn) {
      inquiryTabBtn.classList.toggle('active', !isRecruiting);
      inquiryTabBtn.setAttribute('aria-selected', (!isRecruiting).toString());
      recruitingTabBtn.classList.toggle('active', isRecruiting);
      recruitingTabBtn.setAttribute('aria-selected', isRecruiting.toString());
    }

    if (inquiryPanel && recruitingPanel) {
      inquiryPanel.style.display = isRecruiting ? 'none' : 'block';
      recruitingPanel.style.display = isRecruiting ? 'block' : 'none';
    }

    if (inquiryInfoCol && recruitingInfoCol) {
      inquiryInfoCol.style.display = isRecruiting ? 'none' : 'block';
      recruitingInfoCol.style.display = isRecruiting ? 'block' : 'none';
    }

    if (breadcrumbActive) {
      breadcrumbActive.textContent = isRecruiting ? 'Careers & Recruiting' : 'Contact & RFQ';
    }

    if (eyebrowText) {
      eyebrowText.textContent = isRecruiting ? 'ICON TALENT ACQUISITION' : 'CONNECT WITH ENGINEERING';
    }

    if (pageTitle) {
      pageTitle.innerHTML = isRecruiting 
        ? 'Join India’s Foremost RF &amp; Microwave Engineering Hub' 
        : 'Send Us a Message &amp; Request Fast Quotes';
    }

    if (pageLead) {
      pageLead.textContent = isRecruiting 
        ? 'Accelerate your career in millimeter-wave technology, defense electronics, and satellite communications. Explore engineering opportunities at ICON Electromatic.' 
        : 'Whether you require component data sheets, custom waveguide machining, or volume pricing, our application engineering team in Bengaluru is ready to assist.';
    }
  }

  // Bind tab buttons
  if (inquiryTabBtn) {
    inquiryTabBtn.addEventListener('click', () => switchTab('inquiry'));
  }
  if (recruitingTabBtn) {
    recruitingTabBtn.addEventListener('click', () => switchTab('recruiting'));
  }

  // Resume File Upload feedback
  if (resumeInput && resumeUploadText) {
    resumeInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        resumeUploadText.innerHTML = `<strong style="color:var(--success);"><i class="fa-solid fa-file-check"></i> ${file.name}</strong> (${sizeMb} MB attached)`;
      } else {
        resumeUploadText.textContent = 'Click or drop resume file (PDF/DOCX, max 10MB)';
      }
    });
  }

  // Synchronize values from hash/search query params
  function syncFormFields() {
    const { subjectVal, targetModel, prefillMessage, activeTab } = getInquiryDetails();
    
    switchTab(activeTab);

    if (modelInput && targetModel) {
      modelInput.value = targetModel;
    }
    if (subjectSelect && subjectVal) {
      subjectSelect.value = subjectVal;
    }
    if (messageInput && prefillMessage && (!messageInput.value.trim() || messageInput.value.includes('Request for Quotation') || messageInput.value.includes('technical consultation'))) {
      messageInput.value = prefillMessage;
    }
  }

  syncFormFields();

  // Listen to hash changes while on contact page
  const handleHashSync = () => {
    if (window.location.hash.includes('/contact')) {
      syncFormFields();
    }
  };
  window.addEventListener('hashchange', handleHashSync);

  // Quick requirement presets for RFQ form
  document.querySelectorAll('.quick-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-preset');
      if (messageInput) {
        messageInput.value = q;
        messageInput.focus();
      }
    });
  });

  // Handle Inquiry Form Submission
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c-fullname').value || 'Customer';

      if (inquiryPanel) {
        inquiryPanel.innerHTML = `
          <div style="text-align:center;padding:var(--space-10) var(--space-4);">
            <div style="width:68px;height:68px;border-radius:50%;background:rgba(37,99,235,0.15);color:var(--logo-blue-light);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto var(--space-4);">
              <i class="fa-solid fa-check"></i>
            </div>
            <h3 style="font-size:1.5rem;font-weight:800;color:var(--text-white);margin-bottom:8px;">Thank You, ${name}!</h3>
            <p style="color:var(--text-gray-400);font-size:1rem;max-width:480px;margin:0 auto var(--space-6);line-height:1.6;">
              Your inquiry has been logged with ICON Electromatic Technical Dispatch.
            </p>
            <div>
              <button class="btn-relay-secondary" id="reset-inquiry-btn" style="padding:8px 18px;font-size:0.85rem;">
                <i class="fa-solid fa-rotate-left"></i> Send Another Inquiry
              </button>
            </div>
          </div>
        `;

        const resetBtn = document.getElementById('reset-inquiry-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }
    });
  }

  // Handle Recruiting Form Submission
  if (recruitingForm) {
    recruitingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const candName = document.getElementById('r-fullname').value || 'Candidate';
      const position = document.getElementById('r-position').value || 'Engineering Role';
      const candRefId = 'ICON-CAREER-' + Math.floor(100000 + Math.random() * 900000);

      if (recruitingPanel) {
        recruitingPanel.innerHTML = `
          <div style="text-align:center;padding:var(--space-10) var(--space-4);">
            <div style="width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.15);color:#34D399;display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto var(--space-4);border:1px solid rgba(16,185,129,0.3);">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <h3 style="font-size:1.6rem;font-weight:800;color:var(--text-white);margin-bottom:8px;">Application Received!</h3>
            <p style="color:var(--text-white);font-weight:600;font-size:1.05rem;margin-bottom:6px;">
              Thank you, ${candName}.
            </p>
            <p style="color:var(--text-gray-300);font-size:0.95rem;max-width:500px;margin:0 auto var(--space-4);line-height:1.6;">
              Your application for <strong style="color:var(--logo-blue-light);">${position}</strong> has been logged with our Technical Evaluation Committee and Talent Acquisition team in Bengaluru.
            </p>
            
            <div style="display:inline-block;padding:12px 24px;background:rgba(255,255,255,0.05);border:1px solid var(--border-card);border-radius:var(--radius-md);font-family:var(--font-display);font-size:0.95rem;color:var(--text-white);margin-bottom:var(--space-6);">
              Candidate Application ID: <span style="color:#34D399;font-weight:800;letter-spacing:1px;">${candRefId}</span>
            </div>

            <div style="max-width:440px;margin:0 auto var(--space-6);padding:14px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.25);border-radius:var(--radius-md);font-size:0.85rem;color:var(--text-gray-300);line-height:1.5;text-align:left;">
              <i class="fa-solid fa-circle-info" style="color:var(--logo-blue-light);margin-right:6px;"></i>
              <strong>Next Steps:</strong> Qualified candidates will be contacted within <strong>3 to 5 business days</strong> for an introductory technical discussion. For updates, quote your Candidate Application ID to <a href="mailto:careers@iconelectromatic.com" style="color:var(--logo-blue-light);">careers@iconelectromatic.com</a>.
            </div>

            <div>
              <button class="btn-relay-secondary" id="reset-recruiting-btn" style="padding:9px 20px;font-size:0.85rem;">
                <i class="fa-solid fa-rotate-left"></i> Submit Another Application
              </button>
            </div>
          </div>
        `;

        const resetBtn = document.getElementById('reset-recruiting-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }
    });
  }
}
