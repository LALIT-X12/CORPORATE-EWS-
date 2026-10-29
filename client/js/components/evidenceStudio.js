// Corporate EWS - Multi-Modal Audit Evidence Reconciliation Studio
// Addresses GAP 3: Disregard for Multi-Modal Audit Evidence

const EvidenceStudioComponent = {
  async render(container, companyId = null) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Reconciling unstructured audit filing documents against structured database...</p>
      </div>
    `;

    try {
      const data = await API.getEvidence(companyId);
      const s = data.stats;

      let html = `
        <div class="evidence-studio-view">
          <!-- Summary Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="font-family:var(--font-heading); font-size:20px; font-weight:800; color:var(--text-primary);">
                Multi-Modal Document vs. Database Reconciliation
              </h3>
              <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                Uncovers off-balance-sheet guarantees, related-party loan inflation, and CARO discrepancies
              </p>
            </div>
            <button class="btn btn-primary" onclick="App.openUploadDocModal('${companyId || 'ind-def-01'}')">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload & Reconcile Filing
            </button>
          </div>

          <!-- Pipeline Stats Grid -->
          <div class="grid-4" style="margin-bottom:20px;">
            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Extracted Filing Claims</span>
              <div class="metric-value-row">
                <span class="metric-value cyan">${s.totalClaims}</span>
                <span class="metric-delta">Disclosures</span>
              </div>
              <span class="card-subtitle">Parsed from CARO & Notes</span>
            </div>

            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Reconciled Matches</span>
              <div class="metric-value-row">
                <span class="metric-value teal">${s.matches}</span>
                <span class="metric-delta">Clean</span>
              </div>
              <span class="card-subtitle">Values perfectly match DB</span>
            </div>

            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Audit Discrepancies</span>
              <div class="metric-value-row">
                <span class="metric-value ruby">${s.mismatches}</span>
                <span class="metric-delta">${s.discrepancyRatePct}% Discrepancy Rate</span>
              </div>
              <span class="card-subtitle">Material off-balance-sheet gap</span>
            </div>

            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Flagged by Investigators</span>
              <div class="metric-value-row">
                <span class="metric-value amber">${s.flaggedFrauds}</span>
                <span class="metric-delta">Flagged</span>
              </div>
              <span class="card-subtitle">Confirmed accounting divergence</span>
            </div>
          </div>

          <!-- Claims List -->
          <div class="claims-list-container">
            <h4 style="font-family:var(--font-heading); font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <i class="fa-solid fa-file-invoice-dollar" style="color:var(--color-primary);"></i>
              Extracted Evidence Claims vs Structured Financial Records
            </h4>

            ${data.claims.length === 0 ? `
              <div class="card" style="padding:40px; text-align:center; color:var(--text-muted);">
                <i class="fa-solid fa-file-circle-check" style="font-size:32px; margin-bottom:10px; display:block;"></i>
                No discrepancies found for this entity. All audited filings match structured accounts.
              </div>
            ` : data.claims.map(cl => `
              <div class="evidence-claim-card ${cl.reconciliation_status === 'MATCH' ? 'match' : 'mismatch'}">
                <div class="claim-header-row">
                  <div>
                    <span class="claim-metric-title">${cl.metric_name}</span>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                      <i class="fa-regular fa-file-pdf"></i> ${cl.doc_title} • <strong>Page ${cl.page_number}</strong> (${cl.table_ref}) • <em>Period: ${cl.fiscal_period}</em>
                    </div>
                  </div>
                  <div>
                    <span class="badge ${cl.reconciliation_status === 'MATCH' ? 'badge-version' : 'badge-cap'}">
                      ${cl.reconciliation_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <!-- 3-Way Diff Comparison Grid -->
                <div class="diff-values-grid">
                  <div class="diff-box">
                    <span class="diff-box-label">Claimed in Filing Note</span>
                    <span class="diff-box-val claimed">${Formatters.formatINR(cl.claimed_value)}</span>
                  </div>
                  <div class="diff-box">
                    <span class="diff-box-label">Structured DB Record</span>
                    <span class="diff-box-val structured">${Formatters.formatINR(cl.structured_value)}</span>
                  </div>
                  <div class="diff-box">
                    <span class="diff-box-label">Unrecorded Discrepancy</span>
                    <span class="diff-box-val discrepancy">
                      +${Formatters.formatINR(cl.discrepancy_amount)} (+${cl.discrepancy_pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <!-- Context Snippet with highlight -->
                <div class="claim-snippet-box">
                  <div style="font-size:10px; text-transform:uppercase; color:var(--color-amber); font-weight:700; margin-bottom:2px;">
                    <i class="fa-solid fa-quote-left"></i> Verified Document Extraction Snippet (Confidence: ${(cl.extraction_confidence * 100).toFixed(0)}%)
                  </div>
                  ${cl.context_snippet}
                </div>

                <!-- Verification Footer Action Bar -->
                <div class="claim-actions-row">
                  <div style="font-size:11px; color:var(--text-secondary);">
                    <strong>Verification Status:</strong> 
                    <span class="badge ${cl.verification_status === 'FLAGGED_FRAUD' ? 'badge-cap' : cl.verification_status === 'VERIFIED_CORRECT' ? 'badge-version' : 'badge-subtle'}">
                      ${cl.verification_status.replace(/_/g, ' ')}
                    </span>
                    ${cl.verified_by ? `<span style="margin-left:6px;">by ${cl.verified_by} (${Formatters.formatDate(cl.verified_at)})</span>` : ''}
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary btn-sm" onclick="EvidenceStudioComponent.verifyClaimAction('${cl.claim_id}', 'VERIFIED_CORRECT', '${companyId}')">
                      <i class="fa-solid fa-check"></i> Verify Correct
                    </button>
                    <button class="btn btn-ruby btn-sm" onclick="EvidenceStudioComponent.verifyClaimAction('${cl.claim_id}', 'FLAGGED_FRAUD', '${companyId}')">
                      <i class="fa-solid fa-flag"></i> Flag Accounting Fraud
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="card" style="padding:24px; text-align:center;"><p style="color:var(--color-ruby);">${err.message}</p></div>`;
    }
  },

  async verifyClaimAction(claimId, status, companyId) {
    try {
      await API.verifyClaim(claimId, status, 'Senior Credit Investigator');
      App.showToast(`Claim successfully marked as ${status.replace(/_/g, ' ')}`, 'success');
      const container = document.getElementById('investigation_subtab_content');
      if (container) {
        this.render(container, companyId);
      }
    } catch (err) {
      App.showToast(`Failed to update verification: ${err.message}`, 'error');
    }
  }
};
