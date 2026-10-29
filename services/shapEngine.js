// Explainable AI & Regulatory Policy Engine
// Addresses GAP 2: Black-Box Decisioning in Regulatory Workflows

const { getRow } = require('../db/database');

/**
 * Generate SHAP waterfall feature attributions and regulatory audit dossier
 */
async function getCompanyExplainability(companyId) {
  const assessment = await getRow(
    `SELECT a.*, c.trade_name, c.legal_name, c.cin, c.sector_code, c.is_defaulted
     FROM risk_assessments a
     JOIN companies c ON a.company_id = c.company_id
     WHERE a.company_id = ?
     ORDER BY a.priority_rank ASC LIMIT 1`,
    [companyId]
  );

  if (!assessment) {
    return {
      companyId,
      error: 'No assessment record found for company.'
    };
  }

  let shapFeatures = [];
  try {
    shapFeatures = JSON.parse(assessment.shap_contributions_json || '[]');
  } catch (e) {
    shapFeatures = [];
  }

  let regulatoryRules = [];
  try {
    regulatoryRules = JSON.parse(assessment.rule_explanations_json || '[]');
  } catch (e) {
    regulatoryRules = [];
  }

  // Base expected log-odds (portfolio mean baseline)
  const baseValue = -2.15; // Corresponding to ~10.4% baseline risk
  let currentLogOdds = baseValue;

  const waterfallSteps = [
    {
      step: 0,
      name: 'Baseline Portfolio Risk',
      value: baseValue,
      contribution: 0,
      total: baseValue,
      category: 'BASELINE'
    }
  ];

  shapFeatures.forEach((feat, idx) => {
    currentLogOdds += feat.shapValue;
    waterfallSteps.push({
      step: idx + 1,
      name: feat.displayName || feat.featureName,
      rawFeatureValue: feat.featureValue,
      contribution: feat.shapValue,
      total: Number(currentLogOdds.toFixed(3)),
      category: feat.category,
      isPositive: feat.shapValue > 0
    });
  });

  // Calculate final predicted probability from log-odds
  const finalProbability = Number((1 / (1 + Math.exp(-currentLogOdds))).toFixed(3));

  // Statutory Regulatory Mapping
  const regulatoryDossier = [
    {
      statute: 'RBI Master Circular on EWS & Wilful Defaulters (DBS.CO.PPD.BC.No. /01.01.005/2014-15)',
      clause: 'Indicator #14 & #22: Asset-Liability Mismatch and High Borrower Leverage',
      status: assessment.default_risk_score > 70 ? 'NON_COMPLIANT_BREACH' : 'COMPLIANT',
      finding: `Model detected elevated default probability (${(assessment.default_probability * 100).toFixed(1)}%) with Altman Z'' of ${assessment.altman_z_score || 'N/A'}. Requires special mention account (SMA-2) supervisory classification.`
    },
    {
      statute: 'Companies Act, 2013 - Section 143(12) [Auditor Duty to Report Fraud]',
      clause: 'CARO 2020 Clause (ix) & (xi) - Discrepancy in Bank Borrowing Utilization',
      status: assessment.evidence_discrepancy_score > 60 ? 'ACTIONABLE_FLAG' : 'CLEAN',
      finding: assessment.evidence_discrepancy_score > 60
        ? 'Statutory document reconciliation identified off-balance sheet guarantees or related-party advances exceeding reporting norms.'
        : 'No unrecorded related-party divergences identified in filing claims.'
    },
    {
      statute: 'Beneish Forensic Manipulation Standard (Beneish 1999)',
      clause: '8-Variable Earnings Manipulation Index (Cutoff: > -1.78)',
      status: assessment.beneish_m_score && assessment.beneish_m_score > -1.78 ? 'MANIPULATION_DETECTED' : 'SAFE_ACCRUALS',
      finding: `Calculated M-Score: ${assessment.beneish_m_score || 'N/A'}. ${assessment.beneish_status === 'POTENTIAL_MANIPULATOR' ? 'Exceeds -1.78 threshold; uncovers revenue inflation or abnormal accruals.' : 'Below threshold.'}`
    },
    {
      statute: 'SEBI (LODR) Regulations, 2015 - Regulation 33 & 52',
      clause: 'Promoter Share Pledging and Timely Disclosure of Debt Securities',
      status: assessment.network_contagion_score > 70 ? 'HIGH_CONTAGION_RISK' : 'NORMAL',
      finding: `Network contagion score of ${assessment.network_contagion_score}/100. Entity graph indicates cross-guarantees or circular funding links across subsidiary SPVs.`
    }
  ];

  return {
    companyId,
    legalName: assessment.legal_name,
    tradeName: assessment.trade_name,
    cin: assessment.cin,
    priorityRank: assessment.priority_rank,
    priorityScore: assessment.priority_score,
    alertSelected: assessment.alert_selected === 1,
    baseValue,
    finalLogOdds: Number(currentLogOdds.toFixed(3)),
    finalProbability,
    topRiskDrivers: assessment.top_risk_drivers,
    shapFeatures,
    waterfallSteps,
    regulatoryRules,
    regulatoryDossier
  };
}

module.exports = {
  getCompanyExplainability
};
