const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const seedData = require('./seedData');

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'corporate_ews.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    console.log(`Connected to Corporate EWS SQLite database at: ${DB_PATH}`);
  }
});

// Promisified helper methods
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Database Initialization & Seeding
async function initializeDatabase() {
  try {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    // Execute schema statements in serial order
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await runQuery(statement);
    }

    // Check if companies table is empty
    const companyCountRow = await getRow('SELECT COUNT(*) as cnt FROM companies');
    if (companyCountRow && companyCountRow.cnt === 0) {
      console.log('Seeding initial Corporate EWS database with Benchmark datasets, 40 Indian companies, relational webs, and multi-modal claims...');
      await seedDatabase();
      console.log('Database seeded successfully.');
    } else {
      console.log(`Database already populated with ${companyCountRow.cnt} companies.`);
    }

    // Ensure users table is populated
    const userCountRow = await getRow('SELECT COUNT(*) as cnt FROM users');
    if (userCountRow && userCountRow.cnt === 0 && seedData.users) {
      for (const u of seedData.users) {
        await runQuery(
          `INSERT OR REPLACE INTO users (user_id, email, password_hash, full_name, institution_name, role, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [u.user_id, u.email, u.password_hash, u.full_name, u.institution_name, u.role, u.created_at]
        );
      }
      console.log('Seeded initial users.');
    }

    // Ensure live_alerts_feed is populated
    const alertCountRow = await getRow('SELECT COUNT(*) as cnt FROM live_alerts_feed');
    if (alertCountRow && alertCountRow.cnt === 0 && seedData.liveAlerts) {
      for (const alt of seedData.liveAlerts) {
        await runQuery(
          `INSERT OR REPLACE INTO live_alerts_feed (alert_id, timestamp, source_channel, amount, risk_score, risk_level, reasons_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [alt.alert_id, alt.timestamp, alt.source_channel, alt.amount, alt.risk_score, alt.risk_level, alt.reasons_json]
        );
      }
      console.log('Seeded live alerts feed.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function seedDatabase() {
  // 1. Benchmark Datasets
  for (const ds of seedData.benchmarkDatasets) {
    await runQuery(
      `INSERT OR REPLACE INTO benchmark_datasets (dataset_id, name, origin_country, sample_size, feature_count, default_rate, source_url, description, summary_metrics_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ds.dataset_id, ds.name, ds.origin_country, ds.sample_size, ds.feature_count, ds.default_rate, ds.source_url, ds.description, ds.summary_metrics_json]
    );
  }

  // 2. Companies
  for (const c of seedData.companies) {
    await runQuery(
      `INSERT OR REPLACE INTO companies (company_id, cin, legal_name, trade_name, sector_code, industry_name, listing_status, peer_group_id, is_defaulted, default_event_date, distress_type, market_cap_crores, credit_rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.company_id, c.cin, c.legal_name, c.trade_name, c.sector_code, c.industry_name, c.listing_status, c.peer_group_id, c.is_defaulted, c.default_event_date || null, c.distress_type || null, c.market_cap_crores || 0.0, c.credit_rating || 'CRISIL BBB']
    );
  }

  // 3. Financial Periods
  for (const p of seedData.financialPeriods) {
    await runQuery(
      `INSERT OR REPLACE INTO financial_periods (period_id, company_id, fiscal_year, fiscal_quarter, period_end_date, filing_date, publicly_available_at, statement_version, is_consolidated, currency, unit_scale, revenue, cogs, ebit, net_income, total_assets, current_assets, current_liabilities, total_liabilities, total_debt, operating_cash_flow, retained_earnings, receivables, depreciation, sga_expenses, ppe_net, securities, common_shares_outstanding, book_equity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.period_id, p.company_id, p.fiscal_year, p.fiscal_quarter, p.period_end_date, p.filing_date, p.publicly_available_at, p.statement_version, p.is_consolidated, p.currency, p.unit_scale, p.revenue, p.cogs, p.ebit, p.net_income, p.total_assets, p.current_assets, p.current_liabilities, p.total_liabilities, p.total_debt, p.operating_cash_flow, p.retained_earnings, p.receivables, p.depreciation, p.sga_expenses, p.ppe_net, p.securities, p.common_shares_outstanding, p.book_equity]
    );
  }

  // Generate synthetic baseline financial periods for the other 36 companies so all 40 have calculated metrics
  const existingCompanyIds = new Set(seedData.financialPeriods.map(p => p.company_id));
  for (const c of seedData.companies) {
    if (!existingCompanyIds.has(c.company_id)) {
      const isDef = c.is_defaulted === 1;
      const baseRev = isDef ? (5000 + Math.random() * 15000) : (15000 + Math.random() * 50000);
      const totalAssets = isDef ? (baseRev * 1.8) : (baseRev * 1.5);
      const totalDebt = isDef ? (totalAssets * 0.85) : (totalAssets * 0.35);
      const netIncome = isDef ? (-baseRev * (0.05 + Math.random() * 0.15)) : (baseRev * (0.06 + Math.random() * 0.10));
      const ocf = isDef ? (-baseRev * (0.04 + Math.random() * 0.08)) : (baseRev * (0.08 + Math.random() * 0.12));
      const bookEquity = totalAssets - (totalDebt * 1.15);

      await runQuery(
        `INSERT OR REPLACE INTO financial_periods (period_id, company_id, fiscal_year, fiscal_quarter, period_end_date, filing_date, publicly_available_at, statement_version, is_consolidated, currency, unit_scale, revenue, cogs, ebit, net_income, total_assets, current_assets, current_liabilities, total_liabilities, total_debt, operating_cash_flow, retained_earnings, receivables, depreciation, sga_expenses, ppe_net, securities, common_shares_outstanding, book_equity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `p-auto-${c.company_id}-2023`,
          c.company_id,
          2023,
          0,
          '2023-03-31',
          '2023-06-30',
          '2023-06-30T18:00:00Z',
          1,
          1,
          'INR',
          'CRORES',
          Number(baseRev.toFixed(1)),
          Number((baseRev * 0.72).toFixed(1)),
          Number((netIncome * 1.4).toFixed(1)),
          Number(netIncome.toFixed(1)),
          Number(totalAssets.toFixed(1)),
          Number((totalAssets * 0.35).toFixed(1)),
          Number((totalAssets * (isDef ? 0.48 : 0.25)).toFixed(1)),
          Number((totalDebt * 1.15).toFixed(1)),
          Number(totalDebt.toFixed(1)),
          Number(ocf.toFixed(1)),
          Number((totalAssets * (isDef ? -0.05 : 0.25)).toFixed(1)),
          Number((baseRev * 0.18).toFixed(1)),
          Number((baseRev * 0.04).toFixed(1)),
          Number((baseRev * 0.12).toFixed(1)),
          Number((totalAssets * 0.45).toFixed(1)),
          Number((totalAssets * 0.05).toFixed(1)),
          100.0,
          Number(bookEquity.toFixed(1))
        ]
      );
    }
  }

  // 4. Soft Signals
  for (const s of seedData.softSignals) {
    await runQuery(
      `INSERT OR REPLACE INTO soft_signals (signal_id, company_id, signal_type, severity, event_date, source_name, details, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.signal_id, s.company_id, s.signal_type, s.severity, s.event_date, s.source_name, s.details, s.verification_status]
    );
  }

  // 5. Entity Relationships
  for (const r of seedData.entityRelationships) {
    await runQuery(
      `INSERT OR REPLACE INTO entity_relationships (relationship_id, company_id, source_entity_name, target_entity_name, target_entity_type, relationship_type, valid_from, valid_to, confidence, verification_status, is_distressed_link, distress_details, path_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.relationship_id, r.company_id, r.source_entity_name, r.target_entity_name, r.target_entity_type, r.relationship_type, r.valid_from, r.valid_to || null, r.confidence, r.verification_status, r.is_distressed_link, r.distress_details, r.path_description]
    );
  }

  // 6. Evidence Documents & Claims
  for (const d of seedData.evidenceDocuments) {
    await runQuery(
      `INSERT OR REPLACE INTO evidence_documents (document_id, company_id, document_type, title, filing_date, storage_ref, file_hash, processing_status, summary_findings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.document_id, d.company_id, d.document_type, d.title, d.filing_date, d.storage_ref, d.file_hash, d.processing_status, d.summary_findings]
    );
  }

  for (const cl of seedData.evidenceClaims) {
    await runQuery(
      `INSERT OR REPLACE INTO evidence_claims (claim_id, document_id, company_id, metric_name, claimed_value, structured_value, discrepancy_amount, discrepancy_pct, unit_scale, fiscal_period, page_number, table_ref, extraction_confidence, reconciliation_status, verification_status, verified_by, verified_at, context_snippet)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cl.claim_id, cl.document_id, cl.company_id, cl.metric_name, cl.claimed_value, cl.structured_value, cl.discrepancy_amount, cl.discrepancy_pct, cl.unit_scale, cl.fiscal_period, cl.page_number, cl.table_ref, cl.extraction_confidence, cl.reconciliation_status, cl.verification_status, cl.verified_by, cl.verified_at, cl.context_snippet]
    );
  }

  // 7. Risk Assessments
  for (const a of seedData.riskAssessments) {
    await runQuery(
      `INSERT OR REPLACE INTO risk_assessments (assessment_id, run_id, company_id, default_probability, default_risk_score, manipulation_risk_score, network_contagion_score, evidence_discrepancy_score, beneish_m_score, beneish_status, piotroski_f_score, piotroski_status, altman_z_score, altman_status, sector_adjusted_risk, priority_score, priority_rank, alert_selected, scorable_status, top_risk_drivers, shap_contributions_json, rule_explanations_json, as_of_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.assessment_id, a.run_id, a.company_id, a.default_probability, a.default_risk_score, a.manipulation_risk_score, a.network_contagion_score, a.evidence_discrepancy_score, a.beneish_m_score, a.beneish_status, a.piotroski_f_score, a.piotroski_status, a.altman_z_score, a.altman_status, a.sector_adjusted_risk, a.priority_score, a.priority_rank, a.alert_selected, a.scorable_status, a.top_risk_drivers, a.shap_contributions_json, a.ruleExplanations_json, a.as_of_date]
    );
  }

  // Seed risk assessments for the other companies in ranked order
  const existingAssessmentCompanyIds = new Set(seedData.riskAssessments.map(a => a.company_id));
  let rankCounter = 4;
  for (const c of seedData.companies) {
    if (!existingAssessmentCompanyIds.has(c.company_id)) {
      const isDef = c.is_defaulted === 1;
      const defProb = isDef ? (0.75 + Math.random() * 0.18) : (0.02 + Math.random() * 0.15);
      const defScore = Number((defProb * 100).toFixed(1));
      const manipScore = isDef ? Number((65 + Math.random() * 25).toFixed(1)) : Number((10 + Math.random() * 20).toFixed(1));
      const networkScore = isDef ? Number((70 + Math.random() * 20).toFixed(1)) : Number((10 + Math.random() * 25).toFixed(1));
      const evidenceScore = isDef ? Number((60 + Math.random() * 30).toFixed(1)) : Number((5 + Math.random() * 15).toFixed(1));
      const beneish = isDef ? Number((-1.65 + Math.random() * 0.8).toFixed(2)) : Number((-2.4 - Math.random() * 1.0).toFixed(2));
      const beneishStatus = beneish > -1.78 ? 'POTENTIAL_MANIPULATOR' : 'NON_MANIPULATOR';
      const piotroski = isDef ? (1 + Math.floor(Math.random() * 3)) : (6 + Math.floor(Math.random() * 4));
      const piotroskiStatus = piotroski >= 7 ? 'STRONG' : (piotroski >= 4 ? 'MODERATE' : 'WEAK');
      const altman = isDef ? Number((0.2 + Math.random() * 0.7).toFixed(2)) : Number((2.8 + Math.random() * 2.5).toFixed(2));
      const altmanStatus = altman < 1.1 ? 'DISTRESS' : (altman < 2.6 ? 'GREY' : 'SAFE');
      const priorityScore = Number(((defScore * 0.4) + (manipScore * 0.25) + (networkScore * 0.2) + (evidenceScore * 0.15)).toFixed(1));

      // 5% alert budget: only rank 1 and 2 are alert_selected=1
      const isAlert = false;

      await runQuery(
        `INSERT OR REPLACE INTO risk_assessments (assessment_id, run_id, company_id, default_probability, default_risk_score, manipulation_risk_score, network_contagion_score, evidence_discrepancy_score, beneish_m_score, beneish_status, piotroski_f_score, piotroski_status, altman_z_score, altman_status, sector_adjusted_risk, priority_score, priority_rank, alert_selected, scorable_status, top_risk_drivers, shap_contributions_json, rule_explanations_json, as_of_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `ass-auto-${c.company_id}`,
          'run-2026-q3',
          c.company_id,
          Number(defProb.toFixed(3)),
          defScore,
          manipScore,
          networkScore,
          evidenceScore,
          beneish,
          beneishStatus,
          piotroski,
          piotroskiStatus,
          altman,
          altmanStatus,
          priorityScore,
          priorityScore,
          rankCounter++,
          isAlert ? 1 : 0,
          'SCORED',
          isDef ? 'High Leverage, Cash Flow Drain, Sector Contagion' : 'Positive OCF, Safe Leverage, Robust Liquidity Cushion',
          JSON.stringify([
            { featureName: 'altman_z', displayName: 'Altman Z\'\' Ratio', featureValue: altman, shapValue: isDef ? 0.75 : -0.65, category: 'LEVERAGE' },
            { featureName: 'beneish_m', displayName: 'Beneish M Score', featureValue: beneish, shapValue: isDef ? 0.62 : -0.45, category: 'PROFITABILITY' },
            { featureName: 'piotroski_f', displayName: 'Piotroski F Score', featureValue: piotroski, shapValue: isDef ? 0.58 : -0.52, category: 'PROFITABILITY' }
          ]),
          JSON.stringify([
            isDef ? 'RULE-WARN: Elevated default probability and weak financial health.' : 'RULE-SAFE: Adequate capital cushion and positive cash flows.'
          ]),
          '2026-09-30'
        ]
      );
    }
  }

  // 8. Ablation Experiments
  for (const exp of seedData.ablationExperiments) {
    await runQuery(
      `INSERT OR REPLACE INTO ablation_experiments (experiment_id, experiment_name, configuration, sample_size, alert_rate_cap, recall_at_5pct, precision_at_5pct, pr_auc, expected_cost_20to1, lead_time_quarters, question_answered, gap_addressed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [exp.experiment_id, exp.experiment_name, exp.configuration, exp.sample_size, exp.alert_rate_cap, exp.recall_at_5pct, exp.precision_at_5pct, exp.pr_auc, exp.expected_cost_20to1, exp.lead_time_quarters, exp.question_answered, exp.gap_addressed]
    );
  }

  // 9. Review Actions
  for (const act of seedData.reviewActions) {
    await runQuery(
      `INSERT OR REPLACE INTO review_actions (action_id, assessment_id, company_id, analyst_name, disposition, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [act.action_id, act.assessment_id, act.company_id, act.analyst_name, act.disposition, act.notes, act.created_at]
    );
  }

  // 10. Users
  if (seedData.users) {
    for (const u of seedData.users) {
      await runQuery(
        `INSERT OR REPLACE INTO users (user_id, email, password_hash, full_name, institution_name, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.user_id, u.email, u.password_hash, u.full_name, u.institution_name, u.role, u.created_at]
      );
    }
  }

  // 11. Live Alerts Feed
  if (seedData.liveAlerts) {
    for (const alt of seedData.liveAlerts) {
      await runQuery(
        `INSERT OR REPLACE INTO live_alerts_feed (alert_id, timestamp, source_channel, amount, risk_score, risk_level, reasons_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [alt.alert_id, alt.timestamp, alt.source_channel, alt.amount, alt.risk_score, alt.risk_level, alt.reasons_json]
      );
    }
  }
}


module.exports = {
  db,
  runQuery,
  getRow,
  getAll,
  initializeDatabase
};
