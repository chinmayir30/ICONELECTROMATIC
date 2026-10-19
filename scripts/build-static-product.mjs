// ==============================================================================
// build-static-product.mjs
// Static HTML Page & SEO Generator for Icon Electromatic Catalog
// Generates fully pre-rendered static HTML with Schema.org JSON-LD, OpenGraph,
// unique <title>, <meta description>, canonical link, and responsive WebP gallery.
// ==============================================================================

import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://iconelectromatic.com';

// Sample product dataset from the Walking Skeleton (Rogers TC350 & RT/duroid 5880)
const SAMPLE_PRODUCTS = [
  {
    name: "TC350",
    slug: "tc350",
    oem: {
      name: "Rogers Corporation",
      slug: "rogers",
      logo: "/images/oem-logos/Rogers_Logo_no_bg.png"
    },
    category: {
      name: "TC Series",
      slug: "tc-series"
    },
    tagline: "Thermally Conductive Ceramic-Filled PTFE Laminate for RF Power",
    description: "Rogers TC350 is a thermally conductive ceramic-filled PTFE composite laminate engineered for high-power RF and microwave circuit applications. It offers an exceptional 1.20 W/m-K thermal conductivity combined with low loss Df of 0.0020 at 10 GHz, dramatically lowering junction temperatures in power amplifiers and couplers.",
    specifications: {
      "Dielectric Constant (Dk)": "3.50 +/- 0.05 at 10 GHz",
      "Dissipation Factor (Df)": "0.0020 at 10 GHz",
      "Thermal Conductivity": "1.20 W/m/K",
      "Thermal Coefficient of Dk": "-39 ppm/C (-55C to 125C)",
      "Moisture Absorption": "0.05%",
      "Flammability": "UL 94 V-0"
    },
    features: [
      "High thermal conductivity of 1.20 W/m-K reduces operating temperatures",
      "Low loss tangent Df 0.0020 enables maximum RF efficiency",
      "Z-axis CTE matched to copper (35 ppm/C) for plated through-hole reliability",
      "Stable electrical performance across military temperature ranges (-55C to 125C)"
    ],
    applications: [
      "High-power RF and microwave power amplifiers (PA)",
      "Power combiners and splitters",
      "Microwave power filters and couplers",
      "Base station and radar power backplanes"
    ],
    datasheet_url: "https://www.rogerscorp.com/datasheets/tc350.pdf",
    images: [
      {
        url: "/extracted-samples/rogers_tc350_1.webp",
        alt: "Rogers TC350 Thermally Conductive Laminate - Primary View",
        width: 230,
        height: 124,
        is_primary: true
      },
      {
        url: "/extracted-samples/rogers_tc350_2.webp",
        alt: "Rogers TC350 Laminate - Cross Section & Substrate Detail",
        width: 229,
        height: 124,
        is_primary: false
      },
      {
        url: "/extracted-samples/rogers_tc350_3.webp",
        alt: "Rogers TC350 RF Material - High-Power Packaging Detail",
        width: 516,
        height: 280,
        is_primary: false
      }
    ],
    meta_title: "Rogers TC350 Thermally Conductive Laminates | Icon Electromatic",
    meta_description: "Buy genuine Rogers TC350 ceramic-filled PTFE laminates from Icon Electromatic. High thermal conductivity 1.2 W/m-K for high-power RF circuits in India, Singapore & USA."
  },
  {
    name: "RT/duroid 5880",
    slug: "rt-duroid-5880",
    oem: {
      name: "Rogers Corporation",
      slug: "rogers",
      logo: "/images/oem-logos/Rogers_Logo_no_bg.png"
    },
    category: {
      name: "RT/Duroid",
      slug: "rt-duroid"
    },
    tagline: "High Frequency PTFE Glass Microfiber Reinforced Composite Laminate",
    description: "Rogers RT/duroid 5880 PTFE composite laminate is reinforced with glass microfibers. Its extremely low dielectric constant of 2.20 and industry-leading low dissipation factor of 0.0009 make it the material of choice for high frequency millimeter-wave, radar, and satellite communications.",
    specifications: {
      "Dielectric Constant (Dk)": "2.20 +/- 0.02 at 10 GHz",
      "Dissipation Factor (Df)": "0.0009 at 10 GHz",
      "Moisture Absorption": "0.02%",
      "Thermal Conductivity": "0.20 W/m/K",
      "Lead-Free Solder Compatible": "Yes"
    },
    features: [
      "Lowest electrical loss of any reinforced PTFE material",
      "Uniform dielectric constant over wide frequency spectrum",
      "Easily cut, sheared, and machined to custom geometry",
      "High chemical resistance against solvents and etchants"
    ],
    applications: [
      "Commercial airline broadband antennas",
      "Millimeter-wave point-to-point radios",
      "Military radar and missile guidance systems",
      "Microstrip and stripline RF circuitry"
    ],
    datasheet_url: "https://www.rogerscorp.com/datasheets/rt-duroid-5880.pdf",
    images: [
      {
        url: "/extracted-samples/rogers_rt-duroid-5880_1.webp",
        alt: "Rogers RT/duroid 5880 PTFE Composite High Frequency Laminate",
        width: 440,
        height: 238,
        is_primary: true
      }
    ],
    meta_title: "Rogers RT/duroid 5880 High Frequency Laminates | Icon Electromatic",
    meta_description: "Buy genuine Rogers RT/duroid 5880 PTFE composite laminate from Icon Electromatic. Low Dk 2.20, low loss. Available in India, Singapore & USA."
  }
];

function generateProductHtml(prod) {
  const canonicalUrl = `${SITE_URL}/products/${prod.oem.slug}/${prod.slug}`;
  const primaryImg = prod.images.find(img => img.is_primary) || prod.images[0];
  const ogImageUrl = primaryImg ? `${SITE_URL}${primaryImg.url}` : `${SITE_URL}/images/og-default.jpg`;

  // 1. Structured Schema.org Product JSON-LD
  const schemaProduct = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${prod.oem.name} ${prod.name}`,
    "image": prod.images.map(img => `${SITE_URL}${img.url}`),
    "description": prod.description,
    "sku": `${prod.oem.slug}-${prod.slug}`,
    "mpn": prod.name,
    "brand": {
      "@type": "Brand",
      "name": prod.oem.name
    },
    "manufacturer": {
      "@type": "Organization",
      "name": prod.oem.name
    },
    "category": prod.category.name,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "Contact for Quote",
      "availability": "https://schema.org/InStock",
      "url": canonicalUrl,
      "seller": {
        "@type": "Organization",
        "name": "Icon Electromatic"
      }
    }
  };

  // 2. Structured Schema.org Breadcrumbs
  const schemaBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": prod.oem.name,
        "item": `${SITE_URL}/partners/${prod.oem.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": prod.category.name,
        "item": `${SITE_URL}/categories/${prod.category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": prod.name,
        "item": canonicalUrl
      }
    ]
  };

  // Specifications rows
  const specRows = Object.entries(prod.specifications || {}).map(([key, val]) => `
    <tr>
      <th scope="row" class="spec-label">${key}</th>
      <td class="spec-value">${val}</td>
    </tr>
  `).join('');

  // Features list
  const featuresList = (prod.features || []).map(f => `<li>${f}</li>`).join('');

  // Applications list
  const appsList = (prod.applications || []).map(a => `<li>${a}</li>`).join('');

  // Gallery thumbnails
  const galleryThumbnails = prod.images.map((img, idx) => `
    <button class="thumb-btn ${img.is_primary ? 'active' : ''}" onclick="document.getElementById('main-product-img').src='${img.url}'; document.getElementById('main-product-img').alt='${img.alt}'" aria-label="View Image ${idx + 1}">
      <img src="${img.url}" alt="${img.alt}" width="80" height="48" loading="lazy" />
    </button>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${prod.meta_title}</title>
  <meta name="description" content="${prod.meta_description}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow" />

  <!-- OpenGraph Social Sharing -->
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${prod.meta_title}" />
  <meta property="og:description" content="${prod.meta_description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:site_name" content="Icon Electromatic" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${prod.meta_title}" />
  <meta name="twitter:description" content="${prod.meta_description}" />
  <meta name="twitter:image" content="${ogImageUrl}" />

  <!-- Google Schema.org Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(schemaProduct, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(schemaBreadcrumbs, null, 2)}
  </script>

  <link rel="stylesheet" href="/assets/index-DmDkINf5.css" />
  <style>
    .product-page-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
    .breadcrumb-nav { font-size: 0.875rem; color: #64748b; margin-bottom: 24px; }
    .breadcrumb-nav a { color: #0284c7; text-decoration: none; }
    .breadcrumb-nav a:hover { text-decoration: underline; }
    .product-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 48px; }
    @media (max-width: 768px) { .product-hero-grid { grid-template-columns: 1fr; } }
    .gallery-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; }
    .main-img-box { min-height: 280px; display: flex; align-items: center; justify-content: center; }
    .main-img-box img { max-width: 100%; max-height: 320px; object-fit: contain; border-radius: 8px; }
    .thumbnails-strip { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
    .thumb-btn { background: #ffffff; border: 2px solid #e2e8f0; border-radius: 6px; padding: 4px; cursor: pointer; transition: border-color 0.2s; }
    .thumb-btn:hover, .thumb-btn.active { border-color: #0284c7; }
    .oem-badge { display: inline-flex; align-items: center; gap: 8px; background: #fee2e2; color: #b91c1c; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.2; }
    .product-tagline { font-size: 1.125rem; color: #475569; margin-bottom: 20px; line-height: 1.5; }
    .product-desc { font-size: 1rem; color: #334155; line-height: 1.7; margin-bottom: 28px; }
    .cta-row { display: flex; gap: 16px; margin-bottom: 32px; }
    .btn-quote { background: #dd2b1c; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; }
    .btn-quote:hover { background: #b91c1c; }
    .btn-datasheet { background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
    .btn-datasheet:hover { background: #f1f5f9; }
    .specs-section { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 40px; }
    .specs-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.9375rem; }
    .specs-table th, .specs-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .specs-table th { background: #f8fafc; font-weight: 600; color: #334155; width: 35%; }
    .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px; }
    @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }
    .features-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .features-box h3 { font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .features-box ul { padding-left: 20px; margin: 0; line-height: 1.8; color: #334155; }
  </style>
</head>
<body>
  <div class="product-page-container">
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <a href="/">Home</a> / 
      <a href="/partners/${prod.oem.slug}">${prod.oem.name}</a> / 
      <a href="/categories/${prod.category.slug}">${prod.category.name}</a> / 
      <span aria-current="page">${prod.name}</span>
    </nav>

    <div class="product-hero-grid">
      <div class="gallery-card">
        <div class="main-img-box">
          <img id="main-product-img" src="${primaryImg.url}" alt="${primaryImg.alt}" width="${primaryImg.width}" height="${primaryImg.height}" />
        </div>
        ${prod.images.length > 1 ? `<div class="thumbnails-strip">${galleryThumbnails}</div>` : ''}
      </div>

      <div class="product-info-card">
        <div class="oem-badge">OEM Partner: ${prod.oem.name}</div>
        <h1>${prod.name}</h1>
        <div class="product-tagline">${prod.tagline}</div>
        <p class="product-desc">${prod.description}</p>

        <div class="cta-row">
          <a class="btn-quote" href="/#/contact?oem=${prod.oem.slug}&product=${prod.slug}">Request Price & Delivery</a>
          ${prod.datasheet_url ? `<a class="btn-datasheet" href="${prod.datasheet_url}" target="_blank" rel="noopener">Download Datasheet</a>` : ''}
        </div>
      </div>
    </div>

    <section class="specs-section">
      <h2>Technical Specifications</h2>
      <table class="specs-table">
        <tbody>
          ${specRows}
        </tbody>
      </table>
    </section>

    <div class="features-grid">
      <div class="features-box">
        <h3>Key Features & Advantages</h3>
        <ul>${featuresList}</ul>
      </div>

      <div class="features-box">
        <h3>Target Applications</h3>
        <ul>${appsList}</ul>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildStaticProducts() {
  const publicDir = path.resolve('public');
  
  for (const prod of SAMPLE_PRODUCTS) {
    const outDir = path.join(publicDir, 'products', prod.oem.slug, prod.slug);
    os_mkdirp(outDir);
    const outFile = path.join(outDir, 'index.html');
    const html = generateProductHtml(prod);
    fs.writeFileSync(outFile, html, 'utf8');
    console.log(`Generated Static Product Page: ${outFile.replace(process.cwd(), '')}`);
  }
}

function os_mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

buildStaticProducts();
