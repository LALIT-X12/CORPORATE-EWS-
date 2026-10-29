// Corporate EWS - Executive Overview View Component

const OverviewComponent = {
  async render(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Executive Portfolio Analytics...</p>
      </div>
    `;

    try {
      const data = await API.getOverview();
      const ablationData = await API.getAblation();

      const cap = data.capacity;
      const kpis = data.kpiSummary;

      let html = `
        <div class="overview-view">
          <!-- Executive Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
            <div>
              <h1 style="font-family:var(--font-heading); font-size:26px; font-weight:800; color:var(--text-primary);">
                Executive Credit Risk Intelligence
              </h1>
              <p style="font-size:13px; color:var(--text-secondary); margin-top:2px;">
                Quarterly Early-Warning Run as of <strong>${data.asOfDate}</strong> • Model: <code>${data.modelVersion}</code>
              </p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" onclick="App.navigateTo('benchmark')">
                <i class="fa-solid fa-database"></i> Benchmark Database
              </button>
              <button class="btn btn-primary" onclick="App.navigateTo('watchlist')">
                <i class="fa-solid fa-list-ol"></i> View 40 Borrowers
              </button>
            </div>
          </div>

          <!-- Top Row: 5% Capacity Constraint Card -->
          <div class="card capacity-card" style="margin-bottom:20px;">
            <div class="capacity-meter-header">
              <div>
                <span class="metric-label" style="color:var(--color-primary);">Regulatory Operational Constraint</span>
                <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:700; color:var(--text-primary); margin-top:2px;">
                  5% Alert Capacity Constraint & Committee Review Slots
                </h3>
              </div>
              <div class="capacity-slots-badge">
                <span class="slots-used">${cap.usedAlertSlots}</span>
                <span class="slots-cap">/ ${cap.alertCapacityCap} Allowed Slots</span>
                <span class="badge badge-cap" style="margin-left:6px;">100% UTILIZED</span>
              </div>
            </div>

            <div class="capacity-bar-track">
              <div class="capacity-bar-fill" style="width: ${cap.capacityUtilizationPct}%;"></div>
            </div>

            <div class="capacity-legend">
              <span><strong>Portfolio Size:</strong> ${cap.totalPortfolio} Corporate Borrowers</span>
              <span><strong>Policy Cap:</strong> floor(N * 0.05) = ${cap.alertCapacityCap} In-Depth Investigations</span>
              <span><strong>Remaining Budget:</strong> ${cap.remainingSlots} Slots</span>
            </div>

            <div class="capacity-warning">
              <i class="fa-solid fa-triangle-exclamation" style="color:var(--color-ruby); font-size:16px;"></i>
              <div>
                <strong>Operational Budget Locked:</strong> Only the top ${cap.alertCapacityCap} borrowers ranked by asymmetric expected cost are escalated for deep forensic audit. Remaining distressed firms are placed on the quarterly watchlist monitor to prevent investigator alarm fatigue.
              </div>
            </div>
          </div>

          <!-- KPI Summary Cards Grid -->
          <div class="grid-4" style="margin-bottom:24px;">
            <div class="card metric-card">
              <span class="metric-label">Monitored Portfolio</span>
              <div class="metric-value-row">
                <span class="metric-value cyan">${kpis.monitoredBorrowers}</span>
                <span class="metric-delta">Eligible Firms</span>
              </div>
              <span class="card-subtitle">10 Defaulters + 30 Matched Controls</span>
            </div>

            <div class="card metric-card">
              <span class="metric-label">Active 5% Alerts</span>
              <div class="metric-value-row">
                <span class="metric-value ruby">${kpis.activeAlertsUnderCap}</span>
                <span class="metric-delta">Escalated</span>
              </div>
              <span class="card-subtitle">IL&FS & DHFL (Rank #1 & #2)</span>
            </div>

            <div class="card metric-card">
              <span class="metric-label">Beneish M-Score Breaches</span>
              <div class="metric-value-row">
                <span class="metric-value amber">${kpis.potentialManipulators}</span>
                <span class="metric-delta">Manipulators</span>
              </div>
              <span class="card-subtitle">M-Score > -1.78 Fraud Cutoff</span>
            </div>

            <div class="card metric-card">
              <span class="metric-label">Relational Contagion Risk</span>
              <div class="metric-value-row">
                <span class="metric-value cyan">${kpis.highContagionCount}</span>
                <span class="metric-delta">Network Webs</span>
              </div>
              <span class="card-subtitle">SPV & Shell Round-Tripping Links</span>
            </div>
          </div>

          <!-- Bottom Grid: Priority Alerts List & Lead-Time Curve -->
          <div class="grid-2">
            <!-- Top Priority Alerts -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Priority Early-Warning Alert Queue</h3>
                  <span class="card-subtitle">Top borrowers sorted by multi-factor asymmetric risk score</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('watchlist')">
                  View All
                </button>
              </div>

              <div class="table-responsive" style="border:none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Borrower</th>
                      <th>Sector</th>
                      <th>Risk Score</th>
                      <th>Alert Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.topAlerts.map(a => `
                      <tr class="${a.alert_selected ? 'row-alert' : ''}">
                        <td><strong style="font-family:var(--font-mono); color:${a.alert_selected ? 'var(--color-ruby)' : 'var(--text-secondary)'};">#${a.priority_rank}</strong></td>
                        <td>
                          <div style="font-weight:700; color:var(--text-primary);">${a.company_id === 'ind-def-01' ? 'IL&FS' : a.company_id === 'ind-def-02' ? 'DHFL' : a.company_id === 'ind-def-03' ? 'Jet Airways' : 'Borrower'}</div>
                          <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${a.company_id}</div>
                        </td>
                        <td><span class="badge badge-version">${a.company_id === 'ind-def-01' ? 'INFRA' : a.company_id === 'ind-def-02' ? 'NBFC' : 'AIR'}</span></td>
                        <td><span class="mono-cell" style="font-weight:700; color:var(--color-ruby);">${a.priority_score.toFixed(1)}</span></td>
                        <td>
                          ${a.alert_selected ? '<span class="badge badge-cap">5% ACTIVE ALERT</span>' : '<span class="badge badge-subtle">MONITOR QUEUE</span>'}
                        </td>
                        <td>
                          <button class="btn btn-secondary btn-sm" onclick="App.selectBorrower('${a.company_id}')">
                            Investigate
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Lead-Time Horizon Performance -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">4-Quarter Lead-Time Detection Curve</h3>
                  <span class="card-subtitle">Recall performance across prediction horizons under 5% budget</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('simulator')">
                  Open Simulator
                </button>
              </div>

              <div id="overview_lead_time_chart" class="chart-container" style="border:none; padding:0;">
                <!-- SVG Chart rendered by ChartUtils -->
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Render Lead Time Curve SVG
      const chartContainer = document.getElementById('overview_lead_time_chart');
      if (chartContainer) {
        const simData = await API.getSimulation(0.05, 20, 4);
        ChartUtils.renderLeadTimeCurve(chartContainer, simData.leadTimeCurves);
      }
    } catch (err) {
      container.innerHTML = `
        <div class="card" style="border-color:var(--color-ruby); padding:24px; text-align:center;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:32px; color:var(--color-ruby); margin-bottom:12px;"></i>
          <h3>Failed to load Overview data</h3>
          <p style="color:var(--text-secondary); margin-top:6px;">${err.message}</p>
        </div>
      `;
    }
  }
};
