const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./db/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_BASE_URL = process.env.BASE_URL || 'https://delight-everything-parts-hoping.trycloudflare.com';
const BASE_URL = DEFAULT_BASE_URL;

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (req && req.headers && req.headers.host) {
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    return `${proto}://${req.headers.host}`;
  }
  return DEFAULT_BASE_URL;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static client assets
const clientPath = path.join(__dirname, '../client');

// 1. Robots.txt and Sitemap.xml routes
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const robotsTxt = fs.readFileSync(path.join(clientPath, 'robots.txt'), 'utf8');
  const baseUrl = getBaseUrl(req);
  res.send(robotsTxt.replace(/https:\/\/corporate-ews\.bank\.internal/g, baseUrl));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const sitemapXml = fs.readFileSync(path.join(clientPath, 'sitemap.xml'), 'utf8');
  const baseUrl = getBaseUrl(req);
  res.send(sitemapXml.replace(/https:\/\/corporate-ews\.bank\.internal/g, baseUrl));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(clientPath, 'favicon.svg'));
});

// 2. 301 Permanent Redirects
app.get('/home', (req, res) => res.redirect(301, '/'));
app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.get('/dashboard', (req, res) => res.redirect(301, '/'));
app.get('/signin', (req, res) => res.redirect(301, '/login'));

// Serve static assets (CSS, JS, assets)
app.use(express.static(clientPath, { index: false }));

// 3. API Routes
app.use('/api', apiRoutes);

// Page Metadata Map for SSR Injection
const PAGE_METADATA = {
  '/': {
    title: 'Corporate EWS : Follow the money, every hop - Early Warning System for Banks',
    description: 'Institutional early-warning system predicting corporate default and financial manipulation 4 quarters ahead within a 5% alert budget.',
    canonical: `${BASE_URL}/`,
    heading: 'Corporate EWS : Follow the Money, Every Hop',
    subheading: 'Institutional credit surveillance, sub-40ms transaction risk checks, and forensic accounting intelligence.',
    activeTab: 'overview',
    stationId: 'vault',
    breadcrumbs: [{ name: 'Home', url: '/' }]
  },
  '/watchlist': {
    title: 'Portfolio Watchlist Surveillance : Corporate EWS',
    description: 'Real-time multi-dimensional risk monitoring of corporate exposures across Solvency, Forensic M-Score, and Contagion networks.',
    canonical: `${BASE_URL}/watchlist`,
    heading: 'Borrower Portfolio Surveillance Watchlist',
    subheading: 'Continuous risk tracking of 40 monitored borrowers with Altman Z, Beneish M, and Network Contagion ratings.',
    activeTab: 'watchlist',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Watchlist', url: '/watchlist' }]
  },
  '/investigate': {
    title: 'Single-Borrower Forensic Dossier & Evidence Studio : Corporate EWS',
    description: 'Deep forensic investigation workbench featuring SHAP waterfalls, relational fraud graphs, and multi-modal audit evidence.',
    canonical: `${BASE_URL}/investigate`,
    heading: 'Forensic Investigation Dossier & Audit Evidence Studio',
    subheading: 'Reconcile contradictory financial filings, examine counterparty shell flows, and log regulatory committee decisions.',
    activeTab: 'investigation',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Investigation', url: '/investigate' }]
  },
  '/simulator': {
    title: 'Asymmetric Loss & 5% Budget Simulator : Corporate EWS',
    description: 'Evaluate corporate default early warning trade-offs under 20:1 asymmetric false-negative loss weighting and a 5% alert capacity cap.',
    canonical: `${BASE_URL}/simulator`,
    heading: 'Production Asymmetric Loss & 5% Budget Policy Simulator',
    subheading: 'Interactive stress testing of alert thresholds, false negative penalties, and early detection lead times.',
    activeTab: 'simulator',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Simulator', url: '/simulator' }]
  },
  '/benchmark': {
    title: 'UCI Polish & Taiwan Benchmark Database : Corporate EWS',
    description: 'Academic transferability database containing 43,405 Polish enterprise observations and 6,819 Taiwanese corporate distress records.',
    canonical: `${BASE_URL}/benchmark`,
    heading: 'International Corporate Distress Benchmark Database',
    subheading: 'Cross-jurisdictional empirical validation of transferability across Central European and East Asian distress cohorts.',
    activeTab: 'benchmark',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Benchmark', url: '/benchmark' }]
  },
  '/station/vault': {
    title: 'Station 01 : The Vault & Liquidity Reserve - Corporate EWS',
    description: 'Reserve ledger, capital allocation monitoring, and debt maturity profile tracking for institutional balance sheets.',
    canonical: `${BASE_URL}/station/vault`,
    heading: 'Station 01 : The Vault & Liquidity Reserve',
    subheading: 'Continuous surveillance of reserve ratios, cash buffers, and short-term debt refinancing pressure.',
    activeTab: 'overview',
    stationId: 'vault',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Stations', url: '/#stations' }, { name: 'Vault', url: '/station/vault' }]
  },
  '/station/network': {
    title: 'Station 02 : Network Rails & Transaction Pathways - Corporate EWS',
    description: 'Graph surveillance tracing cross-corporate funds flow, circular routing, and related-party counterparty hops.',
    canonical: `${BASE_URL}/station/network`,
    heading: 'Station 02 : Network Rails & Counterparty Pathways',
    subheading: 'Follow the money through circular routing, SPVs, common directors, and undisclosed related parties.',
    activeTab: 'overview',
    stationId: 'network',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Stations', url: '/#stations' }, { name: 'Network Rails', url: '/station/network' }]
  },
  '/station/global': {
    title: 'Station 03 : Global Contagion & Offshore Shells - Corporate EWS',
    description: 'Multi-jurisdictional tracking of cross-border financial flows into FATF grey-list territories and shell intermediaries.',
    canonical: `${BASE_URL}/station/global`,
    heading: 'Station 03 : Global Contagion & Offshore Intermediaries',
    subheading: 'Surveillance of cross-border remittances, tax haven shell entities, and international contagion vulnerability.',
    activeTab: 'overview',
    stationId: 'global',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Stations', url: '/#stations' }, { name: 'Global', url: '/station/global' }]
  },
  '/station/fraud': {
    title: 'Station 04 : Fraud Engine & Forensic Manipulation - Corporate EWS',
    description: 'Automated Beneish M-Score, Piotroski F-Score, and Tree-SHAP forensic feature attribution identifying accounting fraud.',
    canonical: `${BASE_URL}/station/fraud`,
    heading: 'Station 04 : Forensic Fraud & Accounting Manipulation Engine',
    subheading: 'Deconstruct revenue acceleration, unrecorded liabilities, asset quality degradation, and auditor resignation alerts.',
    activeTab: 'overview',
    stationId: 'fraud',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Stations', url: '/#stations' }, { name: 'Fraud Engine', url: '/station/fraud' }]
  },
  '/station/hq': {
    title: 'Station 05 : Bank HQ & Regulatory Action Room - Corporate EWS',
    description: 'Executive command room enforcing the 5% alert capacity cap and logging immutable regulatory review committee decisions.',
    canonical: `${BASE_URL}/station/hq`,
    heading: 'Station 05 : Bank HQ & Regulatory Decision Room',
    subheading: 'Operational governance ensuring audit compliance with RBI Master Directions and Section 143(12) of Companies Act.',
    activeTab: 'overview',
    stationId: 'hq',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Stations', url: '/#stations' }, { name: 'Bank HQ', url: '/station/hq' }]
  },
  '/login': {
    title: 'Institutional Access Portal & Credentials Vault : Corporate EWS',
    description: 'Authorized sign-in for credit risk officers, forensic auditors, and regulatory committee members.',
    canonical: `${BASE_URL}/login`,
    heading: 'Institutional Access Portal',
    subheading: 'Authenticate credentials against local database security vault to access restricted surveillance dossiers.',
    activeTab: 'login',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Login', url: '/login' }]
  },
  '/contact': {
    title: 'Institutional Inquiry & Deployment Request : Corporate EWS',
    description: 'Contact the corporate credit risk intelligence group for on-premise deployment or enterprise surveillance evaluation.',
    canonical: `${BASE_URL}/contact`,
    heading: 'Institutional Deployment Inquiry',
    subheading: 'Submit enterprise requirements for custom portfolio monitoring, Core Banking integration, or forensic audit pilots.',
    activeTab: 'contact',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]
  },
  '/privacy': {
    title: 'Privacy Policy & Data Protection : Corporate EWS',
    description: 'Regulatory compliance standards, borrower data handling norms, and DPDP Act 2023 governance.',
    canonical: `${BASE_URL}/privacy`,
    heading: 'Institutional Privacy Policy & Data Governance',
    subheading: 'Adherence to RBI guidelines, Companies Act confidentiality, and Digital Personal Data Protection Act 2023.',
    activeTab: 'privacy',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]
  },
  '/terms': {
    title: 'Terms and Conditions : Corporate EWS',
    description: 'Institutional license terms, model risk governance disclaimers, and statutory regulatory citations.',
    canonical: `${BASE_URL}/terms`,
    heading: 'Institutional Terms and Conditions',
    subheading: 'Model usage agreements, risk rating disclaimers, and regulatory compliance protocols for lending institutions.',
    activeTab: 'terms',
    stationId: null,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Terms & Conditions', url: '/terms' }]
  }
};

// 4. SSR Page Rendering Engine
function renderPage(meta, initialTab = 'overview', initialStation = 'vault', req = null) {
  const indexHtmlPath = path.join(clientPath, 'index.html');
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = meta.canonical ? meta.canonical.replace(/https?:\/\/[^\/]+/, baseUrl) : `${baseUrl}/`;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

  // Replace Meta Description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${meta.description}">`
  );

  // Inject Canonical link
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
  } else {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
  }

  // Inject Open Graph and Twitter Card tags
  const ogTags = `
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${baseUrl}/assets/og-image.svg">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Corporate EWS">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${baseUrl}/assets/og-image.svg">

  <!-- Search Console Verification & Analytics Hook -->
  <meta name="google-site-verification" content="GSC-CORPORATE-EWS-VERIFY-KEY-2026">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-EWSBANK2026"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-EWSBANK2026');
  </script>

  <!-- Organization JSON-LD Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Corporate EWS - Early Warning System for Banks",
    "url": "${baseUrl}",
    "logo": "${baseUrl}/favicon.svg",
    "description": "${meta.description}",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    }
  }
  </script>

  <!-- BreadcrumbList JSON-LD Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": ${JSON.stringify(
      (meta.breadcrumbs || []).map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": b.name,
        "item": `${baseUrl}${b.url}`
      }))
    )}
  }
  </script>`;

  html = html.replace('</head>', `${ogTags}\n</head>`);

  // Inject initial state for client-side hydration
  const stateScript = `
  <script>
    window.__INITIAL_STATE__ = {
      activeTab: ${JSON.stringify(meta.activeTab || initialTab)},
      activeStation: ${JSON.stringify(meta.stationId || initialStation)},
      pageTitle: ${JSON.stringify(meta.title)},
      heading: ${JSON.stringify(meta.heading)},
      subheading: ${JSON.stringify(meta.subheading)},
      breadcrumbs: ${JSON.stringify(meta.breadcrumbs || [])}
    };
  </script>`;

  html = html.replace('</body>', `${stateScript}\n</body>`);

  return html;
}

// 5. Defined SSR Routes
Object.keys(PAGE_METADATA).forEach(routePath => {
  app.get(routePath, (req, res) => {
    const meta = PAGE_METADATA[routePath];
    const html = renderPage(meta, meta.activeTab, meta.stationId, req);
    res.send(html);
  });
});

// Dynamic investigate with company ID
app.get('/investigate/:companyId', (req, res) => {
  const companyId = req.params.companyId;
  const baseUrl = getBaseUrl(req);
  const meta = {
    title: `Forensic Dossier : ${companyId.toUpperCase()} - Corporate EWS`,
    description: `Forensic early-warning examination, SHAP attribution, and audit evidence for borrower ${companyId}.`,
    canonical: `${baseUrl}/investigate/${companyId}`,
    heading: `Forensic Borrower Dossier : ${companyId.toUpperCase()}`,
    subheading: 'SHAP Waterfall, Relational Contagion Network, and CARO Reconciliation Audit Studio.',
    activeTab: 'investigation',
    stationId: null,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Investigation', url: '/investigate' },
      { name: companyId.toUpperCase(), url: `/investigate/${companyId}` }
    ]
  };
  const html = renderPage(meta, 'investigation', null, req);
  res.send(html);
});

// 6. Custom 404 Error Page Handler
app.use((req, res) => {
  res.status(404);
  
  // If it's an API request, return JSON
  if (req.path.startsWith('/api')) {
    return res.json({ error: 'Endpoint Not Found', status: 404, path: req.path });
  }

  // Render Institutional 404 HTML
  const baseUrl = getBaseUrl(req);
  const notFoundMeta = {
    title: '404 : Resource Not Found - Corporate EWS',
    description: 'The requested surveillance endpoint or corporate dossier does not exist.',
    canonical: `${baseUrl}${req.path}`,
    heading: '404 : Dossier or Endpoint Not Located',
    subheading: 'The requested URL is not cataloged in the institutional surveillance registry.',
    activeTab: '404',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: '404 Not Found', url: req.path }]
  };

  const html = renderPage(notFoundMeta, '404', null, req);
  res.send(html);
});

// Start Server after Database Initialization
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Corporate Early-Warning System (EWS) Web Application`);
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Mode: Production SSR Web Hosting Ready`);
      console.log(` SEO: Robots.txt, Sitemap.xml, Canonical & OpenGraph`);
      console.log(` Database: SQLite Real Benchmark Database Loaded`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start Corporate EWS server:', err);
    process.exit(1);
  }
}

startServer();
