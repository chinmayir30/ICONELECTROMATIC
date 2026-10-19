-- ==============================================================================
-- seed.sql (Full Catalog Seed)
-- Complete dataset: 15 OEMs, 88 Categories, 169 Products + Images + SEO Metadata
-- Generated automatically from catalogData.js and full_extraction_report.json
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. OEMs (Original Equipment Manufacturers)
-- ------------------------------------------------------------------------------
INSERT INTO public.oems (id, name, slug, logo_url, description, priority_order, website_url) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Rogers Corporation',
    'rogers',
    '/images/oem-logos/Rogers_Logo_no_bg.png',
    'Rogers Corporation is a global leader in engineered materials for high-frequency RF, microwave, and millimeter-wave applications across defense, automotive radar, and 5G infrastructure.',
    1,
    'https://www.rogerscorp.com'
  ),
(
    '00000000-0000-0000-0000-000000000002',
    'Minicircuits',
    'mini-circuits',
    '/images/oem-logos/mini-circuits-seeklogo.png',
    'Mini-Circuits is the global leader in RF & microwave design and manufacturing, offering over 10,000 active models spanning DC to 110 GHz across adapters, amplifiers, attenuators, couplers, filters, and test systems.',
    2,
    'https://www.minicircuits.com'
  ),
(
    '00000000-0000-0000-0000-000000000003',
    'Qorvo',
    'qorvo',
    '/images/oem-logos/Qorvo_logo_wb.png',
    'Qorvo is an industry-leading innovator in RF solutions, developing high-power GaN HEMTs, driver and low noise amplifiers, beamformers, and front-end modules for defense radar, 5G, and SATCOM.',
    3,
    'https://www.qorvo.com'
  ),
(
    '00000000-0000-0000-0000-000000000004',
    'TecDia',
    'tecdia',
    '/images/oem-logos/Tecdia_cropped.png',
    'Tecdia manufactures high-frequency single-layer ceramic chip capacitors, precision thin-film substrates, diamond scribing tools, and micro-dispensing nozzles for millimeter-wave and optoelectronic packaging.',
    4,
    'https://us.tecdia.com'
  ),
(
    '00000000-0000-0000-0000-000000000005',
    'TriTeq',
    'tri-teq',
    '/images/oem-logos/TriTeq_logo_wb.png',
    'Tri-TeQ specializes in tunable harmonic switched filter banks, lumped element, and suspended substrate RF filters for tactical software-defined radios and EW co-site mitigation systems.',
    5,
    'https://www.tri-teq.com'
  ),
(
    '00000000-0000-0000-0000-000000000006',
    'RFuW Engineering',
    'rfuw-engineering',
    '/images/oem-logos/RFuW_Logo.jpg',
    'RFuW Engineering manufactures rugged, surface-mount high-power RF switches and "Always On" limiters operating up to Ku-band with power handling up to +60 dBm for mission-critical receivers.',
    6,
    'https://www.rfuw-engineering.com'
  ),
(
    '00000000-0000-0000-0000-000000000007',
    'YTTEK',
    'yttek',
    '/images/oem-logos/YTTEK_Logo_wb.png',
    'YTTEK develops wideband SDR platforms, satellite communication modems, 5G FR2/6G up/downconverters, and reconfigurable intelligent surfaces (RIS) for aerospace and CubeSats.',
    7,
    'https://yttek.com'
  ),
(
    '00000000-0000-0000-0000-000000000008',
    'Evans',
    'evans',
    '/images/oem-logos/Evans_logo.png',
    'Quantic Evans and Eulex develop high-energy hybrid wet tantalum capacitors, multi-layer polymer (MLP) films, and ultra-high-frequency ceramic capacitors routinely tested to NASA EEE-INST-002 space standards.',
    8,
    'https://www.evans-group.com'
  ),
(
    '00000000-0000-0000-0000-000000000009',
    'Ohmega Ticer',
    'ohmega-ticer',
    '/images/oem-logos/OhmegaTicer_Black.png',
    'Quantic Ohmega-Ticer pioneers thin-film embedded resistor technology, integrating precision resistor networks directly into inner PCB layers for aerospace, defense, and high-speed digital systems.',
    9,
    'https://quanticohmega.com'
  ),
(
    '00000000-0000-0000-0000-000000000010',
    'Thermosen',
    'thermosen',
    '/images/oem-logos/Thermosen_logo.png',
    'Thermosen Technologies develops high-reliability NTC and PTC thermistors and precision thermal sensors for mission-critical space, aerospace, EV, medical, and defense applications.',
    10,
    'https://www.thermosen.com'
  ),
(
    '00000000-0000-0000-0000-000000000011',
    'Fortify',
    'fortify',
    '/images/oem-logos/Fortify_Logo_Black_Bg.png',
    'Fortify enables advanced dielectric 3D printing for RF and microwave components, delivering complex GRIN lenses, radomes, and conformal antenna optics with precise spatial permittivity control.',
    11,
    'https://3dfortify.com'
  ),
(
    '00000000-0000-0000-0000-000000000012',
    'NEE',
    'nee-international',
    '/images/oem-logos/NEE_Logo_wb.png',
    'NEE International (New Era Electronics) specializes in rigid-flex and microwave PTFE printed circuit board fabrication for space satellites, base station power amplifiers, and large format antennas.',
    12,
    'https://www.nee-intl.com'
  ),
(
    '00000000-0000-0000-0000-000000000013',
    'Transline Technology',
    'transline-technology',
    NULL,
    'Transline Technology is an elite fabricator of advanced RF, microwave, and millimeter-wave printed circuit boards utilizing Rogers, PTFE, and hybrid dielectric stackups for aerospace and defense electronics.',
    13,
    'https://translinetech.com'
  ),
(
    '00000000-0000-0000-0000-000000000014',
    'Spellman',
    'spellman',
    '/images/gan-power-chip.jpg',
    'Spellman High Voltage Electronics Corporation is a world leader in high-voltage DC power supplies, modular power converters, X-ray generators, and custom power solutions for defense, aerospace, medical, and industrial applications.',
    14,
    'https://www.spellmanhv.com'
  ),
(
    '00000000-0000-0000-0000-000000000015',
    'AEE ISARAEL',
    'aee-israel',
    '/images/rf-filter.jpg',
    'AEE Israel specializes in high-security physical and electronic perimeter detection, fiber-optic boundary sensing, taut-wire fences, drone defense, and command & control security management systems.',
    15,
    'https://www.aee-israel.com'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 2. Categories
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, oem_id) VALUES
(
      '00000000-0000-0000-0001-000000000001',
      'RT/Duroid',
      'rtduroid',
      'PTFE composite laminate with very low dielectric constant and loss, reinforced with glass microfibers.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000002',
      'RO400 Series',
      'ro400-series',
      'Low loss laminate with excellent thermal stability and multilayer capability.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000003',
      'RO300 Series',
      'ro300-series',
      'Ceramic-filled PTFE laminate with low loss and stable Dk over frequency.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000004',
      'TMM Series',
      'tmm-series',
      'Thermoset microwave laminate with matched CTE to copper.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000005',
      'CLTE Series',
      'clte-series',
      'PTFE laminate with woven glass reinforcement for dimensional stability.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000006',
      'DICLAD Series',
      'diclad-series',
      'PTFE woven-glass reinforced laminate with controlled dielectric properties and good mechanical stability.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000007',
      'TC Series',
      'tc-series',
      'Thermally conductive ceramic-filled PTFE laminate for RF thermal management.',
      '00000000-0000-0000-0000-000000000001'
    ),
(
      '00000000-0000-0000-0001-000000000008',
      'RF Adapters',
      'rf-adapters',
      'RF adapters for 1.35mm, 1.85mm, 2.4mm, 2.4mm NMD, 2.92mm, 2.92mm NMD, 3.5mm, BNC, N-Type, SMA, SMP, WR19, WR22, and WR28. Wide selection of connector genders, mounting types and orientations.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000009',
      'RF/MW Amplifiers',
      'rfmw-amplifiers',
      'Gain blocks, low noise amplifiers, power amplifiers, RF transistors, Class-A and Class-AB amplifiers, linear amplifiers, 75Ω CATV amplifiers, dual-matched amplifiers, variable gain amplifiers, pulse amplifiers',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000010',
      'RF Attenuators',
      'rf-attenuators',
      'Fixed, Digital Step, Voltage Variable, & Programmable- Coaxial, surface mount, and MMIC attenuator models for 50-Ohm & 75-Ohm systems including fixed attenuators, high-power attenuators, digital step / programmable at...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000011',
      'Bias Tees',
      'bias-tees',
      'RF & Microwave Bias Tees (Bias Ts)
Wideband DC to RF Isolation
Your complete source for coaxial and surface mount bias tees for DC current up to 5 Amps and RF bandwidths spanning 100 kHz to 54 GHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000012',
      'RF/MW/MMW Cable asseblies',
      'rfmwmmw-cable-asseblies',
      'RF Coaxial Cables
System Interconnect Cables and Precision Test Leads
Mini-Circuits suite of RF cable solutions is built for precision, performance, and versatility. Our RF/microwave interconnect and precision test ca...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000013',
      'RF Couplers',
      'rf-couplers',
      'RF Couplers
Directional, Bi-Directional, Dual Directional & RF Tap
Over 475 models with power handling from 0.5 to 250W covering DC to 65 GHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000014',
      'RF /MW Custom Assemblies',
      'rf-mw-custom-assemblies',
      'Custom integration to achieve highly functional systems and sub-systems.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000015',
      'DC Blocks',
      'dc-blocks',
      'Choose from a variety of wideband DC blocks with SMA, N-type, BNC, 2.92mm, 2.4mm and 1.85mm connector types for 50-Ohm and 75-Ohm applications from 100 kHz to 65 GHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000016',
      'MMIC Die Parts',
      'mmic-die-parts',
      'Mini-Circuits offers a broad selection of MMIC components in bare die format for your chip and wire integration, including amplifiers, attenuators, couplers, filters, mixers, multipliers, and splitter/combiners.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000017',
      'Equalizers',
      'equalizers',
      'Voltage Variable and Fixed Slope Models
Nearly 100 equalizer models for gain flattening and frequency-dependent loss compensation in a wide range of applications from DC to 45 GHz.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000018',
      'Filters',
      'filters',
      'RF Filters
Low-Pass, High-Pass, Band-Pass, Band-Stop, Diplexers. Triplexers, and More!
Mini-Circuits has over 3000 models of RF filters available for same-day shipping and is able to create custom designs with fast tu...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000019',
      'Frequency Mixers',
      'frequency-mixers',
      'RF Frequency Mixers
The Industry''s Widest Selection
Over 300 models of RF frequency mixers available in coaxial, surface mount, and MMIC die formats from 500 Hz to 65GHz! Whether you need wideband performance, high IP...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000020',
      'Frequency Multipliers',
      'frequency-multipliers',
      'Frequency Multipliers
Mini-Circuits offers a wide array of off-the-shelf multipliers including doublers, triplers, quadruplers, X5, X7, and X12 multipliers with output frequencies ranging from 100 KHz to 72 GHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000021',
      'Impedance Matching Pads',
      'impedance-matching-pads',
      'Surface mount and coaxial 50 Ohm / 75 Ohm impedance matching pads for CATV systems, broadband networks, test setups and more!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000022',
      'Limiters',
      'limiters',
      'Tough and reliable for the harshest operating conditions, from 100 kHz to 8.2 GHz!
Tough and reliable for the harshest operating conditions, from 100 KHz to 8.20 GHz',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000023',
      'Modulators / Demodulators',
      'modulators-demodulators',
      '&Q and QPSK Modulators / Demodulators',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000024',
      'Oscillators',
      'oscillators',
      'Voltage Controlled Oscillators (VCOs)
Wide selection of models from spot frequency and narrow band to medium and wide bandwidths up to 1.5 octaves with low phase noise, linear tuning, dual outputs, 5V tuning for PLLs ...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000025',
      'Phase Detectors',
      'phase-detectors',
      'RF Phase Detectors
Broadband and optimized band RF phase detectors for phase locked loops (PLLs), monitoring and levelling circuits from 1 to 650 MHz',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000026',
      'Phase Shifters',
      'phase-shifters',
      'RF Phase Shifters
Mini-Circuits’ broad selection of surface-mount and coaxial voltage-variable phase shifters gives you precise phase control up to 360 degrees for a wide range of applications including cellular, rada...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000027',
      'Power Detectors',
      'power-detectors',
      'RF Power Detectors
Precision RF power detectors for a wide range of applications including RF/IF power measurement, transmit/receive power monitoring, RF leakage monitors, fast feedback levelling circuits, receiver ga...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000028',
      'Power Sensors',
      'power-sensors',
      'RF Power Sensors
For CW, RMS, Peak & Average Measurements. The PWR series features a high range of performance sensors, including up to a 40 GHz power sensor and supporting measurements of any type of signal from CW /...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000029',
      'Power Splitters / Combiners',
      'power-splitters-combiners',
      'RF Power Splitters/Dividers/Combiners
2-Way, 3-way, 4-way, 6-way, 8-way, 10-way, 12-way, 16-way and up to 24-way models for 50 Ohm and 75 Ohm systems from DC to 67 GHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000030',
      '90°/180° Hybrids',
      '90180-hybrids',
      '90-Degree and 180-Degree
Hybrid Splitter/Combiners
A broad selection of quadrature (90-degree) and 180-degree hybrids in coaxial connectorized and surface-mount packages as well as MMIC die.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000031',
      'Reference Designs',
      'reference-designs',
      'High performance Reference Designs solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000032',
      'RF Chokes',
      'rf-chokes',
      'RF Chokes
RF Chokes with effective parallel resistance over wide bandwidths from 5 MHz to 10 GHz!
RF chokes are commonly used in RF system design to block RF signal while passing DC current. Mini-Circuits offers RF ch...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000033',
      'Research & Educational Kits',
      'research-educational-kits',
      'UVNA-63 microwave transceiver kit includes everything students need to build a fully functioning vector network analyzer and bridge the gap between textbook theory in the classroom and practical, real-world measuremen...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000034',
      'RF & Microwave Energy',
      'rf-microwave-energy',
      'High performance RF & Microwave Energy solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000035',
      'Space Upscreening',
      'space-upscreening',
      'Mil Spec or Equivalent Qualification with EEE-INST-002 Compliant Workflows
Mini-Circuits has a long history of space-level screening and testing servicing some of the earliest government space missions all the way thr...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000036',
      'Switches',
      'switches',
      'F/Microwave Switches
SPDT, DPDT (transfer), SP4T, SP6T, SP8T, and SP10T mechanical and solid state RF switches for 50-ohm and 75-ohm systems spanning DC to 50 GHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000037',
      'Synthesizers',
      'synthesizers',
      'RF Frequency Synthesizers
Mini-Circuits offers a broad selection of RF/microwave frequency synthesizers to meet the needs of engineers for a wide range of applications up to 7800 MHz',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000038',
      'Terminations',
      'terminations',
      'RF Terminations
Reliable dissipation of signal power for 50-Ohm and 75-Ohm systems from DC to 110 GHz. Choose from a wide variety of male and female connector types including 1.85mm, 2.4mm, 2.92mm, SMA, SMP, N-Type, a...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000039',
      'Test Solutions',
      'test-solutions',
      'RF Test Solutions
Software-controlled building blocks in-stock for automation of lab and production test environments',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000040',
      'Instrumentation Amplifiers',
      'instrumentation-amplifiers',
      'RF Instrumentation Amplifiers
Precision Amplifier Systems for a Wide Range of Test and Measurement Applications.
Mini-Circuits’ extensive selection of amplifiers in stock allows us to build integrated amplifier system...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000041',
      'Precision Connector Gauges',
      'precision-connector-gauges',
      'High performance Precision Connector Gauges solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000042',
      'Signal Distribution Systems',
      'signal-distribution-systems',
      'RF Signal Distribution Systems
For High-Volume Test Setups
For test systems requiring distribution of signal to many DUTs, Mini-Circuits’ signal distribution systems combine splitter/combiners and directional couplers...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000043',
      'Signal Generation and Measurement',
      'signal-generation-and-measurement',
      'RF Signal Generation & Measurement
RF Signal Generators, Power Sensors & More
Mini-Circuits offers a wide selection of benchtop signal sources and measurement instruments for RF test and measurement applications. Comp...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000044',
      'Solid State Switch Systems',
      'solid-state-switch-systems',
      'Solid State RF Switch Systems
Fast Switching & High Reliability for RF Test & Measurement
Mini-Circuits offers a wide selection of solid-state RF switches for test and measurement applications, from compact switch mod...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000045',
      'Wrenches',
      'wrenches',
      'RF Connector Wrenches
For SMA, N-Type, 3.5mm, 2.92mm, 2.4mm, 1.85mm & 1.0mm Connectors
Mini-Circuits'' TRQ-series of 8 in-lb and 4 in-lb torque calibrated breakover wrenches are the perfect tool for tightening a variet...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000046',
      'Custom Test Systems',
      'custom-test-systems',
      'Custom RF Test Equipment
Integrated Test Systems Tailored to Your Requirements
Our experience in the test space has evolved according to your needs. The diversity of customer requirements for highly customized test so...',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000047',
      'Transformers Baluns',
      'transformers-baluns',
      'RF Transformers and Baluns
Over 500 transformer and balun models in a wide variety of DC passing and DC isolated configurations with for single-ended and balanced/differential transmission lines from DC to 24000 MHz!',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000048',
      'Voltage Variable Equalizers',
      'voltage-variable-equalizers',
      'RF Equalizers
Voltage Variable and Fixed Slope Models
Nearly 100 equalizer models for gain flattening and frequency-dependent loss compensation in a wide range of applications from DC to 45 GHz.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000049',
      'Waveguides',
      'waveguides',
      'Waveguide bandpass filters  Mini-Circuits feature models with passbands up to 86 GHz with low insertion loss and high stopband rejection.',
      '00000000-0000-0000-0000-000000000002'
    ),
(
      '00000000-0000-0000-0001-000000000050',
      'Power Amplifiers',
      'power-amplifiers',
      '1. Frequency coverage from DC to W-band
2. Application-specific product focus (such as power or linearity)
3. Variety of power levels along with high PAE and gain performance
4. Superior thermal management
5. Small fo...',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000051',
      'Driver Amplifiers',
      'driver-amplifiers',
      '1. High efficiency
2. High linearity
3. High gain',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000052',
      'Low Noise Amplifiers',
      'low-noise-amplifiers',
      '1. Ultra-low noise figure – as low as 0.4 dB NF
2. Integrated active biasing for most parts
3. Integrated on-chip matching for most parts
4. Available in die or packaged form',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000053',
      'Variable Gain Amplifiers',
      'variable-gain-amplifiers',
      '1. Integration offers PCB size reduction
2. High linearity
3. High efficiency
4. Same package configuration across 3GPP bands',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000054',
      'Beamforming Integrated Circuits',
      'beamforming-integrated-circuits',
      '1. Lowest $/dBm commercially available today
2. Multi-band performance
3. Advanced digital core simplifying design
4. Smart integration
5. System level support for optimized solutions
6. Proven in volume in fielded ra...',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000055',
      'Front End Modules',
      'front-end-modules',
      '1. High power efficiency
2. Low noise figure
3. Front end protection
4. Suitable for harsh environments',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000056',
      'Vpin Limiters',
      'vpin-limiters',
      '1. Protection against high-power incident RF signals
2. Low flat leakage
3. Low insertion loss
4. Passive component that requires no system power
5. Small footprint SMT packaging',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000057',
      'Mixers',
      'mixers',
      '1. High linearity
2. Low current draw',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000058',
      'GaN HEMTs',
      'gan-hemts',
      '1. High efficiency and power density
2. Superior gain
3. Ruggedness and ability to operate over a wide bandwidth
4. Record-setting reliability that exceeds previous industry standards
5. Design expertise as a frontrun...',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000059',
      'GaAs pHEMTs',
      'gaas-phemts',
      '1. Ultra-low noise figure – as low as 0.15 dB NF (min)
2. Available in die or packaged form',
      '00000000-0000-0000-0000-000000000003'
    ),
(
      '00000000-0000-0000-0001-000000000060',
      'Single Layer Capacitors',
      'single-layer-capacitors',
      'Single Layer Chip Capacitors (A Type)
Single Layer Chip Capacitors (B Type)
Single Layer Chip Capacitors (C Type)
Rectangular SLCS
Binary Capacitors
Gap Capacitors
Row Capacitors
Integrated Resistor-Capacitor',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000061',
      'Tunable Dielectric Capacitors',
      'tunable-dielectric-capacitors',
      'High performance Tunable Dielectric Capacitors solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000062',
      'Thin Film Substrates',
      'thin-film-substrates',
      'High performance Thin Film Substrates solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000063',
      'Dispensing Nozzles',
      'dispensing-nozzles',
      'Arque Dispensing Nozzles
Super Long Tipped Nozzles
Ruby Nozzle
Special Application Nozzles
Precision nozzle for 3D printing (kaika)',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000064',
      'Diamond Products',
      'diamond-products',
      'High performance Diamond Products solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000065',
      'Handy Wafer Scriber Kit',
      'handy-wafer-scriber-kit',
      'High performance Handy Wafer Scriber Kit solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000066',
      'Diamond Pick Up Tools',
      'diamond-pick-up-tools',
      'High performance Diamond Pick Up Tools solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000004'
    ),
(
      '00000000-0000-0000-0001-000000000067',
      'Harmonic Switched Filters',
      'harmonic-switched-filters',
      'Tunable Filters.
Bandpass
Passive & Co-Site Mitigation Filters
Lumped Element & Suspended Substrate Technologies-- RF filters for tactical radios.',
      '00000000-0000-0000-0000-000000000005'
    ),
(
      '00000000-0000-0000-0001-000000000068',
      'RF Limiters',
      'rf-limiters',
      'Always RF offers a family of passive and quasi-active High Power RF Limiters which operate from HF to Ku Band frequency ranges with power handling capabilities up to +60 dBm. These RF Limiters provide "Always On" prot...',
      '00000000-0000-0000-0000-000000000006'
    ),
(
      '00000000-0000-0000-0001-000000000069',
      'RF Switches',
      'rf-switches',
      'Always RF offers a family of High Power PIN diode based surface mount RF switches which operate HF to Ku Band frequency ranges with power handling capabilities from +50 dBm to +62 dBm. The standard product family come...',
      '00000000-0000-0000-0000-000000000006'
    ),
(
      '00000000-0000-0000-0001-000000000070',
      'Software-Defined Radio (SDR)',
      'software-defined-radio-sdr',
      'High performance Software-Defined Radio (SDR) solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000007'
    ),
(
      '00000000-0000-0000-0001-000000000071',
      'HyperSDR',
      'hypersdr',
      'High-speed satellite modem',
      '00000000-0000-0000-0000-000000000007'
    ),
(
      '00000000-0000-0000-0001-000000000072',
      'SDRspace',
      'sdrspace',
      'High performance SDRspace solution engineered for demanding RF, microwave, and aerospace applications.',
      '00000000-0000-0000-0000-000000000007'
    ),
(
      '00000000-0000-0000-0001-000000000073',
      'PluSDR',
      'plusdr',
      'Software-defined radio platform',
      '00000000-0000-0000-0000-000000000007'
    ),
(
      '00000000-0000-0000-0001-000000000074',
      'SDRone',
      'sdrone',
      'UAV communication transceiver',
      '00000000-0000-0000-0000-000000000007'
    ),
(
      '00000000-0000-0000-0001-000000000075',
      '5G FR2
& 6G',
      '5g-fr2-6g',
      'TrueUDC
26.5~29.5 GHz
Frequency drift: 5ppb.',
      '00000000-0000-0000-0000-000000000007'
    ),
(
      '00000000-0000-0000-0001-000000000076',
      'Eulex',
      'eulex',
      'RF/High Frequency Ceramic Capacitors',
      '00000000-0000-0000-0000-000000000008'
    ),
(
      '00000000-0000-0000-0001-000000000077',
      'Evans',
      'evans',
      'Hybrid Wet Tantalum',
      '00000000-0000-0000-0000-000000000008'
    ),
(
      '00000000-0000-0000-0001-000000000078',
      'Paktron',
      'paktron',
      'Multi-layer Polymer (MLP) Stacked Film',
      '00000000-0000-0000-0000-000000000008'
    ),
(
      '00000000-0000-0000-0001-000000000079',
      'UTC',
      'utc',
      'Multi-layer Ceramic (MLCC) Stacked Film',
      '00000000-0000-0000-0000-000000000008'
    ),
(
      '00000000-0000-0000-0001-000000000080',
      'RCM Series',
      'rcm-series',
      '10 Ω/sq thin-film embedded resistor copper foil on ½ oz (18 µm) copper. High reliability resistive conductor material for PCB integration.',
      '00000000-0000-0000-0000-000000000009'
    ),
(
      '00000000-0000-0000-0001-000000000081',
      'TCR Series',
      'tcr-series',
      '25 Ω/sq Ticer thin-film resistive copper foil on ½ oz (18 µm) copper, designed for high-frequency response.',
      '00000000-0000-0000-0000-000000000009'
    ),
(
      '00000000-0000-0000-0001-000000000082',
      'TCR EHF Series',
      'tcr-ehf-series',
      '25 Ω/sq TCR EHF embedded foil with very smooth thin film for lowest loss.',
      '00000000-0000-0000-0000-000000000009'
    ),
(
      '00000000-0000-0000-0001-000000000083',
      'temperature sensors',
      'temperature-sensors',
      'Space * EV * Medical * IOT',
      '00000000-0000-0000-0000-000000000010'
    ),
(
      '00000000-0000-0000-0001-000000000084',
      '3D Printed Dielectric Parts',
      '3d-printed-dielectric-parts',
      'Industry’s first low-loss dielectric photopolymer enabling scalable 3D printing of dielectric and GRIN lenses. Dielectric constant 2.8, loss tangent 0.0043.',
      '00000000-0000-0000-0000-000000000011'
    ),
(
      '00000000-0000-0000-0001-000000000085',
      'RF/Microwave PCB',
      'rfmicrowave-pcb',
      'High frequency laminate expertise',
      '00000000-0000-0000-0000-000000000012'
    ),
(
      '00000000-0000-0000-0001-000000000086',
      'PCB Fabrication',
      'pcb-fabrication',
      'RF, Microwave, and mmWave PCB Fabrication Experts',
      '00000000-0000-0000-0000-000000000013'
    ),
(
      '00000000-0000-0000-0001-000000000087',
      'high voltage power supplies',
      'high-voltage-power-supplies',
      'Modular High Voltage Power Supply, Rack Mount Power Supply, X-Ray Generators, and Monoblock® Sources',
      '00000000-0000-0000-0000-000000000014'
    ),
(
      '00000000-0000-0000-0001-000000000088',
      'Perimeter Intrusion Detection System (PIDS)',
      'perimeter-intrusion-detection-system-pids',
      'High security fencing, C4I security management, fiber & copper vibration systems, seismic sensors, and anti-drone defense',
      '00000000-0000-0000-0000-000000000015'
    )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 3. Products (169 items with specifications and SEO tags)
-- ------------------------------------------------------------------------------
INSERT INTO public.products (
  id, name, slug, oem_id, category_id, description,
  specifications, features, applications, datasheet_url,
  is_published, is_featured,
  meta_title, meta_description, canonical_url, og_image_url
) VALUES
(
        '00000000-0000-0000-0002-000000000001',
        'RT/duroid 5880',
        'rtduroid-5880',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'PTFE composite laminate with very low dielectric constant and loss, reinforced with glass microfibers.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Antennas', 'RF/microwave circuits communication system', 'aerospace & defense', 'Commercial Airline Broadband Antennas', 'Microstrip and Stripline Circuits', 'Millimeter Wave Applications', 'Military Radar Systems', 'Missile Guidance Systems', 'Point to Point Digital Radio Antennas'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 5880 RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 5880 RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-5880',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000002',
        'RT/duroid 5870',
        'rtduroid-5870',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'Low Dk PTFE laminate with excellent electrical consistency and low loss.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Broadband RF circuits', 'microwave links', 'Commercial Airline Broadband Antennas', 'Microstrip and Stripline Circuits', 'Millimeter Wave Applications', 'Military Radar Systems', 'Missile Guidance Systems', 'Point to Point Digital Radio Antennas'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 5870 RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 5870 RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-5870',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000003',
        'RT/duroid 5880LZ',
        'rtduroid-5880lz',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'Lightweight PTFE laminate designed for weight-sensitive RF applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'UAVs', 'space communication', 'Airborne antenna system', 'Lightweight feed networks', 'Military radar systems', 'Missile guidance systems', 'Point-to-point digital radio antennas'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 5880LZ RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 5880LZ RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-5880lz',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000004',
        'RT/duroid 6002',
        'rtduroid-6002',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'Medium Dk PTFE composite offering controlled impedance and mechanical stability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF power amplifiers', 'filters', 'couplers.Phased Array Antennas', 'Ground Based and Airborne Radar Systems', 'Global Positioning System
Antennas', 'Power Backplanes', 'High Reliability Complex Multilayer Circuits', 'Commercial Airline Collision Avoidance', 'Beam Forming Networks'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 6002 RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 6002 RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-6002',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000005',
        'RT/duroid 6006',
        'rtduroid-6006',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'Provide high dielectric constants (Dk) to enable circuit size reduction. low loss, ideal for operating at X-band or below. Additionally, their tight Dk and thickness control deliver repeatable circuit performance.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Patch Antennas', 'Satellite Communications Systems', 'Power Amplifiers', 'Aircraft Collision Avoidance Systems', 'Ground Radar Warning Systems', 'miniaturized microwave circuits.'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 6006 RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 6006 RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-6006',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000006',
        'RT/duroid 6010.2LM',
        'rtduroid-60102lm',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'Provide high dielectric constants (Dk) to enable circuit size reduction. low loss, ideal for operating at X-band or below. Additionally, their tight Dk and thickness control deliver repeatable circuit performance.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Patch Antennas', 'Satellite Communications Systems', 'Power Amplifiers', 'Aircraft Collision Avoidance Systems', 'Ground Radar Warning Systems', 'high density RF boards.'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 6010.2LM RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 6010.2LM RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-60102lm',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000007',
        'RT/duroid 6035HTC',
        'rtduroid-6035htc',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000001',
        'Thermally conductive PTFE laminate with medium dielectric constant and excellent heat dissipation.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-power RF amplifiers', 'microwave power devices', 'couplers', 'filters', 'combiners', 'power dividers'],
        NULL,
        false,
        false,
        'Rogers RT/duroid 6035HTC RT/Duroid | Icon Electromatic',
        'Buy genuine Rogers RT/duroid 6035HTC RT/Duroid from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/rtduroid-6035htc',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000008',
        'RO4350B',
        'ro4350b',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000002',
        'Low loss laminate with excellent thermal stability and multilayer capability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Cellular Base Station Antennas and Power Amplifiers', 'RF Identification Tags', 'Automotive Radar and Sensors', 'LNB’s for Direct Broadcast Satellites', 'Automotive radar', 'base stations', 'RF power.'],
        NULL,
        false,
        false,
        'Rogers RO4350B RO400 Series | Icon Electromatic',
        'Buy genuine Rogers RO4350B RO400 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro4350b',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000009',
        'RO4003C',
        'ro4003c',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000002',
        'Hydrocarbon ceramic laminate offering FR-4-like processing with RF performance.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Cellular Base Station Antennas and Power Amplifiers', 'RF Identification Tags', 'Automotive Radar and Sensors', 'LNB’s for Direct Broadcast Satellites', 'RF/microwave circuits', 'ISM band designs.'],
        NULL,
        false,
        false,
        'Rogers RO4003C RO400 Series | Icon Electromatic',
        'Buy genuine Rogers RO4003C RO400 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro4003c',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000010',
        'RO4360G2',
        'ro4360g2',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000002',
        'High Dk laminate optimized for multilayer high-reliability PCBs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Multilayer RF PCB boards', 'defense electronics.'],
        NULL,
        false,
        false,
        'Rogers RO4360G2 RO400 Series | Icon Electromatic',
        'Buy genuine Rogers RO4360G2 RO400 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro4360g2',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000011',
        'RO4835',
        'ro4835',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000002',
        'Low loss, oxidation-resistant laminate compatible with standard PCB processing.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF/microwave multilayer circuits.'],
        NULL,
        false,
        false,
        'Rogers RO4835 RO400 Series | Icon Electromatic',
        'Buy genuine Rogers RO4835 RO400 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro4835',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000012',
        'RO3003',
        'ro3003',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000003',
        'Ceramic-filled PTFE laminate with low loss and stable Dk over frequency.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Automotive radar', '5G mmWave', 'ADAS.'],
        NULL,
        false,
        false,
        'Rogers RO3003 RO300 Series | Icon Electromatic',
        'Buy genuine Rogers RO3003 RO300 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro3003',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000013',
        'RO3003G2',
        'ro3003g2',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000003',
        'Next-generation RO3003 with improved processing and consistency.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['ADAS systems like adaptive cruise control', 'forward collision warning and active brake or lane change assist'],
        NULL,
        false,
        false,
        'Rogers RO3003G2 RO300 Series | Icon Electromatic',
        'Buy genuine Rogers RO3003G2 RO300 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro3003g2',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000014',
        'RO3006',
        'ro3006',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000003',
        'Higher Dk ceramic-filled PTFE laminate for compact RF designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Automotive radar applications', 'Global positioning satellite antennas', 'Cellular telecommunications systems -power amplifiers and antennas', 'Patch antenna for wireless communications', 'Direct broadcast satellites', 'Datalink on cable systems', 'Remote meter readers', 'Power backplanes', 'RF amplifiers', 'satellite communication.'],
        NULL,
        false,
        false,
        'Rogers RO3006 RO300 Series | Icon Electromatic',
        'Buy genuine Rogers RO3006 RO300 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro3006',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000015',
        'RO3010',
        'ro3010',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000003',
        'Ceramic-filled PTFE composites that offer a higher dielectric constant with excellent stability.Very high Dk laminate enabling extreme miniaturization.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Automotive radar applications', 'Global positioning satellite antennas', 'Cellular telecommunications systems -power amplifiers and antennas', 'Patch antenna for wireless communications', 'Direct broadcast satellites', 'Datalink on cable systems', 'Remote meter readers', 'Power backplanes', 'Microwave circuits', 'impedance matching.'],
        NULL,
        false,
        false,
        'Rogers RO3010 RO300 Series | Icon Electromatic',
        'Buy genuine Rogers RO3010 RO300 Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro3010',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000016',
        'TMM 3',
        'tmm-3',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000004',
        'Thermoset microwave laminate with matched CTE to copper.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF and microwave circuitry', 'Power amplifiers and combiners', 'Filters and coupler', 'Satellite communication systems', 'Global Positioning Systems Antennas', 'Patch Antennas', 'Dielectric polarizers and lenses', 'Chip testers', 'Military & aerospace microwave circuits.'],
        NULL,
        false,
        false,
        'Rogers TMM 3 TMM Series | Icon Electromatic',
        'Buy genuine Rogers TMM 3 TMM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tmm-3',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000017',
        'TMM 4',
        'tmm-4',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000004',
        'Thermoset microwave laminate with low Dk and matched CTE to copper.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF and microwave circuitry', 'Power amplifiers and combiners', 'Filters and coupler', 'Satellite communication systems', 'Global Positioning Systems Antennas', 'Patch Antennas', 'Dielectric polarizers and lenses', 'Chip testers', 'Aerospace and defense RF circuits.'],
        NULL,
        false,
        false,
        'Rogers TMM 4 TMM Series | Icon Electromatic',
        'Buy genuine Rogers TMM 4 TMM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tmm-4',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000018',
        'TMM 6',
        'tmm-6',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000004',
        'Medium Dk thermoset laminate with excellent mechanical stability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF and microwave circuitry', 'Power amplifiers and combiners', 'Filters and coupler', 'Satellite communication systems', 'Global Positioning Systems Antennas', 'Patch Antennas', 'Dielectric polarizers and lenses', 'Chip testers', 'High reliability RF applications.'],
        NULL,
        false,
        false,
        'Rogers TMM 6 TMM Series | Icon Electromatic',
        'Buy genuine Rogers TMM 6 TMM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tmm-6',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000019',
        'TMM 10',
        'tmm-10',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000004',
        'High Dk thermoset laminate for compact microwave designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF and microwave circuitry', 'Power amplifiers and combiners', 'Filters and coupler', 'Satellite communication systems', 'Global Positioning Systems Antennas', 'Patch Antennas', 'Dielectric polarizers and lenses', 'Chip testers', 'Power amplifiers', 'RF modules.'],
        NULL,
        false,
        false,
        'Rogers TMM 10 TMM Series | Icon Electromatic',
        'Buy genuine Rogers TMM 10 TMM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tmm-10',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000020',
        'TMM 10i',
        'tmm-10i',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000004',
        'Improved TMM10 with enhanced electrical consistency and reliability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF and microwave circuitry', 'Power amplifiers and combiners', 'Filters and coupler', 'Satellite communication systems', 'Global Positioning Systems Antennas', 'Patch Antennas', 'Dielectric polarizers and lenses', 'Chip testersHigh-reliability microwave circuits.'],
        NULL,
        false,
        false,
        'Rogers TMM 10i TMM Series | Icon Electromatic',
        'Buy genuine Rogers TMM 10i TMM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tmm-10i',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000021',
        'TMM 13i',
        'tmm-13i',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000004',
        'Very high Dk thermoset laminate for compact RF designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF and microwave circuitry', 'Power amplifiers and combiners', 'Filters and coupler', 'Satellite communication systems', 'Global Positioning Systems Antennas', 'Patch Antennas', 'Dielectric polarizers and lenses', 'Chip testersPower amplifiers', 'impedance matching networks.'],
        NULL,
        false,
        false,
        'Rogers TMM 13i TMM Series | Icon Electromatic',
        'Buy genuine Rogers TMM 13i TMM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tmm-13i',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000022',
        'CLTE-XT',
        'clte-xt',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000005',
        'PTFE laminate with woven glass reinforcement for dimensional stability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'multilayer RF circuits.'],
        NULL,
        false,
        false,
        'Rogers CLTE-XT CLTE Series | Icon Electromatic',
        'Buy genuine Rogers CLTE-XT CLTE Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/clte-xt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000023',
        'CLTE-MW',
        'clte-mw',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000005',
        'Low loss PTFE laminate optimized for microwave multilayer designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Radar', 'satellite communication.'],
        NULL,
        false,
        false,
        'Rogers CLTE-MW CLTE Series | Icon Electromatic',
        'Buy genuine Rogers CLTE-MW CLTE Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/clte-mw',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000024',
        'DiClad 880',
        'diclad-880',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000006',
        'PTFE woven-glass reinforced laminate with controlled dielectric properties and good mechanical stability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF/microwave circuits', 'aerospace & defense.'],
        NULL,
        false,
        false,
        'Rogers DiClad 880 DICLAD Series | Icon Electromatic',
        'Buy genuine Rogers DiClad 880 DICLAD Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/diclad-880',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000025',
        'DiClad 870',
        'diclad-870',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000006',
        'Low loss PTFE composite laminate optimized for microwave frequency performance.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF power amplifiers', 'filters', 'couplers.'],
        NULL,
        false,
        false,
        'Rogers DiClad 870 DICLAD Series | Icon Electromatic',
        'Buy genuine Rogers DiClad 870 DICLAD Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/diclad-870',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000026',
        'DiClad 527',
        'diclad-527',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000006',
        'PTFE laminate with balanced electrical and mechanical properties for RF designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Microwave circuits', 'communication systems.'],
        NULL,
        false,
        false,
        'Rogers DiClad 527 DICLAD Series | Icon Electromatic',
        'Buy genuine Rogers DiClad 527 DICLAD Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/diclad-527',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000027',
        'MAGTREX 555',
        'magtrex-555',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000006',
        'Magnetically loaded laminate engineered for high impedance RF applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF absorbers', 'EMI suppression', 'specialty RF designs.'],
        NULL,
        false,
        false,
        'Rogers MAGTREX 555 DICLAD Series | Icon Electromatic',
        'Buy genuine Rogers MAGTREX 555 DICLAD Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/magtrex-555',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000028',
        'TC350',
        'tc350',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Thermally conductive ceramic-filled PTFE laminate for RF thermal management.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-power RF and microwave circuits.'],
        NULL,
        false,
        false,
        'Rogers TC350 TC Series | Icon Electromatic',
        'Buy genuine Rogers TC350 TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tc350',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000029',
        'TC350 Plus',
        'tc350-plus',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Enhanced TC350 with improved thermal conductivity and electrical stability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Power RF modules', 'base station hardware.'],
        NULL,
        false,
        false,
        'Rogers TC350 Plus TC Series | Icon Electromatic',
        'Buy genuine Rogers TC350 Plus TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tc350-plus',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000030',
        'TC600',
        'tc600',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'High thermal conductivity PTFE laminate designed for extreme heat dissipation needs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-power microwave and RF power electronics.'],
        NULL,
        false,
        false,
        'Rogers TC600 TC Series | Icon Electromatic',
        'Buy genuine Rogers TC600 TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/tc600',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000031',
        'RO4400 Bondply',
        'ro4400-bondply',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Thermoset prepreg matched to RO4000 series laminates.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Multilayer RF PCB bonding.'],
        NULL,
        false,
        false,
        'Rogers RO4400 Bondply TC Series | Icon Electromatic',
        'Buy genuine Rogers RO4400 Bondply TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro4400-bondply',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000032',
        'RO4400T Bondply',
        'ro4400t-bondply',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Toughened bondply for sequential lamination.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High layer count RF boards.'],
        NULL,
        false,
        false,
        'Rogers RO4400T Bondply TC Series | Icon Electromatic',
        'Buy genuine Rogers RO4400T Bondply TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/ro4400t-bondply',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000033',
        '2929 Bondply',
        '2929-bondply',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Thin adhesive bondply for RF multilayer constructions.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Microwave multilayer bonding.'],
        NULL,
        false,
        false,
        'Rogers 2929 Bondply TC Series | Icon Electromatic',
        'Buy genuine Rogers 2929 Bondply TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/2929-bondply',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000034',
        'CuClad 6250 Bonding Film',
        'cuclad-6250-bonding-film',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Thermoplastic bonding film with low dielectric loss.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF multilayer laminations.'],
        NULL,
        false,
        false,
        'Rogers CuClad 6250 Bonding Film TC Series | Icon Electromatic',
        'Buy genuine Rogers CuClad 6250 Bonding Film TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/cuclad-6250-bonding-film',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000035',
        'CuClad 6700 Bonding Film',
        'cuclad-6700-bonding-film',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'CTFE bonding film with excellent electrical properties.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High reliability RF boards.'],
        NULL,
        false,
        false,
        'Rogers CuClad 6700 Bonding Film TC Series | Icon Electromatic',
        'Buy genuine Rogers CuClad 6700 Bonding Film TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/cuclad-6700-bonding-film',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000036',
        'SpeedWave 300P Prepreg',
        'speedwave-300p-prepreg',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Ultra-low loss prepreg for high-speed & RF designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['5G', 'radar', 'aerospace electronics.'],
        NULL,
        false,
        false,
        'Rogers SpeedWave 300P Prepreg TC Series | Icon Electromatic',
        'Buy genuine Rogers SpeedWave 300P Prepreg TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/speedwave-300p-prepreg',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000037',
        'XtremeSpeed RO1200',
        'xtremespeed-ro1200',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0001-000000000007',
        'Ultra-low loss, low Dk laminate for very high-speed digital and RF designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-speed digital', 'data centers', 'advanced RF.'],
        NULL,
        false,
        false,
        'Rogers XtremeSpeed RO1200 TC Series | Icon Electromatic',
        'Buy genuine Rogers XtremeSpeed RO1200 TC Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rogers/xtremespeed-ro1200',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000038',
        'RF Adapters',
        'rf-adapters',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000008',
        'RF adapters for 1.35mm, 1.85mm, 2.4mm, 2.4mm NMD, 2.92mm, 2.92mm NMD, 3.5mm, BNC, N-Type, SMA, SMP, WR19, WR22, and WR28. Wide selection of connector genders, mounting types and orientations.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Frequency Range as wide as DC to 110 GHz
Low insertion loss
Excellent VSWR
Rugged construction'],
        NULL,
        false,
        false,
        'Mini-Circuits RF Adapters RF Adapters | Icon Electromatic',
        'Buy genuine Mini-Circuits RF Adapters RF Adapters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rf-adapters',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000039',
        'RF/MW Amplifiers',
        'rfmw-amplifiers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000009',
        'Gain blocks, low noise amplifiers, power amplifiers, RF transistors, Class-A and Class-AB amplifiers, linear amplifiers, 75Ω CATV amplifiers, dual-matched amplifiers, variable gain amplifiers, pulse amplifiers',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Connectorized', 'MMIC surface mount', 'bare die & waveguide interfaces
In-house design and manufacturing
Industry-leading quality and reliability
Cost-effective custom solutions'],
        NULL,
        false,
        false,
        'Mini-Circuits RF/MW Amplifiers RF/MW Amplifiers | Icon Electromatic',
        'Buy genuine Mini-Circuits RF/MW Amplifiers RF/MW Amplifiers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rfmw-amplifiers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000040',
        'RF Attenuators',
        'rf-attenuators',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000010',
        'Fixed, Digital Step, Voltage Variable, & Programmable- Coaxial, surface mount, and MMIC attenuator models for 50-Ohm & 75-Ohm systems including fixed attenuators, high-power attenuators, digital step / programmable attenuators, voltage variable attenuators',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['DC passing and DC blocking models
Power handling up to 100W
Bandwidths spanning DC to 67 GHz
Excellent accuracy and repeatability'],
        NULL,
        false,
        false,
        'Mini-Circuits RF Attenuators RF Attenuators | Icon Electromatic',
        'Buy genuine Mini-Circuits RF Attenuators RF Attenuators from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rf-attenuators',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000041',
        'Bias Tees',
        'bias-tees',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000011',
        'RF & Microwave Bias Tees (Bias Ts)
Wideband DC to RF Isolation
Your complete source for coaxial and surface mount bias tees for DC current up to 5 Amps and RF bandwidths spanning 100 kHz to 54 GHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Choose from coaxial connector types including SMA', 'N-Type', 'and BNC
Tiny surface mount packages as small as 2.5 x 2.5 mm or bare die MMICs
Excellent isolation
50-Ohm and 75-Ohm models'],
        NULL,
        false,
        false,
        'Mini-Circuits Bias Tees Bias Tees | Icon Electromatic',
        'Buy genuine Mini-Circuits Bias Tees Bias Tees from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/bias-tees',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000042',
        'RF/MW/MMW Cable asseblies',
        'rfmwmmw-cable-asseblies',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000012',
        'RF Coaxial Cables
System Interconnect Cables and Precision Test Leads
Mini-Circuits suite of RF cable solutions is built for precision, performance, and versatility. Our RF/microwave interconnect and precision test cables are available for 50-Ohm and 75-Ohm systems, covering frequencies from DC to 110 GHz. With connector options including SMA, N-Type, F-Type, BNC, and 2.92mm, we provide unmatched flexibility cross applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Available in male and female connector combinations
Connector formats: straight', 'right angle', 'bulkhead', 'quick-connect
Engineered to deliver high reliability under demanding test and field conditions
Custom RF cable assemblies available to meet specific design requirements'],
        NULL,
        false,
        false,
        'Mini-Circuits RF/MW/MMW Cable asseblies RF/MW/MMW Cable asseblies | Icon Electromatic',
        'Buy genuine Mini-Circuits RF/MW/MMW Cable asseblies RF/MW/MMW Cable asseblies from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rfmwmmw-cable-asseblies',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000043',
        'RF Couplers',
        'rf-couplers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000013',
        'RF Couplers
Directional, Bi-Directional, Dual Directional & RF Tap
Over 475 models with power handling from 0.5 to 250W covering DC to 65 GHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Transformer-based', 'LTCC', 'stripline/microstrip', 'bridge', 'and MMIC designs
Surface mount and coaxial formats
Wide selection for 50-ohm and 75-ohm systems'],
        NULL,
        false,
        false,
        'Mini-Circuits RF Couplers RF Couplers | Icon Electromatic',
        'Buy genuine Mini-Circuits RF Couplers RF Couplers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rf-couplers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000044',
        'RF /MW Custom Assemblies',
        'rf-mw-custom-assemblies',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000014',
        'Custom integration to achieve highly functional systems and sub-systems.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Signal Generator Assemblies
Signal Splitters and Distribution Systems
Frequency Convertor Module
Amplifier Switch Filter Assemblies'],
        NULL,
        false,
        false,
        'Mini-Circuits RF /MW Custom Assemblies RF /MW Custom Assemblies | Icon Electromatic',
        'Buy genuine Mini-Circuits RF /MW Custom Assemblies RF /MW Custom Assemblies from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rf-mw-custom-assemblies',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000045',
        'DC Blocks',
        'dc-blocks',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000015',
        'Choose from a variety of wideband DC blocks with SMA, N-type, BNC, 2.92mm, 2.4mm and 1.85mm connector types for 50-Ohm and 75-Ohm applications from 100 kHz to 65 GHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Low insertion loss and excellent return loss
Rugged constructio'],
        NULL,
        false,
        false,
        'Mini-Circuits DC Blocks DC Blocks | Icon Electromatic',
        'Buy genuine Mini-Circuits DC Blocks DC Blocks from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/dc-blocks',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000046',
        'MMIC Die Parts',
        'mmic-die-parts',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000016',
        'Mini-Circuits offers a broad selection of MMIC components in bare die format for your chip and wire integration, including amplifiers, attenuators, couplers, filters, mixers, multipliers, and splitter/combiners.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Wide selection of models spanning DC to mmWave
Available in small quantity gel-paks', 'partial and full wafers
More models available as unpackaged die on request'],
        NULL,
        false,
        false,
        'Mini-Circuits MMIC Die Parts MMIC Die Parts | Icon Electromatic',
        'Buy genuine Mini-Circuits MMIC Die Parts MMIC Die Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/mmic-die-parts',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000047',
        'Equalizers',
        'equalizers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000017',
        'Voltage Variable and Fixed Slope Models
Nearly 100 equalizer models for gain flattening and frequency-dependent loss compensation in a wide range of applications from DC to 45 GHz.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Coaxial', 'surface-mount packages', 'and bare die
Precise attenuation slope control
50-Ohm and 75-Ohm designs'],
        NULL,
        false,
        false,
        'Mini-Circuits Equalizers Equalizers | Icon Electromatic',
        'Buy genuine Mini-Circuits Equalizers Equalizers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/equalizers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000048',
        'Filters',
        'filters',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000018',
        'RF Filters
Low-Pass, High-Pass, Band-Pass, Band-Stop, Diplexers. Triplexers, and More!
Mini-Circuits has over 3000 models of RF filters available for same-day shipping and is able to create custom designs with fast turnarounds for almost any need',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Patented MMIC Reflectionless Filters Eliminate Spurs
Sharp-Rejection Cavity and Suspended Substrate Filters
LTCC Filters as small as 0603
Passbands spanning DC to 58 GHz'],
        NULL,
        false,
        false,
        'Mini-Circuits Filters Filters | Icon Electromatic',
        'Buy genuine Mini-Circuits Filters Filters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/filters',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000049',
        'Frequency Mixers',
        'frequency-mixers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000019',
        'RF Frequency Mixers
The Industry''s Widest Selection
Over 300 models of RF frequency mixers available in coaxial, surface mount, and MMIC die formats from 500 Hz to 65GHz! Whether you need wideband performance, high IP3, low distortion, upconverters, downconverters, active mixers, hi-rel ceramic mixers - we have a solution for your needs. Most models are in-stock and ship same-day.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['LO power levels from -3 to 27 dBm
Excellent repeatability
Hi-rel', 'hermetically sealed ceramic models
MMIC mixers up to 65 GHz'],
        NULL,
        false,
        false,
        'Mini-Circuits Frequency Mixers Frequency Mixers | Icon Electromatic',
        'Buy genuine Mini-Circuits Frequency Mixers Frequency Mixers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/frequency-mixers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000050',
        'Frequency Multipliers',
        'frequency-multipliers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000020',
        'Frequency Multipliers
Mini-Circuits offers a wide array of off-the-shelf multipliers including doublers, triplers, quadruplers, X5, X7, and X12 multipliers with output frequencies ranging from 100 KHz to 72 GHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Low conversion loss
Excellent suppression of unwanted harmonics
Coaxial', 'surface mount and MMIC die formats'],
        NULL,
        false,
        false,
        'Mini-Circuits Frequency Multipliers Frequency Multipliers | Icon Electromatic',
        'Buy genuine Mini-Circuits Frequency Multipliers Frequency Multipliers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/frequency-multipliers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000051',
        'Impedance Matching Pads',
        'impedance-matching-pads',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000021',
        'Surface mount and coaxial 50 Ohm / 75 Ohm impedance matching pads for CATV systems, broadband networks, test setups and more!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['SMA', 'N-Type and BNC connectors available
Frequency ranges as wide as DC to 3000 MHz
Excellent matching VSWR'],
        NULL,
        false,
        false,
        'Mini-Circuits Impedance Matching Pads Impedance Matching Pads | Icon Electromatic',
        'Buy genuine Mini-Circuits Impedance Matching Pads Impedance Matching Pads from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/impedance-matching-pads',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000052',
        'Limiters',
        'limiters',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000022',
        'Tough and reliable for the harshest operating conditions, from 100 kHz to 8.2 GHz!
Tough and reliable for the harshest operating conditions, from 100 KHz to 8.20 GHz',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Rugged coaxial models
Hermetically sealed LTCC models as small as 0.12 x 0.12 x 0.045 in.
Quick recovery times
Cost-effective custom models with rapid response and fast turnaround!'],
        NULL,
        false,
        false,
        'Mini-Circuits Limiters Limiters | Icon Electromatic',
        'Buy genuine Mini-Circuits Limiters Limiters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/limiters',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000053',
        'Modulators / Demodulators',
        'modulators-demodulators',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000023',
        '&Q and QPSK Modulators / Demodulators',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['QPSK modulators and I&Q modulator/demodulators covering RF/LO frequencies from 1 to 2000 MHz and I&Q frequencies from DC to 5 MHz. Available in coaxial connectorized and surface mount packages', 'these components provide excellent harmonic rejection as well as good carrier and sideband rejection while maintaining low conversion loss over their operating range.'],
        NULL,
        false,
        false,
        'Mini-Circuits Modulators / Demodulators Modulators / Demodulators | Icon Electromatic',
        'Buy genuine Mini-Circuits Modulators / Demodulators Modulators / Demodulators from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/modulators-demodulators',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000054',
        'Oscillators',
        'oscillators',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000024',
        'Voltage Controlled Oscillators (VCOs)
Wide selection of models from spot frequency and narrow band to medium and wide bandwidths up to 1.5 octaves with low phase noise, linear tuning, dual outputs, 5V tuning for PLLs and more!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Voltage Controlled Oscillators (VCOs)
Wide selection of models from spot frequency and narrow band to medium and wide bandwidths up to 1.5 octaves with low phase noise', 'linear tuning', 'dual outputs', '5V tuning for PLLs and more!'],
        NULL,
        false,
        false,
        'Mini-Circuits Oscillators Oscillators | Icon Electromatic',
        'Buy genuine Mini-Circuits Oscillators Oscillators from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/oscillators',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000055',
        'Phase Detectors',
        'phase-detectors',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000025',
        'RF Phase Detectors
Broadband and optimized band RF phase detectors for phase locked loops (PLLs), monitoring and levelling circuits from 1 to 650 MHz',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High DC output versus phase
Low DC offset
Coaxial designs with rugged construction
Miniature', 'surface-mount packages'],
        NULL,
        false,
        false,
        'Mini-Circuits Phase Detectors Phase Detectors | Icon Electromatic',
        'Buy genuine Mini-Circuits Phase Detectors Phase Detectors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/phase-detectors',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000056',
        'Phase Shifters',
        'phase-shifters',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000026',
        'RF Phase Shifters
Mini-Circuits’ broad selection of surface-mount and coaxial voltage-variable phase shifters gives you precise phase control up to 360 degrees for a wide range of applications including cellular, radar, test and measurement and more!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Precise 180-degree and 360-degree phase control
Low insertion loss
Rugged coaxial and miniature surface-mount formats available'],
        NULL,
        false,
        false,
        'Mini-Circuits Phase Shifters Phase Shifters | Icon Electromatic',
        'Buy genuine Mini-Circuits Phase Shifters Phase Shifters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/phase-shifters',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000057',
        'Power Detectors',
        'power-detectors',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000027',
        'RF Power Detectors
Precision RF power detectors for a wide range of applications including RF/IF power measurement, transmit/receive power monitoring, RF leakage monitors, fast feedback levelling circuits, receiver gain control systems and more!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Wide bandwidth', '0.01 to 67 GHz
Dynamic range as wide as 60 dB', 'spanning -60 to +20 dBm
Low noise
Built-in temperature sensor'],
        NULL,
        false,
        false,
        'Mini-Circuits Power Detectors Power Detectors | Icon Electromatic',
        'Buy genuine Mini-Circuits Power Detectors Power Detectors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/power-detectors',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000058',
        'Power Sensors',
        'power-sensors',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000028',
        'RF Power Sensors
For CW, RMS, Peak & Average Measurements. The PWR series features a high range of performance sensors, including up to a 40 GHz power sensor and supporting measurements of any type of signal from CW / single tone applications, to pulsed signals and most modern digital modulations.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Input power ranges down to -60 dBm are ideal for measurement of transmitted signals and characterization of components with high loss or rejection (such as filters). Sample rates up to 80 million samples per second allow detailed signal analysis with very fine measurement resolution.Frequency Ranges Spanning
9 kHz - 40 GHz

Dynamic range options spanning
-60 to +20 dBm

CW', 'true RMS peak and average measurement capability

USB rf power sensor and ethernet control options'],
        NULL,
        false,
        false,
        'Mini-Circuits Power Sensors Power Sensors | Icon Electromatic',
        'Buy genuine Mini-Circuits Power Sensors Power Sensors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/power-sensors',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000059',
        'Power Sensors',
        'power-sensors-power-sensors',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000028',
        'RF Power Sensors
For CW, RMS, Peak & Average Measurements
The RF power sensor from Mini-Circuits has been developed to provide a reliable and affordable option for any test requirement, budget, and experience level.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['The PWR series features a high range of performance sensors', 'including up to a 40 GHz power sensor and supporting measurements of any type of signal from CW / single tone applications', 'to pulsed signals and most modern digital modulations.'],
        NULL,
        false,
        false,
        'Mini-Circuits Power Sensors Power Sensors | Icon Electromatic',
        'Buy genuine Mini-Circuits Power Sensors Power Sensors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/power-sensors-power-sensors',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000060',
        'Power Splitters / Combiners',
        'power-splitters-combiners',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000029',
        'RF Power Splitters/Dividers/Combiners
2-Way, 3-way, 4-way, 6-way, 8-way, 10-way, 12-way, 16-way and up to 24-way models for 50 Ohm and 75 Ohm systems from DC to 67 GHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Coaxial', 'surface mount', 'and MMIC die formats available
SMA', 'N-Type', 'F-Type', 'BNC', '2.92mm', '2.4mm', '1.85mm and 7/16 DIN connectors
Power handling up to 1.2kW
DC passing and DC blocking'],
        NULL,
        false,
        false,
        'Mini-Circuits Power Splitters / Combiners Power Splitters / Combiners | Icon Electromatic',
        'Buy genuine Mini-Circuits Power Splitters / Combiners Power Splitters / Combiners from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/power-splitters-combiners',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000061',
        '90°/180° Hybrids',
        '90180-hybrids',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000030',
        '90-Degree and 180-Degree
Hybrid Splitter/Combiners
A broad selection of quadrature (90-degree) and 180-degree hybrids in coaxial connectorized and surface-mount packages as well as MMIC die.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['90°', '180°', 'and quadrifilar phase shifts
Power handling up to 50W
Low phase and amplitude unbalance
Choose from LTCC', 'MMIC', 'core and wire', 'and microstrip/stripline designs
BROWSE CATALOG
CONTACT US
Catalog Products'],
        NULL,
        false,
        false,
        'Mini-Circuits 90°/180° Hybrids 90°/180° Hybrids | Icon Electromatic',
        'Buy genuine Mini-Circuits 90°/180° Hybrids 90°/180° Hybrids from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/90180-hybrids',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000062',
        'Reference Designs',
        'reference-designs',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000031',
        'High performance Reference Designs solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'Mini-Circuits Reference Designs Reference Designs | Icon Electromatic',
        'Buy genuine Mini-Circuits Reference Designs Reference Designs from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/reference-designs',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000063',
        'RF Chokes',
        'rf-chokes',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000032',
        'RF Chokes
RF Chokes with effective parallel resistance over wide bandwidths from 5 MHz to 10 GHz!
RF chokes are commonly used in RF system design to block RF signal while passing DC current. Mini-Circuits offers RF chokes with effective parallel resistance for DC current up to 15A over wide bandwidths from 5 MHz to 10 GH',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Tiny surface mount packages', 'as small as 0.15 x 0.15 x 0.15"
Low DC resistance
Low parasitic capacitance
DC current handling up to 15A'],
        NULL,
        false,
        false,
        'Mini-Circuits RF Chokes RF Chokes | Icon Electromatic',
        'Buy genuine Mini-Circuits RF Chokes RF Chokes from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rf-chokes',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000064',
        'Research & Educational Kits',
        'research-educational-kits',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000033',
        'UVNA-63 microwave transceiver kit includes everything students need to build a fully functioning vector network analyzer and bridge the gap between textbook theory in the classroom and practical, real-world measurement in the lab.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['The IMAGEVK-74 is a revolutionary tool incorporating Vayyar''s highly integrated RFIC technology and radar IP into a compact evaluation kit. This kit enables researchers around the world to explore and realize millimeter wave imaging and sensing applications without the cost and overhead that would otherwise be associated with developing the required hardware.'],
        NULL,
        false,
        false,
        'Mini-Circuits Research & Educational Kits Research & Educational Kits | Icon Electromatic',
        'Buy genuine Mini-Circuits Research & Educational Kits Research & Educational Kits from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/research-educational-kits',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000065',
        'RF & Microwave Energy',
        'rf-microwave-energy',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000034',
        'High performance RF & Microwave Energy solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'Mini-Circuits RF & Microwave Energy RF & Microwave Energy | Icon Electromatic',
        'Buy genuine Mini-Circuits RF & Microwave Energy RF & Microwave Energy from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/rf-microwave-energy',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000066',
        'Space Upscreening',
        'space-upscreening',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000035',
        'Mil Spec or Equivalent Qualification with EEE-INST-002 Compliant Workflows
Mini-Circuits has a long history of space-level screening and testing servicing some of the earliest government space missions all the way through to the modern independent enterprises. Most of our catalog and custom components can be upscreened in-house for Mil Standard or equivalent in as little as 90 days. Our in-house screening reduces costs and accelerates your project timeline.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Standard Capabilities: Burn-in', 'thermal shock', 'vibration*', 'radiographic inspection*', 'destructive physical analysis (DPA)*', 'mechanical shock', 'hermeticity', 'outgassing requirements', 'residual gas analysis', 'and hydrogen poisoning susceptibility with accompanying acceptance test procedure (ATP).

In addition to our standard capabilities', 'Mini-Circuits'' space specialists on the applications support team can develop custom solutions for nearly any project.'],
        NULL,
        false,
        false,
        'Mini-Circuits Space Upscreening Space Upscreening | Icon Electromatic',
        'Buy genuine Mini-Circuits Space Upscreening Space Upscreening from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/space-upscreening',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000067',
        'Switches',
        'switches',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000036',
        'F/Microwave Switches
SPDT, DPDT (transfer), SP4T, SP6T, SP8T, and SP10T mechanical and solid state RF switches for 50-ohm and 75-ohm systems spanning DC to 50 GHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Ultra-reliable mechanical switches capable of extended life up to 10-million switch cycles!
Solid-state switches with extremely fast switching times
USB', 'Ethernet', 'and SPI control interfaces available
Coaxial and surface mount formats available'],
        NULL,
        false,
        false,
        'Mini-Circuits Switches Switches | Icon Electromatic',
        'Buy genuine Mini-Circuits Switches Switches from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/switches',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000068',
        'Synthesizers',
        'synthesizers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000037',
        'RF Frequency Synthesizers
Mini-Circuits offers a broad selection of RF/microwave frequency synthesizers to meet the needs of engineers for a wide range of applications up to 7800 MHz',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Surface mount and coaxial formats
Fixed frequency to broadband
Low phase noise and spurious
Affordable custom designs available'],
        NULL,
        false,
        false,
        'Mini-Circuits Synthesizers Synthesizers | Icon Electromatic',
        'Buy genuine Mini-Circuits Synthesizers Synthesizers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/synthesizers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000069',
        'Terminations',
        'terminations',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000038',
        'RF Terminations
Reliable dissipation of signal power for 50-Ohm and 75-Ohm systems from DC to 110 GHz. Choose from a wide variety of male and female connector types including 1.85mm, 2.4mm, 2.92mm, SMA, SMP, N-Type, and DIN 1.0/2.3.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Up to 250W
Excellent return loss
Rugged construction'],
        NULL,
        false,
        false,
        'Mini-Circuits Terminations Terminations | Icon Electromatic',
        'Buy genuine Mini-Circuits Terminations Terminations from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/terminations',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000070',
        'Test Solutions',
        'test-solutions',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000039',
        'RF Test Solutions
Software-controlled building blocks in-stock for automation of lab and production test environments',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Modular Test Systems
Mechanical Switch Systems
Solid State Switch Systems
Programmable Attenuators
Mesh Network Test Systems
Instrumentation Amplifiers
NxM Switch Matrices 50Ω/75Ω
Signal Generation & Measurement
High Power Test Systems
Panel Mounted Structures
Signal Distribution Systems
Custom Designs 50Ω/75Ω'],
        NULL,
        false,
        false,
        'Mini-Circuits Test Solutions Test Solutions | Icon Electromatic',
        'Buy genuine Mini-Circuits Test Solutions Test Solutions from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/test-solutions',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000071',
        'Instrumentation Amplifiers',
        'instrumentation-amplifiers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000040',
        'RF Instrumentation Amplifiers
Precision Amplifier Systems for a Wide Range of Test and Measurement Applications.
Mini-Circuits’ extensive selection of amplifiers in stock allows us to build integrated amplifier systems for specific test applications. These systems range in complexity from simple multi-channel amplifier racks to designs with additional functions such as gain control, filtering and more.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['2-Channel Amplifier', '2U', '3.5 mm
12-Channel Amplifier System
4-Channel Variable Gain Amplifier'],
        NULL,
        false,
        false,
        'Mini-Circuits Instrumentation Amplifiers Instrumentation Amplifiers | Icon Electromatic',
        'Buy genuine Mini-Circuits Instrumentation Amplifiers Instrumentation Amplifiers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/instrumentation-amplifiers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000072',
        'Precision Connector Gauges',
        'precision-connector-gauges',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000041',
        'High performance Precision Connector Gauges solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'Mini-Circuits Precision Connector Gauges Precision Connector Gauges | Icon Electromatic',
        'Buy genuine Mini-Circuits Precision Connector Gauges Precision Connector Gauges from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/precision-connector-gauges',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000073',
        'Signal Distribution Systems',
        'signal-distribution-systems',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000042',
        'RF Signal Distribution Systems
For High-Volume Test Setups
For test systems requiring distribution of signal to many DUTs, Mini-Circuits’ signal distribution systems combine splitter/combiners and directional couplers to expand test signal into multiple channels. Amplifiers can also be incorporated to minimize path loss and manage signal power from input to output.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Wide selection of splitter/combiners and directional couplers in stock
Bandwidths up to 65 GHz
RF input power up to 250W
Rack-mounted', 'panel-mounted or benchtop structures'],
        NULL,
        false,
        false,
        'Mini-Circuits Signal Distribution Systems Signal Distribution Systems | Icon Electromatic',
        'Buy genuine Mini-Circuits Signal Distribution Systems Signal Distribution Systems from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/signal-distribution-systems',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000074',
        'Signal Generation and Measurement',
        'signal-generation-and-measurement',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000043',
        'RF Signal Generation & Measurement
RF Signal Generators, Power Sensors & More
Mini-Circuits offers a wide selection of benchtop signal sources and measurement instruments for RF test and measurement applications. Comprising synthesized signal generators, power sensors and a 2-port vector network analyzer, our product line provides powerful functionality for an exceptional value with industry-leading quality and technical support.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Synthesized signal generators
Power sensors and frequency counters
Control products
User-friendly GUI and API included'],
        NULL,
        false,
        false,
        'Mini-Circuits Signal Generation and Measurement Signal Generation and Measurement | Icon Electromatic',
        'Buy genuine Mini-Circuits Signal Generation and Measurement Signal Generation and Measurement from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/signal-generation-and-measurement',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000075',
        'Solid State Switch Systems',
        'solid-state-switch-systems',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000044',
        'Solid State RF Switch Systems
Fast Switching & High Reliability for RF Test & Measurement
Mini-Circuits offers a wide selection of solid-state RF switches for test and measurement applications, from compact switch modules to complex, rack-mountable switch matrices with integrated attenuation and other functions. Our wealth of components in-stock allows us to configure affordable high-performance systems to customers'' unique needs with fast turnaround. Switches feature TTL, SPI and I2C control ports, and our unique daisy-chain interface on some models provides added flexibility to control multiple switches on a single control line to scale your switching configuration as your needs change.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Ultra-high reliability with long switching life
Switch transition time as fast as 5 ns
Daisy-chain configuration simplifies control systems
Wide selection of switch modules in stock
Integrated rack-mount systems with fast turnaround'],
        NULL,
        false,
        false,
        'Mini-Circuits Solid State Switch Systems Solid State Switch Systems | Icon Electromatic',
        'Buy genuine Mini-Circuits Solid State Switch Systems Solid State Switch Systems from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/solid-state-switch-systems',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000076',
        'Wrenches',
        'wrenches',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000045',
        'RF Connector Wrenches
For SMA, N-Type, 3.5mm, 2.92mm, 2.4mm, 1.85mm & 1.0mm Connectors
Mini-Circuits'' TRQ-series of 8 in-lb and 4 in-lb torque calibrated breakover wrenches are the perfect tool for tightening a variety of RF connector types without damaging the connector interface due to over-tightening. Our HT-series of SMA wrench extensions offer added utility in tight spaces and dense connector arrays.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['8 in-lb and 4 in-lb calibrated torque wrenches
SMA wrench extensions for tightening connectors in tight spaces
Options for SMA', 'N-Type', '3.5mm', '2.92mm', '2.4mm', '1.8mm and 1.0mm connector types'],
        NULL,
        false,
        false,
        'Mini-Circuits Wrenches Wrenches | Icon Electromatic',
        'Buy genuine Mini-Circuits Wrenches Wrenches from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/wrenches',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000077',
        'Custom Test Systems',
        'custom-test-systems',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000046',
        'Custom RF Test Equipment
Integrated Test Systems Tailored to Your Requirements
Our experience in the test space has evolved according to your needs. The diversity of customer requirements for highly customized test solutions has led us to build our business around principles of flexibility, reliability, economy and speed. Our wealth and variety of components in stock allows us to take a building-block approach to developing custom equipment for your unique needs with exceptionally fast turnaround.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Designed and built to your unique test requirements
All systems fully characterized during production
On-site integration available when needed
Full GUI and API for programming with your native test software'],
        NULL,
        false,
        false,
        'Mini-Circuits Custom Test Systems Custom Test Systems | Icon Electromatic',
        'Buy genuine Mini-Circuits Custom Test Systems Custom Test Systems from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/custom-test-systems',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000078',
        'Transformers Baluns',
        'transformers-baluns',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000047',
        'RF Transformers and Baluns
Over 500 transformer and balun models in a wide variety of DC passing and DC isolated configurations with for single-ended and balanced/differential transmission lines from DC to 24000 MHz!',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Surface mount and coaxial case styles
Tiny LTCC models as small as 0603
Wideband MMIC baluns up to 24 GHz
50/75 Ohm matching transformers and matching pads'],
        NULL,
        false,
        false,
        'Mini-Circuits Transformers Baluns Transformers Baluns | Icon Electromatic',
        'Buy genuine Mini-Circuits Transformers Baluns Transformers Baluns from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/transformers-baluns',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000079',
        'Voltage Variable Equalizers',
        'voltage-variable-equalizers',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000048',
        'RF Equalizers
Voltage Variable and Fixed Slope Models
Nearly 100 equalizer models for gain flattening and frequency-dependent loss compensation in a wide range of applications from DC to 45 GHz.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Coaxial', 'surface-mount packages', 'and bare die
Precise attenuation slope control
50-Ohm and 75-Ohm designs'],
        NULL,
        false,
        false,
        'Mini-Circuits Voltage Variable Equalizers Voltage Variable Equalizers | Icon Electromatic',
        'Buy genuine Mini-Circuits Voltage Variable Equalizers Voltage Variable Equalizers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/voltage-variable-equalizers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000080',
        'Waveguides',
        'waveguides',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000049',
        'Waveguide bandpass filters  Mini-Circuits feature models with passbands up to 86 GHz with low insertion loss and high stopband rejection.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'Mini-Circuits Waveguides Waveguides | Icon Electromatic',
        'Buy genuine Mini-Circuits Waveguides Waveguides from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/mini-circuits/waveguides',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000081',
        'Power Amplifiers',
        'power-amplifiers',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000050',
        '1. Frequency coverage from DC to W-band
2. Application-specific product focus (such as power or linearity)
3. Variety of power levels along with high PAE and gain performance
4. Superior thermal management
5. Small footprint packages',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Military and commercial radar', '2. Military and commercial satellite communications', '3. Infrastructure communication links', '4. Instrumentation', '5. Traveling wave tube amplifier (TWTA) replacement.'],
        NULL,
        false,
        false,
        'Qorvo Power Amplifiers Power Amplifiers | Icon Electromatic',
        'Buy genuine Qorvo Power Amplifiers Power Amplifiers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/power-amplifiers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000082',
        'Driver Amplifiers',
        'driver-amplifiers',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000051',
        '1. High efficiency
2. High linearity
3. High gain',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Base station
2. Defense communications
3. Electronic warfare (EW) and radar
4. Optical
5. Point-to-point radio
6. VSAT'],
        NULL,
        true,
        false,
        'Qorvo Driver Amplifiers Driver Amplifiers | Icon Electromatic',
        'Buy genuine Qorvo Driver Amplifiers Driver Amplifiers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/driver-amplifiers',
        '/catalog-images/qorvo__driver-amplifiers_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000083',
        'Low Noise Amplifiers',
        'low-noise-amplifiers',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000052',
        '1. Ultra-low noise figure – as low as 0.4 dB NF
2. Integrated active biasing for most parts
3. Integrated on-chip matching for most parts
4. Available in die or packaged form',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Automotive
2. Base station
3. Cable TV (CATV) / fiber to the home (FTTH)
4. Defense communications
5. Optical
6. Point-to-point (PtP) radio'],
        NULL,
        true,
        false,
        'Qorvo Low Noise Amplifiers Low Noise Amplifiers | Icon Electromatic',
        'Buy genuine Qorvo Low Noise Amplifiers Low Noise Amplifiers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/low-noise-amplifiers',
        '/catalog-images/qorvo__low-noise-amplifiers_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000084',
        'Variable Gain Amplifiers',
        'variable-gain-amplifiers',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000053',
        '1. Integration offers PCB size reduction
2. High linearity
3. High efficiency
4. Same package configuration across 3GPP bands',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Base station
2. Distributed antenna systems (DAS)
3. Repeaters'],
        NULL,
        false,
        false,
        'Qorvo Variable Gain Amplifiers Variable Gain Amplifiers | Icon Electromatic',
        'Buy genuine Qorvo Variable Gain Amplifiers Variable Gain Amplifiers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/variable-gain-amplifiers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000085',
        'Beamforming Integrated Circuits',
        'beamforming-integrated-circuits',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000054',
        '1. Lowest $/dBm commercially available today
2. Multi-band performance
3. Advanced digital core simplifying design
4. Smart integration
5. System level support for optimized solutions
6. Proven in volume in fielded radios',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Military / commercial radar
2. SATCOM LEO/MEO', 'mobile GEO
3. Millimeter wave (mmWave) 5G
4. Future FR3'],
        NULL,
        false,
        false,
        'Qorvo Beamforming Integrated Circuits Beamforming Integrated Circuits | Icon Electromatic',
        'Buy genuine Qorvo Beamforming Integrated Circuits Beamforming Integrated Circuits from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/beamforming-integrated-circuits',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000086',
        'Front End Modules',
        'front-end-modules',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000055',
        '1. High power efficiency
2. Low noise figure
3. Front end protection
4. Suitable for harsh environments',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Military / commercial radar
2. Long range communications'],
        NULL,
        false,
        false,
        'Qorvo Front End Modules Front End Modules | Icon Electromatic',
        'Buy genuine Qorvo Front End Modules Front End Modules from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/front-end-modules',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000087',
        'Vpin Limiters',
        'vpin-limiters',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000056',
        '1. Protection against high-power incident RF signals
2. Low flat leakage
3. Low insertion loss
4. Passive component that requires no system power
5. Small footprint SMT packaging',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Receiver protection for radar systems'],
        NULL,
        false,
        false,
        'Qorvo Vpin Limiters Vpin Limiters | Icon Electromatic',
        'Buy genuine Qorvo Vpin Limiters Vpin Limiters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/vpin-limiters',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000088',
        'Mixers',
        'mixers',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000057',
        '1. High linearity
2. Low current draw',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Automotive
2. Base station
3. Repeaters
4. Defense communications
5. Point-to-point radio'],
        NULL,
        false,
        false,
        'Qorvo Mixers Mixers | Icon Electromatic',
        'Buy genuine Qorvo Mixers Mixers from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/mixers',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000089',
        'GaN HEMTs',
        'gan-hemts',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000058',
        '1. High efficiency and power density
2. Superior gain
3. Ruggedness and ability to operate over a wide bandwidth
4. Record-setting reliability that exceeds previous industry standards
5. Design expertise as a frontrunner in GaN technology',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Military and civilian radar
2. Professional and military radio communications
3. Test instrumentation
4. Wideband or narrowband amplifiers
5. Jammers
6. Base station – base transceiver station', 'repeaters', 'pico cells', 'macro cell networks'],
        NULL,
        false,
        false,
        'Qorvo GaN HEMTs GaN HEMTs | Icon Electromatic',
        'Buy genuine Qorvo GaN HEMTs GaN HEMTs from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/gan-hemts',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000090',
        'GaAs pHEMTs',
        'gaas-phemts',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0001-000000000059',
        '1. Ultra-low noise figure – as low as 0.15 dB NF (min)
2. Available in die or packaged form',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Base station
2. Defense communications
3. Point-to-point (PtP) radio'],
        NULL,
        false,
        false,
        'Qorvo GaAs pHEMTs GaAs pHEMTs | Icon Electromatic',
        'Buy genuine Qorvo GaAs pHEMTs GaAs pHEMTs from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/qorvo/gaas-phemts',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000091',
        'Single Layer Capacitors',
        'single-layer-capacitors',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000060',
        'Single Layer Chip Capacitors (A Type)
Single Layer Chip Capacitors (B Type)
Single Layer Chip Capacitors (C Type)
Rectangular SLCS
Binary Capacitors
Gap Capacitors
Row Capacitors
Integrated Resistor-Capacitor',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        true,
        false,
        'TecDia Single Layer Capacitors Single Layer Capacitors | Icon Electromatic',
        'Buy genuine TecDia Single Layer Capacitors Single Layer Capacitors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/single-layer-capacitors',
        '/catalog-images/tecdia__single-layer-capacitors_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000092',
        'Tunable Dielectric Capacitors',
        'tunable-dielectric-capacitors',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000061',
        'High performance Tunable Dielectric Capacitors solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        true,
        false,
        'TecDia Tunable Dielectric Capacitors Tunable Dielectric Capacitors | Icon Electromatic',
        'Buy genuine TecDia Tunable Dielectric Capacitors Tunable Dielectric Capacitors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/tunable-dielectric-capacitors',
        '/catalog-images/tecdia__tunable-dielectric-capacitors_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000093',
        'Thin Film Substrates',
        'thin-film-substrates',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000062',
        'High performance Thin Film Substrates solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Diamond Scribe Tool'],
        NULL,
        false,
        false,
        'TecDia Thin Film Substrates Thin Film Substrates | Icon Electromatic',
        'Buy genuine TecDia Thin Film Substrates Thin Film Substrates from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/thin-film-substrates',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000094',
        'Dispensing Nozzles',
        'dispensing-nozzles',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000063',
        'Arque Dispensing Nozzles
Super Long Tipped Nozzles
Ruby Nozzle
Special Application Nozzles
Precision nozzle for 3D printing (kaika)',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Ejector Needles
Probe Needle'],
        NULL,
        false,
        false,
        'TecDia Dispensing Nozzles Dispensing Nozzles | Icon Electromatic',
        'Buy genuine TecDia Dispensing Nozzles Dispensing Nozzles from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/dispensing-nozzles',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000095',
        'Diamond Products',
        'diamond-products',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000064',
        'High performance Diamond Products solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'TecDia Diamond Products Diamond Products | Icon Electromatic',
        'Buy genuine TecDia Diamond Products Diamond Products from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/diamond-products',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000096',
        'Handy Wafer Scriber Kit',
        'handy-wafer-scriber-kit',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000065',
        'High performance Handy Wafer Scriber Kit solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'TecDia Handy Wafer Scriber Kit Handy Wafer Scriber Kit | Icon Electromatic',
        'Buy genuine TecDia Handy Wafer Scriber Kit Handy Wafer Scriber Kit from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/handy-wafer-scriber-kit',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000097',
        'Diamond Pick Up Tools',
        'diamond-pick-up-tools',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0001-000000000066',
        'High performance Diamond Pick Up Tools solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'TecDia Diamond Pick Up Tools Diamond Pick Up Tools | Icon Electromatic',
        'Buy genuine TecDia Diamond Pick Up Tools Diamond Pick Up Tools from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tecdia/diamond-pick-up-tools',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000098',
        'Harmonic Switched Filters',
        'harmonic-switched-filters',
        '00000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0001-000000000067',
        'Tunable Filters.
Bandpass
Passive & Co-Site Mitigation Filters
Lumped Element & Suspended Substrate Technologies-- RF filters for tactical radios.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Tunable Harmonic Switched Filterbank-- Miniature Low Noise Tunable Bandpass-- Tunable Bandpass  - Software Defined Radios'],
        NULL,
        false,
        false,
        'Tri-TeQ Harmonic Switched Filters Harmonic Switched Filters | Icon Electromatic',
        'Buy genuine Tri-TeQ Harmonic Switched Filters Harmonic Switched Filters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/tri-teq/harmonic-switched-filters',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000099',
        'RF Limiters',
        'rf-limiters',
        '00000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0001-000000000068',
        'Always RF offers a family of passive and quasi-active High Power RF Limiters which operate from HF to Ku Band frequency ranges with power handling capabilities up to +60 dBm. These RF Limiters provide "Always On" protection which afford complete protection to sensitive RF receivers, even when the system is turned off.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Receiver Protection', 'Protects LNAs', 'mixers', 'and ADCs from damage or compression caused by high RF power.                 2. Common in radar receivers', 'EW/ESM systems', 'and wideband monitoring receivers.                                                                          3. Radar Systems', 'Used at the front end of radar receivers to prevent damage from: 
Transmit leakage', 'Reflections from nearby targets.                                                                                 4. Electronic Warfare (EW) & SIGINT', 'Shields sensitive receivers from strong intentional or unintentional signals.'],
        NULL,
        true,
        false,
        'RFuW Engineering RF Limiters RF Limiters | Icon Electromatic',
        'Buy genuine RFuW Engineering RF Limiters RF Limiters from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rfuw-engineering/rf-limiters',
        '/catalog-images/rfuw-engineering__rf-limiters_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000100',
        'RF Switches',
        'rf-switches',
        '00000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0001-000000000069',
        'Always RF offers a family of High Power PIN diode based surface mount RF switches which operate HF to Ku Band frequency ranges with power handling capabilities from +50 dBm to +62 dBm. The standard product family comes in SP2T, SP3T, SP4T, SP5T and SP6T configurations.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['1. Communication Systems', 'Antenna switching between transmit and receive paths', 'Band selection in multi-band radios and Redundancy switching for backup transceivers.                                                                   2. Radar Systems', 'T/R switching between transmitter and receiver', 'Beamforming networks', 'Switching between calibration', 'test', 'and operational paths.                                            3. Electronic Warfare (EW)', 'SIGINT & ESM', 'Rapid selection among multiple antennas', 'Threat monitoring and signal direction finding and Channelized receiver front ends.'],
        NULL,
        false,
        false,
        'RFuW Engineering RF Switches RF Switches | Icon Electromatic',
        'Buy genuine RFuW Engineering RF Switches RF Switches from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/rfuw-engineering/rf-switches',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000101',
        'Software-Defined Radio (SDR)',
        'software-defined-radio-sdr',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0001-000000000070',
        'High performance Software-Defined Radio (SDR) solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Real time satellite modem
CubeSats communication payloadOffline debugging tool by RF recorder  VSG and VSA enabled by SDR  -mmWave modules
Up/down converter
Reconfigurable Intelligent Surface (RIS)
Anti-jamming UAV communication payload with agile frequency hopping'],
        NULL,
        false,
        false,
        'YTTEK Software-Defined Radio (SDR) Software-Defined Radio (SDR) | Icon Electromatic',
        'Buy genuine YTTEK Software-Defined Radio (SDR) Software-Defined Radio (SDR) from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/yttek/software-defined-radio-sdr',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000102',
        'HyperSDR',
        'hypersdr',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0001-000000000071',
        'High-speed satellite modem',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Frequency Hopping
Three-phase deployment stage'],
        NULL,
        false,
        false,
        'YTTEK HyperSDR HyperSDR | Icon Electromatic',
        'Buy genuine YTTEK HyperSDR HyperSDR from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/yttek/hypersdr',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000103',
        'SDRspace',
        'sdrspace',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0001-000000000072',
        'High performance SDRspace solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Satellite communication payload'],
        NULL,
        false,
        false,
        'YTTEK SDRspace SDRspace | Icon Electromatic',
        'Buy genuine YTTEK SDRspace SDRspace from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/yttek/sdrspace',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000104',
        'PluSDR',
        'plusdr',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0001-000000000073',
        'Software-defined radio platform',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Wide range band:
10 MHz - 15 GHz'],
        NULL,
        false,
        false,
        'YTTEK PluSDR PluSDR | Icon Electromatic',
        'Buy genuine YTTEK PluSDR PluSDR from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/yttek/plusdr',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000105',
        'SDRone',
        'sdrone',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0001-000000000074',
        'UAV communication transceiver',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'YTTEK SDRone SDRone | Icon Electromatic',
        'Buy genuine YTTEK SDRone SDRone from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/yttek/sdrone',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000106',
        '5G FR2
& 6G',
        '5g-fr2-6g',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0001-000000000075',
        'TrueUDC
26.5~29.5 GHz
Frequency drift: 5ppb.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['FR2 Small Cell-   EcoRIS (Power by Liquid Crystal)'],
        NULL,
        false,
        false,
        'YTTEK 5G FR2
& 6G 5G FR2
& 6G | Icon Electromatic',
        'Buy genuine YTTEK 5G FR2
& 6G 5G FR2
& 6G from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/yttek/5g-fr2-6g',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000107',
        'XG1 Series- Binary',
        'xg1-series--binary',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000076',
        'High-Q binary ceramic capacitor for precision frequency tuning in microwave circuits.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Military & aerospace radar', 'satcom & EW', 'mmWave beamforming'],
        NULL,
        true,
        false,
        'Evans XG1 Series- Binary Eulex | Icon Electromatic',
        'Buy genuine Evans XG1 Series- Binary Eulex from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/xg1-series--binary',
        '/catalog-images/evans__xg1-series--binary_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000108',
        'XG2 Series - 2 Terminal',
        'xg2-series---2-terminal',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000076',
        'Ultra-compact two-terminal ceramic capacitor with tight tolerance and high self-resonance.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Advanced broadband & RF systems', 'optical transceivers', 'automotive mmWave'],
        NULL,
        true,
        false,
        'Evans XG2 Series - 2 Terminal Eulex | Icon Electromatic',
        'Buy genuine Evans XG2 Series - 2 Terminal Eulex from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/xg2-series---2-terminal',
        '/catalog-images/evans__xg2-series---2-terminal_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000109',
        'XG3 Series - 3 Terminal',
        'xg3-series---3-terminal',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000076',
        'Three-terminal feedthrough ceramic capacitor engineered for noise suppression.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Power supply decoupling', 'high-speed digital and RF signal filtering'],
        NULL,
        false,
        false,
        'Evans XG3 Series - 3 Terminal Eulex | Icon Electromatic',
        'Buy genuine Evans XG3 Series - 3 Terminal Eulex from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/xg3-series---3-terminal',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000110',
        'XQ Series - Ultra-High Q',
        'xq-series---ultra-high-q',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000076',
        'Ultra-High Q RF capacitor featuring low ESR and exceptional dielectric stability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-power RF amplifiers', 'matching networks', 'MRI and defense transceivers'],
        NULL,
        false,
        false,
        'Evans XQ Series - Ultra-High Q Eulex | Icon Electromatic',
        'Buy genuine Evans XQ Series - Ultra-High Q Eulex from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/xq-series---ultra-high-q',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000111',
        'XV Series - Vertical Layer',
        'xv-series---vertical-layer',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000076',
        'Vertical layer ceramic capacitor designed for ultra-broadband bypass and coupling.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['DC blocks', 'broadband amplifier bias tees', 'radar RF front-ends'],
        NULL,
        false,
        false,
        'Evans XV Series - Vertical Layer Eulex | Icon Electromatic',
        'Buy genuine Evans XV Series - Vertical Layer Eulex from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/xv-series---vertical-layer',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000112',
        'Substrates',
        'substrates',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000076',
        'Precision engineered ceramic substrates with controlled dielectric properties.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Thin-film hybrid circuits', 'MCMs', 'and multi-chip microwave modules'],
        NULL,
        false,
        false,
        'Evans Substrates Eulex | Icon Electromatic',
        'Buy genuine Evans Substrates Eulex from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/substrates',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000113',
        'TDD Series',
        'tdd-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'High energy density hybrid wet tantalum capacitor for extreme pulse power.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Radar pulse transmitters', 'laser drivers', 'defense electronics'],
        NULL,
        true,
        false,
        'Evans TDD Series Evans | Icon Electromatic',
        'Buy genuine Evans TDD Series Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/tdd-series',
        '/catalog-images/evans__tdd-series_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000114',
        'TDE Series',
        'tde-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'Extended range hybrid wet tantalum capacitor with high volumetric efficiency.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Avionics hold-up', 'space power systems', 'airborne surveillance'],
        NULL,
        true,
        false,
        'Evans TDE Series Evans | Icon Electromatic',
        'Buy genuine Evans TDE Series Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/tde-series',
        '/catalog-images/evans__tde-series_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000115',
        'THS3 Series',
        'ths3-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'Hermetically sealed square hybrid tantalum capacitor with ruggedized construction.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Downhole drilling', 'aerospace telemetry', 'missile guidance'],
        NULL,
        true,
        false,
        'Evans THS3 Series Evans | Icon Electromatic',
        'Buy genuine Evans THS3 Series Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/ths3-series',
        '/catalog-images/evans__ths3-series_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000116',
        'THQ',
        'thq',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'High reliability hybrid capacitor providing low ESR and instant energy discharge.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Phased array radars', 'EW pods', 'flight computers'],
        NULL,
        false,
        false,
        'Evans THQ Evans | Icon Electromatic',
        'Buy genuine Evans THQ Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/thq',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000117',
        'THQA2/M2/T2 Series',
        'thqa2m2t2-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'Multi-voltage hybrid tantalum capacitor arrays for custom power architectures.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Electronic countermeasure (ECM)', 'satellite payloads', 'pulsed RF'],
        NULL,
        false,
        false,
        'Evans THQA2/M2/T2 Series Evans | Icon Electromatic',
        'Buy genuine Evans THQA2/M2/T2 Series Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/thqa2m2t2-series',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000118',
        'HyCap Series',
        'hycap-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'Ultra-high capacitance hybrid wet tantalum module for power interruption hold-up.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['MIL-STD-704 hold-up', 'electric propulsion', 'mission computer backup'],
        NULL,
        false,
        false,
        'Evans HyCap Series Evans | Icon Electromatic',
        'Buy genuine Evans HyCap Series Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/hycap-series',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000119',
        'Capattery Series',
        'capattery-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'High energy storage capacitor-battery hybrid providing long duration pulses.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Space propulsion', 'tactical sensors', 'distributed energy buffers'],
        NULL,
        false,
        false,
        'Evans Capattery Series Evans | Icon Electromatic',
        'Buy genuine Evans Capattery Series Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/capattery-series',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000120',
        'Capacitor Banks',
        'capacitor-banks',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000077',
        'Engineered multi-capacitor banks tailored for megawatt-level pulsed power systems.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Railguns', 'Directed Energy Weapons (DEW)', 'high-power radar transmitters'],
        NULL,
        false,
        false,
        'Evans Capacitor Banks Evans | Icon Electromatic',
        'Buy genuine Evans Capacitor Banks Evans from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/capacitor-banks',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000121',
        'Angstor',
        'angstor',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000078',
        'Ultra-miniature stacked multi-layer polymer film capacitor with high ripple current capability.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Wide Bandgap GaN/SiC power converters', 'VPX systems', 'space computing'],
        NULL,
        true,
        false,
        'Evans Angstor Paktron | Icon Electromatic',
        'Buy genuine Evans Angstor Paktron from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/angstor',
        '/catalog-images/evans__angstor_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000122',
        'Capstick',
        'capstick',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000078',
        'High-density stacked polymer film capacitor designed for low inductance high-frequency decoupling.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['SMPS power stages', 'GaN inverters', 'high-temperature avionics'],
        NULL,
        false,
        false,
        'Evans Capstick Paktron | Icon Electromatic',
        'Buy genuine Evans Capstick Paktron from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/capstick',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000123',
        'Quencharc RC Snubber',
        'quencharc-rc-snubber',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000078',
        'Precision integrated RC snubber network for transient voltage suppression and arc suppression.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Relay contact protection', 'inductive load switching', 'motor drives'],
        NULL,
        false,
        false,
        'Evans Quencharc RC Snubber Paktron | Icon Electromatic',
        'Buy genuine Evans Quencharc RC Snubber Paktron from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/quencharc-rc-snubber',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000124',
        'New High Voltage MLP',
        'new-high-voltage-mlp',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000078',
        'High voltage multi-layer polymer capacitor offering self-healing dielectric properties.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['EV power electronics', 'defense power distribution', 'high-voltage converters'],
        NULL,
        false,
        false,
        'Evans New High Voltage MLP Paktron | Icon Electromatic',
        'Buy genuine Evans New High Voltage MLP Paktron from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/new-high-voltage-mlp',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000125',
        'Surfilm',
        'surfilm',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000078',
        'Surface-mount multi-layer polymer capacitor with ultra-low ESR and zero piezoelectric noise.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Audio and precision instrumentation', 'radar IF processing', 'space sensors'],
        NULL,
        false,
        false,
        'Evans Surfilm Paktron | Icon Electromatic',
        'Buy genuine Evans Surfilm Paktron from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/surfilm',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000126',
        'MLCC (Low and Mid Voltage)',
        'mlcc-low-and-mid-voltage',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'High-reliability multi-layer ceramic capacitors for commercial space and harsh industrial use.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Satellite electronics', 'telemetry systems', 'industrial instrumentation'],
        NULL,
        false,
        false,
        'Evans MLCC (Low and Mid Voltage) UTC | Icon Electromatic',
        'Buy genuine Evans MLCC (Low and Mid Voltage) UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/mlcc-low-and-mid-voltage',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000127',
        'SMPS',
        'smps',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Switch-mode power supply ceramic capacitor stacks engineered for high ripple current and low ESR.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-density DC-DC converters', 'airborne power supplies', 'radar modules'],
        NULL,
        true,
        false,
        'Evans SMPS UTC | Icon Electromatic',
        'Buy genuine Evans SMPS UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/smps',
        '/catalog-images/evans__smps_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000128',
        'Military (MIL-PRF 49470)',
        'military-mil-prf-49470',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Qualified military-grade ceramic capacitor assemblies certified to MIL-PRF-49470 standard.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Mission-critical defense', 'tactical communications', 'missile electronic units'],
        NULL,
        true,
        false,
        'Evans Military (MIL-PRF 49470) UTC | Icon Electromatic',
        'Buy genuine Evans Military (MIL-PRF 49470) UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/military-mil-prf-49470',
        '/catalog-images/evans__military-mil-prf-49470_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000129',
        'MegaCap Type (BC Series)',
        'megacap-type-bc-series',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'High capacitance metal-frame ceramic capacitor assembly providing mechanical stress relief.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Automotive EV inverters', 'power distribution backplanes', 'avionics'],
        NULL,
        false,
        false,
        'Evans MegaCap Type (BC Series) UTC | Icon Electromatic',
        'Buy genuine Evans MegaCap Type (BC Series) UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/megacap-type-bc-series',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000130',
        'Pulse Energy',
        'pulse-energy',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Specialized ceramic capacitors optimized for pulsed power discharge and laser systems.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Detonation systems', 'pulsed lasers', 'high-intensity strobe circuits'],
        NULL,
        false,
        false,
        'Evans Pulse Energy UTC | Icon Electromatic',
        'Buy genuine Evans Pulse Energy UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/pulse-energy',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000131',
        'Radial Leaded',
        'radial-leaded',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Conformal coated radial leaded ceramic capacitors designed for through-hole PCB assembly.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Harsh vibration environments', 'defense legacy systems', 'oil and gas sensors'],
        NULL,
        false,
        false,
        'Evans Radial Leaded UTC | Icon Electromatic',
        'Buy genuine Evans Radial Leaded UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/radial-leaded',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000132',
        'Discoidal',
        'discoidal',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Circular discoidal feedthrough capacitors providing low inductance EMI suppression up to microwave frequencies.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['EMI/RFI filter connectors', 'hermetic feedthroughs', 'radar chassis shielding'],
        NULL,
        false,
        false,
        'Evans Discoidal UTC | Icon Electromatic',
        'Buy genuine Evans Discoidal UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/discoidal',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000133',
        'Planar Arrays',
        'planar-arrays',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Multi-pin ceramic planar capacitor arrays tailored for circular and D-sub filter connectors.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['MIL-DTL-38999 connectors', 'avionics data buses', 'secure communications'],
        NULL,
        false,
        false,
        'Evans Planar Arrays UTC | Icon Electromatic',
        'Buy genuine Evans Planar Arrays UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/planar-arrays',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000134',
        'Safety Caps',
        'safety-caps',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0001-000000000079',
        'Class X and Y certified AC safety capacitors engineered for line-to-line and line-to-ground protection.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Primary AC power line filtering', 'aerospace ground power units', 'medical devices'],
        NULL,
        false,
        false,
        'Evans Safety Caps UTC | Icon Electromatic',
        'Buy genuine Evans Safety Caps UTC from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/evans/safety-caps',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000135',
        'OhmegaPly® RCM – 0.5A10PT',
        'ohmegaply-rcm-05a10pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '10 Ω/sq thin-film embedded resistor copper foil on ½ oz (18 µm) copper. High reliability resistive conductor material for PCB integration.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Embedded resistors in RF/microwave/5G PCBs', 'aerospace', 'defense', 'automotive', 'industrial.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A10PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A10PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a10pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000136',
        'OhmegaPly® RCM – 0.5A25PT',
        'ohmegaply-rcm-05a25pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '25 Ω/sq thin-film embedded resistor foil on ½ oz copper. Ideal for standard embedded resistor designs.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['PCB boards needing tight resistor integration and improved signal integrity.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A25PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A25PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a25pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000137',
        'OhmegaPly® RCM – 0.5A40PT',
        'ohmegaply-rcm-05a40pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '40 Ω/sq embedded resistor conductor copper foil for moderate resistance applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High frequency/medium-power embedded resistive networks.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A40PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A40PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a40pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000138',
        'OhmegaPly® RCM – 0.5A50PT',
        'ohmegaply-rcm-05a50pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '50 Ω/sq embedded resistive foil with predictable sheet resistivity.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Broadband embedded resistor solutions for RF & high-speed boards.'],
        NULL,
        true,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A50PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A50PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a50pt',
        '/catalog-images/ohmega-ticer__ohmegaply-rcm-05a50pt_1.webp'
      ),
(
        '00000000-0000-0000-0002-000000000139',
        'OhmegaPly® RCM – 0.5A100PT',
        'ohmegaply-rcm-05a100pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '100 Ω/sq resistive conductor material on ½ oz copper.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High-density resistor embedding', 'signal termination layers.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A100PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A100PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a100pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000140',
        'OhmegaPly® RCM – 0.5A250PT',
        'ohmegaply-rcm-05a250pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '250 Ω/sq high resistivity embedded foil.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Specialized high resistive networks for signal termination and filtering.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A250PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A250PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a250pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000141',
        'OhmegaPly® RCM – 0.5A377PT',
        'ohmegaply-rcm-05a377pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '377 Ω/sq high sheet resistivity material.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Designed for high-frequency and calibration networks where high resistivity is critical.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 0.5A377PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 0.5A377PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-05a377pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000142',
        'OhmegaPly® RCM – 1A10PT',
        'ohmegaply-rcm-1a10pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '10 Ω/sq on 1 oz (35 µm) copper for higher current capacity.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Embedded resistor networks with higher current requirements.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 1A10PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 1A10PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-1a10pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000143',
        'OhmegaPly® RCM – 1A25PT',
        'ohmegaply-rcm-1a25pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '25 Ω/sq on 1 oz copper combining high reliability and standard resistance.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Medium resistance embedded designs in demanding environments.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 1A25PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 1A25PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-1a25pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000144',
        'OhmegaPly® RCM – 1A50PT',
        'ohmegaply-rcm-1a50pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '50 Ω/sq on 1 oz copper for standard embedded resistor solutions.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF termination networks', 'high frequency PCBs.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 1A50PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 1A50PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-1a50pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000145',
        'OhmegaPly® RCM – 1A100PT',
        'ohmegaply-rcm-1a100pt',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000080',
        '100 Ω/sq on thicker copper for precision resistor applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High density embedded resistor layers for advanced PCB designs.'],
        NULL,
        false,
        false,
        'Ohmega Ticer OhmegaPly® RCM – 1A100PT RCM Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer OhmegaPly® RCM – 1A100PT RCM Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/ohmegaply-rcm-1a100pt',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000146',
        'TCR® 25N18P9X',
        'tcr-25n18p9x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000081',
        '25 Ω/sq Ticer thin-film resistive copper foil on ½ oz (18 µm) copper, designed for high-frequency response.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Embedded resistor foil for RF/mmWave PCBs.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR® 25N18P9X TCR Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR® 25N18P9X TCR Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-25n18p9x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000147',
        'TCR® 50N18P9X',
        'tcr-50n18p9x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000081',
        '50 Ω/sq TCR resistive material on ½ oz copper for RF/HDI embedded resistors.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High speed digital & RF embedded circuits.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR® 50N18P9X TCR Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR® 50N18P9X TCR Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-50n18p9x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000148',
        'TCR® 100N18P9X',
        'tcr-100n18p9x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000081',
        '100 Ω/sq TCR resistive foil on ½ oz copper.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Signal termination networks in high frequency circuit boards.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR® 100N18P9X TCR Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR® 100N18P9X TCR Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-100n18p9x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000149',
        'TCR® 250A18P9X',
        'tcr-250a18p9x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000081',
        '250 Ω/sq TCR resistive conductor material on ½ oz copper.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Highly resistive embedded networks for specialized PCB functions.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR® 250A18P9X TCR Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR® 250A18P9X TCR Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-250a18p9x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000150',
        'TCR® 1KO18P9X',
        'tcr-1ko18p9x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000081',
        '1000 Ω/sq ultra-high resistivity Ticer embedded foil.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Low-loss', 'high resistivity networks for precision embedded resistors.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR® 1KO18P9X TCR Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR® 1KO18P9X TCR Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-1ko18p9x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000151',
        'TCR EHF® 25N18P8X',
        'tcr-ehf-25n18p8x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000082',
        '25 Ω/sq TCR EHF embedded foil with very smooth thin film for lowest loss.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['mmWave frequency embedded resistor foils.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR EHF® 25N18P8X TCR EHF Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR EHF® 25N18P8X TCR EHF Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-ehf-25n18p8x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000152',
        'TCR EHF® 50N18P8X',
        'tcr-ehf-50n18p8x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000082',
        '50 Ω/sq TCR EHF resistive foil optimized for high speed & high frequency.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Embedded resistor applications with minimized insertion loss.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR EHF® 50N18P8X TCR EHF Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR EHF® 50N18P8X TCR EHF Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-ehf-50n18p8x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000153',
        'TCR EHF® 100N18P8X',
        'tcr-ehf-100n18p8x',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0001-000000000082',
        '100 Ω/sq TCR EHF resistive foil for high precision mmWave embedded networks.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Advanced RF/mmWave PCB designs.'],
        NULL,
        false,
        false,
        'Ohmega Ticer TCR EHF® 100N18P8X TCR EHF Series | Icon Electromatic',
        'Buy genuine Ohmega Ticer TCR EHF® 100N18P8X TCR EHF Series from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/ohmega-ticer/tcr-ehf-100n18p8x',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000154',
        'temperature sensors',
        'temperature-sensors',
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0001-000000000083',
        'Space * EV * Medical * IOT',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['NTC Thermistor /PTC Thermistor /'],
        NULL,
        false,
        false,
        'Thermosen temperature sensors temperature sensors | Icon Electromatic',
        'Buy genuine Thermosen temperature sensors temperature sensors from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/thermosen/temperature-sensors',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000155',
        'Radix™ 2.8 Dielectric Lens Material',
        'radix-28-dielectric-lens-material',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Industry’s first low-loss dielectric photopolymer enabling scalable 3D printing of dielectric and GRIN lenses. Dielectric constant 2.8, loss tangent 0.0043.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['RF & mmWave dielectric lenses', 'antenna gain enhancement', 'GRIN and Luneburg lenses.'],
        NULL,
        false,
        false,
        'Fortify Radix™ 2.8 Dielectric Lens Material 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify Radix™ 2.8 Dielectric Lens Material 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/radix-28-dielectric-lens-material',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000156',
        'Radix™ 4.6 Dielectric Lens Material',
        'radix-46-dielectric-lens-material',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Higher-Dk printable dielectric material enabling reduced feature size and transformation optics. Dielectric constant 4.6, loss tangent 0.0046.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Compact RF lenses', 'high-gain antenna optics', 'phased-array enhancement.'],
        NULL,
        false,
        false,
        'Fortify Radix™ 4.6 Dielectric Lens Material 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify Radix™ 4.6 Dielectric Lens Material 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/radix-46-dielectric-lens-material',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000157',
        'GRIN Dielectric Lens (Radix™ Platform)',
        'grin-dielectric-lens-radix-platform',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Gradient-index dielectric lenses created using lattice-controlled effective permittivity. Enables spatial Dk variation within a single printed lens.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['GRIN lenses', 'beam steering', 'wide-band RF optics.'],
        NULL,
        false,
        false,
        'Fortify GRIN Dielectric Lens (Radix™ Platform) 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify GRIN Dielectric Lens (Radix™ Platform) 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/grin-dielectric-lens-radix-platform',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000158',
        '3D Printed Horn Lens',
        '3d-printed-horn-lens',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Dielectric horn-mounted lens that increases antenna gain without increasing antenna length. Reduces device length by ~33% for equivalent gain.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Point-to-point RF links', 'FWA', 'backhaul', 'antenna characterization.'],
        NULL,
        false,
        false,
        'Fortify 3D Printed Horn Lens 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify 3D Printed Horn Lens 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/3d-printed-horn-lens',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000159',
        'Switched Beam Antenna Lens',
        'switched-beam-antenna-lens',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Dielectric lens replacing phase shifters to enable wide-band beam steering with lower power consumption and reduced system complexity.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['EW systems', 'direction finding', 'ground-to-satellite & cellular base stations.'],
        NULL,
        false,
        false,
        'Fortify Switched Beam Antenna Lens 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify Switched Beam Antenna Lens 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/switched-beam-antenna-lens',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000160',
        'Field-of-View (FOV) Enhancing Lens',
        'field-of-view-fov-enhancing-lens',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        '3D printed dielectric lens extending antenna field-of-view up to ±90° while reducing scan loss at high angles.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['5G infrastructure', 'outdoor antennas', 'phased-array systems.'],
        NULL,
        false,
        false,
        'Fortify Field-of-View (FOV) Enhancing Lens 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify Field-of-View (FOV) Enhancing Lens 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/field-of-view-fov-enhancing-lens',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000161',
        'Tactical FOV Enhancing Lens',
        'tactical-fov-enhancing-lens',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Dielectric lens optimized for AESA reduction, enabling 360° coverage with fewer antennas and lower power consumption.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['LPD/LPI tactical communications', 'mesh networking', 'defense RF systems.'],
        NULL,
        false,
        false,
        'Fortify Tactical FOV Enhancing Lens 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify Tactical FOV Enhancing Lens 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/tactical-fov-enhancing-lens',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000162',
        'Low-Dk Printed Foam Spacer (Lens Adjacent)',
        'low-dk-printed-foam-spacer-lens-adjacent',
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0001-000000000084',
        'Non-compressing, low-Dk printed structures used near antenna/lens assemblies to improve predictability and integration.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Antenna stack-ups', 'conformal RF structures', 'radomes.'],
        NULL,
        false,
        false,
        'Fortify Low-Dk Printed Foam Spacer (Lens Adjacent) 3D Printed Dielectric Parts | Icon Electromatic',
        'Buy genuine Fortify Low-Dk Printed Foam Spacer (Lens Adjacent) 3D Printed Dielectric Parts from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/fortify/low-dk-printed-foam-spacer-lens-adjacent',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000163',
        'RF/Microwave PCB',
        'rfmicrowave-pcb',
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0001-000000000085',
        'High frequency laminate expertise',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Base Station Power Amplifiers'],
        NULL,
        false,
        false,
        'NEE International RF/Microwave PCB RF/Microwave PCB | Icon Electromatic',
        'Buy genuine NEE International RF/Microwave PCB RF/Microwave PCB from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/nee-international/rfmicrowave-pcb',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000164',
        'RF/Microwave PCB',
        'rfmicrowave-pcb-rfmicrowave-pcb',
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0001-000000000085',
        'Power amplifier heatsink fabrication and attachment',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Base Station Large Format Antenna'],
        NULL,
        false,
        false,
        'NEE International RF/Microwave PCB RF/Microwave PCB | Icon Electromatic',
        'Buy genuine NEE International RF/Microwave PCB RF/Microwave PCB from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/nee-international/rfmicrowave-pcb-rfmicrowave-pcb',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000165',
        'RF/Microwave PCB',
        'rfmicrowave-pcb-rfmicrowave-pcb',
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0001-000000000085',
        'High performance RF/Microwave PCB solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Satellite LNB/LNA circuits'],
        NULL,
        false,
        false,
        'NEE International RF/Microwave PCB RF/Microwave PCB | Icon Electromatic',
        'Buy genuine NEE International RF/Microwave PCB RF/Microwave PCB from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/nee-international/rfmicrowave-pcb-rfmicrowave-pcb',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000166',
        'RF/Microwave PCB',
        'rfmicrowave-pcb-rfmicrowave-pcb',
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0001-000000000085',
        'High performance RF/Microwave PCB solution engineered for demanding RF, microwave, and aerospace applications.',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['High power circuit boards'],
        NULL,
        false,
        false,
        'NEE International RF/Microwave PCB RF/Microwave PCB | Icon Electromatic',
        'Buy genuine NEE International RF/Microwave PCB RF/Microwave PCB from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/nee-international/rfmicrowave-pcb-rfmicrowave-pcb',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000167',
        'PCB Fabrication',
        'pcb-fabrication',
        '00000000-0000-0000-0000-000000000013',
        '00000000-0000-0000-0001-000000000086',
        'RF, Microwave, and mmWave PCB Fabrication Experts',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Aerospace', 'Defense', 'Radar', 'Telecommunications', 'Space'],
        NULL,
        false,
        false,
        'Transline Technology PCB Fabrication PCB Fabrication | Icon Electromatic',
        'Buy genuine Transline Technology PCB Fabrication PCB Fabrication from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/transline-technology/pcb-fabrication',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000168',
        'High Voltage Power Supplies & X-Ray Sources',
        'high-voltage-power-supplies-x-ray-sources',
        '00000000-0000-0000-0000-000000000014',
        '00000000-0000-0000-0001-000000000087',
        'Modular High Voltage Power Supply, Rack Mount High Voltage Power Supply, X-Ray Generator, X-Ray Source (Monoblock®), Custom High Voltage Power Supply, Application Specific High Voltage Power Supply, Portable NDT X-Ray Imaging Products',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Ion Beam Implantation', 'Electron Beam Welding', 'Electrostatic Separators', 'Electron Beam Evaporation', 'Ion Milling', 'Neutron Generators', 'Plasma Igniters', 'Sputtering', 'Marx Generators', 'Electrostatic Lenses', 'Oil Well Data Logging'],
        NULL,
        false,
        false,
        'Spellman High Voltage Power Supplies & X-Ray Sources high voltage power supplies | Icon Electromatic',
        'Buy genuine Spellman High Voltage Power Supplies & X-Ray Sources high voltage power supplies from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/spellman/high-voltage-power-supplies-x-ray-sources',
        NULL
      ),
(
        '00000000-0000-0000-0002-000000000169',
        'Perimeter Intrusion Detection System (PIDS)',
        'perimeter-intrusion-detection-system-pids',
        '00000000-0000-0000-0000-000000000015',
        '00000000-0000-0000-0001-000000000088',
        'High Security Fencing, Industrial and Residential fencing systems, Command and Control C4I and Security Management Systems, Taut wire and Electric fences, Seismic systems, Fence mounted vibration ranging systems (Copper & Fiber), Drone Systems, Jammer equipment and Anti-Drone Systems, Radar, Aesthetic Smart Decorative Detection Fences, Fire & Smoke Detection system, Video Analytic (3D) and Behavior based on AI, Face Recognition Systems, Laser Sensor & Infra-Red Towers, Barrier & Bollards, Balloon Tactical Surveillance, Buried cable systems',
        '{}'::jsonb,
        '{}'::text[],
        ARRAY['Military Bases', 'Radar Installations', 'Aerospace Test Facilities', 'Critical Infrastructure', 'Industrial and Defense Perimeters'],
        NULL,
        false,
        false,
        'AEE Israel Perimeter Intrusion Detection System (PIDS) Perimeter Intrusion Detection System (PIDS) | Icon Electromatic',
        'Buy genuine AEE Israel Perimeter Intrusion Detection System (PIDS) Perimeter Intrusion Detection System (PIDS) from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.',
        'https://iconelectromatic.com/products/aee-israel/perimeter-intrusion-detection-system-pids',
        NULL
      )
ON CONFLICT (oem_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- ------------------------------------------------------------------------------
-- 4. Product Images (Ordered Left-to-Right from Excel)
-- ------------------------------------------------------------------------------
INSERT INTO public.product_images (
  id, product_id, image_url, alt_text, display_order, is_primary, width, height, format
) VALUES
(
          '00000000-0000-0000-0003-000000000001',
          '00000000-0000-0000-0002-000000000082',
          '/catalog-images/qorvo__driver-amplifiers_1.webp',
          'Qorvo Driver Amplifiers Driver Amplifiers - Image 1',
          1,
          true,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000002',
          '00000000-0000-0000-0002-000000000082',
          '/catalog-images/qorvo__driver-amplifiers_2.webp',
          'Qorvo Driver Amplifiers Driver Amplifiers - Image 2',
          2,
          false,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000003',
          '00000000-0000-0000-0002-000000000082',
          '/catalog-images/qorvo__driver-amplifiers_3.webp',
          'Qorvo Driver Amplifiers Driver Amplifiers - Image 3',
          3,
          false,
          498,
          260,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000004',
          '00000000-0000-0000-0002-000000000082',
          '/catalog-images/qorvo__driver-amplifiers_4.webp',
          'Qorvo Driver Amplifiers Driver Amplifiers - Image 4',
          4,
          false,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000005',
          '00000000-0000-0000-0002-000000000082',
          '/catalog-images/qorvo__driver-amplifiers_5.webp',
          'Qorvo Driver Amplifiers Driver Amplifiers - Image 5',
          5,
          false,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000006',
          '00000000-0000-0000-0002-000000000082',
          '/catalog-images/qorvo__driver-amplifiers_6.webp',
          'Qorvo Driver Amplifiers Driver Amplifiers - Image 6',
          6,
          false,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000007',
          '00000000-0000-0000-0002-000000000083',
          '/catalog-images/qorvo__low-noise-amplifiers_1.webp',
          'Qorvo Low Noise Amplifiers Low Noise Amplifiers - Image 1',
          1,
          true,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000008',
          '00000000-0000-0000-0002-000000000083',
          '/catalog-images/qorvo__low-noise-amplifiers_2.webp',
          'Qorvo Low Noise Amplifiers Low Noise Amplifiers - Image 2',
          2,
          false,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000009',
          '00000000-0000-0000-0002-000000000083',
          '/catalog-images/qorvo__low-noise-amplifiers_3.webp',
          'Qorvo Low Noise Amplifiers Low Noise Amplifiers - Image 3',
          3,
          false,
          236,
          220,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000010',
          '00000000-0000-0000-0002-000000000083',
          '/catalog-images/qorvo__low-noise-amplifiers_4.webp',
          'Qorvo Low Noise Amplifiers Low Noise Amplifiers - Image 4',
          4,
          false,
          498,
          260,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000011',
          '00000000-0000-0000-0002-000000000091',
          '/catalog-images/tecdia__single-layer-capacitors_1.webp',
          'TecDia Single Layer Capacitors Single Layer Capacitors - Image 1',
          1,
          true,
          260,
          200,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000012',
          '00000000-0000-0000-0002-000000000091',
          '/catalog-images/tecdia__single-layer-capacitors_2.webp',
          'TecDia Single Layer Capacitors Single Layer Capacitors - Image 2',
          2,
          false,
          412,
          271,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000013',
          '00000000-0000-0000-0002-000000000092',
          '/catalog-images/tecdia__tunable-dielectric-capacitors_1.webp',
          'TecDia Tunable Dielectric Capacitors Tunable Dielectric Capacitors - Image 1',
          1,
          true,
          653,
          149,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000014',
          '00000000-0000-0000-0002-000000000099',
          '/catalog-images/rfuw-engineering__rf-limiters_1.webp',
          'RFuW Engineering RF Limiters RF Limiters - Image 1',
          1,
          true,
          103,
          66,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000015',
          '00000000-0000-0000-0002-000000000099',
          '/catalog-images/rfuw-engineering__rf-limiters_2.webp',
          'RFuW Engineering RF Limiters RF Limiters - Image 2',
          2,
          false,
          114,
          114,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000016',
          '00000000-0000-0000-0002-000000000107',
          '/catalog-images/evans__xg1-series--binary_1.webp',
          'Evans XG1 Series- Binary Eulex - Image 1',
          1,
          true,
          321,
          180,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000017',
          '00000000-0000-0000-0002-000000000108',
          '/catalog-images/evans__xg2-series---2-terminal_1.webp',
          'Evans XG2 Series - 2 Terminal Eulex - Image 1',
          1,
          true,
          244,
          138,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000018',
          '00000000-0000-0000-0002-000000000108',
          '/catalog-images/evans__xg2-series---2-terminal_2.webp',
          'Evans XG2 Series - 2 Terminal Eulex - Image 2',
          2,
          false,
          251,
          141,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000019',
          '00000000-0000-0000-0002-000000000108',
          '/catalog-images/evans__xg2-series---2-terminal_3.webp',
          'Evans XG2 Series - 2 Terminal Eulex - Image 3',
          3,
          false,
          229,
          129,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000020',
          '00000000-0000-0000-0002-000000000108',
          '/catalog-images/evans__xg2-series---2-terminal_4.webp',
          'Evans XG2 Series - 2 Terminal Eulex - Image 4',
          4,
          false,
          258,
          145,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000021',
          '00000000-0000-0000-0002-000000000108',
          '/catalog-images/evans__xg2-series---2-terminal_5.webp',
          'Evans XG2 Series - 2 Terminal Eulex - Image 5',
          5,
          false,
          326,
          183,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000022',
          '00000000-0000-0000-0002-000000000113',
          '/catalog-images/evans__tdd-series_1.webp',
          'Evans TDD Series Evans - Image 1',
          1,
          true,
          400,
          267,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000023',
          '00000000-0000-0000-0002-000000000113',
          '/catalog-images/evans__tdd-series_2.webp',
          'Evans TDD Series Evans - Image 2',
          2,
          false,
          386,
          217,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000024',
          '00000000-0000-0000-0002-000000000114',
          '/catalog-images/evans__tde-series_1.webp',
          'Evans TDE Series Evans - Image 1',
          1,
          true,
          341,
          192,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000025',
          '00000000-0000-0000-0002-000000000114',
          '/catalog-images/evans__tde-series_2.webp',
          'Evans TDE Series Evans - Image 2',
          2,
          false,
          317,
          178,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000026',
          '00000000-0000-0000-0002-000000000114',
          '/catalog-images/evans__tde-series_3.webp',
          'Evans TDE Series Evans - Image 3',
          3,
          false,
          333,
          187,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000027',
          '00000000-0000-0000-0002-000000000114',
          '/catalog-images/evans__tde-series_4.webp',
          'Evans TDE Series Evans - Image 4',
          4,
          false,
          400,
          225,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000028',
          '00000000-0000-0000-0002-000000000115',
          '/catalog-images/evans__ths3-series_1.webp',
          'Evans THS3 Series Evans - Image 1',
          1,
          true,
          280,
          158,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000029',
          '00000000-0000-0000-0002-000000000115',
          '/catalog-images/evans__ths3-series_2.webp',
          'Evans THS3 Series Evans - Image 2',
          2,
          false,
          251,
          141,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000030',
          '00000000-0000-0000-0002-000000000121',
          '/catalog-images/evans__angstor_1.webp',
          'Evans Angstor Paktron - Image 1',
          1,
          true,
          301,
          301,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000031',
          '00000000-0000-0000-0002-000000000121',
          '/catalog-images/evans__angstor_2.webp',
          'Evans Angstor Paktron - Image 2',
          2,
          false,
          242,
          242,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000032',
          '00000000-0000-0000-0002-000000000121',
          '/catalog-images/evans__angstor_3.webp',
          'Evans Angstor Paktron - Image 3',
          3,
          false,
          121,
          171,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000033',
          '00000000-0000-0000-0002-000000000121',
          '/catalog-images/evans__angstor_4.webp',
          'Evans Angstor Paktron - Image 4',
          4,
          false,
          179,
          180,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000034',
          '00000000-0000-0000-0002-000000000121',
          '/catalog-images/evans__angstor_5.webp',
          'Evans Angstor Paktron - Image 5',
          5,
          false,
          187,
          187,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000035',
          '00000000-0000-0000-0002-000000000127',
          '/catalog-images/evans__smps_1.webp',
          'Evans SMPS UTC - Image 1',
          1,
          true,
          279,
          222,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000036',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_1.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 1',
          1,
          true,
          374,
          210,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000037',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_2.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 2',
          2,
          false,
          376,
          212,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000038',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_3.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 3',
          3,
          false,
          359,
          202,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000039',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_4.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 4',
          4,
          false,
          333,
          187,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000040',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_5.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 5',
          5,
          false,
          400,
          225,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000041',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_6.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 6',
          6,
          false,
          310,
          174,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000042',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_7.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 7',
          7,
          false,
          345,
          193,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000043',
          '00000000-0000-0000-0002-000000000128',
          '/catalog-images/evans__military-mil-prf-49470_8.webp',
          'Evans Military (MIL-PRF 49470) UTC - Image 8',
          8,
          false,
          374,
          210,
          'webp'
        ),
(
          '00000000-0000-0000-0003-000000000044',
          '00000000-0000-0000-0002-000000000138',
          '/catalog-images/ohmega-ticer__ohmegaply-rcm-05a50pt_1.webp',
          'Ohmega Ticer OhmegaPly® RCM – 0.5A50PT RCM Series - Image 1',
          1,
          true,
          1024,
          670,
          'webp'
        )
ON CONFLICT (id) DO NOTHING;
