// Corporate EWS - 5 Stations World Showcase Component
// Matches the reference site's 5-station world with: Vault, Network Rails, Global, Fraud Engine, Bank HQ
// Includes Live Alert Feed and real-time Transaction Risk Checker

const StationsComponent = {
  activeStation: 'vault',
  alertsInterval: null,

  stations: {
    vault: {
      num: '01',
      name: 'The Vault',
      tagline: 'Liquidity Reserve and Capital Allocation Monitor',
      description: 'Continuous surveillance of reserve ratios, cash buffers, short-term debt refinancing stress, and off-balance-sheet contingencies. Tracks maturity mismatches between current liabilities and liquid asset pools.',
      image: '/assets/station-vault.svg',
      imageAlt: 'Vault and liquidity reserve monitoring diagram showing circular reserve architecture',
      specs: [
        ['Reserve Coverage', 'Current Ratio and Quick Ratio Alerts'],
        ['Cash Buffer', 'Operating Cash Flow vs. Debt Maturity'],
        ['Off-Balance Sheet', 'CARO-disclosed guarantees and contingencies'],
        ['Altman Z-Score', 'Working Capital / Total Assets component'],
        ['Coverage Policy', 'DSCR below 1.0 triggers escalation'],
        ['Data Sources', 'MCA filing, audited BS, Rating rationale']
      ],
      liveStats: ['12 borrowers with CRatio < 1.0', '3 critical DSCR breaches', 'Avg. liquid coverage: 0.87x']
    },
    network: {
      num: '02',
      name: 'Network Rails',
      tagline: 'Counterparty Relationship Graph and Transaction Pathway Tracing',
      description: 'Follow the money through circular routing, related-party SPVs, common director networks, and cross-guarantee structures. Identifies contagion propagation paths before systemic exposure materialises.',
      image: '/assets/station-network.svg',
      imageAlt: 'Network graph showing counterparty relationship hops and circular fund routing',
      specs: [
        ['Graph Engine', 'D3.js Force-Directed Contagion Network'],
        ['Node Types', 'Promoter, Auditor, Lender, SPV, Shell Entity'],
        ['Edge Types', 'Common Director, Cross-Guarantee, Round-Tripping'],
        ['Contagion Score', 'PageRank-weighted distressed link propagation'],
        ['Alert Trigger', 'Contagion Score >= 70 flags board escalation'],
        ['Coverage', '40 borrowers, 9+ confirmed distressed links']
      ],
      liveStats: ['7 active contagion links detected', '2 shell entity pathways active', 'Highest contagion: IL&FS Score 92']
    },
    global: {
      num: '03',
      name: 'Global Contagion',
      tagline: 'Cross-Border Flow Surveillance and Offshore Intermediary Mapping',
      description: 'Multi-jurisdictional tracking of cross-border remittances into FATF grey-list territories, Mauritius-routed FDI, Cayman shell counterparties, and undisclosed related-party offshore flows.',
      image: '/assets/station-global.svg',
      imageAlt: 'Global map showing cross-border financial flows and offshore shell intermediary nodes',
      specs: [
        ['FATF Coverage', 'Grey-list and black-list jurisdiction monitoring'],
        ['Offshore Routes', 'Mauritius, Cayman Islands, British Virgin Islands'],
        ['Flow Types', 'Round-tripping, FDI misclassification, SWIFT RTGS hops'],
        ['High-Risk Score', '+25 basis points per grey-list geography'],
        ['AML Integration', 'PMLA 2002 and FEMA 1999 compliance framework'],
        ['Data Sources', 'RBI FLA returns, SEBI ODI disclosures']
      ],
      liveStats: ['4 transactions flagged to grey-list geographies', '1 Mauritius routing detected today', 'SWIFT monitoring: 3 RTGS chains']
    },
    fraud: {
      num: '04',
      name: 'Fraud Engine',
      tagline: 'Forensic Accounting Manipulation and SHAP Attribution Engine',
      description: 'Automated Beneish M-Score, Piotroski F-Score, and Tree-SHAP forensic feature attribution identifying revenue acceleration, receivables manipulation, asset quality degradation, and auditor resignation patterns.',
      image: '/assets/station-fraud.svg',
      imageAlt: 'SHAP waterfall chart showing forensic feature contributions to fraud risk score',
      specs: [
        ['Beneish M-Score', '8-ratio manipulation detection (threshold: -1.78)'],
        ['Piotroski F-Score', '9-point financial strength signal (0 to 9)'],
        ['SHAP Engine', 'Tree-SHAP Waterfall per alert (full explainability)'],
        ['Sector Adj.', 'Peer group percentile normalisation per sector'],
        ['Soft Signals', 'Auditor resignation, promoter pledging, delayed MCA'],
        ['Model', 'XGBoost dual-transfer EWS-XGB-DualTransfer-v2.4']
      ],
      liveStats: ['5 M-Score MANIPULATOR flags active', 'SHAP top driver: Receivables growth > 38%', '2 auditor resignation soft signals']
    },
    hq: {
      num: '05',
      name: 'Bank HQ',
      tagline: 'Regulatory Action Room and 5% Alert Budget Governance',
      description: 'Executive command room enforcing the 5% alert capacity constraint with immutable regulatory committee decision logging, asymmetric loss optimisation, and full SEBI and RBI audit trail compliance.',
      image: '/assets/station-hq.svg',
      imageAlt: 'Bank headquarters regulatory action room with alert budget capacity meter and committee decision logging',
      specs: [
        ['Alert Budget', '5% Cap: floor(N x 0.05) per evaluation cycle'],
        ['Priority Rule', 'Top-K ranked by Asymmetric Expected Cost (20:1 FN:FP)'],
        ['Audit Trail', 'Immutable committee actions under RBI norms'],
        ['Actions', 'Escalate Board, Commission Forensic Audit, Watchlist, Reject'],
        ['Compliance', 'Section 143(12) Companies Act, RBI DBS Master Direction'],
        ['Model Recall', '90.0% recall at 5% alert rate (UCI Polish validation)']
      ],
      liveStats: ['2/2 alert slots utilised (100% capacity)', 'Largest exposure: IL&FS Rs. 91,000 Cr.', 'Last committee action: 3 hours ago']
    }
  },

  render(container, stationId = 'vault') {
    this.activeStation = stationId || 'vault';
    container.innerHTML = `<div id="stations_view" class="stations-view"></div>`;
    this.renderView(document.getElementById('stations_view'));
  },

  renderView(root) {
    const s = this.stations;
    const active = this.activeStation;

    root.innerHTML = `
      <div class="page-header">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/" onclick="App.navigateTo('overview');return false;">Home</a>
          <span>/</span>
          <span class="current">5 Stations</span>
        </nav>
        <div class="page-title-row">
          <div>
            <h1 class="page-title">Follow the Money - 5 Surveillance Stations</h1>
            <p class="page-subtitle">
              Each station covers a distinct surveillance domain: liquidity, transaction rails, global flows, forensic accounting, and bank regulatory governance.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('investigation')">
            Open Investigation Console
          </button>
        </div>
      </div>

      <!-- Station Switcher Bar -->
      <div class="stations-bar" role="tablist" aria-label="Surveillance Stations">
        ${Object.entries(s).map(([id, st]) => `
          <button class="station-item${id === active ? ' active' : ''}"
            data-station="${id}"
            role="tab"
            aria-selected="${id === active}"
            onclick="StationsComponent.switchStation('${id}')"
            id="station_btn_${id}">
            <div class="station-num">${st.num}</div>
            <div class="station-name">${st.name}</div>
            <div class="station-desc">${st.tagline.substring(0, 50)}...</div>
          </button>`).join('')}
      </div>

      <!-- Active Station Hero -->
      <div id="station_hero_area">
        ${this.renderHero(this.stations[active], active)}
      </div>

      <!-- Live Alert Feed and Risk Checker -->
      <div class="grid-main-side" style="margin-top:1.5rem;">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">
              <span style="display:inline-block;width:8px;height:8px;background:var(--color-risk-critical);border-radius:2px;animation:pulse-dot 2s infinite;"></span>
              Live Fraud and Distress Alert Feed
            </h2>
            <button class="btn btn-secondary btn-sm" id="refresh_alerts_btn" onclick="StationsComponent.loadAlerts()">
              Refresh
            </button>
          </div>
          <div id="alert_feed_content">
            <div class="loading-state" style="padding:2rem;">
              <div class="spinner"></div>
              <p>Loading live alert feed...</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Transaction Risk Checker</h2>
            <span class="badge badge-safe">Sub-40ms</span>
          </div>
          <p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:1rem;">
            Simulate a real-time transaction risk assessment against the EWS forensic scoring engine.
          </p>
          <div class="checker-form">
            <div class="form-group">
              <label for="rc_amount">Transaction Amount (Rs.)</label>
              <input type="number" id="rc_amount" class="form-input" value="75000000" placeholder="e.g. 75000000">
            </div>
            <div class="checker-toggle-group">
              ${[
                ['rc_new_device', 'Unrecognised device fingerprint', 'Unauthorised IP subnet or new device'],
                ['rc_high_risk', 'High-risk geography', 'FATF grey-list or black-listed jurisdiction'],
                ['rc_unusual_hour', 'Unusual execution hour', 'Outside standard 09:00-18:00 clearing window'],
                ['rc_neg_networth', 'Negative net worth', 'Book equity negative in latest MCA filing'],
                ['rc_delayed_filing', 'Delayed MCA compliance', 'ROC filing delayed more than 45 days']
              ].map(([id, label, sub]) => `
                <label class="checker-toggle-item" for="${id}" style="cursor:pointer;">
                  <div>
                    <span class="checker-toggle-label">${label}</span>
                    <span class="checker-toggle-sub">${sub}</span>
                  </div>
                  <input type="checkbox" id="${id}" style="width:16px;height:16px;accent-color:var(--color-primary);" onchange="StationsComponent.runRiskCheck()">
                </label>`).join('')}
              <div class="form-group" style="margin-bottom:0;">
                <label for="rc_velocity">Transfers in Last Hour</label>
                <input type="number" id="rc_velocity" class="form-input" value="2" min="0" max="20" onchange="StationsComponent.runRiskCheck()">
              </div>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="StationsComponent.runRiskCheck()">
              Run Risk Assessment
            </button>

            <div class="checker-result-box" id="risk_result_box" style="display:none;">
              <div class="checker-result-header">
                <div class="checker-score-display">
                  <span class="checker-score-num" id="risk_score_num" style="color:var(--color-risk-critical);">0</span>
                  <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">/100</span>
                </div>
                <span class="checker-latency-badge" id="risk_latency_badge">-- ms</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
                <span style="font-family:var(--font-mono);font-size:0.8rem;font-weight:600;" id="risk_level_label">--</span>
                <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);" id="risk_decision_label">--</span>
              </div>
              <div id="risk_reasons_list" style="display:flex;flex-direction:column;gap:0.3rem;margin-top:0.35rem;"></div>
              <p style="font-size:0.68rem;color:var(--text-muted);margin-top:0.65rem;" id="risk_citation"></p>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      </style>`;

    // Load live alerts
    this.loadAlerts();
    // Auto-refresh every 30 seconds
    if (this.alertsInterval) clearInterval(this.alertsInterval);
    this.alertsInterval = setInterval(() => this.loadAlerts(), 30000);
  },

  renderHero(st, id) {
    return `
      <div class="station-hero" id="station_hero_${id}">
        <div class="station-hero-content">
          <div class="station-badge-row">
            <span class="badge badge-version">STATION ${st.num}</span>
            <span class="badge badge-subtle">LIVE</span>
          </div>
          <h2 class="station-hero-title">${st.name}: ${st.tagline}</h2>
          <p class="station-hero-text">${st.description}</p>
          <div class="station-specs-list">
            ${st.specs.map(([k, v]) => `
              <div class="station-spec-row">
                <span class="station-spec-label">${k}</span>
                <span class="station-spec-value">${v}</span>
              </div>`).join('')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.25rem;">
            ${st.liveStats.map(s => `
              <span style="font-family:var(--font-mono);font-size:0.7rem;padding:3px 8px;background:var(--bg-surface-elevated);border:1px solid var(--border-subtle);border-radius:2px;color:var(--text-secondary);">${s}</span>
            `).join('')}
          </div>
          <div style="display:flex;gap:0.75rem;margin-top:0.5rem;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('investigation')">
              Open Forensic Console
            </button>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('watchlist')">
              View Watchlist
            </button>
          </div>
        </div>
        <div class="station-hero-preview">
          <img src="${st.image}" alt="${st.imageAlt}" width="360" height="220" loading="lazy">
        </div>
      </div>`;
  },

  switchStation(id) {
    this.activeStation = id;

    // Update tab buttons
    document.querySelectorAll('.station-item[data-station]').forEach(btn => {
      const isActive = btn.dataset.station === id;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update hero area
    const heroArea = document.getElementById('station_hero_area');
    if (heroArea) {
      heroArea.innerHTML = this.renderHero(this.stations[id], id);
    }

    // Update URL
    window.history.pushState({}, '', `/station/${id}`);
  },

  async loadAlerts() {
    const content = document.getElementById('alert_feed_content');
    if (!content) return;

    try {
      const alerts = await API.getLiveAlerts();
      if (!alerts || alerts.length === 0) {
        content.innerHTML = `<p style="font-size:0.82rem;color:var(--text-muted);padding:1rem;">No live alerts in feed.</p>`;
        return;
      }

      const levelClass = (level) => {
        if (level === 'CRITICAL' || level === 'HIGH') return 'risk-critical';
        if (level === 'MEDIUM') return 'risk-medium';
        return 'risk-low';
      };

      const formatAmount = (amt) => {
        if (amt >= 10000000) return `Rs. ${(amt / 10000000).toFixed(2)} Cr.`;
        if (amt >= 100000) return `Rs. ${(amt / 100000).toFixed(2)} L.`;
        return `Rs. ${amt.toLocaleString('en-IN')}`;
      };

      content.innerHTML = `
        <div class="alert-feed-list">
          ${alerts.map(a => `
            <div class="alert-feed-item ${levelClass(a.risk_level)}">
              <div class="alert-feed-meta">
                <span class="alert-feed-channel">${a.source_channel} &nbsp;|&nbsp; ${new Date(a.timestamp).toLocaleTimeString('en-IN')}</span>
                <span class="alert-feed-amount">${formatAmount(a.amount)}</span>
              </div>
              <div class="alert-feed-reasons">
                <span class="badge ${a.risk_level === 'CRITICAL' ? 'badge-cap' : 'badge-subtle'}" style="font-size:0.68rem;">${a.risk_level}</span>
                ${(a.reasons || []).map(r => `<span class="alert-reason-tag">${r}</span>`).join('')}
              </div>
            </div>`).join('')}
        </div>
        <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.65rem;">
          Showing ${alerts.length} latest transactions. Auto-refreshes every 30 seconds.
        </p>`;
    } catch (e) {
      content.innerHTML = `<p style="font-size:0.82rem;color:var(--color-risk-critical);padding:1rem;">Failed to load live alert feed: ${e.message}</p>`;
    }
  },

  async runRiskCheck() {
    const params = {
      amount: parseFloat(document.getElementById('rc_amount')?.value) || 0,
      newDevice: document.getElementById('rc_new_device')?.checked || false,
      highRiskCountry: document.getElementById('rc_high_risk')?.checked || false,
      unusualHour: document.getElementById('rc_unusual_hour')?.checked || false,
      negativeNetWorth: document.getElementById('rc_neg_networth')?.checked || false,
      delayedFiling: document.getElementById('rc_delayed_filing')?.checked || false,
      txLastHour: parseInt(document.getElementById('rc_velocity')?.value) || 0
    };

    const resultBox = document.getElementById('risk_result_box');
    const scoreEl = document.getElementById('risk_score_num');
    const latencyEl = document.getElementById('risk_latency_badge');
    const levelEl = document.getElementById('risk_level_label');
    const decisionEl = document.getElementById('risk_decision_label');
    const reasonsList = document.getElementById('risk_reasons_list');
    const citationEl = document.getElementById('risk_citation');

    if (!resultBox) return;

    try {
      const result = await API.checkRisk(params);
      resultBox.style.display = 'flex';

      const scoreColor = result.score >= 70 ? 'var(--color-risk-critical)' : (result.score >= 40 ? 'var(--color-warning)' : 'var(--color-success)');

      if (scoreEl) { scoreEl.textContent = result.score; scoreEl.style.color = scoreColor; }
      if (latencyEl) { latencyEl.textContent = `${result.responseLatencyMs}ms`; }
      if (levelEl) { levelEl.textContent = result.level; levelEl.style.color = scoreColor; }
      if (decisionEl) { decisionEl.textContent = result.decision?.replace(/_/g, ' ') || '--'; }
      if (reasonsList) {
        reasonsList.innerHTML = (result.reasons || []).map(r =>
          `<span class="alert-reason-tag">${r}</span>`
        ).join('');
      }
      if (citationEl) { citationEl.textContent = result.regulatoryCitation || ''; }
    } catch (e) {
      if (resultBox) {
        resultBox.style.display = 'flex';
        if (scoreEl) scoreEl.textContent = 'ERR';
        if (levelEl) levelEl.textContent = 'API Error: ' + e.message;
      }
    }
  }
};
