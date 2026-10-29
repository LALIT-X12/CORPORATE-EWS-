// Multi-Modal Audit Evidence Reconciliation Engine
// Addresses GAP 3: Disregard for Multi-Modal Audit Evidence

const { getAll, getRow, runQuery } = require('../db/database');

/**
 * Get all documents and extracted claims for a company or for the whole portfolio
 */
async function getCompanyEvidence(companyId) {
  let docsQuery = `SELECT * FROM evidence_documents`;
  let claimsQuery = `SELECT c.*, d.title as doc_title, d.document_type
                     FROM evidence_claims c
                     JOIN evidence_documents d ON c.document_id = d.document_id`;
  const params = [];

  if (companyId) {
    docsQuery += ` WHERE company_id = ?`;
    claimsQuery += ` WHERE c.company_id = ?`;
    params.push(companyId);
  }

  const documents = await getAll(docsQuery, params);
  const claims = await getAll(claimsQuery, params);

  // Compute summary stats
  const totalClaims = claims.length;
  const matches = claims.filter(c => c.reconciliation_status === 'MATCH').length;
  const mismatches = claims.filter(c => c.reconciliation_status !== 'MATCH').length;
  const flaggedFrauds = claims.filter(c => c.verification_status === 'FLAGGED_FRAUD').length;
  const verifiedCorrect = claims.filter(c => c.verification_status === 'VERIFIED_CORRECT').length;
  const pendingReview = claims.filter(c => c.verification_status === 'AWAITING_VERIFICATION').length;

  return {
    companyId,
    stats: {
      totalDocuments: documents.length,
      totalClaims,
      matches,
      mismatches,
      flaggedFrauds,
      verifiedCorrect,
      pendingReview,
      discrepancyRatePct: totalClaims > 0 ? Number(((mismatches / totalClaims) * 100).toFixed(1)) : 0
    },
    documents,
    claims
  };
}

/**
 * Update verification status of a claim (human-in-the-loop audit verification)
 */
async function updateClaimVerification(claimId, status, verifiedBy) {
  const verifiedAt = new Date().toISOString();
  await runQuery(
    `UPDATE evidence_claims
     SET verification_status = ?, verified_by = ?, verified_at = ?
     WHERE claim_id = ?`,
    [status, verifiedBy || 'Credit Risk Specialist', verifiedAt, claimId]
  );

  return getRow(`SELECT * FROM evidence_claims WHERE claim_id = ?`, [claimId]);
}

/**
 * Simulate upload and extraction of an audit filing document
 */
async function uploadAndExtractFiling(companyId, docData) {
  const documentId = `doc-${Date.now()}`;
  const title = docData.title || 'Audited Financial Disclosure Note';
  const docType = docData.documentType || 'AUDITOR_CARO_REPORT';
  const filingDate = docData.filingDate || new Date().toISOString().split('T')[0];
  const fileHash = `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

  await runQuery(
    `INSERT INTO evidence_documents (document_id, company_id, document_type, title, filing_date, storage_ref, file_hash, processing_status, summary_findings)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [documentId, companyId, docType, title, filingDate, `/uploads/${documentId}.pdf`, fileHash, 'EXTRACTED', docData.findings || 'Extracted new audit disclosures from uploaded PDF.']
  );

  // If claimed values provided, insert extracted claim
  if (docData.claim) {
    const cl = docData.claim;
    const claimId = `claim-${Date.now()}`;
    const discrepancyAmount = Math.abs(cl.claimedValue - cl.structuredValue);
    const discrepancyPct = cl.structuredValue > 0 ? Number(((discrepancyAmount / cl.structuredValue) * 100).toFixed(1)) : 100.0;
    const reconciliationStatus = discrepancyPct > 10.0 ? 'OFF_BALANCE_SHEET_DIVERGENCE' : 'MATCH';

    await runQuery(
      `INSERT INTO evidence_claims (claim_id, document_id, company_id, metric_name, claimed_value, structured_value, discrepancy_amount, discrepancy_pct, unit_scale, fiscal_period, page_number, table_ref, extraction_confidence, reconciliation_status, verification_status, context_snippet)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [claimId, documentId, companyId, cl.metricName, cl.claimedValue, cl.structuredValue, discrepancyAmount, discrepancyPct, 'CRORES', cl.fiscalPeriod || 'FY 2023-24', cl.pageNumber || 12, cl.tableRef || 'Note to Accounts', 0.95, reconciliationStatus, 'AWAITING_VERIFICATION', cl.snippet || 'Extracted disclosure text from document page.']
    );
  }

  return getCompanyEvidence(companyId);
}

module.exports = {
  getCompanyEvidence,
  updateClaimVerification,
  uploadAndExtractFiling
};
