-- ==============================================================================
-- seed.sql
-- Walking Skeleton Seed Data: 1 OEM (Rogers Corporation) + 5 Products
-- Demonstrates full relation mapping: OEM -> Categories -> Products -> Images
-- ==============================================================================

-- 1. Insert OEM: Rogers Corporation
INSERT INTO public.oems (
    id, name, slug, logo_url, description, priority_order, website_url
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Rogers Corporation',
    'rogers',
    '/images/oem-logos/Rogers_Logo_no_bg.png',
    'Rogers Corporation is a global leader in engineered materials for high-frequency RF, microwave, and millimeter-wave applications across defense, automotive radar, and 5G infrastructure.',
    1,
    'https://www.rogerscorp.com'
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. Insert Categories
INSERT INTO public.categories (
    id, name, slug, description, oem_id
) VALUES 
(
    '00000000-0000-0000-0000-000000000101',
    'RT/Duroid',
    'rt-duroid',
    'PTFE composite laminate with very low dielectric constant and loss, reinforced with glass microfibers.',
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000102',
    'RO400 Series',
    'ro400-series',
    'Hydrocarbon ceramic laminates engineered for high frequency RF and microwave applications.',
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000103',
    'TMM Series',
    'tmm-series',
    'Thermoset microwave materials offering exceptional mechanical and electrical stability across wide temperature ranges.',
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000104',
    'TC Series',
    'tc-series',
    'Thermally conductive ceramic-filled PTFE laminates for advanced RF thermal management.',
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 3. Insert 5 Sample Rogers Products
-- Note: Per Option B, products with image + description are published. Products missing images are drafts.
INSERT INTO public.products (
    id, name, slug, oem_id, category_id, description,
    specifications, features, applications, datasheet_url,
    is_published, is_featured,
    meta_title, meta_description, canonical_url, og_image_url
) VALUES 
(
    '00000000-0000-0000-0000-000000000201',
    'RT/duroid 5880',
    'rt-duroid-5880',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'PTFE composite laminate with very low dielectric constant and loss, reinforced with glass microfibers.',
    '{"Dk": "2.20 +/- 0.02 at 10 GHz", "Df": "0.0009 at 10 GHz", "MoistureAbsorption": "0.02%", "ThermalConductivity": "0.20 W/m/K"}'::jsonb,
    ARRAY['Lowest electrical loss for reinforced PTFE material', 'Easily cut, sheared and machined to shape', 'Uniform electrical properties over wide frequency range'],
    ARRAY['Commercial Airline Broadband Antennas', 'Microstrip and Stripline Circuits', 'Millimeter Wave Applications', 'Military Radar Systems', 'Missile Guidance Systems'],
    'https://www.rogerscorp.com/datasheets/rt-duroid-5880.pdf',
    true, true,
    'Rogers RT/duroid 5880 High Frequency Laminates | Icon Electromatic',
    'Buy genuine Rogers RT/duroid 5880 PTFE composite laminate from Icon Electromatic. Low Dk 2.20, low loss. Available in India, Singapore & USA.',
    'https://iconelectromatic.com/products/rogers/rt-duroid-5880',
    '/extracted-samples/rogers_rt-duroid-5880_1.webp'
),
(
    '00000000-0000-0000-0000-000000000202',
    'RO4350B',
    'ro4350b',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000102',
    'Low loss hydrocarbon ceramic laminate with excellent thermal stability and multilayer capability.',
    '{"Dk": "3.48 +/- 0.05 at 10 GHz", "Df": "0.0037 at 10 GHz", "Tg": "> 280 C", "ThermalConductivity": "0.62 W/m/K"}'::jsonb,
    ARRAY['FR-4 process compatible with standard PCB fabrication', 'Excellent dimensional stability', 'Low Z-axis CTE for reliable plated through-holes'],
    ARRAY['Cellular Base Station Antennas and Power Amplifiers', 'Automotive Radar and Sensors', 'LNBs for Direct Broadcast Satellites', 'RF Identification Tags'],
    'https://www.rogerscorp.com/datasheets/ro4350b.pdf',
    true, true,
    'Rogers RO4350B High Frequency Laminates | Icon Electromatic',
    'Buy genuine Rogers RO4350B hydrocarbon ceramic laminates from Icon Electromatic. Low loss Dk 3.48. Inquire for pricing in India, Singapore & USA.',
    'https://iconelectromatic.com/products/rogers/ro4350b',
    '/extracted-samples/rogers_ro4350b_1.webp'
),
(
    '00000000-0000-0000-0000-000000000203',
    'TC350',
    'tc350',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000104',
    'Thermally conductive ceramic-filled PTFE laminate for advanced RF thermal management.',
    '{"Dk": "3.50 +/- 0.05 at 10 GHz", "Df": "0.0020 at 10 GHz", "ThermalConductivity": "1.20 W/m/K", "MoistureAbsorption": "0.05%"}'::jsonb,
    ARRAY['High thermal conductivity 1.2 W/m/K', 'Low dielectric loss Df 0.0020', 'Low Z-axis expansion matched to copper'],
    ARRAY['High-power RF and microwave amplifiers', 'Combiners and dividers', 'Power filters and couplers'],
    'https://www.rogerscorp.com/datasheets/tc350.pdf',
    true, false,
    'Rogers TC350 Thermally Conductive Laminates | Icon Electromatic',
    'Buy genuine Rogers TC350 ceramic-filled PTFE laminates from Icon Electromatic. High thermal conductivity 1.2 W/m-K for high-power RF circuits.',
    'https://iconelectromatic.com/products/rogers/tc350',
    '/extracted-samples/rogers_tc350_1.webp'
),
(
    '00000000-0000-0000-0000-000000000204',
    'RO4003C',
    'ro4003c',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000102',
    'Hydrocarbon ceramic laminate offering FR-4-like processing with RF microwave performance.',
    '{"Dk": "3.38 +/- 0.05 at 10 GHz", "Df": "0.0027 at 10 GHz", "Tg": "> 280 C"}'::jsonb,
    ARRAY['Standard FR-4 fabrication compatible', 'Tight dielectric tolerance', 'Stable electrical performance over temperature'],
    ARRAY['Cellular base stations', 'RF identification tags', 'Automotive radar'],
    'https://www.rogerscorp.com/datasheets/ro4003c.pdf',
    false, false, -- Option B: marked draft until image uploaded via Admin
    'Rogers RO4003C High Frequency Laminates | Icon Electromatic',
    'Buy genuine Rogers RO4003C hydrocarbon ceramic laminate from Icon Electromatic. Tight Dk 3.38 tolerance for microwave circuits.',
    'https://iconelectromatic.com/products/rogers/ro4003c',
    NULL
),
(
    '00000000-0000-0000-0000-000000000205',
    'TMM 10i',
    'tmm-10i',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000103',
    'Thermoset microwave composite laminate offering high Dk and exceptional electrical consistency.',
    '{"Dk": "9.80 +/- 0.245 at 10 GHz", "Df": "0.0020 at 10 GHz", "ThermalConductivity": "0.76 W/m/K"}'::jsonb,
    ARRAY['High dielectric constant 9.80', 'Exceptional thermal stability of Dk', 'Resistant to chemicals and solvents'],
    ARRAY['Power amplifiers and combiners', 'Filters and couplers', 'Satellite communication systems', 'Global Positioning Systems Antennas'],
    'https://www.rogerscorp.com/datasheets/tmm-10i.pdf',
    false, false, -- Option B: marked draft until image uploaded via Admin
    'Rogers TMM 10i Thermoset Microwave Materials | Icon Electromatic',
    'Buy genuine Rogers TMM 10i microwave laminate from Icon Electromatic. High Dk 9.80 for compact RF filters and patch antennas.',
    'https://iconelectromatic.com/products/rogers/tmm-10i',
    NULL
)
ON CONFLICT (oem_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    specifications = EXCLUDED.specifications,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description;

-- 4. Insert Images for the 3 Published Products
-- Demonstrates single image and multi-image left-to-right gallery ordering
INSERT INTO public.product_images (
    product_id, image_url, alt_text, display_order, is_primary, width, height, format
) VALUES 
-- RT/duroid 5880 (1 image)
(
    '00000000-0000-0000-0000-000000000201',
    '/extracted-samples/rogers_rt-duroid-5880_1.webp',
    'Rogers RT/duroid 5880 PTFE Composite High Frequency Laminate',
    1, true, 440, 238, 'webp'
),
-- RO4350B (1 image)
(
    '00000000-0000-0000-0000-000000000202',
    '/extracted-samples/rogers_ro4350b_1.webp',
    'Rogers RO4350B Hydrocarbon Ceramic High Frequency Laminate',
    1, true, 148, 81, 'webp'
),
-- TC350 (3 images ordered Left-to-Right from Excel row 29)
(
    '00000000-0000-0000-0000-000000000203',
    '/extracted-samples/rogers_tc350_1.webp',
    'Rogers TC350 Thermally Conductive Laminate - Primary View',
    1, true, 230, 124, 'webp'
),
(
    '00000000-0000-0000-0000-000000000203',
    '/extracted-samples/rogers_tc350_2.webp',
    'Rogers TC350 Laminate - Cross Section & Substrate Detail',
    2, false, 229, 124, 'webp'
),
(
    '00000000-0000-0000-0000-000000000203',
    '/extracted-samples/rogers_tc350_3.webp',
    'Rogers TC350 RF Material - High-Power Packaging Detail',
    3, false, 516, 280, 'webp'
);
