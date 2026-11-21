/**
 * OEM Technical Blogs, News, Videos & Resources Data — ICON ELECTROMATIC
 * Comprehensive engineering news, video releases, whitepapers, and official links
 * covering all 15 manufacturing partner OEMs.
 */
import { CATALOG } from '../../shared/catalogData.js';

export const OEM_BLOGS = [
  {
    oemId: 'rogers-corporation',
    officialWebsite: 'https://www.rogerscorp.com/advanced-electronics-solutions',
    portalName: 'Rogers AES Technology Center',
    headline: 'Advanced High-Frequency PTFE & Ceramic Substrates for Millimeter-Wave Radars',
    articles: [
      {
        id: 'rogers-art-1',
        title: 'Rogers Unveils Next-Gen RT/duroid® Formulations for 77–81 GHz Automotive Radars',
        date: 'September 2026',
        category: 'Materials Innovation',
        readTime: '5 min read',
        image: '/images/rf-laminate.jpg',
        summary: 'New micro-dispersion glass microfiber composites reduce dielectric loss tangent down to 0.0009 at 77 GHz while preserving dimensional stability across -55°C to +125°C automotive qualification cycles.',
        content: `
          <p>As commercial automotive radars transition to high-definition 77–81 GHz imaging architectures, dielectric consistency and low insertion loss have become fundamental design constraints. Rogers Corporation has announced enhanced RT/duroid® composite formulations specifically tailored for millimeter-wave antenna-in-package (AiP) and microstrip patch arrays.</p>
          <h4>Key Engineering Advantages:</h4>
          <ul>
            <li><strong>Dielectric Constant Tolerance:</strong> Tight Dk control of 2.20 ± 0.02 across the entire production lot, minimizing beam squint in phased array radar sensors.</li>
            <li><strong>Extremely Low Dissipation Factor:</strong> Tan δ of 0.0009 at 77 GHz ensures maximum transmit power efficiency and received signal-to-noise ratio (SNR).</li>
            <li><strong>Reverse-Treated Copper Foil:</strong> Ultralow surface roughness (Rq < 0.3 µm) eliminates conductor loss spikes typical in sub-THz frequency bands.</li>
          </ul>
          <p>ICON Electromatic stocks certified RT/duroid panels for defense radar, automotive prototyping, and satellite transceivers with complete lot traceability.</p>
        `,
        tags: ['77 GHz Radar', 'RT/duroid', 'PTFE Substrate', 'Automotive']
      },
      {
        id: 'rogers-art-2',
        title: 'RO4000® Series Evolution: Combining FR-4 Processing Simplicity with Millimeter-Wave Performance',
        date: 'August 2026',
        category: 'Manufacturing Guide',
        readTime: '4 min read',
        image: '/images/rf-microwave-pcb.jpg',
        summary: 'A technical review of RO4350B and RO4003C thermoset ceramic laminates enabling standard standard multi-layer PCB lamination without specialized plasma sodium treatment.',
        content: `
          <p>Traditional PTFE laminates require specialized sodium etching or plasma surface preparation prior to through-hole plating. Rogers RO4000® series thermoset hydrocarbon ceramic laminates overcome this hurdle, processing like standard FR-4 while delivering microwave electrical performance.</p>
          <h4>Fabrication & Electrical Highlights:</h4>
          <ul>
            <li>Compatible with automated surface-mount assembly and lead-free SAC305 reflow profiles up to 280°C.</li>
            <li>Low Z-axis coefficient of thermal expansion (CTE 31 ppm/°C) matches copper, preventing plated through-hole (PTH) barrel fatigue under severe thermal shock.</li>
            <li>Excellent thermal conductivity (0.62 W/m/K) provides efficient passive heat spreading under surface-mount power amplifiers.</li>
          </ul>
        `,
        tags: ['RO4350B', 'PCB Fabrication', 'Thermoset', 'High-Rel']
      }
    ],
    videos: [
      {
        id: 'rogers-vid-1',
        title: 'Dielectric Material Characterization at W-Band (75 to 110 GHz)',
        speaker: 'John Coonrod, Technical Marketing Director',
        duration: '18:40',
        date: 'October 2026',
        thumbnail: '/images/rf-laminate.jpg',
        summary: 'A technical webinar exploring cavity perturbation and split-post dielectric resonator methods for accurately extracting Dk and Df up to 110 GHz.',
        topics: ['Sub-THz Metrology', 'Skin Depth Effects', 'Microstrip Resonators']
      },
      {
        id: 'rogers-vid-2',
        title: 'Optimizing Microstrip-to-CPW Transitions on RT/duroid 5880',
        speaker: 'Dr. Allen Ward, Senior Application Specialist',
        duration: '14:15',
        date: 'July 2026',
        thumbnail: '/images/rf-microwave-pcb.jpg',
        summary: 'Step-by-step layout considerations for ground-coplanar waveguide (GCPW) feedlines to eliminate parasitic mode propagation in aerospace antennas.',
        topics: ['GCPW Transitions', 'Parasitic Modes', 'Via Stitching']
      }
    ],
    whitepapers: [
      {
        id: 'rogers-wp-1',
        title: 'Thermal Management Strategies for Multi-Layer High-Power RF Amplifiers',
        author: 'Rogers Corporation Advanced Electronics Lab',
        date: 'June 2026',
        pages: '16 Pages',
        frequencyBand: 'DC to 28 GHz',
        summary: 'Comparative analysis of copper backplane bonding, coin insertion, and high-conductivity TC-series laminates for high-power radar transmitters.',
        keyFindings: [
          'TC350 Plus reduces amplifier junction temperatures by up to 22°C vs conventional FR-4.',
          'Direct copper bonded (DCB) substrates eliminate thermal grease interface resistances.',
          'Continuous thermal rating up to 170°C for airborne radar pods.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Rogers AES Technology Center',
        url: 'https://www.rogerscorp.com/advanced-electronics-solutions',
        description: 'Access official Rogers design calculators, material property tables, and laminate selector guides.',
        icon: 'fa-globe'
      },
      {
        title: 'Rogers ROG RF Calculator Hub',
        url: 'https://www.rogerscorp.com/advanced-electronics-solutions/design-hub',
        description: 'Interactive microstrip and stripline impedance synthesis calculator with copper roughness modeling.',
        icon: 'fa-calculator'
      }
    ]
  },
  {
    oemId: 'qorvo',
    officialWebsite: 'https://www.qorvo.com',
    portalName: 'Qorvo Design & Engineering Hub',
    headline: 'High-Power GaN-on-SiC MMICs & Active Phased Array Beamforming ICs',
    articles: [
      {
        id: 'qorvo-art-uwb-hospital',
        title: 'How Qorvo UWB Technology Helps Hospitals Move Faster and Smarter',
        date: 'October 2026',
        category: 'Ultra-Wideband (UWB)',
        readTime: '5 min read',
        image: '/images/gan-power-chip.jpg',
        sourceUrl: 'https://www.qorvo.com/about/news-events/blogs/how-qorvo-uwb-technology-helps-hospitals-move-faster-and-smarter',
        summary: 'In modern clinical environments, ultra-wideband (UWB) real-time location systems (RTLS) locate critical medical equipment and track patient workflow with centimeter precision, unaffected by hospital RF noise or metallic reflections.',
        content: `
          <p>Hospitals are fast-paced environments where every second counts. Locating critical medical equipment—such as infusion pumps, crash carts, defibrillators, and mobile imaging units—can directly impact clinical response times and patient survival rates. Traditional RFID and standard Bluetooth Low Energy (BLE) tracking often produce multipath errors when signals bounce off stainless steel carts, metal beds, and diagnostic machines.</p>
          <p>Qorvo Ultra-Wideband (UWB) technology transforms healthcare operations by delivering centimeter-level indoor positioning accuracy through picosecond-resolution time-of-flight (ToF) RF impulse signals.</p>
          <h4>Key Healthcare Engineering Benefits:</h4>
          <ul>
            <li><strong>Centimeter-Level Real-Time Location:</strong> Pinpoint critical equipment and staff badges with sub-10 cm accuracy across complex hospital floorplans.</li>
            <li><strong>Immunity to Multipath Interference:</strong> Ultra-short UWB pulses are easily distinguished from reflections, ensuring reliable tracking in dense clinical rooms.</li>
            <li><strong>Safe Coexistence with Medical Telemetry:</strong> Operating across low power spectral densities (-41.3 dBm/MHz), UWB emissions do not interfere with sensitive diagnostic monitors or wireless telemetry.</li>
            <li><strong>Optimized Clinical Workflow:</strong> Automates maintenance scheduling, sanitization compliance tracking for surgical tools, and streamlined patient admission processes.</li>
          </ul>
          <p>Icon Electromatic is an authorized distributor and technical representative for Qorvo’s advanced wireless and RF solutions across India and Southeast Asia.</p>
        `,
        tags: ['UWB', 'Healthcare RTLS', 'Indoor Positioning', 'Qorvo Wireless', 'Asset Tracking']
      },
      {
        id: 'qorvo-art-1',
        title: 'Qorvo Launches 100W X-Band GaN Power Amplifier with >48% Power-Added Efficiency',
        date: 'September 2026',
        category: 'Semiconductor Breakthrough',
        readTime: '6 min read',
        image: '/images/gan-power-chip.jpg',
        summary: 'Targeting next-generation active electronically scanned arrays (AESA), Qorvo’s latest GaN-on-SiC MMIC provides 100W pulsed output power in an ultracompact surface-mount package.',
        content: `
          <p>Modern military radar and airborne surveillance payloads demand massive radiated RF power within strict thermal and size envelopes. Qorvo has unveiled its new generation of X-band (8.5 to 10.5 GHz) gallium nitride on silicon carbide (GaN-on-SiC) high-power amplifiers.</p>
          <h4>Key Performance Metrics:</h4>
          <ul>
            <li><strong>Saturated Output Power:</strong> Exceeds 50 dBm (100 Watts) across the full 8.5–10.5 GHz band under pulsed radar conditions.</li>
            <li><strong>Power-Added Efficiency (PAE):</strong> Greater than 48% at nominal bias, significantly reducing cooling payload requirements for phased array tiles.</li>
            <li><strong>Integrated Protection:</strong> Built-in gate pulse sequencing and RF power overdrive detectors ensure fail-safe operation in dense RF emitter environments.</li>
          </ul>
        `,
        tags: ['X-Band Radar', 'GaN MMIC', 'AESA', 'Defense']
      },
      {
        id: 'qorvo-art-2',
        title: 'Dual-Polarization Ka-Band Beamforming ICs Revolutionize LEO Satellite Terminals',
        date: 'August 2026',
        category: 'SATCOM Innovation',
        readTime: '5 min read',
        image: '/images/gan-power-chip.jpg',
        summary: 'Qorvo integrated 8-channel transmit/receive beamformers with 6-bit phase and 6-bit amplitude control, enabling dynamic satellite tracking without mechanical gimbals.',
        content: `
          <p>Low-Earth-Orbit (LEO) satellite communications require electronically steered phased arrays capable of maintaining multi-gigabit user links across rapid orbital overhead passes. Qorvo’s Ka-band beamforming ASICs integrate bidirectional amplifiers, phase shifters, and attenuators into a single monolithic die.</p>
        `,
        tags: ['Ka-Band', 'Beamforming', 'LEO Satellites', 'Phased Array']
      }
    ],
    videos: [
      {
        id: 'qorvo-vid-1',
        title: 'Thermal Modeling & Pulsed Biasing for GaN-on-SiC Power Amplifiers',
        speaker: 'David Aichele, VP Defense & Aerospace Solutions',
        duration: '22:10',
        date: 'September 2026',
        thumbnail: '/images/gan-power-chip.jpg',
        summary: 'Critical electrical considerations for drain voltage pulsing, thermal time constants, and transient load line stability in high-power radar transmitters.',
        topics: ['Pulsed Radar Biasing', 'Thermal Resistance Rth', 'VSWR Tolerance']
      },
      {
        id: 'qorvo-vid-2',
        title: 'Integrating 16-Channel Core Chips into Flat-Panel Phased Arrays',
        speaker: 'Dr. Michael Chen, Principal Systems Architect',
        duration: '16:50',
        date: 'July 2026',
        thumbnail: '/images/gan-power-chip.jpg',
        summary: 'Architecture overview of tile-based active phased arrays utilizing SPI control and calibrated beam tables.',
        topics: ['Tile Arrays', 'SPI Digital Control', 'Phase Calibration']
      }
    ],
    whitepapers: [
      {
        id: 'qorvo-wp-1',
        title: 'Optimizing Efficiency and Linearity in Wideband GaN Power Amplifiers',
        author: 'Qorvo Advanced Defense Applications Group',
        date: 'May 2026',
        pages: '20 Pages',
        frequencyBand: '2.0 to 18.0 GHz',
        summary: 'Harmonic termination networks and digital predistortion (DPD) co-design methodologies for multi-octave electronic warfare transmitters.',
        keyFindings: [
          'Second and third harmonic tuning enhances PAE by 12% across multi-octave bandwidths.',
          'GaN-on-SiC demonstrates 5x higher power density compared to equivalent GaAs pHEMT devices.',
          'MTTF exceeds 10^7 hours at 200°C channel junction temperatures.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Qorvo Official Technical Hub',
        url: 'https://www.qorvo.com/design-hub',
        description: 'Explore S-parameter downloads, nonlinear large-signal models, and evaluation board user manuals.',
        icon: 'fa-microchip'
      },
      {
        title: 'Qorvo MatchCalc Impedance Matching Tool',
        url: 'https://www.qorvo.com/design-hub/design-tools/matchcalc',
        description: 'Interactive Smith chart synthesis tool for discrete and distributed RF matching networks.',
        icon: 'fa-chart-line'
      }
    ]
  },
  {
    oemId: 'minicircuits',
    officialWebsite: 'https://www.minicircuits.com',
    portalName: 'Mini-Circuits Technical Portal',
    headline: 'Precision RF, Microwave & Millimeter-Wave Components DC to 100 GHz',
    articles: [
      {
        id: 'mini-art-thin-film-filters',
        title: 'Thin-Film Filters: Standard & Custom Designs for High-Frequency Systems',
        date: 'September 2026',
        category: 'Filter Technology',
        readTime: '5 min read',
        image: '/images/rf-filter.jpg',
        sourceUrl: 'https://blog.minicircuits.com/thin-film-filters-standard-custom-designs/',
        summary: 'Mini-Circuits thin-film filter technology on precision ceramic substrates delivers high selectivity, low insertion loss, and miniature footprints for wideband aerospace, defense, and millimeter-wave wireless designs.',
        content: `
          <p>As microwave and millimeter-wave communication systems push higher in frequency and tighter in footprint, traditional lumped-element LC filters face physical limitations due to parasitic component interactions. Mini-Circuits thin-film filter technology utilizes photolithographic precision on high-dielectric alumina and titanate substrates to fabricate high-order bandpass, highpass, and lowpass filter networks.</p>
          <h4>Thin-Film Filter Advantages:</h4>
          <ul>
            <li><strong>Sub-Millimeter Package Footprints:</strong> Monolithic thin-film construction enables compact surface-mount footprints down to 0805 and 0603 case sizes.</li>
            <li><strong>Exceptional Passband Consistency:</strong> Photolithography achieves line-width tolerances below 1 micron, delivering predictable filter response and high rejection up to 40+ GHz.</li>
            <li><strong>High Power & Temperature Stability:</strong> Inorganic ceramic substrates ensure thermal expansion matches adjacent GaAs/GaN MMICs with minimal frequency drift over -55°C to +125°C.</li>
            <li><strong>Custom Design Flexibility:</strong> Rapid custom synthesis for specialized passbands, steep skirts, and harmonic rejection in satellite and radar front-ends.</li>
          </ul>
          <p>Icon Electromatic provides engineers with direct access to Mini-Circuits catalog inventory, S-parameters, evaluation boards, and custom synthesis support.</p>
        `,
        tags: ['Thin-Film Filters', 'Mini-Circuits', 'Ceramic Substrates', 'Microwave Filters', 'Bandpass']
      },
      {
        id: 'mini-art-1',
        title: 'Mini-Circuits Expands Ultra-Wideband Connectorized Amplifiers Covering 0.5 to 40 GHz',
        date: 'September 2026',
        category: 'Product Release',
        readTime: '4 min read',
        image: '/images/rf-filter.jpg',
        summary: 'New ZX60 and ZVE series instrumentation-grade amplifiers deliver +22 dBm P1dB, low 2.8 dB noise figure, and hermetic ruggedized packaging for lab and field telemetry.',
        content: `
          <p>Mini-Circuits has announced the latest additions to its field-proven coaxial amplifier portfolio. Incorporating proprietary GaAs and GaN MMIC designs, these plug-and-play modules streamline test benches and military comms testing.</p>
        `,
        tags: ['Wideband Amplifier', 'Test Bench', 'Coaxial', 'Instrumentation']
      }
    ],
    videos: [
      {
        id: 'mini-vid-1',
        title: 'Understanding Linearity & IP3 in Wideband Frequency Mixers',
        speaker: 'Mini-Circuits Applications Engineering Group',
        duration: '19:30',
        date: 'August 2026',
        thumbnail: '/images/rf-filter.jpg',
        summary: 'A deep-dive tutorial explaining two-tone intermodulation distortion, LO drive optimization, and balance topologies in double-balanced diode mixers.',
        topics: ['Mixer Linearity', 'IIP3 Optimization', 'Spur Charts']
      }
    ],
    whitepapers: [
      {
        id: 'mini-wp-1',
        title: 'High-Rejection Miniature Cavity Filter Design Techniques',
        author: 'Mini-Circuits Filter Solutions Division',
        date: 'May 2026',
        pages: '14 Pages',
        frequencyBand: '1 to 20 GHz',
        summary: 'Addressing thermal drift and insertion loss trade-offs in sub-miniature combline and interdigital cavity filters.',
        keyFindings: [
          'Invar temperature compensation keeps center frequency drift under 5 ppm/°C.',
          'Silver plating thickness of 5 skin depths yields insertion loss < 0.8 dB at 10 GHz.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Mini-Circuits Official Component Search',
        url: 'https://www.minicircuits.com',
        description: 'Comprehensive parametric search engine covering over 10,000 RF/microwave catalog components.',
        icon: 'fa-magnifying-glass'
      }
    ]
  },
  {
    oemId: 'ohmega-ticer',
    officialWebsite: 'https://www.ohmega.com',
    portalName: 'Ohmega Ticer Thin Film Technology Center',
    headline: 'Embedded Thin-Film Resistor Foils for High-Density Multi-Layer PCBs',
    articles: [
      {
        id: 'ohmega-art-embedded-resistor-guide',
        title: 'Embedded Thin-Film Resistor Technology: Design & PCB Processing Guide',
        date: 'October 2026',
        category: 'Embedded Passives',
        readTime: '5 min read',
        image: '/images/rf-microwave-pcb.jpg',
        sourceUrl: 'https://ohmegaticer.com/wp-content/uploads/EmbeddedResistorBrochure_v4.pdf',
        summary: 'OhmegaPly® and TCR® nickel-phosphorus thin-film embedded resistor foils eliminate surface-mount chip resistors, freeing up critical PCB surface area and eliminating parasitic inductance up to 50+ GHz.',
        content: `
          <p>As aerospace avionics, radar digital backplanes, and high-speed computing designs demand higher component density, surface-mount chip resistors consume valuable board real estate and introduce parasitic solder joint inductances that distort high-speed signals. Quantic Ohmega-Ticer thin-film technology enables resistors to be embedded directly inside internal PCB copper layers.</p>
          <p>This comprehensive technical guide outlines the electrical advantages, subtractive chemical etching processes, and CAD design guidelines for OhmegaPly® and TCR® resistor-conductor materials.</p>
          <h4>Key Engineering Advantages:</h4>
          <ul>
            <li><strong>100% Surface Real Estate Recovery:</strong> Moves pull-up, pull-down, and termination resistors into internal layers, allowing active ICs to be packed closer together.</li>
            <li><strong>Near-Zero Parasitic Inductance:</strong> Planar thin-film geometry eliminates component leads and solder barrels, preserving clean eye diagrams in 112 Gbps SerDes lines.</li>
            <li><strong>Extreme Thermal & Vibration Reliability:</strong> No solder joints to crack under severe MIL-STD thermal shock or aerospace airframe vibration.</li>
            <li><strong>Precision Laser Trimming:</strong> Resistors can be laser-trimmed to ±1% tolerance through opened prepreg windows prior to final multi-layer lamination.</li>
          </ul>
          <p>Icon Electromatic supplies genuine Ohmega-Ticer resistor foils and provides engineering support for PCB fabricators across the region.</p>
        `,
        tags: ['Ohmega-Ticer', 'Embedded Resistors', 'OhmegaPly', 'TCR Foil', 'PCB Signal Integrity']
      },
      {
        id: 'ohmega-art-1',
        title: 'OhmegaPly® RCM Foils Eliminate Surface Resistors in 100 Gbps High-Speed Backplanes',
        date: 'September 2026',
        category: 'Embedded Passives',
        readTime: '5 min read',
        image: '/images/rf-microwave-pcb.jpg',
        summary: 'By embedding thin-film nickel-phosphorous resistors directly into internal PCB copper layers, parasitic inductance is reduced to near zero, enabling pristine digital eye diagrams.',
        content: `
          <p>Surface-mount chip resistors introduce substantial solder joint parasitic capacitance and lead inductance that degrade signal integrity in high-speed PAM4 and 112G SerDes channels. OhmegaPly® RCM (Resistor-Conductor-Material) allows resistors to be etched internally on planar copper foils, clearing top-layer routing space.</p>
        `,
        tags: ['Embedded Resistors', 'Thin Film', 'High-Speed Digital', 'Signal Integrity']
      }
    ],
    videos: [
      {
        id: 'ohmega-vid-1',
        title: 'Fabricating Embedded Thin Film Resistors: PCB Etch Process Walkthrough',
        speaker: 'Bruce Mahler, VP Engineering',
        duration: '17:10',
        date: 'June 2026',
        thumbnail: '/images/rf-microwave-pcb.jpg',
        summary: 'Detailed chemical etch chemistries and laser trimming procedures for achieving ±1% tolerance on internal PCB embedded resistors.',
        topics: ['PCB Processing', 'Laser Trimming', 'Differential Etching']
      }
    ],
    whitepapers: [
      {
        id: 'ohmega-wp-1',
        title: 'Reliability and Power Handling of Embedded Resistor Foils under Thermal Shock',
        author: 'Ohmega Ticer Reliability Laboratories',
        date: 'April 2026',
        pages: '15 Pages',
        frequencyBand: 'DC to 50 GHz',
        summary: 'Military qualification testing validating OhmegaPly foils through 2,000 cycles of thermal shock (-65°C to +150°C) without resistance drift.',
        keyFindings: [
          'Resistance change under 0.25% after 2,000 MIL-STD-202 Method 107 cycles.',
          'Zero wire bonds or solder joints to fatigue in high-vibration aerospace avionics.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Ohmega Technologies Official Design Portal',
        url: 'https://www.ohmega.com/technical-information/',
        description: 'Design rules, CAD layout footprints, and chemical processing guidelines for embedded resistor foils.',
        icon: 'fa-file-lines'
      }
    ]
  },
  {
    oemId: 'rfuw-engineering',
    officialWebsite: 'https://www.rfuw-engineering.com',
    portalName: 'RFuW High-Power Protection Lab',
    headline: 'High-Power Surface-Mount SMT PIN Diode Limiters & High-Isolation Switches',
    articles: [
      {
        id: 'rfuw-art-sma-limiters',
        title: 'RFuW Engineering Unveils High-Power SMA Connectorized Receiver Protectors',
        date: 'October 2026',
        category: 'Receiver Protection',
        readTime: '4 min read',
        image: '/images/gan-power-chip.jpg',
        sourceUrl: 'https://rfuw-engineering.com/PDF/16%20Oct%202021%20Press%20Release%20-%20SMA%20Connectorized%20Limiters.pdf',
        summary: 'RFuW Engineering introduces coaxial SMA connectorized receiver protectors capable of surviving up to 1 kW peak pulsed RF power while clamping flat leakage below +15 dBm to protect sensitive low-noise amplifiers (LNAs).',
        content: `
          <p>High-power radar systems, co-site military communications, and electronic countermeasure (ECM) environments subject sensitive receiver front-ends to extreme RF power levels. Without adequate limiting, high-power incoming pulses will instantly destroy input stage Low Noise Amplifiers (LNAs).</p>
          <p>RFuW Engineering has announced its new family of coaxial SMA connectorized receiver protectors, delivering plug-and-play high-power protection without requiring specialized surface-mount PCB redesigns.</p>
          <h4>Key Performance Specifications:</h4>
          <ul>
            <li><strong>Extreme Power Handling:</strong> Rated to survive up to 1 kW peak RF power (1 microsecond pulse width, 5% duty cycle) and up to 100W continuous wave (CW).</li>
            <li><strong>Ultra-Low Insertion Loss:</strong> Insertion loss typically &lt; 0.6 dB across the operating band, preserving receiver noise figure and sensitivity.</li>
            <li><strong>Sub-Nanosecond Turn-On:</strong> Fast PIN-Schottky diode limiting stage clamps destructive spike leakage energy before it reaches the LNA input.</li>
            <li><strong>Rugged Coaxial Enclosure:</strong> Hermetically sealed aluminum and passivated stainless steel SMA connectors certified to MIL-STD-202 environmental tests.</li>
          </ul>
          <p>Icon Electromatic distributes RFuW Engineering limiters, switches, and custom receiver protector modules for defense and aerospace programs.</p>
        `,
        tags: ['RFuW Engineering', 'Receiver Protector', 'PIN Diode Limiter', 'SMA Connector', 'Radar Front-End']
      },
      {
        id: 'rfuw-art-1',
        title: 'RFuW Releases 100W SMT Limiter Series Protecting Sensitive LNAs up to 18 GHz',
        date: 'August 2026',
        category: 'RF Protection',
        readTime: '4 min read',
        image: '/images/gan-power-chip.jpg',
        summary: 'MSL1 surface-mount limiters withstand continuous 100W CW power and 500W peak pulsed power while clamping flat leakage below +13 dBm to safeguard sensitive receiver front-ends.',
        content: `
          <p>Radar receiver protection requires instantaneous clamping when exposed to co-site transmitter leakage or external electronic countermeasure (ECM) pulses. RFuW Engineering’s multi-stage diode limiters eliminate bulky coaxial hardware with tiny SMT quad-flat packages.</p>
        `,
        tags: ['Receiver Protection', 'PIN Diode', 'LNA Limiter', 'SMT']
      }
    ],
    videos: [
      {
        id: 'rfuw-vid-1',
        title: 'Radar Receiver Protection: Spike Leakage vs Flat Leakage Explained',
        speaker: 'Tim Gallic, Principal Applications Engineer',
        duration: '14:40',
        date: 'May 2026',
        thumbnail: '/images/gan-power-chip.jpg',
        summary: 'Laboratory oscilloscope captures demonstrating sub-nanosecond recovery time and spike leakage energy mitigation during 1kW radar pulse events.',
        topics: ['Spike Leakage', 'Recovery Time', 'Co-Site Blinding']
      }
    ],
    whitepapers: [
      {
        id: 'rfuw-wp-1',
        title: 'High-Power SMT PIN Diode Switches for Tactical Military Communications',
        author: 'RFuW Applications Group',
        date: 'March 2026',
        pages: '11 Pages',
        frequencyBand: '20 MHz to 6.0 GHz',
        summary: 'Engineering analysis of cold-switching vs hot-switching power capabilities in SP2T and SP4T symmetrical diode topologies.',
        keyFindings: [
          'Isolation exceeds 50 dB at 2 GHz in a 4x4 mm ceramic QFN package.',
          'Integrated DC blocking capacitors prevent accidental ground bias shorting.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'RFuW Engineering Official Site',
        url: 'https://www.rfuw-engineering.com',
        description: 'Datasheets and SMT PCB layout Gerber footprints for high-power limiters and RF switches.',
        icon: 'fa-shield-halved'
      }
    ]
  },
  {
    oemId: 'triteq',
    officialWebsite: 'https://www.triteq.com',
    portalName: 'Tri-TeQ Filter Solutions Hub',
    headline: 'Harmonic Switched Filters & Tactical Frequency Hopping Comms',
    articles: [
      {
        id: 'triteq-art-1',
        title: 'Tri-TeQ Unveils Fast-Hopping Harmonic Filter Banks for Software-Defined Tactical Transceivers',
        date: 'July 2026',
        category: 'Tactical Hardware',
        readTime: '5 min read',
        image: '/images/rf-filter.jpg',
        summary: 'Sub-microsecond switched harmonic filter banks suppress second and third order harmonics by >50 dB across 30–512 MHz tactical VHF/UHF frequency bands.',
        content: `
          <p>Tactical military communications utilize rapid frequency hopping to resist electronic jamming. Tri-TeQ’s digitally controlled harmonic filter units switch between pre-tuned bandpass channels in under 500 nanoseconds, maintaining compliance with MIL-STD-188 harmonics standards.</p>
        `,
        tags: ['Harmonic Filter', 'Frequency Hopping', 'Tactical Radio', 'VHF/UHF']
      }
    ],
    videos: [
      {
        id: 'triteq-vid-1',
        title: 'Bench Test: Harmonic Rejection During 10,000 Hops/sec Tactical Transmission',
        speaker: 'Tri-TeQ Defense Systems Team',
        duration: '11:20',
        date: 'April 2026',
        thumbnail: '/images/rf-filter.jpg',
        summary: 'Real-time spectrum analyzer demonstration showing clean harmonic suppression during extreme frequency agile transmissions.',
        topics: ['Frequency Agile', 'Harmonic Suppression', 'Transient Settling']
      }
    ],
    whitepapers: [
      {
        id: 'triteq-wp-1',
        title: 'Co-Site Interference Cancellation Using Digitally Tuned Harmonic Filters',
        author: 'Tri-TeQ Engineering Division',
        date: 'January 2026',
        pages: '10 Pages',
        frequencyBand: '30 MHz to 2.5 GHz',
        summary: 'Methodology for operating multiple high-power tactical transmitters simultaneously on naval masts without intermodulation receiver desensitization.',
        keyFindings: [
          'Insertion loss under 1.2 dB across active passband preserves transmit power efficiency.',
          'Hermetically sealed enclosure compliant with MIL-STD-810G immersion standards.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Tri-TeQ Engineering Official Portal',
        url: 'https://www.triteq.com',
        description: 'Custom harmonic filter specifications and military tactical communication solutions.',
        icon: 'fa-tower-broadcast'
      }
    ]
  },
  {
    oemId: 'yttek',
    officialWebsite: 'https://www.yttek.com',
    portalName: 'YTTEK Software Defined Radio Center',
    headline: 'Ultra-Wideband Software Defined Radios (HyperSDR) for EW & 5G/6G Research',
    articles: [
      {
        id: 'yttek-art-hypersdr-gsaas',
        title: 'Targeting Growing GSaaS Market: YTTEK Unveils HyperSDR Modem for Satellite Ground Stations',
        date: 'October 2026',
        category: 'Software-Defined Radio',
        readTime: '5 min read',
        image: '/images/rf-microwave-pcb.jpg',
        sourceUrl: 'https://yttek.com/targeting-growing-gsaas-market-yttek-unveils-hypersdr-modem-to-simplify-satellite-ground-station-deployment/',
        summary: 'YTTEK’s HyperSDR modem leverages reconfigurable FPGA digital signal processing to enable multi-orbit, multi-band satellite ground stations with low capital cost and seamless cloud GSaaS integration.',
        content: `
          <p>The exponential growth of Low-Earth Orbit (LEO) satellite constellations has created surging demand for flexible Ground-Station-as-a-Service (GSaaS) infrastructure. Traditional satellite ground stations required dedicated hardware modems for each frequency band and modulation standard, driving up capital deployment expenses.</p>
          <p>YTTEK has launched the HyperSDR Modem, a software-defined satellite communications modem engineered specifically to simplify ground station architecture and accelerate cloud GSaaS deployment.</p>
          <h4>Platform Highlights:</h4>
          <ul>
            <li><strong>Reconfigurable Multi-Band Operation:</strong> Full digital coverage supporting telemetry, tracking, and control (TT&C) across UHF, S, C, X, Ku, and Ka bands.</li>
            <li><strong>High-Throughput Digital Demodulation:</strong> Advanced FPGA acceleration supports DVB-S2X, CCSDS, and custom waveform demodulation at multi-gigabit data rates.</li>
            <li><strong>VITA 49 / Cloud Native Streaming:</strong> Compliant with digital IF standards for low-latency streaming directly to cloud data centers and virtualized processing pipelines.</li>
            <li><strong>Reduced Infrastructure TCO:</strong> A single HyperSDR rack replaces multiple legacy chassis, cutting ground terminal deployment time from months to weeks.</li>
          </ul>
          <p>Icon Electromatic is the authorized regional partner for YTTEK software-defined radio hardware, development kits, and satellite communication transceivers.</p>
        `,
        tags: ['YTTEK', 'HyperSDR', 'GSaaS', 'Satellite Modem', 'Software Defined Radio']
      },
      {
        id: 'yttek-art-1',
        title: 'HyperSDR 4x4 Transceiver Platform Reaches 100 kHz to 18 GHz Instantaneous Coverage',
        date: 'August 2026',
        category: 'SDR Hardware',
        readTime: '6 min read',
        image: '/images/rf-microwave-pcb.jpg',
        summary: 'Featuring onboard Xilinx Ultrascale+ RFSoC and direct RF sampling converters, HyperSDR enables instantaneous spectrum monitoring and multi-channel beamforming experimentation.',
        content: `
          <p>Traditional SDRs rely on multi-stage analog downconversion that introduces phase imbalances and local oscillator leakage. YTTEK’s HyperSDR platform integrates 14-bit ADCs and DACs operating directly up to 18 GHz, streamlining electronic warfare (EW) and cognitive radio development.</p>
        `,
        tags: ['HyperSDR', 'RFSoC', 'Direct RF Sampling', 'Electronic Warfare']
      }
    ],
    videos: [
      {
        id: 'yttek-vid-1',
        title: 'HyperSDR Live Demo: 1 GHz Real-Time Spectrum Recording & Playback',
        speaker: 'YTTEK System Applications Group',
        duration: '16:05',
        date: 'July 2026',
        thumbnail: '/images/rf-microwave-pcb.jpg',
        summary: 'Demonstrating 100 GbE streaming of raw I/Q samples to NVMe storage arrays with zero dropped samples during radar emitter simulation.',
        topics: ['I/Q Recording', '100 GbE Streaming', 'FPGA Processing']
      }
    ],
    whitepapers: [
      {
        id: 'yttek-wp-1',
        title: 'Phase-Coherent Multi-Channel Calibration for 5G FR2 & 6G Testbeds',
        author: 'YTTEK Advanced Wireless Lab',
        date: 'February 2026',
        pages: '18 Pages',
        frequencyBand: '100 kHz to 44 GHz',
        summary: 'Digital calibration techniques ensuring sub-degree phase synchronization across 32 synchronized HyperSDR transceivers.',
        keyFindings: [
          'Inter-channel phase jitter measured below 120 femtoseconds RMS.',
          'Full API compatibility with GNU Radio, MATLAB, and custom C++ pipelines.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'YTTEK Official Product & SDK Portal',
        url: 'https://www.yttek.com',
        description: 'Software-defined radio firmware downloads, API documentation, and RFSoC tutorials.',
        icon: 'fa-satellite-dish'
      }
    ]
  },
  {
    oemId: 'thermosen',
    officialWebsite: 'https://www.thermosen.com',
    portalName: 'Thermosen Sensor Labs',
    headline: 'High-Precision Temperature Sensors for High-Reliability RF Systems',
    articles: [
      {
        id: 'thermosen-art-choose-sensor',
        title: 'Engineering Guide: How to Choose the Right Industrial Temperature Sensor',
        date: 'October 2026',
        category: 'Industrial Sensors',
        readTime: '5 min read',
        image: '/images/gan-power-chip.jpg',
        sourceUrl: 'https://thermosen.in/how-to-choose-the-right-industrial-temperature-sensor/',
        summary: 'Selecting between RTDs, thermocouples, and thermistors requires evaluating temperature range, measurement accuracy, response time, sheath metallurgy, and mechanical vibration resistance in demanding process environments.',
        content: `
          <p>Temperature measurement is one of the most critical sensory inputs across industrial manufacturing, chemical processing, power generation, and aerospace defense testing. However, choosing the incorrect sensor type can result in calibration drift, slow response times, or premature failure under thermal cycling.</p>
          <p>This engineering guide from Thermosen Technologies provides a structured framework for selecting the optimal sensing technology for demanding operating conditions.</p>
          <h4>Selection Criteria Summary:</h4>
          <ul>
            <li><strong>Platinum RTDs (Pt100 / Pt1000):</strong> Best for high precision (±0.05°C) across -200°C to +600°C, offering exceptional linearity and long-term repeatability.</li>
            <li><strong>Thermocouples (Type K, N, J, R, S, B):</strong> Ideal for extreme temperatures up to 1800°C, rugged mechanical durability, and fast point-contact thermal response.</li>
            <li><strong>Thermistors (NTC/PTC):</strong> High sensitivity across narrow temperature spans (-50°C to +150°C), ideal for medical devices and electronic module monitoring.</li>
            <li><strong>Sheath Metallurgy &amp; Insulation:</strong> Inconel 600, 316L Stainless Steel, and compacted mineral insulation (MgO) engineered for corrosive and high-vibration installations.</li>
          </ul>
          <p>Icon Electromatic partners with Thermosen to deliver calibrated, industrial-grade RTDs and thermocouple assemblies with traceable test certifications.</p>
        `,
        tags: ['Thermosen', 'Temperature Sensors', 'RTD Pt100', 'Thermocouples', 'Industrial Automation']
      },
      {
        id: 'thermosen-art-1',
        title: 'Thermosen Miniaturized Platinum RTD Sensors Provide 0.05°C Precision in GaN Thermal Feedback',
        date: 'June 2026',
        category: 'Sensors & Telemetry',
        readTime: '3 min read',
        image: '/images/gan-power-chip.jpg',
        summary: 'Micro-footprint SMD resistance temperature detectors (RTDs) mounted directly adjacent to GaN amplifier MMICs provide real-time junction temperature tracking.',
        content: `
          <p>Proper thermal protection of GaN MMICs requires sensing temperatures within millimeters of active device gates. Thermosen’s platinum thin-film sensors withstand reflow temperatures up to 350°C and maintain linear accuracy across -70°C to +300°C.</p>
        `,
        tags: ['RTD Sensor', 'Thermal Feedback', 'GaN Protection', 'Precision Sensing']
      }
    ],
    videos: [
      {
        id: 'thermosen-vid-1',
        title: 'Real-Time Dynamic Thermal Throttling for Phased Array Transmit Modules',
        speaker: 'Thermosen Engineering Team',
        duration: '10:45',
        date: 'February 2026',
        thumbnail: '/images/gan-power-chip.jpg',
        summary: 'Live telemetry tracking amplifier heatsink temperatures during continuous wave radar transmission at maximum duty cycle.',
        topics: ['Closed-Loop Throttling', 'Platinum RTD', 'Reliability']
      }
    ],
    whitepapers: [
      {
        id: 'thermosen-wp-1',
        title: 'Cryogenic to High-Temperature Sensor Performance in Satellite Telemetry',
        author: 'Thermosen Reliability Team',
        date: 'January 2026',
        pages: '9 Pages',
        frequencyBand: 'Telemetry DC',
        summary: 'Space qualification data certifying thin-film platinum elements under deep-space thermal vacuum cycling.',
        keyFindings: [
          'Zero resistance hysteresis observed after 1,000 thermal cycles between -196°C and +200°C.',
          'Non-magnetic construction prevents magnetic field distortions in scientific space payloads.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Thermosen Official Technology Portal',
        url: 'https://www.thermosen.com',
        description: 'Explore platinum RTD sensor specs, cryogenic probes, and temperature telemetry systems.',
        icon: 'fa-temperature-half'
      }
    ]
  },
  {
    oemId: 'tecdia',
    officialWebsite: 'https://www.tecdia.com',
    portalName: 'TecDia Precision Microelectronics Center',
    headline: 'Single Layer Ceramic Capacitors, Thin-Film Substrates & Precision Diamond Tools',
    articles: [
      {
        id: 'tecdia-art-hf-publications',
        title: 'Tecdia High-Frequency Publications: Single-Layer Capacitors & Sub-THz Components',
        date: 'October 2026',
        category: 'Precision Microelectronics',
        readTime: '4 min read',
        image: '/images/gan-power-chip.jpg',
        sourceUrl: 'https://us.tecdia.com/products/hf/detail/publications/#',
        summary: 'Tecdia technical publications explore dielectric formulation, resonance suppression, and wire-bonding reliability in single-layer ceramic capacitors (SLCs) and mmWave ground blocks operating up to 110 GHz.',
        content: `
          <p>In microwave and millimeter-wave integrated circuits, standard multi-layer ceramic capacitors suffer from internal lead inductance that creates unwanted self-resonance below operating frequencies. Tecdia’s published research details the engineering methodology behind ultra-high-frequency single-layer ceramic capacitors (SLCs) and precision substrate machining.</p>
          <h4>Technical Findings &amp; Capabilities:</h4>
          <ul>
            <li><strong>High Dielectric Constant Formulations:</strong> Proprietary class I and class II dielectric materials manufactured with nanometer surface flatness.</li>
            <li><strong>Parasitic Resonance Beyond 100 GHz:</strong> Monolithic single-layer architecture eliminates internal multi-plate inductances, maintaining pure capacitive behavior into W-band.</li>
            <li><strong>Wire-Bonding Metallization:</strong> TiW/Au and TiW/Pt/Au metallization options optimized for wedge and ball bonding with high shear strength and zero micro-cracking.</li>
            <li><strong>Precision mmWave Ground Blocks:</strong> Engineered ground return paths minimizing parasitic inductance in high-power GaN and GaAs die attach assemblies.</li>
          </ul>
          <p>Icon Electromatic offers Tecdia precision microelectronics components across India and ASEAN regions with engineering consultation.</p>
        `,
        tags: ['Tecdia', 'Single-Layer Capacitors', 'Sub-THz', 'Wire Bonding', 'Microwave Passives']
      },
      {
        id: 'tecdia-art-1',
        title: 'TecDia Introduces Sub-THz Single Layer Capacitors with Self-Resonance Above 60 GHz',
        date: 'July 2026',
        category: 'Passive Components',
        readTime: '4 min read',
        image: '/images/gan-power-chip.jpg',
        summary: 'Custom high-dielectric ceramics with gold wire-bondable terminations eliminate multi-layer parasitic resonances, providing ultra-clean DC bypass up to E-band.',
        content: `
          <p>Traditional multi-layer ceramic capacitors (MLCC) exhibit self-resonant frequencies below 10 GHz due to internal electrode geometry. TecDia single-layer capacitors (SLC) utilize polished monolithic dielectric blocks that push parasitic resonance out past 60 GHz for mmWave MMIC biasing.</p>
        `,
        tags: ['Single Layer Capacitor', 'DC Bypass', 'Wire Bonding', 'Sub-THz']
      }
    ],
    videos: [
      {
        id: 'tecdia-vid-1',
        title: 'Wire Bonding Techniques for Single Layer Capacitors in Microwave Modules',
        speaker: 'TecDia Assembly Engineering Group',
        duration: '12:15',
        date: 'April 2026',
        thumbnail: '/images/gan-power-chip.jpg',
        summary: 'Practical tips for wedge and ball bonding gold ribbon leads to gold metallized pads without dielectric micro-cracking.',
        topics: ['Wire Bonding', 'Die Attach', 'Assembly Best Practices']
      }
    ],
    whitepapers: [
      {
        id: 'tecdia-wp-1',
        title: 'Optimizing MMIC Gate Biasing Networks with Ultra-High-Q Single Layer Capacitors',
        author: 'TecDia Microelectronics Division',
        date: 'March 2026',
        pages: '13 Pages',
        frequencyBand: 'DC to 100 GHz',
        summary: 'Analysis of ESR and ESL in single layer capacitors compared to standard surface-mount multi-layer capacitors.',
        keyFindings: [
          'ESL measured under 15 picohenries across standard chip configurations.',
          'Custom binary capacitor arrays allow in-circuit value tweaking during prototype RF tuning.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'TecDia Official Microelectronics Portal',
        url: 'https://www.tecdia.com',
        description: 'Single-layer capacitors, custom thin-film ceramic substrates, and precision wafer scribing tools.',
        icon: 'fa-circle-dot'
      }
    ]
  },
  {
    oemId: 'evans',
    officialWebsite: 'https://www.evanscap.com',
    portalName: 'Evans Hybrid Capacitor Lab',
    headline: 'High-Energy-Density Tantalum Hybrid Capacitors for High-Power Pulsed Radars',
    articles: [
      {
        id: 'evans-art-ace-in-action',
        title: 'ACE in Action: High-Reliability Hybrid Capacitors for Pulse Power Systems',
        date: 'October 2026',
        category: 'Pulse Power & Energy Storage',
        readTime: '5 min read',
        image: '/images/gan-power-chip.jpg',
        sourceUrl: 'https://www.evans-group.com/news/ace-in-action-q3-2026',
        summary: 'Evans Hybrid Wet Tantalum capacitors deliver up to 10x the volumetric energy density of standard electrolytic capacitors, providing stable voltage hold-up during multi-kilowatt airborne radar pulses.',
        content: `
          <p>Active Electronically Scanned Array (AESA) radar systems and high-power pulsed microwave transmitters present severe transient electrical demands. During microsecond RF transmit bursts, power amplifier stages draw massive currents that can collapse the aircraft DC bus unless buffered by large local energy storage banks.</p>
          <p>Evans Capacitor Company (Quantic Evans) solves this challenge with its patented Hybrid Wet Tantalum technology, combining an electrochemical ruthenium oxide cathode with a high-voltage tantalum anode.</p>
          <h4>Engineering Highlights:</h4>
          <ul>
            <li><strong>10x Volumetric Energy Density:</strong> Replaces banks of dozens of aluminum electrolytic capacitors with a single compact, hermetically sealed Evans Hybrid package.</li>
            <li><strong>Ultra-Low Equivalent Series Resistance (ESR):</strong> Enables rapid, high-current discharge without internal ohmic heating or voltage droop.</li>
            <li><strong>Space &amp; Defense Proven:</strong> Routine qualification to NASA EEE-INST-002 and MIL-STD-810 for extreme vibration, thermal shock, and high-altitude operation.</li>
            <li><strong>Custom Multi-Capacitor Arrays:</strong> Modular configurations available in custom housings tailored for avionics bays and satellite bus architectures.</li>
          </ul>
          <p>Icon Electromatic supplies genuine Quantic Evans hybrid capacitors with screening certification and factory test reports.</p>
        `,
        tags: ['Evans Capacitors', 'Hybrid Tantalum', 'Radar Pulse Power', 'Quantic', 'Energy Density']
      },
      {
        id: 'evans-art-1',
        title: 'Evans Hybrid Capacitors Deliver 10x Volumetric Energy Density for Airborne Radar Pulse Discharge',
        date: 'July 2026',
        category: 'Energy Storage',
        readTime: '4 min read',
        image: '/images/gan-power-chip.jpg',
        summary: 'Hermetically sealed tantalum hybrid capacitors provide hundreds of millifarads in tiny hermetic square cans, smoothing bus voltage drops during radar pulse bursts.',
        content: `
          <p>Active phased array radar modules place enormous transient current demands on aircraft 28V DC bus architectures during multi-kilowatt RF pulse events. Evans Hybrid Capacitors combine an electrochemical cathode with a high-voltage tantalum anode, delivering the highest energy density of any capacitor technology available today.</p>
        `,
        tags: ['Hybrid Capacitor', 'Pulse Discharge', 'Tantalum', 'Radar Power']
      }
    ],
    videos: [
      {
        id: 'evans-vid-1',
        title: 'Mitigating Bus Voltage Droop During 50A Radar Transmit Bursts',
        speaker: 'Evans Capacitor Applications Team',
        duration: '14:30',
        date: 'May 2026',
        thumbnail: '/images/gan-power-chip.jpg',
        summary: 'Oscilloscope captures comparing bank size and voltage stability of Evans hybrid capacitors vs standard aluminum electrolytics.',
        topics: ['Bus Droop', 'ESR Optimization', 'Pulse Power']
      }
    ],
    whitepapers: [
      {
        id: 'evans-wp-1',
        title: 'Space-Qualified Hybrid Capacitors for Satellite Electric Propulsion and Laser Communications',
        author: 'Evans Engineering Research',
        date: 'February 2026',
        pages: '14 Pages',
        frequencyBand: 'Pulse DC',
        summary: 'NASA and ESA radiation tolerance and outgassing certification data for high-voltage hybrid energy storage modules.',
        keyFindings: [
          'Hermetic laser-welded titanium case prevents electrolyte leakage under hard vacuum.',
          'Over 500,000 hours MTBF documented across active defense flight programs.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Evans Capacitor Company Official Site',
        url: 'https://www.evanscap.com',
        description: 'Capacitor sizing calculators, space qualification data, and high-power pulse application notes.',
        icon: 'fa-battery-full'
      }
    ]
  },
  {
    oemId: 'nee',
    officialWebsite: 'https://www.nee-intl.com',
    portalName: 'NEE Precision RF/Microwave Etching Lab',
    headline: 'Photochemical Etching & Precision Microwave Substrates & Leadframes',
    articles: [
      {
        id: 'nee-art-automotive-radar',
        title: 'NEE International Expands Automotive & Millimeter-Wave Radar PCB Manufacturing',
        date: 'October 2026',
        category: 'PCB Fabrication',
        readTime: '4 min read',
        image: '/images/rf-microwave-pcb.jpg',
        sourceUrl: 'https://www.neeinternational.com/pdf/PressRelease_Automotive.pdf',
        summary: 'NEE International announces expanded cleanroom manufacturing lines dedicated to high-frequency automotive radar (24 GHz & 77 GHz) PCBs and hybrid multi-layer PTFE/FR-4 lamination.',
        content: `
          <p>Autonomous driving, advanced driver assistance systems (ADAS), and collision avoidance radars require printed circuit boards with uncompromising dielectric consistency and microscopic trace etching accuracy. NEE International has officially announced the expansion of its specialized cleanroom fabrication facilities for automotive radar and space communication circuits.</p>
          <h4>Fabrication Capabilities &amp; Certifications:</h4>
          <ul>
            <li><strong>77–81 GHz Microstrip Patch Arrays:</strong> Laser direct imaging (LDI) and micro-etching deliver trace width tolerances within ±0.010 mm for antenna-on-PCB arrays.</li>
            <li><strong>Hybrid Multi-Layer Stackups:</strong> Sequential lamination combining high-frequency Rogers/PTFE outer layers with cost-effective FR-4 inner control layers.</li>
            <li><strong>Controlled Cavities &amp; Edge Plating:</strong> Precision CNC depth-controlled routing for cavity-backed antennas and metallic edge shield plating.</li>
            <li><strong>Automotive Quality Assurance:</strong> Fully compliant with IATF 16949 automotive standards with 100% automated optical inspection (AOI) and microsection reporting.</li>
          </ul>
          <p>Icon Electromatic works closely with NEE International to provide high-precision microwave PCB fabrication and leadframe etching services for defense, automotive, and space programs.</p>
        `,
        tags: ['NEE International', 'Automotive Radar', '77 GHz PCB', 'PTFE Lamination', 'IATF 16949']
      },
      {
        id: 'nee-art-1',
        title: 'NEE International Advances Burr-Free Chemical Etching for Ultra-Thin Microwave Leadframes',
        date: 'June 2026',
        category: 'Precision Metal Etching',
        readTime: '3 min read',
        image: '/images/rf-microwave-pcb.jpg',
        summary: 'Chemical machining of Kovar, copper, and beryllium-copper foils down to 12 micron thicknesses without introducing mechanical stamping stress or burrs.',
        content: `
          <p>High-frequency microwave housings and hybrid microelectronic packages require leadframes and RF shielding covers with zero edge burrs to prevent dielectric short circuits. NEE International’s photochemical etching processes deliver micron-level edge straightness and tight feature tolerances.</p>
        `,
        tags: ['Chemical Etching', 'Leadframes', 'Kovar', 'Micro-Machining']
      }
    ],
    videos: [
      {
        id: 'nee-vid-1',
        title: 'Photochemical Etching vs Laser Cutting for RF Shielding Cans',
        speaker: 'NEE Technical Team',
        duration: '09:40',
        date: 'March 2026',
        thumbnail: '/images/rf-microwave-pcb.jpg',
        summary: 'Comparative metallurgical analysis examining heat-affected zones (HAZ) and surface micro-cracking in precision microwave metal components.',
        topics: ['Photochemical Machining', 'Heat Affected Zone', 'RF Shielding']
      }
    ],
    whitepapers: [
      {
        id: 'nee-wp-1',
        title: 'Tolerancing Precision Chemical Etched Microwave Couplers and Stepped Impedance Elements',
        author: 'NEE International Engineering Group',
        date: 'December 2025',
        pages: '8 Pages',
        frequencyBand: 'DC to 40 GHz',
        summary: 'Etch factor compensation rules for CAD engineers designing precision copper interdigital filters and suspended substrate stripline circuits.',
        keyFindings: [
          'Feature tolerance held to ±0.012 mm on 0.1 mm thick beryllium copper.',
          'Zero mechanical tooling costs allow rapid iteration during RF breadboarding.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'NEE International Official Site',
        url: 'https://www.nee-intl.com',
        description: 'Photochemical etching capabilities, material alloy selector, and metal tolerance guidelines.',
        icon: 'fa-scissors'
      }
    ]
  },
  {
    oemId: 'transline-technology',
    officialWebsite: 'https://www.translinetech.com',
    portalName: 'Transline Advanced PCB Fabrication Hub',
    headline: 'High-Frequency RF, Microwave & Rigid-Flex PCB Manufacturing',
    articles: [
      {
        id: 'transline-art-1',
        title: 'Transline Technology Achieves Space-Grade Certification for Mixed-Dielectric Hybrid Rigid-Flex Multilayers',
        date: 'May 2026',
        category: 'PCB Manufacturing',
        readTime: '4 min read',
        image: '/images/rf-microwave-pcb.jpg',
        summary: 'Bonding high-frequency Rogers laminates with polyimide flex cores allows complex 3D avionics packaging without bulky coaxial jumper cables.',
        content: `
          <p>Weight reduction and volume conservation in missile seekers and satellite payloads necessitate rigid-flex printed circuit boards. Transline Technology specializes in hybrid stackups that integrate low-loss Rogers high-frequency laminates on outer microwave layers with polyimide flex cores internally.</p>
        `,
        tags: ['Rigid-Flex', 'Hybrid Stackup', 'Space Qualified', 'Microwave PCB']
      }
    ],
    videos: [
      {
        id: 'transline-vid-1',
        title: 'Inside the Cleanroom: Sequential Lamination of PTFE and FR-4 Hybrid Boards',
        speaker: 'Chris Savalia, Chief Operating Officer',
        duration: '15:45',
        date: 'February 2026',
        thumbnail: '/images/rf-microwave-pcb.jpg',
        summary: 'A factory tour highlighting plasma desmear, automated optical inspection (AOI), and precise blind-via laser drilling for RF backplanes.',
        topics: ['Hybrid Lamination', 'Plasma Desmear', 'Sequential Lamination']
      }
    ],
    whitepapers: [
      {
        id: 'transline-wp-1',
        title: 'Controlling Phase Delay Variation Across Multi-Channel Phased Array Antenna Boards',
        author: 'Transline Technology Engineering Division',
        date: 'December 2025',
        pages: '14 Pages',
        frequencyBand: '1 to 50 GHz',
        summary: 'Manufacturing controls on dielectric thickness tolerances and copper foil grain alignment to ensure matched electrical delay across antenna feeds.',
        keyFindings: [
          'Inter-channel trace length matching held within ±0.025 mm.',
          'Direct laser imaging (DLI) provides line width tolerances of ±0.007 mm.'
        ]
      }
    ],
    officialLinks: [
      {
        title: 'Transline Technology Official PCB Portal',
        url: 'https://www.translinetech.com',
        description: 'PCB design guidelines, stackup engineering assistance, and material compatibility matrices.',
        icon: 'fa-network-wired'
      }
    ]
  }
];

// Helper: Get blog data for an OEM
export function getBlogDataForOem(oemId) {
  const oem = CATALOG.find(o => o.id === oemId);
  const blog = OEM_BLOGS.find(b => b.oemId === oemId);
  if (!oem) return null;
  return {
    oem,
    blog: blog || {
      oemId,
      officialWebsite: oem.website || '#',
      portalName: `${oem.name} Engineering Resource Hub`,
      headline: oem.tagline || oem.specialty,
      articles: [],
      videos: [],
      whitepapers: [],
      officialLinks: [
        {
          title: `${oem.name} Official Website`,
          url: oem.website || '#',
          description: `Direct access to ${oem.name}'s corporate and engineering documentation.`,
          icon: 'fa-globe'
        }
      ]
    }
  };
}

// Helper: Get all articles across all OEMs
export function getAllArticles() {
  const list = [];
  OEM_BLOGS.forEach(b => {
    const oem = CATALOG.find(o => o.id === b.oemId);
    if (!oem) return;
    (b.articles || []).forEach(art => {
      list.push({ ...art, oemName: oem.name, oemShort: oem.shortName, oemId: oem.id, oemAccent: oem.accentColor, oemLogo: oem.logoSvg });
    });
  });
  return list;
}

// Helper: Get all videos across all OEMs
export function getAllVideos() {
  const list = [];
  OEM_BLOGS.forEach(b => {
    const oem = CATALOG.find(o => o.id === b.oemId);
    if (!oem) return;
    (b.videos || []).forEach(vid => {
      list.push({ ...vid, oemName: oem.name, oemShort: oem.shortName, oemId: oem.id, oemAccent: oem.accentColor, oemLogo: oem.logoSvg });
    });
  });
  return list;
}

// Helper: Get counts for an OEM
export function getOemContentCount(oemId) {
  const blog = OEM_BLOGS.find(b => b.oemId === oemId);
  if (!blog) return { articles: 0, videos: 0, whitepapers: 0, links: 1, total: 1 };
  const articles = (blog.articles || []).length;
  const videos = (blog.videos || []).length;
  const whitepapers = (blog.whitepapers || []).length;
  const links = (blog.officialLinks || []).length;
  return { articles, videos, whitepapers, links, total: articles + videos + whitepapers + links };
}
