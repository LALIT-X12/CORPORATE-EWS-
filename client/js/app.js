// Corporate EWS - Main Application Controller & Router
// Handles client-side navigation, theme, modals, auth state, and SSR hydration

const App = {
  currentTab: 'overview',
  currentStation: 'vault',
  selectedCompanyId: 'ind-def-01',
  selectedAssessmentId: 'ass-01',
  authUser: null,

  init() {
    // Hydrate from server-side initial state if present
    if (window.__INITIAL_STATE__) {
      const s = window.__INITIAL_STATE__;
      if (s.activeTab) this.currentTab = s.activeTab;
      if (s.activeStation) this.currentStation = s.activeStation;
    }

    this.setupTheme();
    this.setupNavigation();
    this.setupModals();
    this.restoreAuth();

    // Handle special pages (login, contact, privacy, terms, 404) rendered server-side
    const specialPages = ['login', 'contact', 'privacy', 'terms', '404'];
    if (!specialPages.includes(this.currentTab)) {
      this.navigateTo(this.currentTab, this.currentStation);
    } else {
      this.renderSpecialPage(this.currentTab);
    }

    this.checkHealth();
  },

  async checkHealth() {
    try {
      const health = await API.getHealth();
      const indicator = document.getElementById('sys_indicator');
      if (indicator) indicator.style.backgroundColor = 'var(--color-success)';
      const dateEl = document.getElementById('header_as_of_date');
      if (dateEl && health) dateEl.textContent = '2026-Q3';
    } catch (e) {
      const indicator = document.getElementById('sys_indicator');
      if (indicator) indicator.style.backgroundColor = 'var(--color-risk-critical)';
    }
  },

  restoreAuth() {
    try {
      const stored = localStorage.getItem('ews_auth_user');
      if (stored) {
        this.authUser = JSON.parse(stored);
        this.updateAuthUI();
      }
    } catch (e) { /* ignore */ }
  },

  updateAuthUI() {
    const loginBtn = document.getElementById('header_login_btn');
    if (!loginBtn) return;

    if (this.authUser) {
      loginBtn.textContent = this.authUser.fullName.split(' ')[0] || 'Officer';
      loginBtn.href = '#';
      loginBtn.title = `Signed in as ${this.authUser.email} (${this.authUser.role})`;
      loginBtn.onclick = (e) => {
        e.preventDefault();
        if (confirm('Sign out of Corporate EWS?')) {
          localStorage.removeItem('ews_auth_user');
          this.authUser = null;
          loginBtn.textContent = 'Sign In';
          loginBtn.href = '/login';
          loginBtn.onclick = null;
        }
      };
    }
  },

  setupTheme() {
    const savedTheme = localStorage.getItem('corporate_ews_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);

    const toggleBtn = document.getElementById('theme_toggle_btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('corporate_ews_theme', newTheme);
        this.updateThemeButton(newTheme);
      });
    }
  },

  updateThemeButton(theme) {
    const label = document.getElementById('theme_label');
    if (label) {
      label.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
  },

  setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab[data-tab]');
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.navigateTo(targetTab);
      });
    });
  },

  navigateTo(tabName, payload = null) {
    this.currentTab = tabName;

    // Special client-side pages: redirect via URL
    if (['login', 'contact', 'privacy', 'terms'].includes(tabName)) {
      window.location.href = `/${tabName}`;
      return;
    }

    // Update station sub-path for URL
    const stationRoutes = ['vault', 'network', 'global', 'fraud', 'hq'];
    if (stationRoutes.includes(tabName)) {
      this.currentStation = tabName;
      window.history.pushState({}, '', `/station/${tabName}`);
      this.currentTab = 'stations';
      tabName = 'stations';
    } else {
      const urlMap = {
        overview: '/',
        watchlist: '/watchlist',
        investigation: '/investigate',
        simulator: '/simulator',
        benchmark: '/benchmark',
        stations: '/#stations'
      };
      if (urlMap[tabName]) {
        window.history.pushState({}, '', urlMap[tabName]);
      }
    }

    // Update active tab UI
    const navTabs = document.querySelectorAll('.nav-tab[data-tab]');
    navTabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const container = document.getElementById('view_container');
    if (!container) return;

    window.scrollTo({ top: 0, behavior: 'instant' });

    switch (tabName) {
      case 'overview':
        OverviewComponent.render(container);
        break;
      case 'stations':
        StationsComponent.render(container, this.currentStation);
        break;
      case 'watchlist':
        WatchlistComponent.render(container);
        break;
      case 'investigation':
        const companyId = payload || this.selectedCompanyId;
        InvestigationComponent.render(container, companyId);
        break;
      case 'simulator':
        SimulatorComponent.render(container);
        break;
      case 'benchmark':
        BenchmarkComponent.render(container);
        break;
      default:
        OverviewComponent.render(container);
    }
  },

  selectBorrower(companyId) {
    this.selectedCompanyId = companyId;
    this.navigateTo('investigation', companyId);
  },

  renderSpecialPage(page) {
    const container = document.getElementById('view_container');
    if (!container) return;

    switch (page) {
      case 'login':
        this.renderLoginPage(container);
        break;
      case 'contact':
        this.renderContactPage(container);
        break;
      case 'privacy':
        this.renderPrivacyPage(container);
        break;
      case 'terms':
        this.renderTermsPage(container);
        break;
      case '404':
        this.render404Page(container);
        break;
    }
  },

  renderLoginPage(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="page-header" style="text-align:center;margin-bottom:1.5rem;">
          <div style="display:flex;justify-content:center;margin-bottom:0.5rem;">
            <div style="width:10px;height:10px;background:var(--color-risk-critical);border-radius:2px;"></div>
          </div>
          <h1 class="page-title" style="font-size:1.4rem;">Institutional Access Portal</h1>
          <p class="page-subtitle" style="margin:0.35rem auto 0;">Authenticate credentials to access restricted surveillance dossiers.</p>
        </div>

        <div class="card">
          <div class="auth-tabs">
            <button class="auth-tab-btn active" id="tab_signin" onclick="App.switchAuthTab('signin')">Sign In</button>
            <button class="auth-tab-btn" id="tab_register" onclick="App.switchAuthTab('register')">Register Account</button>
          </div>

          <div id="auth_status_banner" style="display:none;"></div>

          <!-- Sign In Form -->
          <div id="signin_form">
            <div class="form-group">
              <label for="signin_email">Institutional Email Address</label>
              <input type="email" id="signin_email" class="form-input" placeholder="officer@bank.in" autocomplete="email">
            </div>
            <div class="form-group">
              <label for="signin_password">Credential Password</label>
              <input type="password" id="signin_password" class="form-input" placeholder="Secure credential" autocomplete="current-password">
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:0.5rem;" id="signin_btn" onclick="App.handleSignIn()">
              Access Surveillance Console
            </button>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-top:0.85rem;text-align:center;">
              Test credentials: officer@bank.in / password
            </p>
          </div>

          <!-- Register Form -->
          <div id="register_form" style="display:none;">
            <div class="form-group">
              <label for="reg_name">Full Name</label>
              <input type="text" id="reg_name" class="form-input" placeholder="Credit Officer Full Name" autocomplete="name">
            </div>
            <div class="form-group">
              <label for="reg_email">Institutional Email Address</label>
              <input type="email" id="reg_email" class="form-input" placeholder="name@institution.in" autocomplete="email">
            </div>
            <div class="form-group">
              <label for="reg_institution">Financial Institution Name</label>
              <input type="text" id="reg_institution" class="form-input" placeholder="e.g. State Bank of India" autocomplete="organization">
            </div>
            <div class="form-group">
              <label for="reg_role">Role / Designation</label>
              <select id="reg_role" class="form-select">
                <option value="RISK_ANALYST">Credit Risk Analyst</option>
                <option value="FORENSIC_AUDITOR">Forensic Auditor</option>
                <option value="CHIEF_RISK_OFFICER">Chief Risk Officer</option>
                <option value="REGULATORY_OFFICER">Regulatory Compliance Officer</option>
              </select>
            </div>
            <div class="form-group">
              <label for="reg_password">Set Credential Password</label>
              <input type="password" id="reg_password" class="form-input" placeholder="Minimum 8 characters" autocomplete="new-password">
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:0.5rem;" id="register_btn" onclick="App.handleRegister()">
              Create Institutional Account
            </button>
          </div>
        </div>

        <p style="font-size:0.72rem;color:var(--text-muted);margin-top:1rem;text-align:center;line-height:1.6;">
          By accessing this system you agree to the
          <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>.
          Unauthorised access is a violation of RBI IT Framework and Companies Act 2013.
        </p>
      </div>`;
  },

  switchAuthTab(tab) {
    document.getElementById('signin_form').style.display = tab === 'signin' ? 'block' : 'none';
    document.getElementById('register_form').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tab_signin').classList.toggle('active', tab === 'signin');
    document.getElementById('tab_register').classList.toggle('active', tab === 'register');
    this.clearAuthBanner();
  },

  showAuthBanner(type, msg) {
    const el = document.getElementById('auth_status_banner');
    if (!el) return;
    el.className = `status-banner ${type}`;
    el.innerHTML = msg;
    el.style.display = 'flex';
  },

  clearAuthBanner() {
    const el = document.getElementById('auth_status_banner');
    if (el) el.style.display = 'none';
  },

  async handleSignIn() {
    const email = document.getElementById('signin_email')?.value?.trim();
    const password = document.getElementById('signin_password')?.value;
    if (!email || !password) {
      this.showAuthBanner('error', 'Email and password are required.');
      return;
    }
    const btn = document.getElementById('signin_btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Authenticating...'; }

    try {
      const result = await API.login(email, password);
      localStorage.setItem('ews_auth_user', JSON.stringify(result.user));
      this.authUser = result.user;
      this.updateAuthUI();
      this.showAuthBanner('success', `Authentication successful. Welcome, ${result.user.fullName}.`);
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (e) {
      this.showAuthBanner('error', e.message || 'Authentication failed. Verify credentials.');
      if (btn) { btn.disabled = false; btn.textContent = 'Access Surveillance Console'; }
    }
  },

  async handleRegister() {
    const fullName = document.getElementById('reg_name')?.value?.trim();
    const email = document.getElementById('reg_email')?.value?.trim();
    const institutionName = document.getElementById('reg_institution')?.value?.trim();
    const role = document.getElementById('reg_role')?.value;
    const password = document.getElementById('reg_password')?.value;

    if (!fullName || !email || !institutionName || !password) {
      this.showAuthBanner('error', 'All fields are required to create an institutional account.');
      return;
    }
    if (password.length < 8) {
      this.showAuthBanner('error', 'Password must be at least 8 characters.');
      return;
    }
    const btn = document.getElementById('register_btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating Account...'; }

    try {
      const result = await API.register({ email, password, fullName, institutionName, role });
      localStorage.setItem('ews_auth_user', JSON.stringify(result.user));
      this.authUser = result.user;
      this.updateAuthUI();
      this.showAuthBanner('success', `Account created. Welcome to Corporate EWS, ${result.user.fullName}.`);
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (e) {
      this.showAuthBanner('error', e.message || 'Registration failed. Try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Institutional Account'; }
    }
  },

  renderContactPage(container) {
    container.innerHTML = `
      <div class="contact-wrapper">
        <div class="page-header">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a><span>/</span><span class="current">Contact</span>
          </nav>
          <div class="page-title-row">
            <div>
              <h1 class="page-title">Institutional Deployment Inquiry</h1>
              <p class="page-subtitle">
                Submit enterprise requirements for portfolio monitoring, Core Banking System integration, or forensic audit evaluation.
                A specialist from the credit risk intelligence group will respond within 2 business days.
              </p>
            </div>
          </div>
        </div>

        <div class="grid-main-side" style="margin-bottom:1.5rem;">
          <div class="card">
            <h2 style="font-family:var(--font-heading);font-size:1rem;font-weight:600;margin-bottom:1.25rem;color:var(--text-primary);">Deployment Inquiry Form</h2>
            <div id="contact_status" style="display:none;"></div>
            <div class="form-group">
              <label for="ct_name">Full Name</label>
              <input type="text" id="ct_name" class="form-input" placeholder="Credit Officer Name" autocomplete="name">
            </div>
            <div class="form-group">
              <label for="ct_email">Institutional Email Address</label>
              <input type="email" id="ct_email" class="form-input" placeholder="name@bank.in" autocomplete="email">
            </div>
            <div class="form-group">
              <label for="ct_institution">Financial Institution</label>
              <input type="text" id="ct_institution" class="form-input" placeholder="e.g. Bank of Baroda" autocomplete="organization">
            </div>
            <div class="form-group">
              <label for="ct_scale">Portfolio Scale</label>
              <select id="ct_scale" class="form-select">
                <option value="PILOT_50">Pilot (Up to 50 borrowers)</option>
                <option value="SME_200">Mid-size (50 to 500 borrowers)</option>
                <option value="LARGE_500">Large Portfolio (500+ borrowers)</option>
                <option value="CBS_INTEGRATION">Full CBS / Core Banking Integration</option>
              </select>
            </div>
            <div class="form-group">
              <label for="ct_message">Requirements and Deployment Context</label>
              <textarea id="ct_message" class="form-textarea" rows="5"
                placeholder="Describe your portfolio, evaluation objectives, and any CBS integration requirements..."></textarea>
            </div>
            <button class="btn btn-primary" style="margin-top:0.5rem;" id="contact_submit_btn" onclick="App.handleContact()">
              Submit Inquiry
            </button>
          </div>

          <div style="display:flex;flex-direction:column;gap:1rem;">
            <div class="card">
              <h3 style="font-family:var(--font-heading);font-size:0.9rem;font-weight:600;margin-bottom:0.85rem;color:var(--text-primary);">Deployment Specifications</h3>
              <div style="display:flex;flex-direction:column;gap:0.5rem;">
                ${[
                  ['Database', 'SQLite / PostgreSQL / Oracle CBS'],
                  ['Deployment', 'On-premise or Private Cloud'],
                  ['Data Privacy', 'No PII transmission to external servers'],
                  ['Latency', 'Sub-40ms risk scoring per transaction'],
                  ['Alert Budget', '5% capacity cap (configurable)'],
                  ['Explainability', 'Full SHAP attribution on all alerts'],
                  ['Compliance', 'RBI, SEBI, Section 143(12) certified audit trail']
                ].map(([k, v]) => `
                  <div class="station-spec-row">
                    <span class="station-spec-label">${k}</span>
                    <span class="station-spec-value" style="font-size:0.75rem;">${v}</span>
                  </div>`).join('')}
              </div>
            </div>

            <div class="card">
              <h3 style="font-family:var(--font-heading);font-size:0.9rem;font-weight:600;margin-bottom:0.65rem;color:var(--text-primary);">Contact Details</h3>
              <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.5rem;">Credit Risk Intelligence Group</p>
              <p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--color-primary-light);">ews-deploy@corporate-ews.bank.internal</p>
            </div>
          </div>
        </div>
      </div>`;
  },

  async handleContact() {
    const fullName = document.getElementById('ct_name')?.value?.trim();
    const email = document.getElementById('ct_email')?.value?.trim();
    const institutionName = document.getElementById('ct_institution')?.value?.trim();
    const portfolioScale = document.getElementById('ct_scale')?.value;
    const message = document.getElementById('ct_message')?.value?.trim();

    if (!fullName || !email || !institutionName || !message) {
      this.showContactStatus('error', 'All fields are required to submit an institutional inquiry.');
      return;
    }
    const btn = document.getElementById('contact_submit_btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    try {
      const result = await API.contact({ fullName, email, institutionName, portfolioScale, message });
      this.showContactStatus('success',
        `Inquiry logged (Ref: ${result.inquiryId}). A specialist will review your requirements within 2 business days.`);
      if (btn) { btn.style.display = 'none'; }
    } catch (e) {
      this.showContactStatus('error', e.message || 'Submission failed. Please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Inquiry'; }
    }
  },

  showContactStatus(type, msg) {
    const el = document.getElementById('contact_status');
    if (!el) return;
    el.className = `status-banner ${type}`;
    el.textContent = msg;
    el.style.display = 'flex';
  },

  renderPrivacyPage(container) {
    container.innerHTML = `
      <div>
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span>/</span><span class="current">Privacy Policy</span>
        </nav>
        <div class="legal-container">
          <h1 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;margin-bottom:0.35rem;color:var(--text-primary);">
            Institutional Privacy Policy and Data Governance
          </h1>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:2rem;">
            Last Updated: 29 October 2026 | Version 2.4 | Effective Date: 01 November 2026
          </p>

          <div class="legal-section">
            <h2>1. Scope and Jurisdiction</h2>
            <p>This Privacy Policy governs the collection, processing, storage, and disclosure of data within the Corporate Early Warning System (Corporate EWS). It applies to all authorised users, including credit risk officers, forensic auditors, and regulatory compliance teams operating within Indian banking institutions.</p>
            <p>Corporate EWS operates in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Reserve Bank of India's Information Security Framework (2023), and the Information Technology Act, 2000.</p>
          </div>

          <div class="legal-section">
            <h2>2. Data Collected and Processed</h2>
            <p>Corporate EWS processes the following categories of data:</p>
            <ul>
              <li>Corporate financial statements - MCA filings, audited balance sheets, cash flow statements, and notes to accounts (publicly available under Companies Act 2013).</li>
              <li>Regulatory signals - SEBI disclosures, credit rating agency press releases, RBI enforcement orders.</li>
              <li>Operator credentials - institutional email addresses, hashed credential passwords, institution name, and role designation stored in encrypted SQLite database.</li>
              <li>Inquiry submissions - deployment request details submitted via the Contact form.</li>
              <li>Session data - authentication tokens stored in browser localStorage with no server-side session persistence.</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>3. Data Not Collected</h2>
            <p>Corporate EWS does not collect, transmit, or store any of the following:</p>
            <ul>
              <li>Individual borrower Permanent Account Numbers (PAN), Aadhaar, or Know Your Customer (KYC) documents.</li>
              <li>Bank account numbers, loan account numbers, or credit bureau reports.</li>
              <li>Real-time Core Banking System transaction feeds from production environments.</li>
              <li>Cookies or third-party tracking identifiers (no cookies are set by this system).</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>4. Legal Basis for Processing</h2>
            <p>Corporate EWS processes corporate financial data under the following legal bases:</p>
            <ul>
              <li>Legitimate interest in financial stability under RBI Master Direction DBS.CO.PPD.BC.No./01.01.005/2014-15.</li>
              <li>Public interest in prevention of financial fraud under Section 143(12) of the Companies Act, 2013.</li>
              <li>Contractual obligation for institutional subscribers as defined in the Terms and Conditions.</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>5. Data Retention</h2>
            <p>Financial analytics and audit trail records are retained for 7 years in accordance with RBI statutory record-keeping requirements. Operator account credentials are retained until account deletion is requested. Contact inquiry records are retained for 3 years.</p>
          </div>

          <div class="legal-section">
            <h2>6. Data Security Measures</h2>
            <p>Corporate EWS implements the following technical safeguards:</p>
            <ul>
              <li>Password hashing using SHA-256 with institutional salt (no plaintext credential storage).</li>
              <li>All API endpoints validate input and reject malformed requests.</li>
              <li>On-premise deployment option ensures no sensitive corporate data exits institutional network perimeters.</li>
              <li>Audit trail records are immutable once committed (append-only regulatory log).</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>7. Rights under DPDP Act 2023</h2>
            <p>Data principals (individual operators registered on this system) have the right to:</p>
            <ul>
              <li>Access their stored personal data by contacting ews-privacy@corporate-ews.bank.internal.</li>
              <li>Correct inaccurate personal data through the institutional IT administrator.</li>
              <li>Request erasure of personal data, subject to statutory retention obligations.</li>
              <li>Nominate a representative to act on their behalf in the event of incapacity.</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>8. Contact for Privacy Inquiries</h2>
            <p>For data protection queries, corrections, or erasure requests, contact:</p>
            <p style="font-family:var(--font-mono);color:var(--color-primary-light);">ews-privacy@corporate-ews.bank.internal</p>
            <p>All inquiries will receive a substantive response within 30 days as required by DPDP Act 2023.</p>
          </div>
        </div>
      </div>`;
  },

  renderTermsPage(container) {
    container.innerHTML = `
      <div>
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span>/</span><span class="current">Terms and Conditions</span>
        </nav>
        <div class="legal-container">
          <h1 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;margin-bottom:0.35rem;color:var(--text-primary);">
            Institutional Terms and Conditions
          </h1>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:2rem;">
            Last Updated: 29 October 2026 | Version 2.4 | Effective Date: 01 November 2026
          </p>

          <div class="legal-section">
            <h2>1. Institutional Licence and Permitted Use</h2>
            <p>Corporate EWS grants a non-exclusive, non-transferable, revocable licence to authorised credit risk officers, forensic auditors, and regulatory compliance teams of licensed Indian banking institutions to access the Early Warning System for internal credit risk monitoring purposes only.</p>
            <p>Permitted uses include corporate default risk assessment, accounting manipulation screening, network contagion analysis, and regulatory committee decision documentation in accordance with RBI and SEBI mandates.</p>
          </div>

          <div class="legal-section">
            <h2>2. Prohibited Uses</h2>
            <p>The following uses are strictly prohibited and may result in licence termination and regulatory referral:</p>
            <ul>
              <li>Use of model outputs as sole determinants of credit decisions without additional due diligence.</li>
              <li>Redistribution of surveillance reports, SHAP outputs, or forensic dossiers to unauthorised third parties.</li>
              <li>Reverse engineering, decompiling, or commercially exploiting the scoring algorithms.</li>
              <li>Using the system to conduct surveillance on entities outside the subscribing institution's credit portfolio without regulatory authorisation.</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>3. Model Risk Governance Disclaimer</h2>
            <p>Corporate EWS provides early warning signals and forensic accounting indicators. All model outputs are:</p>
            <ul>
              <li>Probabilistic risk assessments, not legal determinations of fraud or insolvency.</li>
              <li>Subject to the limitations of the XGBoost dual-transfer learning model trained on UCI Polish and Taiwanese historical datasets.</li>
              <li>Required to be reviewed by a qualified credit officer before any regulatory escalation action.</li>
              <li>Not a substitute for independent forensic audit under CARO 2020 or Section 143(12) Companies Act investigation.</li>
            </ul>
            <p>The institution bears full responsibility for credit decisions made using Corporate EWS outputs. The system developers are not liable for any lending losses, regulatory penalties, or reputational harm arising from reliance on model outputs.</p>
          </div>

          <div class="legal-section">
            <h2>4. Regulatory Compliance Citations</h2>
            <p>Use of this system must comply with the following applicable frameworks:</p>
            <ul>
              <li>RBI Master Direction on Frauds Classification and Reporting by Commercial Banks (2016).</li>
              <li>RBI Early Warning Signals Framework for Large Borrowers (DBS.CO.PPD.BC.No./01.01.005/2014-15).</li>
              <li>Section 143(12) of the Companies Act, 2013 - Reporting of Fraud by Auditors.</li>
              <li>SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015.</li>
              <li>Prevention of Money Laundering Act (PMLA), 2002 - Customer Due Diligence Standards.</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>5. Alert Budget Policy Obligation</h2>
            <p>Institutions deploying Corporate EWS must configure and honour the 5% alert capacity constraint (floor(N x 0.05) investigations per quarterly evaluation cycle). This policy is designed to prevent investigator alarm fatigue and maintain investigative quality. Bypassing or overriding the capacity cap without documented senior approval is a policy violation.</p>
          </div>

          <div class="legal-section">
            <h2>6. Audit Trail and Immutability</h2>
            <p>All credit committee review actions logged in Corporate EWS are immutable records subject to regulatory inspection. Institutions must retain these audit trail records for a minimum of 7 years in accordance with RBI archival requirements. Tampering with, deleting, or selectively disclosing audit trail records is prohibited and constitutes a violation of the RBI IT Framework.</p>
          </div>

          <div class="legal-section">
            <h2>7. Governing Law and Dispute Resolution</h2>
            <p>These Terms and Conditions are governed by the laws of India. Any disputes arising from the use of Corporate EWS shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra. Disputes shall first be attempted through institutional mediation before judicial proceedings.</p>
          </div>

          <div class="legal-section">
            <h2>8. Amendments</h2>
            <p>These Terms may be updated to reflect changes in applicable law or system capabilities. Institutions will be notified of material changes with a minimum of 30 days advance notice. Continued use of the system after the effective date of amendments constitutes acceptance of the updated Terms.</p>
          </div>
        </div>
      </div>`;
  },

  render404Page(container) {
    container.innerHTML = `
      <div class="error-404-box">
        <div class="error-404-code">404</div>
        <h1 class="error-404-title">Dossier or Endpoint Not Located</h1>
        <p class="error-404-text">
          The requested surveillance path is not cataloged in the institutional registry.
          The resource may have been moved, removed, or the URL may be incorrect.
        </p>
        <div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;">
          <a href="/" class="btn btn-primary">Return to Overview</a>
          <a href="/watchlist" class="btn btn-secondary">View Watchlist</a>
        </div>
      </div>`;
  },

  setupModals() {
    // Disposition Modal
    const modalClose = document.getElementById('modal_close_btn');
    const modalCancel = document.getElementById('modal_cancel_btn');
    const modalSubmit = document.getElementById('modal_submit_btn');
    const dispModal = document.getElementById('disposition_modal');

    if (modalClose) modalClose.addEventListener('click', () => dispModal?.classList.add('hidden'));
    if (modalCancel) modalCancel.addEventListener('click', () => dispModal?.classList.add('hidden'));
    if (dispModal) {
      dispModal.addEventListener('click', (e) => {
        if (e.target === dispModal) dispModal.classList.add('hidden');
      });
    }
    if (modalSubmit) {
      modalSubmit.addEventListener('click', async () => {
        const companyId = modalSubmit.dataset.companyId;
        const analystName = document.getElementById('analyst_name_input')?.value?.trim();
        const disposition = document.getElementById('disposition_select')?.value;
        const notes = document.getElementById('justification_notes')?.value?.trim();
        if (!notes) { showToast('Justification notes are required for compliance audit trail.', 'error'); return; }
        try {
          await API.submitReview(companyId, { analystName, disposition, notes });
          dispModal?.classList.add('hidden');
          showToast('Regulatory action committed to immutable audit trail.', 'success');
        } catch (e) {
          showToast('Failed to commit regulatory action: ' + e.message, 'error');
        }
      });
    }

    // Upload Modal
    const uploadClose = document.getElementById('upload_modal_close_btn');
    const uploadCancel = document.getElementById('upload_modal_cancel_btn');
    const uploadSubmit = document.getElementById('upload_modal_submit_btn');
    const uploadModal = document.getElementById('upload_doc_modal');

    if (uploadClose) uploadClose.addEventListener('click', () => uploadModal?.classList.add('hidden'));
    if (uploadCancel) uploadCancel.addEventListener('click', () => uploadModal?.classList.add('hidden'));
    if (uploadModal) {
      uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.classList.add('hidden');
      });
    }
    if (uploadSubmit) {
      uploadSubmit.addEventListener('click', async () => {
        const data = {
          title: document.getElementById('upload_doc_title')?.value?.trim(),
          docType: document.getElementById('upload_doc_type')?.value,
          metricName: document.getElementById('upload_metric_name')?.value?.trim(),
          claimedValue: parseFloat(document.getElementById('upload_claimed_val')?.value) || 0,
          structuredValue: parseFloat(document.getElementById('upload_structured_val')?.value) || 0,
          contextSnippet: document.getElementById('upload_context_snippet')?.value?.trim(),
          companyId: uploadSubmit.dataset.companyId
        };
        if (!data.title || !data.metricName) {
          showToast('Document title and metric name are required.', 'error');
          return;
        }
        try {
          await API.uploadDocument(data);
          uploadModal?.classList.add('hidden');
          showToast('Audit filing extracted and reconciled against structured database.', 'success');
        } catch (e) {
          showToast('Upload failed: ' + e.message, 'error');
        }
      });
    }
  },

  openDispositionModal(companyId, companyName) {
    const modal = document.getElementById('disposition_modal');
    const nameEl = document.getElementById('modal_borrower_name');
    const titleEl = document.getElementById('modal_company_title');
    const submitEl = document.getElementById('modal_submit_btn');
    if (nameEl) nameEl.textContent = `Credit Committee Review: ${companyName}`;
    if (titleEl) titleEl.textContent = companyName;
    if (submitEl) submitEl.dataset.companyId = companyId;
    modal?.classList.remove('hidden');
  },

  openUploadModal(companyId) {
    const modal = document.getElementById('upload_doc_modal');
    const submitEl = document.getElementById('upload_modal_submit_btn');
    if (submitEl) submitEl.dataset.companyId = companyId;
    modal?.classList.remove('hidden');
  }
};

// Global Toast Notification System
function showToast(msg, type = 'info', duration = 4500) {
  const container = document.getElementById('toast_container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${msg}</span>
    <button onclick="this.parentElement.remove()" aria-label="Dismiss" style="background:none;border:none;color:inherit;cursor:pointer;font-size:1rem;line-height:1;padding:0 0 0 0.5rem;">&times;</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// App boot
document.addEventListener('DOMContentLoaded', () => App.init());
