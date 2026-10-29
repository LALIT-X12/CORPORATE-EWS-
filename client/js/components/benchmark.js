// Corporate EWS - Benchmark Database & Transferability Explorer

const BenchmarkComponent = {
  async render(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Benchmark Database & Transfer Learning Matrices...</p>
      </div>
    `;

    try {
      const data = await API.getBenchmark();
      const dsList = data.datasets || [];
      const trans = data.transferComparison || {};

      let html = `
        <div class="benchmark-view">
          <!-- Page Header -->
          <div style="margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <h1 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--text-primary);">
                International Benchmark Database & Transfer-to-India Evaluation
              </h1>
              <span class="badge badge-version">UCI POLISH & TAIWAN BENCHMARKS</span>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-top:4px; max-width:1000px; line-height:1.6;">
              ${trans.description || 'Evaluates how well machine learning distress models trained on European and East Asian corporate benchmarks generalize to Indian corporate data.'}
            </p>
          </div>

          <!-- Datasets Overview Cards -->
          <div class="grid-2" style="margin-bottom:20px;">
            ${dsList.map(ds => `
              <div class="card">
                <div class="card-header">
                  <div>
                    <h3 class="card-title"><i class="fa-solid fa-database" style="color:var(--color-primary);"></i> ${ds.name}</h3>
                    <span class="card-subtitle">Origin: ${ds.origin} • Default Rate: <strong>${ds.defaultRateDisplay}</strong></span>
                  </div>
                  <a href="${ds.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> UCI Repository
                  </a>
                </div>
                <p style="font-size:12px; color:var(--text-secondary); line-height:1.5; margin-bottom:14px;">
                  ${ds.description}
                </p>

                <div class="grid-3" style="background:var(--bg-surface-elevated); padding:10px; border-radius:var(--radius-sm); margin-bottom:14px;">
                  <div>
                    <span style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Sample Size</span>
                    <div style="font-family:var(--font-mono); font-size:15px; font-weight:700; color:var(--text-primary);">${ds.sampleSize.toLocaleString()} Firms</div>
                  </div>
                  <div>
                    <span style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Financial Ratios</span>
                    <div style="font-family:var(--font-mono); font-size:15px; font-weight:700; color:var(--color-primary);">${ds.featureCount} Features</div>
                  </div>
                  <div>
                    <span style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Prediction Scope</span>
                    <div style="font-family:var(--font-mono); font-size:15px; font-weight:700; color:var(--color-teal);">${ds.metrics?.horizons?.length || 1} Horizons</div>
                  </div>
                </div>

                ${ds.metrics?.top_features ? `
                  <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:6px;">Top Feature Importances (XGBoost / LightGBM):</span>
                  <div style="display:flex; flex-wrap:wrap; gap:6px;">
                    ${ds.metrics.top_features.slice(0, 5).map(f => `
                      <span class="badge badge-version" style="font-size:10px;" title="${f.name}">
                        ${f.code}: ${f.name.split('/')[0]} (${(f.importance * 100).toFixed(0)}%)
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Transfer-to-India Comparison Matrix Table -->
          <div class="card" style="margin-bottom:20px;">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <i class="fa-solid fa-arrows-split-up-and-left" style="color:var(--color-teal);"></i>
                  Benchmark-to-India Transfer Performance Matrix
                </h3>
                <span class="card-subtitle">Comparing raw internationally-trained models vs. sector-adjusted & multi-modal transfer models</span>
              </div>
              <span class="badge badge-cap">LEAKAGE-CONTROLLED EVALUATION</span>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Model Architecture</th>
                    <th>Training Source</th>
                    <th>Target Indian Data</th>
                    <th>Source AUC</th>
                    <th>Target Indian AUC</th>
                    <th>Recall @ 5% Alert Cap</th>
                    <th>Covariate Shift</th>
                    <th>Transfer Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  ${(trans.models || []).map(m => `
                    <tr class="${m.status === 'PRODUCTION_BENCHMARK' ? 'row-alert' : ''}">
                      <td><strong style="color:var(--text-primary); font-size:13px;">${m.name}</strong></td>
                      <td><span style="font-size:11px; color:var(--text-secondary);">${m.trainingData}</span></td>
                      <td><span style="font-size:11px; color:var(--text-secondary);">${m.targetData}</span></td>
                      <td><span class="mono-cell" style="font-weight:700;">${m.sourceRocAuc.toFixed(3)}</span></td>
                      <td><span class="mono-cell" style="font-weight:700; color:${m.transferRocAuc >= 0.85 ? 'var(--color-teal)' : 'var(--color-primary)'};">${m.transferRocAuc.toFixed(3)}</span></td>
                      <td><span class="mono-cell" style="font-weight:800; color:${m.recallAt5PctBudget >= 0.8 ? 'var(--color-ruby)' : 'var(--text-primary)'};">${(m.recallAt5PctBudget * 100).toFixed(0)}%</span></td>
                      <td><span class="mono-cell">${m.distributionShiftDistance.toFixed(3)}</span></td>
                      <td><span style="font-size:12px; color:var(--text-secondary);">${m.transferDiagnosis}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Feature Covariate Shift & Wasserstein Drift Table -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <i class="fa-solid fa-chart-simple" style="color:var(--color-ruby);"></i>
                  Distribution Drift & Covariate Shift Analysis
                </h3>
                <span class="card-subtitle">Wasserstein distance between Polish benchmark distributions and Indian corporate balance sheets</span>
              </div>
              <span class="badge badge-version">WASSERSTEIN METRICS</span>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Accounting Ratio</th>
                    <th>Polish Benchmark Mean</th>
                    <th>Indian Defaulters Mean</th>
                    <th>Indian Healthy Peers Mean</th>
                    <th>Wasserstein Distance</th>
                    <th>Drift Category</th>
                  </tr>
                </thead>
                <tbody>
                  ${(trans.featureDriftAnalysis || []).map(fd => `
                    <tr>
                      <td><strong>${fd.feature}</strong></td>
                      <td class="mono-cell">${fd.polishDistributionMean.toFixed(3)}</td>
                      <td class="mono-cell" style="color:var(--color-ruby); font-weight:700;">${fd.indianDefaulterMean.toFixed(3)}</td>
                      <td class="mono-cell" style="color:var(--color-teal);">${fd.indianHealthyMean.toFixed(3)}</td>
                      <td class="mono-cell" style="font-weight:700;">${fd.wassersteinDrift.toFixed(3)}</td>
                      <td>
                        <span class="badge ${fd.driftCategory === 'HIGH_DRIFT' ? 'badge-cap' : 'badge-subtle'}">
                          ${fd.driftCategory.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="card" style="padding:24px; text-align:center;"><p style="color:var(--color-ruby);">${err.message}</p></div>`;
    }
  }
};
