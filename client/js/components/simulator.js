// Corporate EWS - Production Metric Mismatch & Alert Budget Simulator
// Addresses GAP 4: Metric Mismatch in Production & Lead-Time Analysis

const SimulatorComponent = {
  currentBudget: 0.05,
  currentCostRatio: 20.0,
  currentHorizon: 4,

  async render(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Running Asymmetric Cost & Operational Budget Simulation...</p>
      </div>
    `;

    try {
      const data = await API.getSimulation(this.currentBudget, this.currentCostRatio, this.currentHorizon);
      const o = data.outcomes;
      const c = data.capacity;

      let html = `
        <div class="simulator-view">
          <!-- Page Header -->
          <div style="margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <h1 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--text-primary);">
                Production Metric Mismatch & Asymmetric Cost Optimizer
              </h1>
              <span class="badge badge-cap">GAP 4 RESOLUTION</span>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-top:4px; max-width:1000px; line-height:1.6;">
              In corporate credit operations, standard model accuracy is dangerously misleading: a naive model predicting 100% "healthy" can achieve 95% accuracy while missing ₹90,000 Cr in catastrophic defaults. Credit risk review teams can only deeply investigate a strict <strong>5% operational alert budget</strong>. This engine optimizes thresholding under asymmetric loss where missing a fraud ($C_{FN}$) is <strong>${data.params.costRatio}:1</strong> more costly than a false alarm ($C_{FP}$).
            </p>
          </div>

          <!-- Top Grid: Interactive Control Sliders + Loss Matrix -->
          <div class="grid-2" style="margin-bottom:20px;">
            <!-- Sliders Card -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title"><i class="fa-solid fa-sliders" style="color:var(--color-primary);"></i> Policy Constraints & Cost Sliders</h3>
                  <span class="card-subtitle">Adjust bank review bandwidth and fraud loss asymmetry</span>
                </div>
                <button class="btn btn-secondary btn-sm" id="sim_reset_btn">Reset Defaults (5%, 20:1)</button>
              </div>

              <!-- Slider 1: Alert Rate Budget -->
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">Operational Alert Budget (% of Portfolio)</span>
                  <span class="slider-value-display" id="sim_budget_display">${data.params.budgetPctDisplay} (${c.maxAlertSlots} Review Slots)</span>
                </div>
                <input type="range" id="sim_budget_slider" class="custom-range-slider" min="0.01" max="0.15" step="0.01" value="${this.currentBudget}">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:4px;">
                  <span>1% (Stringent 0-1 slots)</span>
                  <span>5% Policy Cap (${c.maxAlertSlots} slots)</span>
                  <span>15% (Expansive 6 slots)</span>
                </div>
              </div>

              <!-- Slider 2: Cost Ratio (FN : FP) -->
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">Asymmetric Fraud Loss Ratio ($C_{FN}$ : $C_{FP}$)</span>
                  <span class="slider-value-display" id="sim_cost_display">${data.params.costRatioDisplay}</span>
                </div>
                <input type="range" id="sim_cost_slider" class="custom-range-slider" min="5" max="50" step="5" value="${this.currentCostRatio}">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:4px;">
                  <span>5:1 (Moderate Exposure)</span>
                  <span>20:1 (Standard Corporate Default)</span>
                  <span>50:1 (Systemic Tier-1 Exposure)</span>
                </div>
              </div>

              <!-- Horizon Pills -->
              <div style="margin-top:16px;">
                <span class="slider-label" style="display:block; margin-bottom:8px;">Prediction Horizon</span>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-secondary btn-sm ${this.currentHorizon === 4 ? 'btn-primary' : ''}" data-horizon="4">T-4 Quarters (12 Mos Ahead)</button>
                  <button class="btn btn-secondary btn-sm ${this.currentHorizon === 3 ? 'btn-primary' : ''}" data-horizon="3">T-3 Quarters (9 Mos Ahead)</button>
                  <button class="btn btn-secondary btn-sm ${this.currentHorizon === 2 ? 'btn-primary' : ''}" data-horizon="2">T-2 Quarters (6 Mos Ahead)</button>
                  <button class="btn btn-secondary btn-sm ${this.currentHorizon === 1 ? 'btn-primary' : ''}" data-horizon="1">T-1 Quarter (3 Mos Ahead)</button>
                </div>
              </div>
            </div>

            <!-- Asymmetric Cost Outcome Comparison Card -->
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div class="card-header">
                <div>
                  <h3 class="card-title"><i class="fa-solid fa-coins" style="color:var(--color-ruby);"></i> Expected Portfolio Loss vs. Naive Model</h3>
                  <span class="card-subtitle">Asymmetric Cost = $C_{FN} \\times FN + C_{FP} \\times FP$</span>
                </div>
                <span class="badge badge-cap">${o.costSavingsPct}% LOSS REDUCTION</span>
              </div>

              <div class="grid-2" style="margin-bottom:14px;">
                <div style="padding:16px; background:rgba(255,42,109,0.08); border-radius:var(--radius-sm); border:1px solid rgba(255,42,109,0.25);">
                  <div style="font-size:11px; color:var(--color-ruby); text-transform:uppercase; font-weight:700;">Standard "95% Accuracy" Model Loss</div>
                  <div style="font-family:var(--font-heading); font-size:28px; font-weight:800; color:var(--color-ruby); margin:4px 0;">
                    ${o.naiveModelCost.toFixed(1)} <span style="font-size:13px;">Units</span>
                  </div>
                  <p style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
                    Misses 100% of corporate defaults (10/10 missed) due to class imbalance.
                  </p>
                </div>

                <div style="padding:16px; background:rgba(0,229,255,0.08); border-radius:var(--radius-sm); border:1px solid rgba(0,229,255,0.25);">
                  <div style="font-size:11px; color:var(--color-primary); text-transform:uppercase; font-weight:700;">EWS Top-K Policy Loss</div>
                  <div style="font-family:var(--font-heading); font-size:28px; font-weight:800; color:var(--color-primary); margin:4px 0;">
                    ${o.expectedCost.toFixed(1)} <span style="font-size:13px;">Units</span>
                  </div>
                  <p style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
                    Catches high-exposure defaulters within the 5% budget, minimizing total default loss.
                  </p>
                </div>
              </div>

              <!-- Confusion Matrix Counts Row -->
              <div style="display:flex; justify-content:space-between; background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-sm); font-size:12px;">
                <div><strong>True Positives (TP):</strong> <span class="mono-cell" style="color:var(--color-teal);">${o.truePositives}</span></div>
                <div><strong>False Positives (FP):</strong> <span class="mono-cell" style="color:var(--color-amber);">${o.falsePositives}</span></div>
                <div><strong>False Negatives (FN):</strong> <span class="mono-cell" style="color:var(--color-ruby); font-weight:700;">${o.falseNegatives}</span></div>
                <div><strong>Recall @ 5%:</strong> <span class="mono-cell" style="color:var(--color-primary); font-weight:700;">${(o.recallAtBudget * 100).toFixed(1)}%</span></div>
                <div><strong>PR-AUC:</strong> <span class="mono-cell" style="color:var(--color-primary); font-weight:700;">${o.prAuc}</span></div>
              </div>
            </div>
          </div>

          <!-- Bottom: Lead-Time Detection Curves SVG -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <i class="fa-solid fa-chart-line" style="color:var(--color-primary);"></i>
                  Multi-Horizon Lead-Time Curves (T-4 to T-1 Quarters)
                </h3>
                <span class="card-subtitle">Comparing Baseline Tabular vs Relational vs Multi-Modal vs Combined System across 12-month horizon</span>
              </div>
              <span class="badge badge-version">LEAD-TIME BENCHMARK</span>
            </div>

            <div id="sim_lead_time_svg_container" class="chart-container" style="border:none; padding:0;"></div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Render Lead Time Curve SVG
      const chartEl = document.getElementById('sim_lead_time_svg_container');
      if (chartEl && data.leadTimeCurves) {
        ChartUtils.renderLeadTimeCurve(chartEl, data.leadTimeCurves);
      }

      // Attach Slider Event Listeners
      this.attachEvents(container);
    } catch (err) {
      container.innerHTML = `<div class="card" style="padding:24px; text-align:center;"><p style="color:var(--color-ruby);">${err.message}</p></div>`;
    }
  },

  attachEvents(container) {
    const budgetSlider = document.getElementById('sim_budget_slider');
    const costSlider = document.getElementById('sim_cost_slider');
    const resetBtn = document.getElementById('sim_reset_btn');

    if (budgetSlider) {
      budgetSlider.addEventListener('input', (e) => {
        this.currentBudget = parseFloat(e.target.value);
        this.render(container);
      });
    }

    if (costSlider) {
      costSlider.addEventListener('input', (e) => {
        this.currentCostRatio = parseFloat(e.target.value);
        this.render(container);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.currentBudget = 0.05;
        this.currentCostRatio = 20.0;
        this.currentHorizon = 4;
        this.render(container);
      });
    }

    const horizonButtons = container.querySelectorAll('[data-horizon]');
    horizonButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentHorizon = parseInt(btn.getAttribute('data-horizon'));
        this.render(container);
      });
    });
  }
};
