// Corporate EWS - SVG Chart Utilities

const ChartUtils = {
  /**
   * Render SHAP Waterfall chart inside container element
   */
  renderShapWaterfall(container, explainabilityData) {
    if (!container || !explainabilityData || !explainabilityData.waterfallSteps) {
      if (container) container.innerHTML = '<p class="text-muted">No SHAP attribution data available.</p>';
      return;
    }

    const steps = explainabilityData.waterfallSteps;
    const maxVal = Math.max(...steps.map(s => Math.abs(s.contribution || 0)), 1.5);

    let html = `
      <div class="waterfall-header-summary" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:10px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
        <div>
          <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Base Expected Log-Odds:</span>
          <strong style="font-family:var(--font-mono); margin-left:6px;">${explainabilityData.baseValue}</strong>
        </div>
        <div>
          <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Final Model Risk Log-Odds:</span>
          <strong style="font-family:var(--font-mono); margin-left:6px; color:${explainabilityData.finalLogOdds > 0 ? 'var(--color-ruby)' : 'var(--color-primary)'};">${explainabilityData.finalLogOdds > 0 ? '+' : ''}${explainabilityData.finalLogOdds}</strong>
          <span class="badge ${explainabilityData.finalProbability > 0.5 ? 'badge-cap' : 'badge-version'}" style="margin-left:8px;">${(explainabilityData.finalProbability * 100).toFixed(1)}% P(Default)</span>
        </div>
      </div>
      <div class="waterfall-container">
    `;

    steps.forEach((step) => {
      if (step.step === 0) {
        // Baseline row
        html += `
          <div class="waterfall-row">
            <div class="waterfall-feature-name" title="Baseline expected portfolio log-odds">
              <i class="fa-solid fa-scale-balanced" style="margin-right:6px; color:var(--text-muted);"></i> ${step.name}
            </div>
            <div class="waterfall-bar-track">
              <div style="position:absolute; left:50%; width:2px; height:100%; background:var(--text-muted); opacity:0.4;"></div>
            </div>
            <div class="waterfall-value" style="color:var(--text-muted);">${step.total.toFixed(2)}</div>
          </div>
        `;
      } else {
        const absContrib = Math.abs(step.contribution);
        const barWidthPct = Math.min(100, (absContrib / maxVal) * 100);
        const isPos = step.isPositive;
        const iconClass = step.category === 'NETWORK' ? 'fa-diagram-project' :
                          step.category === 'LEVERAGE' ? 'fa-building-columns' :
                          step.category === 'LIQUIDITY' ? 'fa-droplet' :
                          step.category === 'GOVERNANCE' ? 'fa-user-shield' : 'fa-chart-simple';

        html += `
          <div class="waterfall-row">
            <div class="waterfall-feature-name" title="${step.name}">
              <i class="fa-solid ${iconClass}" style="margin-right:6px; color:${isPos ? 'var(--color-ruby)' : 'var(--color-primary)'};"></i>
              ${step.name}
            </div>
            <div class="waterfall-bar-track">
              <div style="position:absolute; left:50%; width:2px; height:100%; background:rgba(255,255,255,0.15); z-index:2;"></div>
              <div style="position:relative; width:50%; height:100%; display:flex; ${isPos ? 'margin-left:50%;' : 'justify-content:flex-end;'}">
                <div class="waterfall-bar ${isPos ? 'positive' : 'negative'}" style="width:${barWidthPct}%;">
                  ${isPos ? '+' : ''}${step.contribution.toFixed(2)}
                </div>
              </div>
            </div>
            <div class="waterfall-value ${isPos ? 'pos' : 'neg'}">
              ${isPos ? '+' : ''}${step.contribution.toFixed(2)}
            </div>
          </div>
        `;
      }
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * Render Lead-Time detection curve SVG
   */
  renderLeadTimeCurve(container, curves) {
    if (!container || !curves || curves.length === 0) return;

    const width = 640;
    const height = 280;
    const pad = { top: 30, right: 40, bottom: 50, left: 60 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    // Horizon points (T-4, T-3, T-2, T-1)
    const xStep = chartW / (curves.length - 1);

    // Map Y: 0.4 to 1.0 (40% to 100% recall)
    const minY = 0.4;
    const maxY = 1.0;
    const getY = (val) => pad.top + chartH - ((val - minY) / (maxY - minY)) * chartH;
    const getX = (idx) => pad.left + idx * xStep;

    let baselinePoints = '';
    let relationalPoints = '';
    let evidencePoints = '';
    let combinedPoints = '';

    curves.forEach((c, i) => {
      const x = getX(i);
      baselinePoints += `${i === 0 ? 'M' : 'L'} ${x} ${getY(c.baselineRecall)} `;
      relationalPoints += `${i === 0 ? 'M' : 'L'} ${x} ${getY(c.relationalRecall)} `;
      evidencePoints += `${i === 0 ? 'M' : 'L'} ${x} ${getY(c.evidenceRecall)} `;
      combinedPoints += `${i === 0 ? 'M' : 'L'} ${x} ${getY(c.combinedRecall)} `;
    });

    let svg = `
      <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
        <!-- Gridlines -->
        <line x1="${pad.left}" y1="${getY(0.4)}" x2="${pad.left + chartW}" y2="${getY(0.4)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <text x="${pad.left - 8}" y="${getY(0.4) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">40%</text>

        <line x1="${pad.left}" y1="${getY(0.6)}" x2="${pad.left + chartW}" y2="${getY(0.6)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <text x="${pad.left - 8}" y="${getY(0.6) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">60%</text>

        <line x1="${pad.left}" y1="${getY(0.8)}" x2="${pad.left + chartW}" y2="${getY(0.8)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <text x="${pad.left - 8}" y="${getY(0.8) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">80%</text>

        <line x1="${pad.left}" y1="${getY(1.0)}" x2="${pad.left + chartW}" y2="${getY(1.0)}" stroke="var(--border-subtle)" />
        <text x="${pad.left - 8}" y="${getY(1.0) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">100%</text>

        <!-- X Axis Labels -->
        ${curves.map((c, i) => `
          <line x1="${getX(i)}" y1="${pad.top}" x2="${getX(i)}" y2="${pad.top + chartH}" stroke="var(--border-subtle)" opacity="0.4" />
          <text x="${getX(i)}" y="${pad.top + chartH + 20}" fill="var(--text-secondary)" font-size="11" font-weight="600" text-anchor="middle">
            ${c.horizon.split(' ')[0]}
          </text>
          <text x="${getX(i)}" y="${pad.top + chartH + 34}" fill="var(--text-muted)" font-size="9" text-anchor="middle">
            ${c.horizon.substring(c.horizon.indexOf('('))}
          </text>
        `).join('')}

        <!-- Lines -->
        <!-- Baseline Tabular -->
        <path d="${baselinePoints}" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4,4" />
        <!-- Relational-Enhanced -->
        <path d="${relationalPoints}" fill="none" stroke="var(--color-indigo)" stroke-width="2.5" />
        <!-- Evidence-Enhanced -->
        <path d="${evidencePoints}" fill="none" stroke="var(--color-teal)" stroke-width="2.5" />
        <!-- Combined Explainable EWS -->
        <path d="${combinedPoints}" fill="none" stroke="var(--color-primary)" stroke-width="3.5" filter="drop-shadow(0 0 6px var(--color-primary-glow))" />

        <!-- Nodes and points for Combined Curve -->
        ${curves.map((c, i) => `
          <circle cx="${getX(i)}" cy="${getY(c.combinedRecall)}" r="5" fill="var(--color-primary)" stroke="var(--bg-surface)" stroke-width="2" />
          <text x="${getX(i)}" y="${getY(c.combinedRecall) - 10}" fill="var(--color-primary)" font-size="11" font-weight="700" text-anchor="middle" font-family="var(--font-mono)">
            ${(c.combinedRecall * 100).toFixed(0)}%
          </text>
        `).join('')}
      </svg>

      <!-- Chart Legend -->
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:16px; margin-top:12px; font-size:11px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:14px; height:3px; background:var(--color-primary); display:inline-block; border-radius:2px;"></span>
          <strong style="color:var(--text-primary);">Combined EWS (Relational + Evidence + Soft)</strong>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:14px; height:2px; background:var(--color-teal); display:inline-block;"></span>
          <span style="color:var(--text-secondary);">Evidence-Enhanced</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:14px; height:2px; background:var(--color-indigo); display:inline-block;"></span>
          <span style="color:var(--text-secondary);">Relational-Enhanced</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="width:14px; height:2px; border-top:2px dashed var(--text-muted); display:inline-block;"></span>
          <span style="color:var(--text-muted);">Baseline (UCI Ratios)</span>
        </div>
      </div>
    `;

    container.innerHTML = svg;
  }
};
