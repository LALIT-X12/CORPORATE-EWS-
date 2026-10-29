// Corporate EWS - Borrower Deep Investigation Workbench

const InvestigationComponent = {
  activeSubTab: 'overview',
  currentCompanyId: null,

  async render(container, companyId = 'ind-def-01') {
    this.currentCompanyId = companyId;

    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Deep Borrower Forensic Dossier for ${companyId}...</p>
      </div>
    `;

    try {
      const data = await API.getCompany(companyId);
      const c = data.company;
      const a = data.assessment || {};
      const dyn = data.dynamicScores || {};

      let html = `
        <div class="investigation-view">
          <!-- Borrower Sticky Header Profile -->
          <div class="investigation-header">
            <div class="investigation-borrower-info">
              <div class="borrower-headline">
                <span class="borrower-name">${c.trade_name}</span>
                <span class="badge badge-version">${c.sector_code}</span>
                <span class="badge ${c.is_defaulted ? 'badge-cap' : 'badge-subtle'}">
                  ${c.is_defaulted ? `HISTORICAL DEFAULTER (${c.default_event_date || 'N/A'})` : 'ACTIVE CONTROL PEER'}
                </span>
                ${a.alert_selected ? '<span class="badge badge-cap pulse-ruby"><i class="fa-solid fa-bell"></i> 5% ACTIVE ALERT</span>' : ''}
              </div>
              <div style="font-size:13px; font-weight:600; color:var(--text-secondary); margin-top:2px;">
                ${c.legal_name}
              </div>
              <div class="borrower-meta">
                <span>CIN: <strong style="font-family:var(--font-mono);">${c.cin}</strong></span> • 
                <span>Peer Group: <strong>${c.peer_group_id}</strong></span> • 
                <span>Credit Rating: <strong>${c.credit_rating}</strong></span> • 
                <span>Market Cap: <strong>${Formatters.formatINR(c.market_cap_crores)}</strong></span>
              </div>
            </div>

            <!-- Priority & Score Quick Pill -->
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="text-align:right;">
                <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Priority Rank</div>
                <div style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:${a.priority_rank <= 2 ? 'var(--color-ruby)' : 'var(--text-primary)'};">
                  #${a.priority_rank || 1} <span style="font-size:14px; color:var(--text-muted);">/ 40</span>
                </div>
              </div>

              <div style="text-align:right; border-left:1px solid var(--border-subtle); padding-left:12px;">
                <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Priority Score</div>
                <div style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:${(a.priority_score || 0) >= 80 ? 'var(--color-ruby)' : 'var(--color-primary)'};">
                  ${(a.priority_score || 0).toFixed(1)}
                </div>
              </div>

              <button class="btn btn-ruby" onclick="App.openDispositionModal('${c.company_id}', '${c.trade_name}', '${a.assessment_id || 'ass-01'}')">
                <i class="fa-solid fa-gavel"></i> Log Committee Action
              </button>
            </div>
          </div>

          <!-- 7-Subtab Navigation Bar -->
          <div class="sub-tabs" role="tablist">
            <button class="sub-tab ${this.activeSubTab === 'overview' ? 'active' : ''}" data-subtab="overview">
              <i class="fa-solid fa-id-card"></i> 1. Profile & Signals
            </button>
            <button class="sub-tab ${this.activeSubTab === 'financials' ? 'active' : ''}" data-subtab="financials">
              <i class="fa-solid fa-table-columns"></i> 2. Point-in-Time Financials
            </button>
            <button class="sub-tab ${this.activeSubTab === 'forensics' ? 'active' : ''}" data-subtab="forensics">
              <i class="fa-solid fa-calculator"></i> 3. Forensic Accounting
            </button>
            <button class="sub-tab ${this.activeSubTab === 'network' ? 'active' : ''}" data-subtab="network">
              <i class="fa-solid fa-diagram-project"></i> 4. Relational Fraud Graph
              <span class="badge badge-subtle">GAP 1</span>
            </button>
            <button class="sub-tab ${this.activeSubTab === 'explainability' ? 'active' : ''}" data-subtab="explainability">
              <i class="fa-solid fa-scale-balanced"></i> 5. SHAP & Regulatory Dossier
              <span class="badge badge-subtle">GAP 2</span>
            </button>
            <button class="sub-tab ${this.activeSubTab === 'evidence' ? 'active' : ''}" data-subtab="evidence">
              <i class="fa-solid fa-file-shield"></i> 6. Multi-Modal Evidence
              <span class="badge badge-subtle">GAP 3</span>
            </button>
            <button class="sub-tab ${this.activeSubTab === 'reviews' ? 'active' : ''}" data-subtab="reviews">
              <i class="fa-solid fa-gavel"></i> 7. Committee Action Log
            </button>
          </div>

          <!-- Subtab Viewport -->
          <div id="investigation_subtab_content" class="subtab-content"></div>
        </div>
      `;

      container.innerHTML = html;

      // Attach subtab click events
      const subTabButtons = container.querySelectorAll('.sub-tab');
      subTabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          subTabButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeSubTab = btn.getAttribute('data-subtab');
          this.renderSubTabContent(data);
        });
      });

      // Render default subtab content
      this.renderSubTabContent(data);
    } catch (err) {
      container.innerHTML = `<div class="card" style="padding:24px; text-align:center;"><p style="color:var(--color-ruby);">${err.message}</p></div>`;
    }
  },

  async renderSubTabContent(data) {
    const container = document.getElementById('investigation_subtab_content');
    if (!container) return;

    const c = data.company;
    const a = data.assessment || {};
    const periods = data.periods || [];
    const signals = data.softSignals || [];
    const reviews = data.reviewActions || [];
    const dyn = data.dynamicScores || {};

    switch (this.activeSubTab) {
      case 'overview':
        container.innerHTML = `
          <div class="grid-2">
            <!-- Left: Governance Soft Signals -->
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">
                  <i class="fa-solid fa-flag" style="color:var(--color-ruby);"></i> Governance & Soft Warning Signals
                </h4>
                <span class="badge badge-version">${signals.length} Verified Flags</span>
              </div>
              ${signals.length === 0 ? `
                <p style="color:var(--text-muted); font-size:13px;">No negative governance or non-financial soft signals recorded.</p>
              ` : signals.map(s => `
                <div style="padding:12px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm); border-left:3px solid var(--color-ruby); margin-bottom:10px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="color:var(--text-primary); font-size:13px;">${s.signal_type.replace(/_/g, ' ')}</strong>
                    <span class="risk-badge ${s.severity === 'CRITICAL' ? 'critical' : 'high'}">${s.severity}</span>
                  </div>
                  <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${s.details}</p>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:6px; display:flex; justify-content:space-between;">
                    <span>Source: <strong>${s.source_name}</strong></span>
                    <span>Date: <strong>${Formatters.formatDate(s.event_date)}</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Right: Assessment Summary & Top Drivers -->
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">
                  <i class="fa-solid fa-shield-virus" style="color:var(--color-primary);"></i> Multi-Factor Risk Summary
                </h4>
                <span class="badge badge-cap">5% POLICY EVALUATION</span>
              </div>

              <div class="grid-2" style="margin-bottom:14px;">
                <div style="padding:10px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm);">
                  <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Default Probability</div>
                  <div style="font-family:var(--font-heading); font-size:22px; font-weight:700; color:var(--color-ruby); margin-top:2px;">
                    ${((a.default_probability || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div style="padding:10px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm);">
                  <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Manipulation Score</div>
                  <div style="font-family:var(--font-heading); font-size:22px; font-weight:700; color:var(--color-amber); margin-top:2px;">
                    ${(a.manipulation_risk_score || 0).toFixed(1)}/100
                  </div>
                </div>
              </div>

              <div style="margin-bottom:14px;">
                <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Top Primary Risk Drivers:</span>
                <p style="font-size:13px; font-weight:600; color:var(--text-primary); margin-top:4px; line-height:1.5;">
                  ${a.top_risk_drivers || 'No severe risk drivers identified.'}
                </p>
              </div>

              <div>
                <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sector-Adjusted Risk Rating:</span>
                <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                  <div style="flex:1; height:8px; background:rgba(255,255,255,0.08); border-radius:var(--radius-pill); overflow:hidden;">
                    <div style="width:${Math.min(100, a.sector_adjusted_risk || 0)}%; height:100%; background:linear-gradient(90deg, var(--color-primary), var(--color-ruby));"></div>
                  </div>
                  <span style="font-family:var(--font-mono); font-weight:700; font-size:13px;">${(a.sector_adjusted_risk || 0).toFixed(1)}/100</span>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'financials':
        container.innerHTML = `
          <div class="card">
            <div class="card-header">
              <div>
                <h4 class="card-title"><i class="fa-solid fa-file-lines" style="color:var(--color-primary);"></i> Point-in-Time Historical Financial Statements</h4>
                <span class="card-subtitle">Audited balance sheet, income statement, and operating cash flows across prediction horizons</span>
              </div>
              <span class="badge badge-version">₹ CRORES</span>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Financial Metric</th>
                    ${periods.map(p => `<th>FY ${p.fiscal_year} (Period End: ${p.period_end_date})</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Revenue / Turnover</strong></td>
                    ${periods.map(p => `<td class="mono-cell">${Formatters.formatINR(p.revenue)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Cost of Goods Sold (COGS)</td>
                    ${periods.map(p => `<td class="mono-cell">${Formatters.formatINR(p.cogs)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>EBIT (Operating Profit)</td>
                    ${periods.map(p => `<td class="mono-cell" style="color:${p.ebit < 0 ? 'var(--color-ruby)' : 'var(--text-primary)'};">${Formatters.formatINR(p.ebit)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td><strong>Net Income (PAT)</strong></td>
                    ${periods.map(p => `<td class="mono-cell" style="font-weight:700; color:${p.net_income < 0 ? 'var(--color-ruby)' : 'var(--color-teal)'};">${Formatters.formatINR(p.net_income)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td><strong>Operating Cash Flow (CFO)</strong></td>
                    ${periods.map(p => `<td class="mono-cell" style="font-weight:700; color:${p.operating_cash_flow < 0 ? 'var(--color-ruby)' : 'var(--color-teal)'};">${Formatters.formatINR(p.operating_cash_flow)}</td>`).join('')}
                  </tr>
                  <tr style="background:rgba(255,255,255,0.02);">
                    <td><strong>Total Assets</strong></td>
                    ${periods.map(p => `<td class="mono-cell" style="font-weight:700;">${Formatters.formatINR(p.total_assets)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Current Assets</td>
                    ${periods.map(p => `<td class="mono-cell">${Formatters.formatINR(p.current_assets)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Current Liabilities</td>
                    ${periods.map(p => `<td class="mono-cell" style="color:${p.current_liabilities > p.current_assets ? 'var(--color-ruby)' : 'var(--text-primary)'};">${Formatters.formatINR(p.current_liabilities)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td><strong>Total Debt (External Borrowings)</strong></td>
                    ${periods.map(p => `<td class="mono-cell" style="font-weight:700; color:var(--color-ruby);">${Formatters.formatINR(p.total_debt)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td><strong>Book Equity / Net Worth</strong></td>
                    ${periods.map(p => `<td class="mono-cell" style="font-weight:700; color:${p.book_equity < 0 ? 'var(--color-ruby)' : 'var(--text-primary)'};">${Formatters.formatINR(p.book_equity)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Trade Receivables</td>
                    ${periods.map(p => `<td class="mono-cell">${Formatters.formatINR(p.receivables)}</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;

      case 'forensics':
        const bm = dyn.beneish || {};
        const pf = dyn.piotroski || {};
        const az = dyn.altman || {};

        container.innerHTML = `
          <div class="grid-3" style="margin-bottom:20px;">
            <!-- Beneish M-Score Card -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title">Beneish M-Score</h4>
                  <span class="card-subtitle">8-Variable Earnings Manipulation</span>
                </div>
                ${Formatters.getBeneishBadge(bm.status, bm.mScore)}
              </div>
              <div style="font-family:var(--font-heading); font-size:32px; font-weight:800; color:${bm.status === 'POTENTIAL_MANIPULATOR' ? 'var(--color-ruby)' : 'var(--color-teal)'}; margin-bottom:8px;">
                ${bm.mScore !== null ? bm.mScore.toFixed(2) : 'N/A'}
              </div>
              <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px; line-height:1.4;">
                ${bm.notes || ''}
              </p>
              <div style="font-size:11px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>DSRI (Days Sales in Rec.):</span>
                  <strong class="mono-cell">${bm.dsri || '1.0'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>GMI (Gross Margin Index):</span>
                  <strong class="mono-cell">${bm.gmi || '1.0'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>AQI (Asset Quality Index):</span>
                  <strong class="mono-cell">${bm.aqi || '1.0'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>TATA (Total Accruals/Assets):</span>
                  <strong class="mono-cell" style="color:${(bm.tata || 0) > 0.05 ? 'var(--color-ruby)' : 'var(--text-primary)'};">${bm.tata || '0.0'}</strong>
                </div>
              </div>
            </div>

            <!-- Piotroski F-Score Card -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title">Piotroski F-Score</h4>
                  <span class="card-subtitle">9 Accounting Health Signals</span>
                </div>
                ${Formatters.getPiotroskiBadge(pf.status, pf.score)}
              </div>
              <div style="font-family:var(--font-heading); font-size:32px; font-weight:800; color:${pf.score >= 7 ? 'var(--color-teal)' : pf.score >= 4 ? 'var(--color-amber)' : 'var(--color-ruby)'}; margin-bottom:8px;">
                ${pf.score !== null ? `${pf.score}/9` : 'N/A'}
              </div>
              <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px; line-height:1.4;">
                ${pf.notes || ''}
              </p>
              <div style="font-size:11px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>Profitability Points:</span>
                  <strong class="mono-cell">${((pf.breakdown?.fRoa || 0) + (pf.breakdown?.fCfo || 0) + (pf.breakdown?.fDeltaRoa || 0) + (pf.breakdown?.fAccrual || 0))}/4</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>Leverage / Liquidity:</span>
                  <strong class="mono-cell">${((pf.breakdown?.fDeltaLever || 0) + (pf.breakdown?.fDeltaLiquid || 0) + (pf.breakdown?.fEqOffer || 0))}/3</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>Operating Efficiency:</span>
                  <strong class="mono-cell">${((pf.breakdown?.fDeltaMargin || 0) + (pf.breakdown?.fDeltaTurn || 0))}/2</strong>
                </div>
              </div>
            </div>

            <!-- Altman Z''-Score Card -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title">Altman Z''-Score</h4>
                  <span class="card-subtitle">Emerging Markets Solvency Index</span>
                </div>
                ${Formatters.getAltmanBadge(az.status, az.zScore)}
              </div>
              <div style="font-family:var(--font-heading); font-size:32px; font-weight:800; color:${az.status === 'DISTRESS' ? 'var(--color-ruby)' : az.status === 'GREY' ? 'var(--color-amber)' : 'var(--color-teal)'}; margin-bottom:8px;">
                ${az.zScore !== null ? az.zScore.toFixed(2) : 'N/A'}
              </div>
              <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px; line-height:1.4;">
                ${az.notes || ''}
              </p>
              <div style="font-size:11px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>X1 (Working Capital / Assets):</span>
                  <strong class="mono-cell">${az.x1WorkingCapital || '0.0'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>X2 (Retained Earnings / Assets):</span>
                  <strong class="mono-cell">${az.x2RetainedEarnings || '0.0'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>X3 (EBIT / Assets):</span>
                  <strong class="mono-cell">${az.x3Ebit || '0.0'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>X4 (Book Equity / Liabilities):</span>
                  <strong class="mono-cell">${az.x4BookEquity || '0.0'}</strong>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'network':
        NetworkGraphComponent.render(container, this.currentCompanyId);
        break;

      case 'explainability':
        container.innerHTML = `
          <div class="grid-2">
            <!-- Left: SHAP Waterfall -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title"><i class="fa-solid fa-water" style="color:var(--color-ruby);"></i> SHAP Feature Attribution Waterfall</h4>
                  <span class="card-subtitle">Marginal log-odds contributions across financial ratios, contagion, and governance</span>
                </div>
                <span class="badge badge-cap">XAI WATERFALL</span>
              </div>
              <div id="shap_waterfall_container">
                <div class="loading-state"><div class="spinner"></div><p>Calculating SHAP values...</p></div>
              </div>
            </div>

            <!-- Right: Statutory Regulatory Policy Dossier -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title"><i class="fa-solid fa-scale-balanced" style="color:var(--color-primary);"></i> Regulatory Compliance & EWS Audit Dossier</h4>
                  <span class="card-subtitle">Direct statutory mapping to RBI EWS Circular & Companies Act Section 143(12)</span>
                </div>
                <span class="badge badge-version">STATUTORY COMPLIANCE</span>
              </div>
              <div id="regulatory_dossier_container">
                <div class="loading-state"><div class="spinner"></div><p>Mapping regulatory rules...</p></div>
              </div>
            </div>
          </div>
        `;

        try {
          const expData = await API.getExplainability(this.currentCompanyId);
          const wfContainer = document.getElementById('shap_waterfall_container');
          if (wfContainer) {
            ChartUtils.renderShapWaterfall(wfContainer, expData);
          }

          const dossierContainer = document.getElementById('regulatory_dossier_container');
          if (dossierContainer && expData.regulatoryDossier) {
            let dHtml = '';
            expData.regulatoryDossier.forEach(d => {
              const isBreach = d.status.includes('BREACH') || d.status.includes('DETECTED') || d.status.includes('FLAG');
              dHtml += `
                <div style="padding:12px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm); border-left:3px solid ${isBreach ? 'var(--color-ruby)' : 'var(--color-teal)'}; margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="color:var(--text-primary); font-size:12px;">${d.statute}</strong>
                    <span class="risk-badge ${isBreach ? 'critical' : 'safe'}">${d.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:4px;">${d.clause}</div>
                  <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${d.finding}</p>
                </div>
              `;
            });
            dossierContainer.innerHTML = dHtml;
          }
        } catch (e) {
          console.error(e);
        }
        break;

      case 'evidence':
        EvidenceStudioComponent.render(container, this.currentCompanyId);
        break;

      case 'reviews':
        container.innerHTML = `
          <div class="card">
            <div class="card-header">
              <div>
                <h4 class="card-title"><i class="fa-solid fa-clock-rotate-left" style="color:var(--color-primary);"></i> Credit Committee Review Actions & Audit Trail</h4>
                <span class="card-subtitle">Chronological record of investigator sign-offs, dispositions, and forensic audit recommendations</span>
              </div>
              <button class="btn btn-ruby btn-sm" onclick="App.openDispositionModal('${c.company_id}', '${c.trade_name}', '${a.assessment_id || 'ass-01'}')">
                <i class="fa-solid fa-plus"></i> Log New Decision
              </button>
            </div>

            ${reviews.length === 0 ? `
              <div style="padding:40px; text-align:center; color:var(--text-muted);">
                <i class="fa-solid fa-user-check" style="font-size:32px; margin-bottom:10px; display:block;"></i>
                No formal committee actions logged yet for this borrower. Click "Log New Decision" to submit a disposition.
              </div>
            ` : `
              <div class="timeline-container" style="display:flex; flex-direction:column; gap:12px;">
                ${reviews.map(r => `
                  <div style="padding:14px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm); border:1px solid var(--border-subtle); border-left:4px solid var(--color-primary);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                      <div>
                        <strong style="color:var(--text-primary); font-size:13px;">${r.disposition.replace(/_/g, ' ')}</strong>
                        <span style="font-size:12px; color:var(--text-secondary); margin-left:8px;">by <strong>${r.analyst_name}</strong></span>
                      </div>
                      <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);">${Formatters.formatDate(r.created_at)}</span>
                    </div>
                    <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">${r.notes}</p>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
        break;
    }
  }
};
