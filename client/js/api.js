// Corporate EWS - Extended Frontend API Client (with auth, contact, live alerts, risk checker)

const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Health check
  getHealth() {
    return this.request('/health');
  },

  // Executive Overview
  getOverview() {
    return this.request('/overview');
  },

  // Watchlist with filters
  getWatchlist(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sector && filters.sector !== 'ALL') params.append('sector', filters.sector);
    if (filters.alertOnly) params.append('alertOnly', 'true');
    if (filters.manipOnly) params.append('manipOnly', 'true');
    if (filters.sort) params.append('sort', filters.sort);
    return this.request(`/watchlist?${params.toString()}`);
  },

  // Single Company Dossier
  getCompany(id) {
    return this.request(`/companies/${id}`);
  },

  // Dynamic Forensic Calculator
  calculateForensics(currentPeriod, priorPeriod, sectorCode) {
    return this.request('/forensics/calculate', {
      method: 'POST',
      body: JSON.stringify({ currentPeriod, priorPeriod, sectorCode })
    });
  },

  // Relational Fraud Graph
  getNetwork(companyId) {
    return this.request(`/network/${companyId}`);
  },

  // SHAP Explainability and Regulatory Policy Dossier
  getExplainability(companyId) {
    return this.request(`/explainability/${companyId}`);
  },

  // Multi-Modal Audit Evidence
  getEvidence(companyId = null) {
    const ep = companyId ? `/evidence/${companyId}` : '/evidence';
    return this.request(ep);
  },

  verifyClaim(claimId, status, verifiedBy) {
    return this.request('/evidence/verify', {
      method: 'POST',
      body: JSON.stringify({ claimId, status, verifiedBy })
    });
  },

  uploadDocument(data) {
    return this.request('/evidence/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Review Committee Action
  submitReview(companyId, reviewData) {
    return this.request(`/review/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  getReviews() {
    return this.request('/reviews');
  },

  // Production Asymmetric Loss and 5% Budget Simulator
  getSimulation(budgetPct = 0.05, costRatio = 20, horizon = 4) {
    return this.request(`/simulator?budgetPct=${budgetPct}&costRatio=${costRatio}&horizon=${horizon}`);
  },

  // Benchmark Database and Transferability Analytics
  getBenchmark() {
    return this.request('/benchmark');
  },

  // Ablation records
  getAblation() {
    return this.request('/ablation');
  },

  // Auth: Login
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Auth: Register
  register({ email, password, fullName, institutionName, role }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, institutionName, role })
    });
  },

  // Contact / Inquiry Form
  contact({ fullName, email, institutionName, portfolioScale, message }) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, institutionName, portfolioScale, message })
    });
  },

  // Live Alert Feed
  getLiveAlerts() {
    return this.request('/live-alerts');
  },

  // Real-time Transaction Risk Checker
  checkRisk(params) {
    return this.request('/risk-checker', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};
