# Corporate Early-Warning System (EWS) for Corporate Default and Financial Manipulation

An explainable, banking-grade Early-Warning System (EWS) designed to predict corporate distress, debt default, and accounting manipulation **at least four quarters ahead** under a strict **5% operational alert budget constraint**.

---

## 🏛️ Problem Statement & Gaps Addressed

Banks and credit committees can deeply review only a small fraction of borrowers (**5% operational alert budget**), while legacy monitoring detects distress too late, overlooks accounting-manipulation signals, and provides black-box scores with limited regulatory explainability.

This project recreates the entire system as a modern, hostable full-stack web application powered by a real SQLite benchmark database, directly addressing all **4 critical industry gaps**:

| Industry Gap | Legacy System Limitation | Our Solution in Corporate EWS |
| :--- | :--- | :--- |
| **Gap 1: Inability to Capture Relational Fraud Structures** | Evaluates borrowers in isolation; misses circular round-tripping, shared promoters, and covert SPV cross-guarantees. | **Relational Fraud Graph & Contagion Engine**: Interactive D3/SVG network visualizer mapping shared promoters (e.g. Wadhawan / DHFL), common directors, 25 shell SPVs (Bandra Books), and cross-guarantee contagion scores (0-100). |
| **Gap 2: Black-Box Decisioning in Regulatory Workflows** | Fraud alerts fail to show investigators which evidence contributed to risk or how it maps to regulatory mandates. | **Dual Explainability & Regulatory Policy Engine**: SHAP waterfall feature attributions (marginal log-odds across Liquidity, Leverage, Profitability, Governance, Network) + Statutory Audit Dossier mapped to **RBI EWS Circular**, **Companies Act 2013 Sec 143(12)**, and **CARO 2020**. |
| **Gap 3: Disregard for Multi-Modal Audit Evidence** | Overlooks inconsistencies between transactions/structured balance sheets and unstructured filing notes. | **Multi-Modal Audit Evidence Reconciliation Studio**: Extracts unstructured text from Annual Report Notes, CARO disclosures, and Rating agency releases; computes side-by-side diffs against database records (e.g., ₹26,850 Cr unrecorded related-party loans); enables one-click auditor verification/fraud flagging. |
| **Gap 4: Metric Mismatch in Production** | Models achieve 95% accuracy on imbalanced data while missing a ₹90,000 Cr default (huge False Negative cost) or generating 500 alerts when a team can only review 20. | **Production Asymmetric Loss & 5% Budget Optimizer**: Enforces hard cap at 5% of portfolio ($\lfloor N \times 0.05 \rfloor = 2$ slots out of 40 firms). Employs an asymmetric loss matrix ($C_{FN} : C_{FP} = 20:1$ to $50:1$), Recall@5% alert rate, PR-AUC (0.895), and multi-horizon lead-time curves (T-4 to T-1). |

---

## 📊 Benchmark Database & Real Cohort Validation

The backend integrates an authentic SQLite relational database (`data/corporate_ews.db`) with:

### 1. International Benchmark Datasets
- **UCI Polish Companies Bankruptcy Dataset**: 10,503 firms across 5 annual prediction horizons (Year 1 to Year 5), 64 financial ratios.
- **Taiwan Economic Journal (TEJ) Corporate Bankruptcy Dataset**: 6,819 listed companies, 95 financial features.
- **Benchmark-to-India Transfer Evaluation**: Evaluates covariate shift (Wasserstein distances) and proves why international models require soft signals (promoter pledges, auditor resignations) and relational graph features to achieve 0.895 PR-AUC on Indian debt structures.

### 2. Indian Corporate Validation Cohort (40 Companies)
- **10 Historical Indian Defaulters**:
  1. *Infrastructure Leasing & Financial Services (IL&FS)* — ₹91,091 Cr debt default, 347 SPVs contagion.
  2. *Dewan Housing Finance Corporation (DHFL)* — ₹83,873 Cr IBC default, ₹14,046 Cr Bandra Books siphoning.
  3. *Jet Airways (India) Ltd* — Negative net worth (-₹7,050 Cr), fleet grounding notices.
  4. *Sintex Industries Ltd* — NCLT insolvency default.
  5. *Bhushan Steel Ltd* — ₹44,478 Cr debt, IBC acquisition.
  6. *Cox & Kings Ltd* — Commercial paper default, fake overseas subsidiaries.
  7. *Reliance Communications (RCom)* — ₹46,000 Cr spectrum debt default.
  8. *Jaypee Infratech Ltd* — Expressway toll & real estate delivery failure.
  9. *Amtek Auto Ltd* — Auto forging debt trap.
  10. *ABG Shipyard Ltd* — ₹22,842 Cr circular LC discounting fraud.
- **30 Matched Sector Control Peers** across Infrastructure, NBFC, Aviation, Textiles, Steel, Travel, Telecom, Real Estate, Automotive, and Marine Engineering (e.g., L&T, HDFC, IndiGo, Tata Steel, Bharti Airtel, DLF, Bharat Forge, Cochin Shipyard).

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express 5, SQLite 3 (`sqlite3`), RESTful APIs.
- **Frontend**: Vanilla ES6+ JavaScript, Semantic HTML5, Custom CSS Design System (Dual-Theme: *Midnight Navy* & *White Canvas*, Glassmorphism, Zero framework bloat).
- **Visualization Engines**: Interactive SVG SHAP Waterfall Charts, Lead-Time Curves, Precision-Recall Curves, and Directed SVG Entity Network Graphs.
- **Deployment**: Docker containerization (`Dockerfile`), Render blueprint (`render.yaml`), Vercel/Railway/Heroku/AWS compatibility.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the web application
npm start
```

Open your browser and visit:
👉 **`http://localhost:3000`**

The server will automatically initialize the database schema and populate all benchmark datasets, companies, multi-period statements, and fraud graph edges on first run!

---

## 🌐 Cloud Hosting & Deployment Options

### Option A: Render (1-Click Deployment)
The repository includes `render.yaml`.
1. Push this repo to GitHub.
2. In Render, select **New > Blueprint** and link your repo.
3. Render will deploy the Express server and serve the website with HTTPS automatically.

### Option B: Docker Container
```bash
# Build the container
docker build -t corporate-ews .

# Run the container
docker run -p 3000:3000 corporate-ews
```

### Option C: Railway / Fly.io / Heroku
Simply connect your Git repository and deploy. The `start` script `node server/server.js` and `PORT` environment variable are preconfigured.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and database connection status. |
| `/api/overview` | `GET` | Executive portfolio statistics, 5% capacity meter status, and lead-time summary. |
| `/api/watchlist` | `GET` | Ranked 40 borrowers with sector, alert-status, and search filtering. |
| `/api/companies/:id` | `GET` | Deep borrower dossier with financial statements, soft signals, and reviews. |
| `/api/forensics/calculate` | `POST` | Dynamic calculation of Beneish M-Score, Piotroski F-Score, and Altman Z''. |
| `/api/network/:companyId` | `GET` | **Gap 1**: Relational entity graph nodes, links, and contagion propagation score. |
| `/api/explainability/:companyId` | `GET` | **Gap 2**: SHAP feature attribution waterfall and regulatory compliance dossier. |
| `/api/evidence/:companyId` | `GET` | **Gap 3**: Extracted multi-modal claims vs structured database values. |
| `/api/evidence/verify` | `POST` | **Gap 3**: Human-in-the-loop audit verification (`VERIFIED_CORRECT` / `FLAGGED_FRAUD`). |
| `/api/evidence/upload` | `POST` | **Gap 3**: Upload simulated audit filing and trigger automated discrepancy extraction. |
| `/api/simulator` | `GET` | **Gap 4**: Asymmetric loss simulator ($C_{FN}:C_{FP}$ 5:1 to 50:1) & 5% budget optimizer. |
| `/api/benchmark` | `GET` | UCI Polish & Taiwan benchmark analytics and Benchmark-to-India transfer evaluation. |
| `/api/review/:companyId` | `POST` | Submit credit committee disposition (`ESCALATE_TO_BOARD_RISK_COMMITTEE`, etc.). |

---

## ⚖️ Regulatory Alignment

This system is built in strict adherence to:
- **Reserve Bank of India (RBI)**: *Master Circular on Early Warning Signals (EWS) and Red Flagged Accounts (RFA)* (DBS.CO.PPD.BC.No./01.01.005/2014-15).
- **Ministry of Corporate Affairs (MCA)**: *Companies Act, 2013 - Section 143(12)* (Auditor reporting on corporate fraud) & *CARO 2020*.
- **SEBI (LODR) Regulations, 2015**: Regulations 33 & 52 (Pledged shareholding disclosure and asset cover covenants).
- **Insolvency and Bankruptcy Code (IBC) 2016**: Lead-time distress forecasting prior to Section 7/9 NCLT filing.

---

© 2026 Corporate Risk & Credit Analytics. Built for institutional credit risk intelligence.
