// Corporate EWS - Formatting & Badge Helpers

const Formatters = {
  /**
   * Format currency in Indian Rupees Crores
   */
  formatINR(amount, decimals = 1) {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0.0 Cr';
    const num = Number(amount);
    const sign = num < 0 ? '-' : '';
    const absVal = Math.abs(num);
    
    // Indian numbering format: lakh/crore
    const formatted = absVal.toLocaleString('en-IN', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    });
    return `${sign}₹${formatted} Cr`;
  },

  /**
   * Format percentage
   */
  formatPercent(val, decimals = 1) {
    if (val === null || val === undefined || isNaN(val)) return '0.0%';
    return `${(Number(val) * (val <= 1.0 ? 100 : 1)).toFixed(decimals)}%`;
  },

  /**
   * Format generic floating point ratio
   */
  formatRatio(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return Number(val).toFixed(decimals);
  },

  /**
   * Format Date string (YYYY-MM-DD to readable format)
   */
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  },

  /**
   * Return risk badge HTML
   */
  getRiskBadge(score) {
    const s = Number(score) || 0;
    if (s >= 80) {
      return `<span class="risk-badge critical"><i class="fa-solid fa-triangle-exclamation"></i> Critical (${s.toFixed(1)})</span>`;
    } else if (s >= 60) {
      return `<span class="risk-badge high"><i class="fa-solid fa-circle-exclamation"></i> High (${s.toFixed(1)})</span>`;
    } else if (s >= 35) {
      return `<span class="risk-badge moderate"><i class="fa-solid fa-shield"></i> Moderate (${s.toFixed(1)})</span>`;
    } else {
      return `<span class="risk-badge safe"><i class="fa-solid fa-check"></i> Safe (${s.toFixed(1)})</span>`;
    }
  },

  /**
   * Return Beneish M-Score badge HTML
   */
  getBeneishBadge(status, mScore) {
    const scoreText = mScore !== null && mScore !== undefined ? ` (${Number(mScore).toFixed(2)})` : '';
    if (status === 'POTENTIAL_MANIPULATOR') {
      return `<span class="risk-badge critical" title="M-Score > -1.78 Threshold"><i class="fa-solid fa-fingerprint"></i> Manipulator${scoreText}</span>`;
    } else if (status === 'NON_MANIPULATOR') {
      return `<span class="risk-badge safe"><i class="fa-solid fa-check-double"></i> Clean${scoreText}</span>`;
    } else {
      return `<span class="risk-badge moderate">Unavailable</span>`;
    }
  },

  /**
   * Return Piotroski F-Score badge HTML
   */
  getPiotroskiBadge(status, score) {
    const scoreText = score !== null && score !== undefined ? ` (${score}/9)` : '';
    if (status === 'STRONG' || score >= 7) {
      return `<span class="risk-badge safe"><i class="fa-solid fa-arrow-trend-up"></i> Strong${scoreText}</span>`;
    } else if (status === 'MODERATE' || score >= 4) {
      return `<span class="risk-badge high"><i class="fa-solid fa-minus"></i> Moderate${scoreText}</span>`;
    } else if (status === 'WEAK' || (score !== null && score < 4)) {
      return `<span class="risk-badge critical"><i class="fa-solid fa-arrow-trend-down"></i> Weak${scoreText}</span>`;
    } else {
      return `<span class="risk-badge moderate">N/A</span>`;
    }
  },

  /**
   * Return Altman Z''-Score badge HTML
   */
  getAltmanBadge(status, zScore) {
    const scoreText = zScore !== null && zScore !== undefined ? ` (${Number(zScore).toFixed(2)})` : '';
    if (status === 'DISTRESS' || (zScore !== null && zScore < 1.1)) {
      return `<span class="risk-badge critical"><i class="fa-solid fa-skull-crossbones"></i> Distress${scoreText}</span>`;
    } else if (status === 'GREY' || (zScore !== null && zScore <= 2.6)) {
      return `<span class="risk-badge high"><i class="fa-solid fa-circle-question"></i> Grey Zone${scoreText}</span>`;
    } else if (status === 'SAFE' || (zScore !== null && zScore > 2.6)) {
      return `<span class="risk-badge safe"><i class="fa-solid fa-shield-halved"></i> Safe${scoreText}</span>`;
    } else if (status === 'EXCLUDED_FINANCIAL_SECTOR') {
      return `<span class="risk-badge moderate">NBFC Excluded</span>`;
    } else {
      return `<span class="risk-badge moderate">N/A</span>`;
    }
  }
};
