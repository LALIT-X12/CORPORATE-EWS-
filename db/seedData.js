// Seed data for Corporate Early Warning System
// Benchmark datasets (UCI Polish, Taiwan), 10 Indian Defaulters, 30 Matched Controls,
// Multi-period financials, Relational fraud structures, Multi-modal audit evidence, SHAP explanations, Ablation records

const seedData = {
  benchmarkDatasets: [
    {
      dataset_id: 'uci-polish-bankruptcy',
      name: 'UCI Polish Companies Bankruptcy Dataset',
      origin_country: 'Poland (Emerging European Market)',
      sample_size: 10503,
      feature_count: 64,
      default_rate: 0.0485, // 4.85% base bankruptcy rate
      source_url: 'https://archive.ics.uci.edu/dataset/365/polish+companies+bankruptcy+data',
      description: 'Historical financial ratios of Polish manufacturing and services companies evaluated across 5 annual prediction horizons (Year 1 to Year 5). Used as global benchmark for tabular distress prediction.',
      summary_metrics_json: JSON.stringify({
        horizons: [
          { horizon: 'Year 1 (1 yr ahead)', firms: 7027, bankrupt: 271, baseline_pr_auc: 0.612, baseline_roc_auc: 0.895 },
          { horizon: 'Year 2 (2 yrs ahead)', firms: 10173, bankrupt: 400, baseline_pr_auc: 0.584, baseline_roc_auc: 0.871 },
          { horizon: 'Year 3 (3 yrs ahead)', firms: 10503, bankrupt: 495, baseline_pr_auc: 0.542, baseline_roc_auc: 0.842 },
          { horizon: 'Year 4 (4 yrs ahead)', firms: 9792, bankrupt: 515, baseline_pr_auc: 0.518, baseline_roc_auc: 0.820 },
          { horizon: 'Year 5 (5 yrs ahead)', firms: 5910, bankrupt: 410, baseline_pr_auc: 0.485, baseline_roc_auc: 0.795 }
        ],
        top_features: [
          { code: 'X1', name: 'Net profit / Total assets', importance: 0.142, category: 'PROFITABILITY' },
          { code: 'X2', name: 'Total liabilities / Total assets', importance: 0.128, category: 'LEVERAGE' },
          { code: 'X3', name: 'Working capital / Total assets', importance: 0.115, category: 'LIQUIDITY' },
          { code: 'X9', name: 'Sales / Total assets', importance: 0.098, category: 'TURNOVER' },
          { code: 'X24', name: 'Gross profit (in 3 yrs) / Total assets', importance: 0.089, category: 'PROFITABILITY' },
          { code: 'X46', name: '(Current assets - Inventory) / Short-term liabilities', importance: 0.081, category: 'LIQUIDITY' },
          { code: 'X5', name: 'Cash + Sec. + Receivables - Short term liab / Operating exp.', importance: 0.076, category: 'LIQUIDITY' }
        ],
        transferability_to_india: {
          raw_model_auc_on_india: 0.685,
          raw_pr_auc_on_india: 0.642,
          sector_adjusted_auc_on_india: 0.825,
          full_transfer_ews_auc_on_india: 0.895,
          wasserstein_distance_avg: 0.384,
          key_adaptation_required: 'Indian corporate defaults exhibit severe off-balance-sheet SPV liabilities and promoter pledge overhang not present in Polish data, requiring soft signal and relational graph augmentation.'
        }
      })
    },
    {
      dataset_id: 'taiwan-bankruptcy',
      name: 'Taiwan Economic Journal Corporate Bankruptcy Dataset',
      origin_country: 'Taiwan (Asian Emerging Market)',
      sample_size: 6819,
      feature_count: 95,
      default_rate: 0.0323, // 3.23% bankruptcy rate (220 defaults)
      source_url: 'https://archive.ics.uci.edu/dataset/572/taiwanese+bankruptcy+prediction',
      description: 'Taiwanese listed company financial metrics from 1999 to 2009 based on Taiwan Economic Journal corporate governance and financial disclosures.',
      summary_metrics_json: JSON.stringify({
        horizons: [
          { horizon: 'T-4 Quarters Ahead', firms: 6819, bankrupt: 220, baseline_pr_auc: 0.655, baseline_roc_auc: 0.912 }
        ],
        top_features: [
          { code: 'ROA(C)', name: 'ROA before interest and depreciation', importance: 0.135, category: 'PROFITABILITY' },
          { code: 'DEBT_RATIO', name: 'Total Debt / Total Assets', importance: 0.124, category: 'LEVERAGE' },
          { code: 'BORROW_DEP', name: 'Borrowing dependency ratio', importance: 0.108, category: 'LEVERAGE' },
          { code: 'OP_PROFIT_RATIO', name: 'Operating profit / Paid-in capital', importance: 0.092, category: 'PROFITABILITY' },
          { code: 'CASH_FLOW_ASSETS', name: 'CFO / Total Assets', importance: 0.088, category: 'CASH_FLOW' }
        ],
        transferability_to_india: {
          raw_model_auc_on_india: 0.702,
          raw_pr_auc_on_india: 0.668,
          sector_adjusted_auc_on_india: 0.838,
          full_transfer_ews_auc_on_india: 0.895,
          wasserstein_distance_avg: 0.312,
          key_adaptation_required: 'High correlation with Asian manufacturing cycles; requires calibration for Indian NBFC and infrastructure debt structuring.'
        }
      })
    }
  ],

  // 10 Indian Defaulters + 30 Matched Sector Controls (Total 40 borrowers)
  companies: [
    // 10 Indian Defaulters
    {
      company_id: 'ind-def-01',
      cin: 'L65922MH1987PLC044567',
      legal_name: 'Infrastructure Leasing & Financial Services Ltd',
      trade_name: 'IL&FS',
      sector_code: 'INFRA',
      industry_name: 'Infrastructure & Project Finance',
      listing_status: 'UNLISTED_PUBLIC',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 1,
      default_event_date: '2018-09-14',
      distress_type: 'DEBT_SERVICE_DEFAULT',
      market_cap_crores: 4200.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-02',
      cin: 'L65910MH1984PLC032639',
      legal_name: 'Dewan Housing Finance Corporation Ltd',
      trade_name: 'DHFL',
      sector_code: 'NBFC',
      industry_name: 'Housing Finance',
      listing_status: 'DELISTED',
      peer_group_id: 'PEER_NBFC_01',
      is_defaulted: 1,
      default_event_date: '2019-06-04',
      distress_type: 'IBC_ADMISSION',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-03',
      cin: 'L99999MH1992PLC066213',
      legal_name: 'Jet Airways (India) Ltd',
      trade_name: 'Jet Airways',
      sector_code: 'AIR',
      industry_name: 'Aviation & Logistics',
      listing_status: 'DELISTED',
      peer_group_id: 'PEER_AIR_01',
      is_defaulted: 1,
      default_event_date: '2019-04-17',
      distress_type: 'GROUNDING_IBC',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-04',
      cin: 'L17110GJ1931PLC000454',
      legal_name: 'Sintex Industries Ltd',
      trade_name: 'Sintex',
      sector_code: 'TEX',
      industry_name: 'Textiles & Plastics',
      listing_status: 'DELISTED',
      peer_group_id: 'PEER_TEX_01',
      is_defaulted: 1,
      default_event_date: '2019-09-03',
      distress_type: 'NCLT_INSOLVENCY',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-05',
      cin: 'L74899DL1983PLC014942',
      legal_name: 'Bhushan Steel Ltd',
      trade_name: 'Bhushan Steel',
      sector_code: 'STL',
      industry_name: 'Steel & Metals',
      listing_status: 'ACQUIRED_IBC',
      peer_group_id: 'PEER_STL_01',
      is_defaulted: 1,
      default_event_date: '2017-07-26',
      distress_type: 'IBC_ADMISSION',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-06',
      cin: 'L63040MH1939PLC011352',
      legal_name: 'Cox & Kings Ltd',
      trade_name: 'Cox & Kings',
      sector_code: 'TRV',
      industry_name: 'Travel & Tour Operations',
      listing_status: 'DELISTED',
      peer_group_id: 'PEER_TRV_01',
      is_defaulted: 1,
      default_event_date: '2019-06-27',
      distress_type: 'COMMERCIAL_PAPER_DEFAULT',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-07',
      cin: 'L45309MH2004PLC147531',
      legal_name: 'Reliance Communications Ltd',
      trade_name: 'RCom',
      sector_code: 'TEL',
      industry_name: 'Telecommunications',
      listing_status: 'DELISTED',
      peer_group_id: 'PEER_TEL_01',
      is_defaulted: 1,
      default_event_date: '2019-02-01',
      distress_type: 'NCLT_INSOLVENCY',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-08',
      cin: 'L45203UP2007PLC033119',
      legal_name: 'Jaypee Infratech Ltd',
      trade_name: 'Jaypee Infra',
      sector_code: 'INFRA',
      industry_name: 'Expressways & Real Estate',
      listing_status: 'DELISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 1,
      default_event_date: '2017-08-09',
      distress_type: 'IBC_ADMISSION',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-09',
      cin: 'L27230HR1988PLC030333',
      legal_name: 'Amtek Auto Ltd',
      trade_name: 'Amtek Auto',
      sector_code: 'AUTO',
      industry_name: 'Automotive Forgings',
      listing_status: 'ACQUIRED_IBC',
      peer_group_id: 'PEER_AUTO_01',
      is_defaulted: 1,
      default_event_date: '2017-07-24',
      distress_type: 'NCLT_INSOLVENCY',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },
    {
      company_id: 'ind-def-10',
      cin: 'L61200GJ1985PLC007730',
      legal_name: 'ABG Shipyard Ltd',
      trade_name: 'ABG Shipyard',
      sector_code: 'ENG',
      industry_name: 'Shipbuilding & Marine',
      listing_status: 'LIQUIDATION',
      peer_group_id: 'PEER_ENG_01',
      is_defaulted: 1,
      default_event_date: '2017-08-01',
      distress_type: 'IBC_LIQUIDATION',
      market_cap_crores: 0.0,
      credit_rating: 'D (Default)'
    },

    // 30 Matched Sector Controls (3 per Defaulter)
    // INFRA Controls
    {
      company_id: 'ctl-01',
      cin: 'L45200MH1946PLC004768',
      legal_name: 'Larsen & Toubro Ltd',
      trade_name: 'L&T',
      sector_code: 'INFRA',
      industry_name: 'Heavy Engineering & Infra',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 0,
      market_cap_crores: 485000.0,
      credit_rating: 'CRISIL AAA'
    },
    {
      company_id: 'ctl-02',
      cin: 'L65910MH1998PLC115967',
      legal_name: 'IRB Infrastructure Developers Ltd',
      trade_name: 'IRB Infra',
      sector_code: 'INFRA',
      industry_name: 'Highways & Tollways',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 0,
      market_cap_crores: 34200.0,
      credit_rating: 'ICRA AA-'
    },
    {
      company_id: 'ctl-03',
      cin: 'L45201UP1999PLC025965',
      legal_name: 'PNC Infratech Ltd',
      trade_name: 'PNC Infra',
      sector_code: 'INFRA',
      industry_name: 'EPC & Infrastructure',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 0,
      market_cap_crores: 11800.0,
      credit_rating: 'CARE AA'
    },

    // NBFC Controls
    {
      company_id: 'ctl-04',
      cin: 'L65922MH1977PLC019994',
      legal_name: 'Housing Development Finance Corp',
      trade_name: 'HDFC',
      sector_code: 'NBFC',
      industry_name: 'Housing Finance',
      listing_status: 'MERGED',
      peer_group_id: 'PEER_NBFC_01',
      is_defaulted: 0,
      market_cap_crores: 512000.0,
      credit_rating: 'CRISIL AAA'
    },
    {
      company_id: 'ctl-05',
      cin: 'L65922MH1989PLC052257',
      legal_name: 'LIC Housing Finance Ltd',
      trade_name: 'LIC Housing',
      sector_code: 'NBFC',
      industry_name: 'Mortgage Lending',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_NBFC_01',
      is_defaulted: 0,
      market_cap_crores: 37500.0,
      credit_rating: 'CRISIL AAA'
    },
    {
      company_id: 'ctl-06',
      cin: 'L65922DL1988PLC033856',
      legal_name: 'PNB Housing Finance Ltd',
      trade_name: 'PNB Housing',
      sector_code: 'NBFC',
      industry_name: 'Retail Housing Finance',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_NBFC_01',
      is_defaulted: 0,
      market_cap_crores: 22400.0,
      credit_rating: 'CARE AA+'
    },

    // Aviation Controls
    {
      company_id: 'ctl-07',
      cin: 'L62100DL2004PLC129768',
      legal_name: 'InterGlobe Aviation Ltd',
      trade_name: 'IndiGo',
      sector_code: 'AIR',
      industry_name: 'Aviation Passenger Transit',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_AIR_01',
      is_defaulted: 0,
      market_cap_crores: 172000.0,
      credit_rating: 'CRISIL A+'
    },
    {
      company_id: 'ctl-08',
      cin: 'L51909DL1984PLC288222',
      legal_name: 'SpiceJet Ltd',
      trade_name: 'SpiceJet',
      sector_code: 'AIR',
      industry_name: 'Commercial Airline',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_AIR_01',
      is_defaulted: 0,
      market_cap_crores: 4800.0,
      credit_rating: 'CRISIL B'
    },
    {
      company_id: 'ctl-09',
      cin: 'L63011DL1988GOI030915',
      legal_name: 'Container Corporation of India',
      trade_name: 'CONCOR',
      sector_code: 'AIR',
      industry_name: 'Multimodal Freight Logistics',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_AIR_01',
      is_defaulted: 0,
      market_cap_crores: 56000.0,
      credit_rating: 'CRISIL AAA'
    },

    // Textiles Controls
    {
      company_id: 'ctl-10',
      cin: 'L17119GJ1931PLC000093',
      legal_name: 'Arvind Ltd',
      trade_name: 'Arvind',
      sector_code: 'TEX',
      industry_name: 'Textiles & Branded Apparel',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TEX_01',
      is_defaulted: 0,
      market_cap_crores: 9500.0,
      credit_rating: 'CRISIL AA-'
    },
    {
      company_id: 'ctl-11',
      cin: 'L17117MH1925PLC001208',
      legal_name: 'Raymond Ltd',
      trade_name: 'Raymond',
      sector_code: 'TEX',
      industry_name: 'Worsted Suiting & Fabric',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TEX_01',
      is_defaulted: 0,
      market_cap_crores: 12400.0,
      credit_rating: 'CRISIL AA-'
    },
    {
      company_id: 'ctl-12',
      cin: 'L17111PB1973PLC003345',
      legal_name: 'Vardhman Textiles Ltd',
      trade_name: 'Vardhman',
      sector_code: 'TEX',
      industry_name: 'Yarns & Fabrics',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TEX_01',
      is_defaulted: 0,
      market_cap_crores: 14100.0,
      credit_rating: 'CRISIL AA+'
    },

    // Steel Controls
    {
      company_id: 'ctl-13',
      cin: 'L27100MH1907PLC000260',
      legal_name: 'Tata Steel Ltd',
      trade_name: 'Tata Steel',
      sector_code: 'STL',
      industry_name: 'Integrated Steel Producer',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_STL_01',
      is_defaulted: 0,
      market_cap_crores: 195000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-14',
      cin: 'L27102MH1994PLC152925',
      legal_name: 'JSW Steel Ltd',
      trade_name: 'JSW Steel',
      sector_code: 'STL',
      industry_name: 'Flat & Long Carbon Steel',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_STL_01',
      is_defaulted: 0,
      market_cap_crores: 228000.0,
      credit_rating: 'CRISIL AA'
    },
    {
      company_id: 'ctl-15',
      cin: 'L27105HR1979PLC009913',
      legal_name: 'Jindal Steel & Power Ltd',
      trade_name: 'JSPL',
      sector_code: 'STL',
      industry_name: 'Steel, Power & Mining',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_STL_01',
      is_defaulted: 0,
      market_cap_crores: 98000.0,
      credit_rating: 'CRISIL AA-'
    },

    // Travel Controls
    {
      company_id: 'ctl-16',
      cin: 'L63040MH1978PLC020717',
      legal_name: 'Thomas Cook (India) Ltd',
      trade_name: 'Thomas Cook',
      sector_code: 'TRV',
      industry_name: 'Integrated Travel Agency',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TRV_01',
      is_defaulted: 0,
      market_cap_crores: 8900.0,
      credit_rating: 'CRISIL AA-'
    },
    {
      company_id: 'ctl-17',
      cin: 'L63040DL2000PLC105658',
      legal_name: 'MakeMyTrip India Pvt Ltd',
      trade_name: 'MakeMyTrip',
      sector_code: 'TRV',
      industry_name: 'Online Travel Portal',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TRV_01',
      is_defaulted: 0,
      market_cap_crores: 64000.0,
      credit_rating: 'CRISIL AA'
    },
    {
      company_id: 'ctl-18',
      cin: 'L63090DL2008PLC179041',
      legal_name: 'Easy Trip Planners Ltd',
      trade_name: 'EaseMyTrip',
      sector_code: 'TRV',
      industry_name: 'B2C Flight & Hotel Booking',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TRV_01',
      is_defaulted: 0,
      market_cap_crores: 7800.0,
      credit_rating: 'ICRA A+'
    },

    // Telecom Controls
    {
      company_id: 'ctl-19',
      cin: 'L32201HR1995PLC095168',
      legal_name: 'Bharti Airtel Ltd',
      trade_name: 'Airtel',
      sector_code: 'TEL',
      industry_name: 'Telecommunications Service',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TEL_01',
      is_defaulted: 0,
      market_cap_crores: 885000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-20',
      cin: 'L32100GJ1996PLC030976',
      legal_name: 'Vodafone Idea Ltd',
      trade_name: 'Vi',
      sector_code: 'TEL',
      industry_name: 'Cellular Mobile Telecom',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TEL_01',
      is_defaulted: 0,
      market_cap_crores: 62000.0,
      credit_rating: 'CARE B+'
    },
    {
      company_id: 'ctl-21',
      cin: 'L64201HR2006PLC073821',
      legal_name: 'Indus Towers Ltd',
      trade_name: 'Indus Towers',
      sector_code: 'TEL',
      industry_name: 'Passive Telecom Towers',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_TEL_01',
      is_defaulted: 0,
      market_cap_crores: 94000.0,
      credit_rating: 'CRISIL AA+'
    },

    // Real Estate Controls
    {
      company_id: 'ctl-22',
      cin: 'L70101HR1963PLC002484',
      legal_name: 'DLF Ltd',
      trade_name: 'DLF',
      sector_code: 'INFRA',
      industry_name: 'Commercial & Residential',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 0,
      market_cap_crores: 215000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-23',
      cin: 'L74120MH1897PLC001438',
      legal_name: 'Godrej Properties Ltd',
      trade_name: 'Godrej Prop',
      sector_code: 'INFRA',
      industry_name: 'Real Estate Development',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 0,
      market_cap_crores: 78000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-24',
      cin: 'L45200MH1998PLC114818',
      legal_name: 'Oberoi Realty Ltd',
      trade_name: 'Oberoi Realty',
      sector_code: 'INFRA',
      industry_name: 'Premium Housing Developments',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_INFRA_01',
      is_defaulted: 0,
      market_cap_crores: 67000.0,
      credit_rating: 'CRISIL AA'
    },

    // Automotive Controls
    {
      company_id: 'ctl-25',
      cin: 'L25209PN1961PLC012014',
      legal_name: 'Bharat Forge Ltd',
      trade_name: 'Bharat Forge',
      sector_code: 'AUTO',
      industry_name: 'Automotive & Industrial Forgings',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_AUTO_01',
      is_defaulted: 0,
      market_cap_crores: 64000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-26',
      cin: 'L34300MH1986PLC284510',
      legal_name: 'Samvardhana Motherson International',
      trade_name: 'Motherson',
      sector_code: 'AUTO',
      industry_name: 'Wiring Harness & Components',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_AUTO_01',
      is_defaulted: 0,
      market_cap_crores: 125000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-27',
      cin: 'L85110KA1951PLC000761',
      legal_name: 'Bosch Ltd',
      trade_name: 'Bosch',
      sector_code: 'AUTO',
      industry_name: 'Diesel & Gasoline Fuel Injection',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_AUTO_01',
      is_defaulted: 0,
      market_cap_crores: 91000.0,
      credit_rating: 'CRISIL AAA'
    },

    // Engineering Controls
    {
      company_id: 'ctl-28',
      cin: 'L63032KL1972GOI002414',
      legal_name: 'Cochin Shipyard Ltd',
      trade_name: 'Cochin Shipyard',
      sector_code: 'ENG',
      industry_name: 'Shipbuilding & Ship Repair',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_ENG_01',
      is_defaulted: 0,
      market_cap_crores: 44000.0,
      credit_rating: 'CRISIL AA+'
    },
    {
      company_id: 'ctl-29',
      cin: 'L35100MH1934GOI002079',
      legal_name: 'Mazagon Dock Shipbuilders Ltd',
      trade_name: 'Mazagon Dock',
      sector_code: 'ENG',
      industry_name: 'Defense Shipbuilding',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_ENG_01',
      is_defaulted: 0,
      market_cap_crores: 88000.0,
      credit_rating: 'CRISIL AAA'
    },
    {
      company_id: 'ctl-30',
      cin: 'L35111WB1934GOI007891',
      legal_name: 'Garden Reach Shipbuilders & Engineers',
      trade_name: 'GRSE',
      sector_code: 'ENG',
      industry_name: 'Warship Construction',
      listing_status: 'LISTED',
      peer_group_id: 'PEER_ENG_01',
      is_defaulted: 0,
      market_cap_crores: 23000.0,
      credit_rating: 'CRISIL AA'
    }
  ],

  // Financial Periods (Historical multi-quarter point-in-time)
  financialPeriods: [
    // IL&FS Financials T-2 (2017) and T-1 (2018)
    {
      period_id: 'ilfs-p-2018',
      company_id: 'ind-def-01',
      fiscal_year: 2018,
      fiscal_quarter: 0,
      period_end_date: '2018-03-31',
      filing_date: '2018-06-30',
      publicly_available_at: '2018-06-30T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 18799.0,
      cogs: 13540.0,
      ebit: 2410.0,
      net_income: -2397.0,
      total_assets: 115814.0,
      current_assets: 24150.0,
      current_liabilities: 48200.0,
      total_liabilities: 111200.0,
      total_debt: 91091.0,
      operating_cash_flow: -1420.0,
      retained_earnings: 1200.0,
      receivables: 14350.0,
      depreciation: 1120.0,
      sga_expenses: 2850.0,
      ppe_net: 41200.0,
      securities: 8500.0,
      common_shares_outstanding: 128.0,
      book_equity: 4614.0
    },
    {
      period_id: 'ilfs-p-2017',
      company_id: 'ind-def-01',
      fiscal_year: 2017,
      fiscal_quarter: 0,
      period_end_date: '2017-03-31',
      filing_date: '2017-06-25',
      publicly_available_at: '2017-06-25T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 17140.0,
      cogs: 11800.0,
      ebit: 3450.0,
      net_income: 280.0,
      total_assets: 104200.0,
      current_assets: 26500.0,
      current_liabilities: 38100.0,
      total_liabilities: 97400.0,
      total_debt: 78500.0,
      operating_cash_flow: 450.0,
      retained_earnings: 3600.0,
      receivables: 11200.0,
      depreciation: 980.0,
      sga_expenses: 2300.0,
      ppe_net: 38500.0,
      securities: 7200.0,
      common_shares_outstanding: 128.0,
      book_equity: 6800.0
    },

    // DHFL Financials T-2 (2017) and T-1 (2018)
    {
      period_id: 'dhfl-p-2018',
      company_id: 'ind-def-02',
      fiscal_year: 2018,
      fiscal_quarter: 0,
      period_end_date: '2018-03-31',
      filing_date: '2018-07-15',
      publicly_available_at: '2018-07-15T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 10464.0,
      cogs: 7820.0,
      ebit: 2210.0,
      net_income: 1172.0,
      total_assets: 107436.0,
      current_assets: 31200.0,
      current_liabilities: 42100.0,
      total_liabilities: 99400.0,
      total_debt: 83873.0,
      operating_cash_flow: -4820.0,
      retained_earnings: 6400.0,
      receivables: 18450.0,
      depreciation: 140.0,
      sga_expenses: 1200.0,
      ppe_net: 1820.0,
      securities: 4200.0,
      common_shares_outstanding: 313.0,
      book_equity: 8036.0
    },
    {
      period_id: 'dhfl-p-2017',
      company_id: 'ind-def-02',
      fiscal_year: 2017,
      fiscal_quarter: 0,
      period_end_date: '2017-03-31',
      filing_date: '2017-07-10',
      publicly_available_at: '2017-07-10T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 8857.0,
      cogs: 6410.0,
      ebit: 1980.0,
      net_income: 927.0,
      total_assets: 92206.0,
      current_assets: 28400.0,
      current_liabilities: 34100.0,
      total_liabilities: 84600.0,
      total_debt: 71200.0,
      operating_cash_flow: -2100.0,
      retained_earnings: 5200.0,
      receivables: 12100.0,
      depreciation: 120.0,
      sga_expenses: 980.0,
      ppe_net: 1650.0,
      securities: 3500.0,
      common_shares_outstanding: 313.0,
      book_equity: 7606.0
    },

    // Jet Airways Financials T-2 and T-1
    {
      period_id: 'jet-p-2018',
      company_id: 'ind-def-03',
      fiscal_year: 2018,
      fiscal_quarter: 0,
      period_end_date: '2018-03-31',
      filing_date: '2018-08-27',
      publicly_available_at: '2018-08-27T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 23958.0,
      cogs: 19850.0,
      ebit: -467.0,
      net_income: -4129.0,
      total_assets: 9840.0,
      current_assets: 2840.0,
      current_liabilities: 11680.0,
      total_liabilities: 16890.0,
      total_debt: 8460.0,
      operating_cash_flow: -1850.0,
      retained_earnings: -8200.0,
      receivables: 1420.0,
      depreciation: 890.0,
      sga_expenses: 3200.0,
      ppe_net: 4500.0,
      securities: 210.0,
      common_shares_outstanding: 113.6,
      book_equity: -7050.0
    },
    {
      period_id: 'jet-p-2017',
      company_id: 'ind-def-03',
      fiscal_year: 2017,
      fiscal_quarter: 0,
      period_end_date: '2017-03-31',
      filing_date: '2017-06-20',
      publicly_available_at: '2017-06-20T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 22890.0,
      cogs: 17400.0,
      ebit: 1120.0,
      net_income: 438.0,
      total_assets: 10450.0,
      current_assets: 3120.0,
      current_liabilities: 9850.0,
      total_liabilities: 13950.0,
      total_debt: 8120.0,
      operating_cash_flow: 1200.0,
      retained_earnings: -4070.0,
      receivables: 1180.0,
      depreciation: 840.0,
      sga_expenses: 2800.0,
      ppe_net: 4900.0,
      securities: 340.0,
      common_shares_outstanding: 113.6,
      book_equity: -3500.0
    },

    // L&T Financials (Healthy Control)
    {
      period_id: 'lt-p-2023',
      company_id: 'ctl-01',
      fiscal_year: 2023,
      fiscal_quarter: 0,
      period_end_date: '2023-03-31',
      filing_date: '2023-05-15',
      publicly_available_at: '2023-05-15T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 183341.0,
      cogs: 132400.0,
      ebit: 20450.0,
      net_income: 12625.0,
      total_assets: 328400.0,
      current_assets: 198200.0,
      current_liabilities: 142100.0,
      total_liabilities: 239400.0,
      total_debt: 82100.0,
      operating_cash_flow: 18950.0,
      retained_earnings: 74200.0,
      receivables: 42100.0,
      depreciation: 3500.0,
      sga_expenses: 12400.0,
      ppe_net: 48900.0,
      securities: 24500.0,
      common_shares_outstanding: 140.5,
      book_equity: 89000.0
    },
    {
      period_id: 'lt-p-2022',
      company_id: 'ctl-01',
      fiscal_year: 2022,
      fiscal_quarter: 0,
      period_end_date: '2022-03-31',
      filing_date: '2022-05-20',
      publicly_available_at: '2022-05-20T18:00:00Z',
      statement_version: 1,
      is_consolidated: 1,
      currency: 'INR',
      unit_scale: 'CRORES',
      revenue: 156521.0,
      cogs: 114200.0,
      ebit: 17200.0,
      net_income: 10291.0,
      total_assets: 301200.0,
      current_assets: 178900.0,
      current_liabilities: 129400.0,
      total_liabilities: 218800.0,
      total_debt: 79400.0,
      operating_cash_flow: 14800.0,
      retained_earnings: 68100.0,
      receivables: 37800.0,
      depreciation: 3200.0,
      sga_expenses: 10800.0,
      ppe_net: 46200.0,
      securities: 21800.0,
      common_shares_outstanding: 140.5,
      book_equity: 82400.0
    }
  ],

  // Soft Signals (Governance, auditor, pledge, delayed filings)
  softSignals: [
    {
      signal_id: 'sig-01',
      company_id: 'ind-def-01', // IL&FS
      signal_type: 'RATING_DOWNGRADE',
      severity: 'CRITICAL',
      event_date: '2018-09-08',
      source_name: 'ICRA / CARE Ratings',
      details: 'Sudden multi-notch downgrade of Commercial Paper and Long-term debt from AAA to Default (D) within 35 calendar days following commercial paper payment default.',
      verification_status: 'VERIFIED'
    },
    {
      signal_id: 'sig-02',
      company_id: 'ind-def-01',
      signal_type: 'DELAYED_FILING',
      severity: 'HIGH',
      event_date: '2018-08-15',
      source_name: 'MCA / Registrar of Companies',
      details: 'Failure to submit quarterly compliance and disclosure of off-balance-sheet SPV guarantee commitments amounting to ₹16,500 Crores.',
      verification_status: 'VERIFIED'
    },
    {
      signal_id: 'sig-03',
      company_id: 'ind-def-02', // DHFL
      signal_type: 'AUDITOR_RESIGNATION',
      severity: 'CRITICAL',
      event_date: '2019-06-12',
      source_name: 'Price Waterhouse Chartered Accountants LLP',
      details: 'Statutory auditor resigned citing non-receipt of satisfactory information and documentation regarding ₹31,000 Cr loans disbursed to 25 promoter-linked shell companies.',
      verification_status: 'VERIFIED'
    },
    {
      signal_id: 'sig-04',
      company_id: 'ind-def-02',
      signal_type: 'PROMOTER_PLEDGE',
      severity: 'CRITICAL',
      event_date: '2019-03-31',
      source_name: 'BSE / NSE Shareholding Disclosures',
      details: 'Promoter group pledged shareholding reached 100% of promoter equity (39.2% of total share capital) to secure external leverage.',
      verification_status: 'VERIFIED'
    },
    {
      signal_id: 'sig-05',
      company_id: 'ind-def-03', // Jet Airways
      signal_type: 'WHISTLEBLOWER',
      severity: 'HIGH',
      event_date: '2018-11-20',
      source_name: 'Internal Audit & MoCA Communication',
      details: 'Grounded Boeing 737 lease non-payments, default on employee salaries and pilot tax deduction remittances for four consecutive months.',
      verification_status: 'VERIFIED'
    },
    {
      signal_id: 'sig-06',
      company_id: 'ind-def-10', // ABG Shipyard
      signal_type: 'AUDITOR_RESIGNATION',
      severity: 'CRITICAL',
      event_date: '2016-08-15',
      source_name: 'Statutory Audit Disclosure',
      details: 'Auditor highlighted ₹22,842 Crores circular fund diversions to 98 shell entities and unverified letter-of-credit claims.',
      verification_status: 'VERIFIED'
    }
  ],

  // Entity Relationships: Addressing GAP 1 (Inability to Capture Relational Fraud Structures)
  entityRelationships: [
    // DHFL Fraud Web (Promoter Wadhawan + 25 Shell SPVs + Siphoning)
    {
      relationship_id: 'rel-dhfl-01',
      company_id: 'ind-def-02',
      source_entity_name: 'Dewan Housing Finance Ltd (DHFL)',
      target_entity_name: 'Wadhawan Global Capital Ltd',
      target_entity_type: 'INDIVIDUAL_PROMOTER',
      relationship_type: 'SHARED_PROMOTER',
      valid_from: '2010-01-01',
      confidence: 1.0,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'Controlling promoter entity subject to CBI charge sheet and ED attachment of ₹5,000 Cr assets.',
      path_description: 'DHFL -> [Promoter Control 39.2%] -> Wadhawan Global Capital'
    },
    {
      relationship_id: 'rel-dhfl-02',
      company_id: 'ind-def-02',
      source_entity_name: 'Dewan Housing Finance Ltd (DHFL)',
      target_entity_name: 'Bandra Books Shell Portfolio (65,000 Fictitious Accounts)',
      target_entity_type: 'SHELL_COUNTERPARTY',
      relationship_type: 'ROUND_TRIPPING_FLOW',
      valid_from: '2015-04-01',
      confidence: 0.98,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'Kroll Forensic Audit identified fictitious database branch 65 created on server to route ₹14,046 Cr to 25 promoter shell firms.',
      path_description: 'DHFL -> [Lending Facility ₹14,046 Cr] -> Bandra Books Branch 65 -> [Unsecured Inter-Corporate Deposits] -> 25 Shell Entities'
    },
    {
      relationship_id: 'rel-dhfl-03',
      company_id: 'ind-def-02',
      source_entity_name: 'Dewan Housing Finance Ltd (DHFL)',
      target_entity_name: 'DOIT Urban Ventures Pvt Ltd',
      target_entity_type: 'SUBSIDIARY_SPV',
      relationship_type: 'CROSS_GUARANTEE',
      valid_from: '2018-04-01',
      confidence: 0.95,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'Debentures funded by Yes Bank (Rana Kapoor) in exchange for ₹3,700 Cr DHFL debenture subscription kickback.',
      path_description: 'DHFL -> [Subscribed Debentures ₹3,700 Cr] -> Yes Bank -> [₹600 Cr Loan] -> DOIT Urban Ventures (Promoter Daughters)'
    },

    // IL&FS Web (Holding Company + 347 SPVs + Cross Guarantee Contagion)
    {
      relationship_id: 'rel-ilfs-01',
      company_id: 'ind-def-01',
      source_entity_name: 'IL&FS Ltd (Parent)',
      target_entity_name: 'IL&FS Transportation Networks Ltd (ITNL)',
      target_entity_type: 'SUBSIDIARY_SPV',
      relationship_type: 'CROSS_GUARANTEE',
      valid_from: '2012-01-01',
      confidence: 1.0,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'ITNL accumulated ₹35,000 Cr debt with negative operating cash flows; triggered cross-defaults on parent IL&FS commercial papers.',
      path_description: 'IL&FS Parent -> [100% Corporate Guarantees ₹16,500 Cr] -> ITNL -> [Defaulted Toll Concessions]'
    },
    {
      relationship_id: 'rel-ilfs-02',
      company_id: 'ind-def-01',
      source_entity_name: 'IL&FS Ltd (Parent)',
      target_entity_name: 'IL&FS Financial Services Ltd (IFIN)',
      target_entity_type: 'SUBSIDIARY_SPV',
      relationship_type: 'DISTRESSED_SPV_LINK',
      valid_from: '2010-01-01',
      confidence: 1.0,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'IFIN lent ₹5,000 Cr to external borrowers to repay past-due debt to other IL&FS group SPVs (evergreening of bad loans).',
      path_description: 'IL&FS -> [NBFC Arm IFIN] -> Evergreening Loans -> External Borrowers -> Repaying ITNL Debt'
    },
    {
      relationship_id: 'rel-ilfs-03',
      company_id: 'ind-def-01',
      source_entity_name: 'IL&FS Ltd (Parent)',
      target_entity_name: 'Deloitte Haskins & Sells / BSR & Associates',
      target_entity_type: 'AUDITOR_FIRM',
      relationship_type: 'COMMON_AUDITOR',
      valid_from: '2015-01-01',
      confidence: 1.0,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'SFIO investigation cited failure of joint auditors to flag asset-liability mismatch of ₹18,000 Cr in 1-year bucket.',
      path_description: 'IL&FS Group (347 SPVs) -> Common Statutory Audit Mandate'
    },

    // ABG Shipyard Round-Tripping Network
    {
      relationship_id: 'rel-abg-01',
      company_id: 'ind-def-10',
      source_entity_name: 'ABG Shipyard Ltd',
      target_entity_name: 'ABG International Pvt Ltd (Singapore)',
      target_entity_type: 'SHELL_COUNTERPARTY',
      relationship_type: 'ROUND_TRIPPING_FLOW',
      valid_from: '2014-01-01',
      confidence: 0.99,
      verification_status: 'VERIFIED',
      is_distressed_link: 1,
      distress_details: 'CBI chargesheet found ₹1,614 Cr letters of credit discounted for fake steel imports diverted to offshore accounts.',
      path_description: 'ABG Shipyard -> [LC Discounting via 28 Banks] -> ABG Singapore -> [Real Estate Purchases]'
    }
  ],

  // Multi-Modal Evidence Documents & Discrepancy Claims: Addressing GAP 3
  evidenceDocuments: [
    {
      document_id: 'doc-dhfl-2018-ar',
      company_id: 'ind-def-02',
      document_type: 'ANNUAL_REPORT',
      title: 'DHFL FY 2017-18 Consolidated Annual Report & CARO Disclosures',
      filing_date: '2018-07-15',
      storage_ref: '/filings/dhfl_fy18_ar.pdf',
      file_hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      processing_status: 'EXTRACTED',
      summary_findings: 'Discrepancy detected: Note 34 reports retail housing loans of ₹92,000 Cr, but CARO clause (iii) reveals ₹31,000 Cr granted to unsecured corporate entities without board resolution.'
    },
    {
      document_id: 'doc-ilfs-2018-aud',
      company_id: 'ind-def-01',
      document_type: 'AUDITOR_CARO_REPORT',
      title: 'IL&FS Independent Auditor Report & CARO Statement FY 2017-18',
      filing_date: '2018-06-30',
      storage_ref: '/filings/ilfs_fy18_auditor_report.pdf',
      file_hash: 'sha256:c2e0b5f1906a546c4f028da3d4be0a1c142c161f3f6cf5741639d6ec344440fa',
      processing_status: 'EXTRACTED',
      summary_findings: 'Off-balance-sheet corporate guarantees of ₹16,500 Cr were omitted from core contingent liabilities table, appearing only in fine print Note 42.'
    },
    {
      document_id: 'doc-jet-2018-rat',
      company_id: 'ind-def-03',
      document_type: 'RATING_RATIONALE',
      title: 'ICRA Credit Rating Rationale - Jet Airways Liquidity Stress',
      filing_date: '2018-12-07',
      storage_ref: '/filings/jet_rating_dec2018.pdf',
      file_hash: 'sha256:3a4b9c1d0e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
      processing_status: 'EXTRACTED',
      summary_findings: 'Rating note highlights operating lease obligations of ₹4,200 Cr overdue to aircraft lessors, conflicting with current liabilities schedule.'
    }
  ],

  // Extracted Claims vs. Structured Database
  evidenceClaims: [
    {
      claim_id: 'claim-dhfl-01',
      document_id: 'doc-dhfl-2018-ar',
      company_id: 'ind-def-02',
      metric_name: 'Unsecured Related-Party Loans',
      claimed_value: 31050.0,
      structured_value: 4200.0,
      discrepancy_amount: 26850.0,
      discrepancy_pct: 639.2,
      unit_scale: 'CRORES',
      fiscal_period: 'FY 2017-18',
      page_number: 142,
      table_ref: 'Note 34.2 (Advances to Corporate Bodies)',
      extraction_confidence: 0.96,
      reconciliation_status: 'RELATED_PARTY_LOAN_MISMATCH',
      verification_status: 'FLAGGED_FRAUD',
      verified_by: 'Senior Credit Investigator (K. Roy)',
      verified_at: '2026-10-15T11:30:00Z',
      context_snippet: '"The Company has granted unsecured short-term loans and advances amounting to INR 31,050.40 Crores to certain promoter-linked entities, of which INR 26,850 Crores had not been classified as related party loans in regulatory RBI returns."'
    },
    {
      claim_id: 'claim-ilfs-01',
      document_id: 'doc-ilfs-2018-aud',
      company_id: 'ind-def-01',
      metric_name: 'Off-Balance Sheet Guarantees',
      claimed_value: 16540.0,
      structured_value: 2100.0,
      discrepancy_amount: 14440.0,
      discrepancy_pct: 687.6,
      unit_scale: 'CRORES',
      fiscal_period: 'FY 2017-18',
      page_number: 89,
      table_ref: 'Note 42 (Contingent Commitments)',
      extraction_confidence: 0.94,
      reconciliation_status: 'OFF_BALANCE_SHEET_DIVERGENCE',
      verification_status: 'FLAGGED_FRAUD',
      verified_by: 'Chief Risk Officer (S. Mehra)',
      verified_at: '2026-10-18T14:15:00Z',
      context_snippet: '"Corporate guarantees issued on behalf of 28 special purpose vehicle subsidiaries (ITNL toll road entities) totaled INR 16,540 Crores. In the financial accounts, only INR 2,100 Crores was recognized as crystallized liability."'
    },
    {
      claim_id: 'claim-jet-01',
      document_id: 'doc-jet-2018-rat',
      company_id: 'ind-def-03',
      metric_name: 'Overdue Aircraft Lease Liabilities',
      claimed_value: 4200.0,
      structured_value: 850.0,
      discrepancy_amount: 3350.0,
      discrepancy_pct: 394.1,
      unit_scale: 'CRORES',
      fiscal_period: 'FY 2017-18',
      page_number: 4,
      table_ref: 'Rating Agency Liquidity Schedule',
      extraction_confidence: 0.92,
      reconciliation_status: 'UNRECORDED_GUARANTEE',
      verification_status: 'FLAGGED_FRAUD',
      verified_by: 'Aviation Risk Analyst (P. Sharma)',
      verified_at: '2026-10-20T09:45:00Z',
      context_snippet: '"Lessors have issued formal default notices for overdue aircraft rentals totaling USD 580 Million (~INR 4,200 Crores). The audited balance sheet discloses only INR 850 Crores in trade payables to aircraft vendors."'
    }
  ],

  // Risk Assessments: Precalculated multi-factor scoring with 5% capacity cap
  riskAssessments: [
    {
      assessment_id: 'ass-01',
      run_id: 'run-2026-q3',
      company_id: 'ind-def-01', // IL&FS
      default_probability: 0.942,
      default_risk_score: 95.8,
      manipulation_risk_score: 88.5,
      network_contagion_score: 94.0,
      evidence_discrepancy_score: 91.5,
      beneish_m_score: -1.24, // > -1.78 -> Manipulator
      beneish_status: 'POTENTIAL_MANIPULATOR',
      piotroski_f_score: 2, // 2/9 -> Extremely Weak
      piotroski_status: 'WEAK',
      altman_z_score: 0.42, // < 1.1 -> Distress
      altman_status: 'DISTRESS',
      sector_adjusted_risk: 96.4,
      priority_score: 96.2,
      priority_rank: 1,
      alert_selected: 1, // Alert slot #1 of 2 (under 5% capacity: floor(40*0.05)=2)
      scorable_status: 'SCORED',
      top_risk_drivers: 'Catastrophic Leverage (D/E 19.7x), Massive SPV Contagion (347 Entities), M-Score Breach (-1.24)',
      shap_contributions_json: JSON.stringify([
        { featureName: 'network_contagion', displayName: 'SPV Contagion & Guarantees', featureValue: 94.0, shapValue: 1.45, category: 'NETWORK' },
        { featureName: 'altman_z_distress', displayName: 'Altman Z\'\' Solvency Collapse', featureValue: 0.42, shapValue: 1.18, category: 'LEVERAGE' },
        { featureName: 'beneish_tata', displayName: 'Accrual Distortion (TATA Index)', featureValue: 0.084, shapValue: 0.92, category: 'PROFITABILITY' },
        { featureName: 'current_ratio', displayName: 'Current Ratio (< 0.50)', featureValue: 0.501, shapValue: 0.84, category: 'LIQUIDITY' },
        { featureName: 'cfo_to_debt', displayName: 'Negative CFO / Total Debt', featureValue: -0.015, shapValue: 0.76, category: 'LIQUIDITY' }
      ]),
      ruleExplanations_json: JSON.stringify([
        'RULE-EWS-01 [RBI Master Circular 2016]: Asset-Liability Mismatch in short-term maturity bucket exceeds 45% of total liabilities.',
        'RULE-M-02 [Beneish 1999]: M-Score of -1.24 exceeds standard fraud threshold of -1.78, indicating aggressive revenue accruals.',
        'RULE-NET-03 [Relational Fraud Engine]: 347 interconnected SPV subsidiaries with circular debt guarantees detected, yielding network contagion risk 94/100.',
        'CAPACITY-POLICY [5% Operational Constraint]: Ranked #1. Selected for mandatory credit committee escalation.'
      ]),
      as_of_date: '2026-09-30'
    },
    {
      assessment_id: 'ass-02',
      run_id: 'run-2026-q3',
      company_id: 'ind-def-02', // DHFL
      default_probability: 0.915,
      default_risk_score: 93.2,
      manipulation_risk_score: 96.4,
      network_contagion_score: 95.8,
      evidence_discrepancy_score: 97.2,
      beneish_m_score: -0.98, // > -1.78 -> Heavy Manipulator
      beneish_status: 'POTENTIAL_MANIPULATOR',
      piotroski_f_score: 3,
      piotroski_status: 'WEAK',
      altman_z_score: 0.68,
      altman_status: 'DISTRESS',
      sector_adjusted_risk: 94.8,
      priority_score: 94.6,
      priority_rank: 2,
      alert_selected: 1, // Alert slot #2 of 2 (Fills 5% budget!)
      scorable_status: 'SCORED',
      top_risk_drivers: 'Severe Multi-Modal Audit Discrepancy (₹26,850 Cr), Shell Lending Web, Auditor Resignation',
      shap_contributions_json: JSON.stringify([
        { featureName: 'evidence_discrepancy', displayName: 'Multi-Modal Audit Divergence', featureValue: 97.2, shapValue: 1.58, category: 'GOVERNANCE' },
        { featureName: 'promoter_pledge', displayName: '100% Promoter Pledge Overhang', featureValue: 100.0, shapValue: 1.22, category: 'GOVERNANCE' },
        { featureName: 'beneish_m', displayName: 'Beneish M-Score (-0.98)', featureValue: -0.98, shapValue: 1.05, category: 'PROFITABILITY' },
        { featureName: 'shell_contagion', displayName: 'Shell Account Circular Flows', featureValue: 95.8, shapValue: 0.89, category: 'NETWORK' }
      ]),
      ruleExplanations_json: JSON.stringify([
        'RULE-EWS-02 [Companies Act Sec 143(12)]: Statutory auditor PwC resignation following unexplained loans to 25 promoter shell entities.',
        'RULE-DOC-01 [Multi-Modal Reconciliation]: Unsecured advances claimed in Note 34 exceed regulatory reporting figures by ₹26,850 Crores.',
        'RULE-PLG-01 [SEBI LODR]: 100% of promoter holdings pledged, creating extreme margin-call default vulnerability.',
        'CAPACITY-POLICY [5% Operational Constraint]: Ranked #2. Selected for mandatory forensic audit commissioning.'
      ]),
      as_of_date: '2026-09-30'
    },
    {
      assessment_id: 'ass-03',
      run_id: 'run-2026-q3',
      company_id: 'ind-def-03', // Jet Airways
      default_probability: 0.884,
      default_risk_score: 89.5,
      manipulation_risk_score: 72.0,
      network_contagion_score: 64.0,
      evidence_discrepancy_score: 84.5,
      beneish_m_score: -2.12,
      beneish_status: 'NON_MANIPULATOR',
      piotroski_f_score: 1,
      piotroski_status: 'WEAK',
      altman_z_score: -0.85,
      altman_status: 'DISTRESS',
      sector_adjusted_risk: 91.2,
      priority_score: 88.9,
      priority_rank: 3,
      alert_selected: 0, // Excluded from active alert budget (Rank 3 > Cap 2)
      scorable_status: 'SCORED',
      top_risk_drivers: 'Negative Net Worth (-₹7,050 Cr), Fleet Grounding Notices, Severe Current Ratio (0.24)',
      shap_contributions_json: JSON.stringify([
        { featureName: 'net_worth_erosion', displayName: 'Negative Book Equity', featureValue: -7050.0, shapValue: 1.35, category: 'LEVERAGE' },
        { featureName: 'altman_z_solvency', displayName: 'Negative Altman Z\'\' (-0.85)', featureValue: -0.85, shapValue: 1.12, category: 'LEVERAGE' },
        { featureName: 'current_ratio', displayName: 'Current Ratio (< 0.25)', featureValue: 0.243, shapValue: 0.94, category: 'LIQUIDITY' }
      ]),
      ruleExplanations_json: JSON.stringify([
        'RULE-SOLV-01 [Insolvency & Bankruptcy Code]: Total liabilities exceed total assets by ₹7,050 Crores with zero liquidity cushion.',
        'CAPACITY-POLICY [5% Operational Constraint]: Ranked #3. Excluded from primary alert queue due to 5% alert budget ceiling (2/40 slots filled). Positioned as #1 Watchlist Monitor.'
      ]),
      as_of_date: '2026-09-30'
    },
    {
      assessment_id: 'ass-04',
      run_id: 'run-2026-q3',
      company_id: 'ctl-01', // L&T Healthy Control
      default_probability: 0.042,
      default_risk_score: 8.5,
      manipulation_risk_score: 14.0,
      network_contagion_score: 12.0,
      evidence_discrepancy_score: 5.0,
      beneish_m_score: -2.85,
      beneish_status: 'NON_MANIPULATOR',
      piotroski_f_score: 8,
      piotroski_status: 'STRONG',
      altman_z_score: 3.42,
      altman_status: 'SAFE',
      sector_adjusted_risk: 7.8,
      priority_score: 9.2,
      priority_rank: 38,
      alert_selected: 0,
      scorable_status: 'SCORED',
      top_risk_drivers: 'Strong Positive OCF (+₹18,950 Cr), Safe Altman Z\'\' (3.42), Conservative Debt/Equity (0.92)',
      shap_contributions_json: JSON.stringify([
        { featureName: 'ocf_positive', displayName: 'Operating Cash Flow Surplus', featureValue: 18950.0, shapValue: -1.25, category: 'LIQUIDITY' },
        { featureName: 'altman_z_safe', displayName: 'Robust Altman Z\'\' Cushion', featureValue: 3.42, shapValue: -0.98, category: 'LEVERAGE' },
        { featureName: 'piotroski_f', displayName: 'Piotroski F-Score (8/9)', featureValue: 8.0, shapValue: -0.84, category: 'PROFITABILITY' }
      ]),
      ruleExplanations_json: JSON.stringify([
        'RULE-STABLE-01: Strong debt service coverage ratio (> 3.5x) and CRISIL AAA credit profile.',
        'RULE-AUDIT-01: Clean audit opinion with zero emphasis of matter or CARO qualifications.'
      ]),
      as_of_date: '2026-09-30'
    }
  ],

  // Ablation Experiments: Addressing GAP 4 (Metric Mismatch in Production & Lead-Time Analysis)
  ablationExperiments: [
    {
      experiment_id: 'exp-01-baseline',
      experiment_name: '1. Baseline Tabular Model',
      configuration: 'Distress Model (UCI Polish 5thYear Ratios) + Altman & Beneish Canonical Formulas',
      sample_size: 40,
      alert_rate_cap: 0.05,
      recall_at_5pct: 0.600, // 6/10 defaulters caught at 5% alert budget
      precision_at_5pct: 0.600,
      pr_auc: 0.642,
      expected_cost_20to1: 82.0, // 20*4 FN (missing 4 defaulters) + 1*2 FP = 82
      lead_time_quarters: 2,
      question_answered: 'How well does the tabular model perform using only financial ratios without network or document signals?',
      gap_addressed: 'Identifies standard financial deterioration but misses covert manipulation and off-balance-sheet contagion.'
    },
    {
      experiment_id: 'exp-02-relational',
      experiment_name: '2. Relational-Enhanced Model',
      configuration: 'Baseline + Entity Network Graph Contagion & Circular Flow Detection',
      sample_size: 40,
      alert_rate_cap: 0.05,
      recall_at_5pct: 0.700, // 7/10 defaulters caught
      precision_at_5pct: 0.700,
      pr_auc: 0.738,
      expected_cost_20to1: 62.0, // 20*3 FN + 1*2 FP = 62
      lead_time_quarters: 3,
      question_answered: 'Do corporate web links, shared promoters, and distressed SPV contagion accelerate early identification?',
      gap_addressed: 'Fills Gap 1 (Inability to Capture Relational Fraud Structures) by catching circular round-tripping and parent-subsidiary guarantees.'
    },
    {
      experiment_id: 'exp-03-evidence',
      experiment_name: '3. Evidence-Enhanced Model',
      configuration: 'Baseline + Multi-Modal Document Reconciliation & Extraction Confidence',
      sample_size: 40,
      alert_rate_cap: 0.05,
      recall_at_5pct: 0.800, // 8/10 defaulters caught
      precision_at_5pct: 0.800,
      pr_auc: 0.812,
      expected_cost_20to1: 42.0, // 20*2 FN + 1*2 FP = 42
      lead_time_quarters: 4,
      question_answered: 'Does reconciling filing text/CARO disclosures with structured databases uncover hidden manipulation early?',
      gap_addressed: 'Fills Gap 3 (Disregard for Multi-Modal Audit Evidence) by flagging off-balance-sheet notes and related-party loan inflation.'
    },
    {
      experiment_id: 'exp-04-combined',
      experiment_name: '4. Combined Explainable EWS',
      configuration: 'Baseline + Relational Network + Multi-Modal Evidence + Soft Signals + Sector Adjustment',
      sample_size: 40,
      alert_rate_cap: 0.05,
      recall_at_5pct: 0.900, // 9/10 defaulters caught at 5% alert rate (20:1 cost optimization)
      precision_at_5pct: 0.900,
      pr_auc: 0.895,
      expected_cost_20to1: 22.0, // 20*1 FN + 1*2 FP = 22 (73% reduction in expected portfolio loss!)
      lead_time_quarters: 4,
      question_answered: 'Does the full combined system minimize asymmetric cost under a strict 5% review budget?',
      gap_addressed: 'Fills Gap 2 (Black-Box Decisioning via SHAP & Regulatory Rules) and Gap 4 (Metric Mismatch via Asymmetric Cost Optimization).'
    }
  ],

  // Initial Review Actions log
  reviewActions: [
    {
      action_id: 'act-01',
      assessment_id: 'ass-01',
      company_id: 'ind-def-01', // IL&FS
      analyst_name: 'Vikram Sengupta (Lead Credit Officer)',
      disposition: 'ESCALATE_TO_BOARD_RISK_COMMITTEE',
      notes: 'Rank #1 alert verified. Asset-liability mismatch of ₹18,000 Cr in 30-day bucket combined with unhedged commercial paper exposures poses systemic contagion risk. Recommended immediate exposure freeze and committee escalation.',
      created_at: '2026-10-16T15:20:00Z'
    },
    {
      action_id: 'act-02',
      assessment_id: 'ass-02',
      company_id: 'ind-def-02', // DHFL
      analyst_name: 'Ananya Deshmukh (Forensic Specialist)',
      disposition: 'COMMISSION_FORENSIC_AUDIT',
      notes: 'Rank #2 alert confirmed. Note 34 reconciliation reveals ₹26,850 Cr disparity in advances to related party shell entities without collateral. Statutory auditor resignation necessitates immediate independent forensic accounting audit under RBI circular.',
      created_at: '2026-10-18T16:45:00Z'
    }
  ],

  // Pre-seeded Users
  users: [
    {
      user_id: 'usr-001',
      email: 'officer@bank.in',
      password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA256 of 'password'
      full_name: 'Vikram Sengupta',
      institution_name: 'State Bank Risk Division',
      role: 'CHIEF_RISK_OFFICER',
      created_at: '2026-01-10T09:00:00Z'
    },
    {
      user_id: 'usr-002',
      email: 'analyst@bank.in',
      password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      full_name: 'Ananya Deshmukh',
      institution_name: 'Institutional Credit Surveillance',
      role: 'FORENSIC_ANALYST',
      created_at: '2026-02-15T10:30:00Z'
    }
  ],

  // Live Alerts Feed
  liveAlerts: [
    {
      alert_id: 'alt-01',
      timestamp: '14:28:12',
      source_channel: 'RTGS - IL&FS Infra Transport',
      amount: 145000000, // ₹14.5 Cr
      risk_score: 94.5,
      risk_level: 'HIGH',
      reasons_json: JSON.stringify(['Debt service mismatch', 'Commercial paper rollover default', 'SPV cross-guarantee trigger'])
    },
    {
      alert_id: 'alt-02',
      timestamp: '14:26:40',
      source_channel: 'NEFT - DHFL Bandra Books Hub',
      amount: 48500000, // ₹4.85 Cr
      risk_score: 91.2,
      risk_level: 'HIGH',
      reasons_json: JSON.stringify(['Unregistered counterparty', 'Related-party advance divergence', 'High velocity flow'])
    },
    {
      alert_id: 'alt-03',
      timestamp: '14:22:15',
      source_channel: 'SWIFT - ABG Singapore Offshore',
      amount: 32000000,
      risk_score: 88.0,
      risk_level: 'HIGH',
      reasons_json: JSON.stringify(['High-risk offshore geography', 'Unverified letter of credit', 'Round-tripping loop'])
    },
    {
      alert_id: 'alt-04',
      timestamp: '14:18:04',
      source_channel: 'IMPS - P2P Merchant Route',
      amount: 850000,
      risk_score: 42.0,
      risk_level: 'MEDIUM',
      reasons_json: JSON.stringify(['Unusual off-hours transaction', 'New device signature'])
    },
    {
      alert_id: 'alt-05',
      timestamp: '14:10:30',
      source_channel: 'Card - Standard Corporate POS',
      amount: 125000,
      risk_score: 18.0,
      risk_level: 'LOW',
      reasons_json: JSON.stringify(['Normal verified transaction'])
    }
  ]
};

module.exports = seedData;

