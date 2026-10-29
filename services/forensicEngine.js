// Forensic Accounting Calculation Engine
// Beneish M-Score (1999), Piotroski F-Score (2000), Altman Z''-Score (1993/2000), Sector Adjustment

const EPSILON = 1e-7;

/**
 * 8-Variable Beneish M-Score Model (Beneish 1999)
 * M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI
 * Threshold: > -1.78 indicates elevated likelihood of earnings manipulation.
 */
function calculateBeneishMScore(curr, prev) {
  if (!prev) {
    return {
      mScore: null,
      dsri: 1.0, gmi: 1.0, aqi: 1.0, sgi: 1.0, depi: 1.0, sgai: 1.0, tata: 0.0, lvgi: 1.0,
      status: 'UNAVAILABLE',
      threshold: -1.78,
      notes: 'Requires prior period (t-1) for delta accounting indices.'
    };
  }

  if (curr.revenue <= 0 || prev.revenue <= 0 || curr.total_assets <= 0 || prev.total_assets <= 0) {
    return {
      mScore: null,
      dsri: 1.0, gmi: 1.0, aqi: 1.0, sgi: 1.0, depi: 1.0, sgai: 1.0, tata: 0.0, lvgi: 1.0,
      status: 'UNAVAILABLE',
      threshold: -1.78,
      notes: 'Revenues or Total Assets are non-positive.'
    };
  }

  // 1. Days Sales in Receivables Index (DSRI)
  const recSalesCurr = curr.receivables / curr.revenue;
  const recSalesPrev = prev.receivables / prev.revenue;
  const dsri = recSalesPrev > EPSILON ? Number((recSalesCurr / recSalesPrev).toFixed(3)) : 1.0;

  // 2. Gross Margin Index (GMI)
  const gmCurr = (curr.revenue - curr.cogs) / curr.revenue;
  const gmPrev = (prev.revenue - prev.cogs) / prev.revenue;
  const gmi = gmCurr > EPSILON ? Number(Math.min(5.0, Math.max(0.1, gmPrev / gmCurr)).toFixed(3)) : 1.0;

  // 3. Asset Quality Index (AQI)
  // Non-current assets other than PP&E and securities / total assets
  const nonCurrCurr = 1.0 - ((curr.current_assets + curr.ppe_net + (curr.securities || 0)) / curr.total_assets);
  const nonCurrPrev = 1.0 - ((prev.current_assets + prev.ppe_net + (prev.securities || 0)) / prev.total_assets);
  const aqi = nonCurrPrev > EPSILON ? Number(Math.min(5.0, Math.max(0.1, nonCurrCurr / nonCurrPrev)).toFixed(3)) : 1.0;

  // 4. Sales Growth Index (SGI)
  const sgi = Number(Math.min(5.0, Math.max(0.1, curr.revenue / prev.revenue)).toFixed(3));

  // 5. Depreciation Index (DEPI)
  const deprRateCurr = curr.depreciation / Math.max(EPSILON, curr.ppe_net + curr.depreciation);
  const deprRatePrev = prev.depreciation / Math.max(EPSILON, prev.ppe_net + prev.depreciation);
  const depi = deprRateCurr > EPSILON ? Number(Math.min(5.0, Math.max(0.1, deprRatePrev / deprRateCurr)).toFixed(3)) : 1.0;

  // 6. Sales, General and Administrative expenses Index (SGAI)
  const sgaCurr = curr.sga_expenses / curr.revenue;
  const sgaPrev = prev.sga_expenses / prev.revenue;
  const sgai = sgaPrev > EPSILON ? Number(Math.min(5.0, Math.max(0.1, sgaCurr / sgaPrev)).toFixed(3)) : 1.0;

  // 7. Total Accruals to Total Assets (TATA)
  const totalAccruals = curr.net_income - curr.operating_cash_flow;
  const tata = Number((totalAccruals / curr.total_assets).toFixed(4));

  // 8. Leverage Index (LVGI)
  const levCurr = curr.total_debt / curr.total_assets;
  const levPrev = prev.total_debt / prev.total_assets;
  const lvgi = levPrev > EPSILON ? Number(Math.min(5.0, Math.max(0.1, levCurr / levPrev)).toFixed(3)) : 1.0;

  const mScore = Number((
    -4.84 +
    (0.920 * dsri) +
    (0.528 * gmi) +
    (0.404 * aqi) +
    (0.892 * sgi) +
    (0.115 * depi) -
    (0.172 * sgai) +
    (4.679 * tata) -
    (0.327 * lvgi)
  ).toFixed(2));

  const status = mScore > -1.78 ? 'POTENTIAL_MANIPULATOR' : 'NON_MANIPULATOR';

  return {
    mScore,
    dsri, gmi, aqi, sgi, depi, sgai, tata, lvgi,
    status,
    threshold: -1.78,
    notes: status === 'POTENTIAL_MANIPULATOR'
      ? `M-Score of ${mScore} is greater than -1.78 cutoff; indicates aggressive revenue/accrual distortion.`
      : `M-Score of ${mScore} is below -1.78 cutoff; non-manipulator pattern.`
  };
}

/**
 * Piotroski 9-Criteria F-Score Model (Piotroski 2000)
 * Evaluates Profitability (4 pts), Leverage/Liquidity (3 pts), Operating Efficiency (2 pts).
 * Score 0-9: 8-9 Strong, 4-7 Moderate, 0-3 Weak.
 */
function calculatePiotroskiFScore(curr, prev) {
  if (curr.total_assets <= 0) {
    return { score: null, status: 'UNAVAILABLE', breakdown: {}, notes: 'Invalid assets.' };
  }

  // 1. ROA > 0
  const roaCurr = curr.net_income / curr.total_assets;
  const fRoa = roaCurr > 0 ? 1 : 0;

  // 2. CFO > 0
  const fCfo = curr.operating_cash_flow > 0 ? 1 : 0;

  // 3. Delta ROA > 0
  const roaPrev = prev && prev.total_assets > 0 ? prev.net_income / prev.total_assets : 0;
  const fDeltaRoa = roaCurr > roaPrev ? 1 : 0;

  // 4. Accrual: CFO > Net Income
  const fAccrual = curr.operating_cash_flow > curr.net_income ? 1 : 0;

  // 5. Delta Leverage: Long term debt ratio decreased
  const levCurr = curr.total_debt / curr.total_assets;
  const levPrev = prev && prev.total_assets > 0 ? prev.total_debt / prev.total_assets : levCurr;
  const fDeltaLever = levCurr <= levPrev ? 1 : 0;

  // 6. Delta Liquidity: Current ratio increased
  const crCurr = curr.current_liabilities > 0 ? curr.current_assets / curr.current_liabilities : 1.0;
  const crPrev = prev && prev.current_liabilities > 0 ? prev.current_assets / prev.current_liabilities : crCurr;
  const fDeltaLiquid = crCurr >= crPrev ? 1 : 0;

  // 7. Equity Offering: No new shares issued
  const fEqOffer = prev ? (curr.common_shares_outstanding <= prev.common_shares_outstanding ? 1 : 0) : 1;

  // 8. Delta Gross Margin
  const gmCurr = curr.revenue > 0 ? (curr.revenue - curr.cogs) / curr.revenue : 0;
  const gmPrev = prev && prev.revenue > 0 ? (prev.revenue - prev.cogs) / prev.revenue : gmCurr;
  const fDeltaMargin = gmCurr >= gmPrev ? 1 : 0;

  // 9. Delta Asset Turnover
  const turnCurr = curr.revenue / curr.total_assets;
  const turnPrev = prev && prev.total_assets > 0 ? prev.revenue / prev.total_assets : turnCurr;
  const fDeltaTurn = turnCurr >= turnPrev ? 1 : 0;

  const totalScore = fRoa + fCfo + fDeltaRoa + fAccrual + fDeltaLever + fDeltaLiquid + fEqOffer + fDeltaMargin + fDeltaTurn;
  const status = totalScore >= 7 ? 'STRONG' : (totalScore >= 4 ? 'MODERATE' : 'WEAK');

  return {
    score: totalScore,
    status,
    breakdown: {
      fRoa, fCfo, fDeltaRoa, fAccrual, fDeltaLever, fDeltaLiquid, fEqOffer, fDeltaMargin, fDeltaTurn
    },
    notes: `Piotroski F-Score: ${totalScore}/9 (${status}).`
  };
}

/**
 * Altman Z''-Score Model for Emerging Markets / Non-Manufacturers
 * Z'' = 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4
 * X1 = Working Capital / Total Assets
 * X2 = Retained Earnings / Total Assets
 * X3 = EBIT / Total Assets
 * X4 = Book Value of Equity / Total Liabilities
 * Cutoffs: Z'' < 1.1 -> Distress, 1.1 <= Z'' <= 2.6 -> Grey, Z'' > 2.6 -> Safe.
 */
function calculateAltmanZScore(curr, sectorCode) {
  if (sectorCode === 'NBFC' || sectorCode === 'FIN') {
    return {
      zScore: null,
      x1WorkingCapital: 0, x2RetainedEarnings: 0, x3Ebit: 0, x4BookEquity: 0,
      status: 'EXCLUDED_FINANCIAL_SECTOR',
      notes: 'Altman Z\'\' model is not applicable to NBFC / Financial institutions due to regulatory capital structuring.'
    };
  }

  if (curr.total_assets <= 0 || curr.total_liabilities <= 0) {
    return {
      zScore: null,
      x1WorkingCapital: 0, x2RetainedEarnings: 0, x3Ebit: 0, x4BookEquity: 0,
      status: 'UNAVAILABLE',
      notes: 'Non-positive assets or liabilities.'
    };
  }

  const workingCapital = curr.current_assets - curr.current_liabilities;
  const x1 = workingCapital / curr.total_assets;
  const x2 = curr.retained_earnings / curr.total_assets;
  const x3 = curr.ebit / curr.total_assets;
  const x4 = curr.book_equity / curr.total_liabilities;

  const zScore = Number((
    (6.56 * x1) +
    (3.26 * x2) +
    (6.72 * x3) +
    (1.05 * x4)
  ).toFixed(2));

  let status = 'SAFE';
  if (zScore < 1.10) {
    status = 'DISTRESS';
  } else if (zScore <= 2.60) {
    status = 'GREY';
  }

  return {
    zScore,
    x1WorkingCapital: Number(x1.toFixed(3)),
    x2RetainedEarnings: Number(x2.toFixed(3)),
    x3Ebit: Number(x3.toFixed(3)),
    x4BookEquity: Number(x4.toFixed(3)),
    status,
    notes: `Altman Z''-Score: ${zScore} (${status}). Cutoffs: <1.1 Distress, 1.1-2.6 Grey, >2.6 Safe.`
  };
}

/**
 * 5% Alert Capacity Constraint Calculator
 * In credit operations, banks can deeply review only a small fraction of borrowers (5% budget).
 */
function calculateAlertCapacityCap(portfolioSize) {
  return Math.max(1, Math.floor(portfolioSize * 0.05));
}

module.exports = {
  calculateBeneishMScore,
  calculatePiotroskiFScore,
  calculateAltmanZScore,
  calculateAlertCapacityCap
};
