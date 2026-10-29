-- Corporate Early Warning System Database Schema
-- Canonical borrower tracking, multi-period financials, relational graph, multi-modal evidence, and benchmark datasets

CREATE TABLE IF NOT EXISTS benchmark_datasets (
    dataset_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    origin_country TEXT NOT NULL,
    sample_size INTEGER NOT NULL,
    feature_count INTEGER NOT NULL,
    default_rate REAL NOT NULL,
    source_url TEXT,
    description TEXT,
    summary_metrics_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS benchmark_samples (
    sample_id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    horizon_year INTEGER NOT NULL,
    company_identifier TEXT NOT NULL,
    is_bankrupt INTEGER NOT NULL,
    ratios_json TEXT NOT NULL,
    predicted_risk REAL,
    FOREIGN KEY (dataset_id) REFERENCES benchmark_datasets(dataset_id)
);

CREATE TABLE IF NOT EXISTS companies (
    company_id TEXT PRIMARY KEY,
    cin TEXT NOT NULL UNIQUE,
    legal_name TEXT NOT NULL,
    trade_name TEXT NOT NULL,
    sector_code TEXT NOT NULL,
    industry_name TEXT NOT NULL,
    listing_status TEXT NOT NULL DEFAULT 'LISTED',
    peer_group_id TEXT NOT NULL,
    is_defaulted INTEGER NOT NULL DEFAULT 0,
    default_event_date TEXT,
    distress_type TEXT,
    market_cap_crores REAL DEFAULT 0.0,
    credit_rating TEXT DEFAULT 'CRISIL BBB'
);

CREATE TABLE IF NOT EXISTS financial_periods (
    period_id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER NOT NULL, -- 0 for Annual, 1..4 for Quarters
    period_end_date TEXT NOT NULL,
    filing_date TEXT NOT NULL,
    publicly_available_at TEXT NOT NULL,
    statement_version INTEGER DEFAULT 1,
    is_consolidated INTEGER DEFAULT 1,
    currency TEXT DEFAULT 'INR',
    unit_scale TEXT DEFAULT 'CRORES',
    revenue REAL NOT NULL,
    cogs REAL NOT NULL,
    ebit REAL NOT NULL,
    net_income REAL NOT NULL,
    total_assets REAL NOT NULL,
    current_assets REAL NOT NULL,
    current_liabilities REAL NOT NULL,
    total_liabilities REAL NOT NULL,
    total_debt REAL NOT NULL,
    operating_cash_flow REAL NOT NULL,
    retained_earnings REAL NOT NULL,
    receivables REAL NOT NULL,
    depreciation REAL NOT NULL,
    sga_expenses REAL NOT NULL,
    ppe_net REAL NOT NULL,
    securities REAL DEFAULT 0.0,
    common_shares_outstanding REAL NOT NULL,
    book_equity REAL NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS soft_signals (
    signal_id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    signal_type TEXT NOT NULL, -- 'AUDITOR_RESIGNATION', 'PROMOTER_PLEDGE', 'DELAYED_FILING', 'RATING_DOWNGRADE', 'WHISTLEBLOWER'
    severity TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    event_date TEXT NOT NULL,
    source_name TEXT NOT NULL,
    details TEXT NOT NULL,
    verification_status TEXT DEFAULT 'VERIFIED',
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS entity_relationships (
    relationship_id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    source_entity_name TEXT NOT NULL,
    target_entity_name TEXT NOT NULL,
    target_entity_type TEXT NOT NULL, -- 'INDIVIDUAL_PROMOTER', 'AUDITOR_FIRM', 'LENDER', 'SUBSIDIARY_SPV', 'SHELL_COUNTERPARTY'
    relationship_type TEXT NOT NULL, -- 'COMMON_DIRECTOR', 'SHARED_PROMOTER', 'COMMON_AUDITOR', 'ROUND_TRIPPING_FLOW', 'CROSS_GUARANTEE', 'DISTRESSED_SPV_LINK'
    valid_from TEXT NOT NULL,
    valid_to TEXT,
    confidence REAL DEFAULT 1.0,
    verification_status TEXT DEFAULT 'VERIFIED',
    is_distressed_link INTEGER DEFAULT 0,
    distress_details TEXT,
    path_description TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS evidence_documents (
    document_id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'ANNUAL_REPORT', 'AUDITOR_CARO_REPORT', 'RATING_RATIONALE', 'FORENSIC_AUDIT_EXCERPT'
    title TEXT NOT NULL,
    filing_date TEXT NOT NULL,
    storage_ref TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    processing_status TEXT DEFAULT 'EXTRACTED',
    summary_findings TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS evidence_claims (
    claim_id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    claimed_value REAL NOT NULL,
    structured_value REAL NOT NULL,
    discrepancy_amount REAL NOT NULL,
    discrepancy_pct REAL NOT NULL,
    unit_scale TEXT DEFAULT 'CRORES',
    fiscal_period TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    table_ref TEXT NOT NULL,
    extraction_confidence REAL NOT NULL,
    reconciliation_status TEXT NOT NULL, -- 'MATCH', 'OFF_BALANCE_SHEET_DIVERGENCE', 'RELATED_PARTY_LOAN_MISMATCH', 'REVENUE_RECOGNITION_DISCREPANCY', 'UNRECORDED_GUARANTEE'
    verification_status TEXT DEFAULT 'AWAITING_VERIFICATION', -- 'AWAITING_VERIFICATION', 'FLAGGED_FRAUD', 'VERIFIED_CORRECT'
    verified_by TEXT,
    verified_at TEXT,
    context_snippet TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES evidence_documents(document_id),
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS risk_assessments (
    assessment_id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    default_probability REAL NOT NULL,
    default_risk_score REAL NOT NULL, -- 0-100
    manipulation_risk_score REAL NOT NULL, -- 0-100
    network_contagion_score REAL NOT NULL, -- 0-100
    evidence_discrepancy_score REAL NOT NULL, -- 0-100
    beneish_m_score REAL,
    beneish_status TEXT NOT NULL, -- 'POTENTIAL_MANIPULATOR', 'NON_MANIPULATOR', 'UNAVAILABLE'
    piotroski_f_score INTEGER,
    piotroski_status TEXT NOT NULL, -- 'STRONG', 'MODERATE', 'WEAK'
    altman_z_score REAL,
    altman_status TEXT NOT NULL, -- 'SAFE', 'GREY', 'DISTRESS', 'EXCLUDED_FINANCIAL_SECTOR'
    sector_adjusted_risk REAL NOT NULL,
    priority_score REAL NOT NULL,
    priority_rank INTEGER NOT NULL,
    alert_selected INTEGER NOT NULL, -- 1 if within top 5% capacity budget, 0 otherwise
    scorable_status TEXT DEFAULT 'SCORED',
    top_risk_drivers TEXT NOT NULL,
    shap_contributions_json TEXT NOT NULL,
    rule_explanations_json TEXT NOT NULL,
    as_of_date TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS review_actions (
    action_id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    analyst_name TEXT NOT NULL,
    disposition TEXT NOT NULL, -- 'ESCALATE_TO_BOARD_RISK_COMMITTEE', 'COMMISSION_FORENSIC_AUDIT', 'ENHANCE_MONITORING_QUARTERLY', 'REJECT_ALERT_FALSE_POSITIVE'
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES risk_assessments(assessment_id),
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE IF NOT EXISTS ablation_experiments (
    experiment_id TEXT PRIMARY KEY,
    experiment_name TEXT NOT NULL,
    configuration TEXT NOT NULL,
    sample_size INTEGER NOT NULL,
    alert_rate_cap REAL NOT NULL DEFAULT 0.05,
    recall_at_5pct REAL NOT NULL,
    precision_at_5pct REAL NOT NULL,
    pr_auc REAL NOT NULL,
    expected_cost_20to1 REAL NOT NULL,
    lead_time_quarters INTEGER NOT NULL,
    question_answered TEXT NOT NULL,
    gap_addressed TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'RISK_ANALYST',
    last_login_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
    inquiry_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    portfolio_scale TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS live_alerts_feed (
    alert_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    source_channel TEXT NOT NULL,
    amount REAL NOT NULL,
    risk_score REAL NOT NULL,
    risk_level TEXT NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
    reasons_json TEXT NOT NULL
);

