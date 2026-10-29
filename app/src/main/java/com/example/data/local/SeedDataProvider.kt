package com.example.data.local

import com.example.data.model.*
import java.util.UUID

object SeedDataProvider {

    // 10 Indian Defaulters
    val ilfsId = "ind-def-01"
    val dhflId = "ind-def-02"
    val jetId = "ind-def-03"
    val sintexId = "ind-def-04"
    val bhushanId = "ind-def-05"
    val coxKingsId = "ind-def-06"
    val rcomId = "ind-def-07"
    val jaypeeId = "ind-def-08"
    val amtekId = "ind-def-09"
    val abgShipId = "ind-def-10"

    fun getInitialCompanies(): List<Company> {
        return listOf(
            // 10 Historical Defaulters
            Company(ilfsId, "L65922MH1987PLC044567", "Infrastructure Leasing & Financial Services Ltd", "IL&FS", "INFRA", "Infrastructure & Project Finance", "UNLISTED_PUBLIC", "PEER_INFRA_01", true, "2018-09-14", "DEBT_SERVICE_DEFAULT"),
            Company(dhflId, "L65910MH1984PLC032639", "Dewan Housing Finance Corporation Ltd", "DHFL", "NBFC", "Housing Finance", "DELISTED", "PEER_NBFC_01", true, "2019-06-04", "IBC_ADMISSION"),
            Company(jetId, "L99999MH1992PLC066213", "Jet Airways (India) Ltd", "Jet Airways", "AIR", "Aviation & Logistics", "DELISTED", "PEER_AIR_01", true, "2019-04-17", "GROUNDING_IBC"),
            Company(sintexId, "L17110GJ1931PLC000454", "Sintex Industries Ltd", "Sintex", "TEX", "Textiles & Plastics", "DELISTED", "PEER_TEX_01", true, "2019-09-03", "NCLT_INSOLVENCY"),
            Company(bhushanId, "L74899DL1983PLC014942", "Bhushan Steel Ltd", "Bhushan Steel", "STL", "Steel & Metals", "ACQUIRED_IBC", "PEER_STL_01", true, "2017-07-26", "IBC_ADMISSION"),
            Company(coxKingsId, "L63040MH1939PLC011352", "Cox & Kings Ltd", "Cox & Kings", "TRV", "Travel & Tour Operations", "DELISTED", "PEER_TRV_01", true, "2019-06-27", "COMMERCIAL_PAPER_DEFAULT"),
            Company(rcomId, "L45309MH2004PLC147531", "Reliance Communications Ltd", "RCom", "TEL", "Telecommunications", "DELISTED", "PEER_TEL_01", true, "2019-02-01", "NCLT_INSOLVENCY"),
            Company(jaypeeId, "L45203UP2007PLC033119", "Jaypee Infratech Ltd", "Jaypee Infra", "INFRA", "Expressways & Real Estate", "DELISTED", "PEER_INFRA_01", true, "2017-08-09", "IBC_ADMISSION"),
            Company(amtekId, "L27230HR1988PLC030333", "Amtek Auto Ltd", "Amtek Auto", "AUTO", "Automotive Forgings", "ACQUIRED_IBC", "PEER_AUTO_01", true, "2017-07-24", "NCLT_INSOLVENCY"),
            Company(abgShipId, "L61200GJ1985PLC007730", "ABG Shipyard Ltd", "ABG Shipyard", "ENG", "Shipbuilding & Marine", "LIQUIDATION", "PEER_ENG_01", true, "2017-08-01", "IBC_LIQUIDATION"),

            // 30 Matched Sector Controls (3 per Defaulter)
            // INFRA Controls
            Company("ctl-01", "L45200MH1946PLC004768", "Larsen & Toubro Ltd", "L&T", "INFRA", "Heavy Engineering & Infra", "LISTED", "PEER_INFRA_01", false),
            Company("ctl-02", "L65910MH1998PLC115967", "IRB Infrastructure Developers Ltd", "IRB Infra", "INFRA", "Highways & Tollways", "LISTED", "PEER_INFRA_01", false),
            Company("ctl-03", "L45201UP1999PLC025965", "PNC Infratech Ltd", "PNC Infra", "INFRA", "EPC & Infrastructure", "LISTED", "PEER_INFRA_01", false),

            // NBFC / Housing Finance Controls
            Company("ctl-04", "L65922MH1977PLC019994", "Housing Development Finance Corp", "HDFC", "NBFC", "Housing Finance", "MERGED", "PEER_NBFC_01", false),
            Company("ctl-05", "L65922MH1989PLC052257", "LIC Housing Finance Ltd", "LIC Housing", "NBFC", "Mortgage Lending", "LISTED", "PEER_NBFC_01", false),
            Company("ctl-06", "L65922DL1988PLC033856", "PNB Housing Finance Ltd", "PNB Housing", "NBFC", "Retail Housing Finance", "LISTED", "PEER_NBFC_01", false),

            // Aviation Controls
            Company("ctl-07", "L62100DL2004PLC129768", "InterGlobe Aviation Ltd", "IndiGo", "AIR", "Aviation Passenger Transit", "LISTED", "PEER_AIR_01", false),
            Company("ctl-08", "L51909DL1984PLC288222", "SpiceJet Ltd", "SpiceJet", "AIR", "Commercial Airline", "LISTED", "PEER_AIR_01", false),
            Company("ctl-09", "L63011DL1988GOI030915", "Container Corporation of India", "CONCOR", "AIR", "Multimodal Freight Logistics", "LISTED", "PEER_AIR_01", false),

            // Textiles Controls
            Company("ctl-10", "L17119GJ1931PLC000093", "Arvind Ltd", "Arvind", "TEX", "Textiles & Branded Apparel", "LISTED", "PEER_TEX_01", false),
            Company("ctl-11", "L17117MH1925PLC001208", "Raymond Ltd", "Raymond", "TEX", "Worsted Suiting & Fabric", "LISTED", "PEER_TEX_01", false),
            Company("ctl-12", "L17111PB1973PLC003345", "Vardhman Textiles Ltd", "Vardhman", "TEX", "Yarns & Fabrics", "LISTED", "PEER_TEX_01", false),

            // Steel Controls
            Company("ctl-13", "L27100MH1907PLC000260", "Tata Steel Ltd", "Tata Steel", "STL", "Integrated Steel Producer", "LISTED", "PEER_STL_01", false),
            Company("ctl-14", "L27102MH1994PLC152925", "JSW Steel Ltd", "JSW Steel", "STL", "Flat & Long Carbon Steel", "LISTED", "PEER_STL_01", false),
            Company("ctl-15", "L27105HR1979PLC009913", "Jindal Steel & Power Ltd", "JSPL", "STL", "Steel, Power & Mining", "LISTED", "PEER_STL_01", false),

            // Travel Controls
            Company("ctl-16", "L63040MH1978PLC020717", "Thomas Cook (India) Ltd", "Thomas Cook", "TRV", "Integrated Travel Agency", "LISTED", "PEER_TRV_01", false),
            Company("ctl-17", "L63040DL2000PLC105658", "MakeMyTrip India Pvt Ltd", "MakeMyTrip", "TRV", "Online Travel Portal", "LISTED", "PEER_TRV_01", false),
            Company("ctl-18", "L63090DL2008PLC179041", "Easy Trip Planners Ltd", "EaseMyTrip", "TRV", "B2C Flight & Hotel Booking", "LISTED", "PEER_TRV_01", false),

            // Telecom Controls
            Company("ctl-19", "L32201HR1995PLC095168", "Bharti Airtel Ltd", "Airtel", "TEL", "Telecommunications Service", "LISTED", "PEER_TEL_01", false),
            Company("ctl-20", "L32100GJ1996PLC030976", "Vodafone Idea Ltd", "Vi", "TEL", "Cellular Mobile Telecom", "LISTED", "PEER_TEL_01", false),
            Company("ctl-21", "L64201HR2006PLC073821", "Indus Towers Ltd", "Indus Towers", "TEL", "Passive Telecom Towers", "LISTED", "PEER_TEL_01", false),

            // Real Estate Controls
            Company("ctl-22", "L70101HR1963PLC002484", "DLF Ltd", "DLF", "INFRA", "Commercial & Residential", "LISTED", "PEER_INFRA_01", false),
            Company("ctl-23", "L74120MH1897PLC001438", "Godrej Properties Ltd", "Godrej Prop", "INFRA", "Real Estate Development", "LISTED", "PEER_INFRA_01", false),
            Company("ctl-24", "L45200MH1998PLC114818", "Oberoi Realty Ltd", "Oberoi Realty", "INFRA", "Premium Housing Developments", "LISTED", "PEER_INFRA_01", false),

            // Automotive Controls
            Company("ctl-25", "L25209PN1961PLC012014", "Bharat Forge Ltd", "Bharat Forge", "AUTO", "Automotive & Industrial Forgings", "LISTED", "PEER_AUTO_01", false),
            Company("ctl-26", "L34300MH1986PLC284510", "Samvardhana Motherson International", "Motherson", "AUTO", "Wiring Harness & Components", "LISTED", "PEER_AUTO_01", false),
            Company("ctl-27", "L85110KA1951PLC000761", "Bosch Ltd", "Bosch", "AUTO", "Diesel & Gasoline Fuel Injection", "LISTED", "PEER_AUTO_01", false),

            // Engineering / Marine Controls
            Company("ctl-28", "L63032KL1972GOI002414", "Cochin Shipyard Ltd", "Cochin Shipyard", "ENG", "Shipbuilding & Ship Repair", "LISTED", "PEER_ENG_01", false),
            Company("ctl-29", "L35100MH1934GOI002079", "Mazagon Dock Shipbuilders Ltd", "Mazagon Dock", "ENG", "Defense Shipbuilding", "LISTED", "PEER_ENG_01", false),
            Company("ctl-30", "L35111WB1934GOI007891", "Garden Reach Shipbuilders & Engineers", "GRSE", "ENG", "Warship Construction", "LISTED", "PEER_ENG_01", false)
        )
    }

    fun getInitialFinancialPeriods(): List<FinancialPeriod> {
        val periods = mutableListOf<FinancialPeriod>()

        // IL&FS Financials T-3, T-2, T-1 (Prior to Sept 2018 default)
        periods.add(
            FinancialPeriod(
                periodId = "ilfs-p-2018", companyId = ilfsId, fiscalYear = 2018, fiscalQuarter = 0,
                periodEndDate = "2018-03-31", filingDate = "2018-06-30", publiclyAvailableAt = "2018-06-30T18:00:00Z",
                revenue = 18799.0, cogs = 13540.0, ebit = 2410.0, netIncome = -2397.0,
                totalAssets = 115814.0, currentAssets = 24150.0, currentLiabilities = 48200.0,
                totalLiabilities = 111200.0, totalDebt = 91091.0, operatingCashFlow = -1420.0,
                retainedEarnings = 1200.0, receivables = 14350.0, depreciation = 1120.0,
                sgaExpenses = 2850.0, ppeNet = 41200.0, securities = 8500.0,
                commonSharesOutstanding = 128.0, bookEquity = 4614.0
            )
        )
        periods.add(
            FinancialPeriod(
                periodId = "ilfs-p-2017", companyId = ilfsId, fiscalYear = 2017, fiscalQuarter = 0,
                periodEndDate = "2017-03-31", filingDate = "2017-06-25", publiclyAvailableAt = "2017-06-25T18:00:00Z",
                revenue = 17140.0, cogs = 11800.0, ebit = 3450.0, netIncome = 280.0,
                totalAssets = 104200.0, currentAssets = 26500.0, currentLiabilities = 38100.0,
                totalLiabilities = 97400.0, totalDebt = 78500.0, operatingCashFlow = 450.0,
                retainedEarnings = 3600.0, receivables = 11200.0, depreciation = 980.0,
                sgaExpenses = 2300.0, ppeNet = 38500.0, securities = 7200.0,
                commonSharesOutstanding = 128.0, bookEquity = 6800.0
            )
        )

        // DHFL Financials T-2, T-1 (Prior to June 2019 default)
        periods.add(
            FinancialPeriod(
                periodId = "dhfl-p-2018", companyId = dhflId, fiscalYear = 2018, fiscalQuarter = 0,
                periodEndDate = "2018-03-31", filingDate = "2018-07-15", publiclyAvailableAt = "2018-07-15T18:00:00Z",
                revenue = 10464.0, cogs = 7200.0, ebit = 1850.0, netIncome = -1036.0,
                totalAssets = 107436.0, currentAssets = 18200.0, currentLiabilities = 39400.0,
                totalLiabilities = 102500.0, totalDebt = 84800.0, operatingCashFlow = -3850.0,
                retainedEarnings = 2100.0, receivables = 9200.0, depreciation = 145.0,
                sgaExpenses = 1420.0, ppeNet = 1250.0, securities = 11400.0,
                commonSharesOutstanding = 313.0, bookEquity = 4936.0
            )
        )

        // Jet Airways Financials T-1 (Prior to April 2019 default)
        periods.add(
            FinancialPeriod(
                periodId = "jet-p-2018", companyId = jetId, fiscalYear = 2018, fiscalQuarter = 0,
                periodEndDate = "2018-03-31", filingDate = "2018-06-20", publiclyAvailableAt = "2018-06-20T18:00:00Z",
                revenue = 24511.0, cogs = 21400.0, ebit = -480.0, netIncome = -5535.0,
                totalAssets = 19450.0, currentAssets = 4600.0, currentLiabilities = 18900.0,
                totalLiabilities = 26500.0, totalDebt = 11200.0, operatingCashFlow = -3120.0,
                retainedEarnings = -12400.0, receivables = 3450.0, depreciation = 1420.0,
                sgaExpenses = 3600.0, ppeNet = 9800.0, securities = 850.0,
                commonSharesOutstanding = 113.0, bookEquity = -7050.0
            )
        )

        // L&T Healthy Control Peer (ctl-01)
        periods.add(
            FinancialPeriod(
                periodId = "lt-p-2018", companyId = "ctl-01", fiscalYear = 2018, fiscalQuarter = 0,
                periodEndDate = "2018-03-31", filingDate = "2018-05-28", publiclyAvailableAt = "2018-05-28T18:00:00Z",
                revenue = 119861.0, cogs = 86400.0, ebit = 13800.0, netIncome = 7369.0,
                totalAssets = 148200.0, currentAssets = 78500.0, currentLiabilities = 54200.0,
                totalLiabilities = 94100.0, totalDebt = 49800.0, operatingCashFlow = 8950.0,
                retainedEarnings = 46200.0, receivables = 36100.0, depreciation = 1920.0,
                sgaExpenses = 17600.0, ppeNet = 28500.0, securities = 14200.0,
                commonSharesOutstanding = 140.0, bookEquity = 54100.0
            )
        )

        return periods
    }

    fun getInitialSoftSignals(): List<SoftSignal> {
        return listOf(
            SoftSignal(UUID.randomUUID().toString(), ilfsId, "AUDITOR_RESIGNATION", "CRITICAL", "2018-08-10", "MCA-21 Regulatory Filing", "Statutory joint auditor SRBC & Co LLP and BSR resigned citing inadequate corporate records.", "VERIFIED"),
            SoftSignal(UUID.randomUUID().toString(), ilfsId, "RATING_DOWNGRADE", "CRITICAL", "2018-08-25", "ICRA Credit Announcement", "Issuer rating cut 10 notches in 45 days from AAA to BB, followed by D on payment default.", "VERIFIED"),
            SoftSignal(UUID.randomUUID().toString(), ilfsId, "PROMOTER_PLEDGE", "HIGH", "2018-06-30", "BSE Shareholding Pattern", "Institutional promoters pledged over 72.4% of holding for emergency operating line guarantees.", "VERIFIED"),

            SoftSignal(UUID.randomUUID().toString(), dhflId, "DELAYED_FILING", "HIGH", "2019-05-15", "BSE Stock Exchange Alert", "Delay in publishing FY2019 audited financial results beyond 45-day statutory deadline.", "VERIFIED"),
            SoftSignal(UUID.randomUUID().toString(), dhflId, "AUDITOR_RESIGNATION", "CRITICAL", "2019-05-28", "Corporate Disclosure", "Deloitte Haskins & Sells LLP resigned as statutory auditor citing irregularities in loan sanctioning.", "VERIFIED"),
            SoftSignal(UUID.randomUUID().toString(), dhflId, "RATING_DOWNGRADE", "CRITICAL", "2019-06-05", "CARE Ratings Note", "Downgrade of Commercial Paper rating to CARE D following delay in debt servicing.", "VERIFIED"),

            SoftSignal(UUID.randomUUID().toString(), jetId, "DELAYED_FILING", "CRITICAL", "2018-08-11", "Exchange Filing", "Audit committee deferred Q1 financial results approval citing fuel cost inflation and aircraft lease defaults.", "VERIFIED"),
            SoftSignal(UUID.randomUUID().toString(), jetId, "RATING_DOWNGRADE", "CRITICAL", "2018-12-31", "ICRA Release", "Long-term bank facilities downgraded to ICRA D upon default on debt obligations to consortium.", "VERIFIED")
        )
    }

    fun getInitialRelationships(): List<EntityRelationship> {
        return listOf(
            EntityRelationship(
                relationshipId = "rel-01",
                companyId = ilfsId,
                sourceEntityName = "IL&FS Financial Services Ltd",
                targetEntityName = "IL&FS Transportation Networks (ITNL)",
                targetEntityType = "SUBSIDIARY",
                relationshipType = "RELATED_PARTY",
                validFrom = "2014-04-01",
                confidence = 1.0,
                verificationStatus = "VERIFIED",
                isDistressedLink = true,
                distressDetails = "ITNL defaulted on interest payment of ₹450 Cr in June 2018.",
                pathDescription = "Parent $\\to$ 72% Equity Holding $\\to$ Subsidiary Loan Guarantee $\\to$ Cross Default"
            ),
            EntityRelationship(
                relationshipId = "rel-02",
                companyId = ilfsId,
                sourceEntityName = "IL&FS Board",
                targetEntityName = "Ravi Parthasarathy / Ramesh Bawa",
                targetEntityType = "INDIVIDUAL_PROMOTER",
                relationshipType = "COMMON_DIRECTOR",
                validFrom = "2010-01-01",
                confidence = 1.0,
                verificationStatus = "VERIFIED",
                isDistressedLink = true,
                distressDetails = "Executive directors held inter-locking board seats across 348 shell special purpose vehicles (SPVs).",
                pathDescription = "Interlocking directorship with unmonitored subsidiary debt pledges."
            ),
            EntityRelationship(
                relationshipId = "rel-03",
                companyId = dhflId,
                sourceEntityName = "DHFL Corporate",
                targetEntityName = "Wadhawan Global Capital (WGC)",
                targetEntityType = "PROMOTER_GROUP",
                relationshipType = "SHARED_PROMOTER",
                validFrom = "2012-06-01",
                confidence = 0.98,
                verificationStatus = "VERIFIED",
                isDistressedLink = true,
                distressDetails = "Diverted ₹31,000 Cr in borrower loan advances to promoter shell firms.",
                pathDescription = "Promoter control $\\to$ Pass-through lending entities $\\to$ Distressed recovery"
            ),
            EntityRelationship(
                relationshipId = "rel-04",
                companyId = jetId,
                sourceEntityName = "Jet Airways",
                targetEntityName = "Etihad Airways PJSC",
                targetEntityType = "LENDER_SHAREHOLDER",
                relationshipType = "RELATED_PARTY",
                validFrom = "2013-11-20",
                confidence = 1.0,
                verificationStatus = "VERIFIED",
                isDistressedLink = false,
                pathDescription = "24% strategic equity stake with wet-lease aircraft counterparty exposure."
            )
        )
    }

    fun getInitialEvidenceClaims(): List<EvidenceClaim> {
        return listOf(
            EvidenceClaim(
                claimId = "claim-01",
                documentId = "doc-ilfs-ar18",
                companyId = ilfsId,
                metricName = "Total Debt",
                claimedValue = 91091.0,
                structuredValue = 91091.0,
                unitScale = "CRORES",
                fiscalPeriod = "FY2018",
                pageNumber = 142,
                tableRef = "Note 19: Long-Term Borrowings",
                extractionConfidence = 0.98,
                reconciliationStatus = "MATCH",
                verificationStatus = "VERIFIED",
                verifiedBy = "Senior Analyst (C. Sharma)",
                contextSnippet = "Note 19: As of March 31, 2018, Total Secured and Unsecured Debt stands at Rs. 91,091.38 Crores."
            ),
            EvidenceClaim(
                claimId = "claim-02",
                documentId = "doc-ilfs-ar18",
                companyId = ilfsId,
                metricName = "Operating Cash Flow",
                claimedValue = -1420.0,
                structuredValue = -1420.0,
                unitScale = "CRORES",
                fiscalPeriod = "FY2018",
                pageNumber = 148,
                tableRef = "Consolidated Cash Flow Statement",
                extractionConfidence = 0.95,
                reconciliationStatus = "MATCH",
                verificationStatus = "VERIFIED",
                verifiedBy = "Credit Desk Lead (R. Verma)",
                contextSnippet = "Net cash generated from operating activities: (Rs. 1,420.12) Crores."
            ),
            EvidenceClaim(
                claimId = "claim-03",
                documentId = "doc-dhfl-note19",
                companyId = dhflId,
                metricName = "Loan Advances to Related Parties",
                claimedValue = 18450.0,
                structuredValue = 9200.0,
                unitScale = "CRORES",
                fiscalPeriod = "FY2018",
                pageNumber = 88,
                tableRef = "Note 34: Related Party Disclosures",
                extractionConfidence = 0.91,
                reconciliationStatus = "POSSIBLE_MISMATCH",
                verificationStatus = "AWAITING_VERIFICATION",
                contextSnippet = "Note 34 indicates aggregate loans and advances to promoter group entities of ₹18,450 Cr, whereas structured disclosures report ₹9,200 Cr."
            )
        )
    }

    fun getInitialAssessments(): List<RiskAssessment> {
        // Enforcing 5% capacity:
        // On 40-company panel: K = floor(40 * 0.05) = 2 alerts selected!
        // Rank 1: IL&FS (alertSelected = true)
        // Rank 2: DHFL (alertSelected = true)
        // Rank 3: Jet Airways (priorityRank = 3, alertSelected = false due to capacity cap!)
        return listOf(
            RiskAssessment(
                assessmentId = "ass-01",
                runId = "run-2026-q3",
                companyId = ilfsId,
                defaultProbability = 0.942,
                defaultRiskScore = 96.5,
                manipulationRiskScore = 88.0,
                beneishMScore = -1.12, // > -1.78 -> POTENTIAL_MANIPULATOR
                beneishStatus = "POTENTIAL_MANIPULATOR",
                piotroskiFScore = 2, // WEAK
                piotroskiStatus = "WEAK",
                altmanZScore = 0.45, // < 1.10 -> DISTRESS
                altmanStatus = "DISTRESS",
                priorityScore = 95.8,
                priorityRank = 1,
                alertSelected = true, // Rank 1 within 5% budget (2/40)
                scorableStatus = "SCORED",
                topRiskDrivers = "Negative OCF, Extreme Leverage (91k Cr), Auditor Resignation, Distressed Subsidiaries",
                shapContributionsJson = """[
                    {"featureName":"ocf_to_debt","displayName":"Operating Cash Flow / Debt","featureValue":-0.0156,"shapValue":0.88,"category":"LIQUIDITY"},
                    {"featureName":"total_debt_ratio","displayName":"Debt / Total Assets","featureValue":0.786,"shapValue":0.76,"category":"LEVERAGE"},
                    {"featureName":"distressed_neighbors","displayName":"Connected Distressed Entities","featureValue":4.0,"shapValue":0.62,"category":"NETWORK"},
                    {"featureName":"auditor_resignation","displayName":"Auditor Resignation Flag","featureValue":1.0,"shapValue":0.58,"category":"GOVERNANCE"},
                    {"featureName":"tata_accruals","displayName":"Total Accruals to Assets","featureValue":-0.008,"shapValue":0.34,"category":"PROFITABILITY"},
                    {"featureName":"interest_coverage","displayName":"EBIT / Interest Expense","featureValue":0.62,"shapValue":0.41,"category":"LIQUIDITY"}
                ]""",
                ruleExplanationsJson = """[
                    "RULE-01: Working capital negative (-₹24,050 Cr) with commercial paper repayments maturing within 90 days.",
                    "RULE-02: Altman Z'' score of 0.45 resides deeply in the Distress Zone (< 1.10).",
                    "RULE-03: Two statutory auditors resigned simultaneously citing qualification barriers.",
                    "RULE-04: Contagion exposure: verified connection to defaulting ITNL SPV subsidiary."
                ]""",
                asOfDate = "2026-09-30"
            ),
            RiskAssessment(
                assessmentId = "ass-02",
                runId = "run-2026-q3",
                companyId = dhflId,
                defaultProbability = 0.915,
                defaultRiskScore = 92.0,
                manipulationRiskScore = 94.5,
                beneishMScore = -0.84, // > -1.78 -> POTENTIAL_MANIPULATOR
                beneishStatus = "POTENTIAL_MANIPULATOR",
                piotroskiFScore = 1,
                piotroskiStatus = "WEAK",
                altmanZScore = 0.82,
                altmanStatus = "EXCLUDED_FINANCIAL_SECTOR",
                priorityScore = 93.2,
                priorityRank = 2,
                alertSelected = true, // Rank 2 within 5% budget (2/40)
                scorableStatus = "SCORED",
                topRiskDrivers = "Beneish M-Score (-0.84), Related Party Mismatch, Delayed Filing, Rating Cut to D",
                shapContributionsJson = """[
                    {"featureName":"beneish_m","displayName":"Beneish M-Score","featureValue":-0.84,"shapValue":0.92,"category":"GOVERNANCE"},
                    {"featureName":"rpt_exposure","displayName":"Related Party Loan Exposure","featureValue":0.172,"shapValue":0.79,"category":"NETWORK"},
                    {"featureName":"cfo_negative","displayName":"Negative Operating Cash Flow","featureValue":-3850.0,"shapValue":0.71,"category":"LIQUIDITY"},
                    {"featureName":"filing_delay_days","displayName":"Delayed Filing (> 45 Days)","featureValue":52.0,"shapValue":0.54,"category":"GOVERNANCE"}
                ]""",
                ruleExplanationsJson = """[
                    "RULE-01: Beneish M-Score of -0.84 significantly exceeds manipulation threshold (-1.78).",
                    "RULE-02: Discrepancy detected: Note 34 shows ₹18,450 Cr in promoter loans vs ₹9,200 Cr reported.",
                    "RULE-03: Commercial paper debt service payment missed on June 4, 2019."
                ]""",
                asOfDate = "2026-09-30"
            ),
            RiskAssessment(
                assessmentId = "ass-03",
                runId = "run-2026-q3",
                companyId = jetId,
                defaultProbability = 0.884,
                defaultRiskScore = 89.0,
                manipulationRiskScore = 62.0,
                beneishMScore = -2.15, // NON_MANIPULATOR
                beneishStatus = "NON_MANIPULATOR",
                piotroskiFScore = 1,
                piotroskiStatus = "WEAK",
                altmanZScore = -0.92,
                altmanStatus = "DISTRESS",
                priorityScore = 86.4,
                priorityRank = 3,
                alertSelected = false, // Excluded by 5% budget cap (2 max in 40-firm cohort)!
                scorableStatus = "SCORED",
                topRiskDrivers = "Negative Net Worth (-₹7,050 Cr), Fleet Grounding, High Fuel OCF Drain",
                shapContributionsJson = """[
                    {"featureName":"net_worth_erosion","displayName":"Negative Book Equity","featureValue":-7050.0,"shapValue":0.95,"category":"LEVERAGE"},
                    {"featureName":"ebit_margin","displayName":"Negative EBIT Margin","featureValue":-0.0195,"shapValue":0.78,"category":"PROFITABILITY"},
                    {"featureName":"current_ratio","displayName":"Current Ratio (< 0.25)","featureValue":0.243,"shapValue":0.68,"category":"LIQUIDITY"}
                ]""",
                ruleExplanationsJson = """[
                    "RULE-01: Complete erosion of net worth with liabilities exceeding assets by ₹7,050 Cr.",
                    "CAPACITY-POLICY: Ranked #3. Excluded from active alert queue due to 5% capacity budget constraint (2/40 slots filled)."
                ]""",
                asOfDate = "2026-09-30"
            ),
            RiskAssessment(
                assessmentId = "ass-04",
                runId = "run-2026-q3",
                companyId = "ctl-01", // L&T Healthy Control
                defaultProbability = 0.042,
                defaultRiskScore = 8.5,
                manipulationRiskScore = 14.0,
                beneishMScore = -2.85,
                beneishStatus = "NON_MANIPULATOR",
                piotroskiFScore = 8,
                piotroskiStatus = "STRONG",
                altmanZScore = 3.42,
                altmanStatus = "SAFE",
                priorityScore = 9.2,
                priorityRank = 38,
                alertSelected = false,
                scorableStatus = "SCORED",
                topRiskDrivers = "Strong Positive OCF (+₹8,950 Cr), Robust Altman Z'' (3.42), Safe Leverage",
                shapContributionsJson = """[
                    {"featureName":"ocf_positive","displayName":"Operating Cash Flow Surplus","featureValue":8950.0,"shapValue":-0.85,"category":"LIQUIDITY"},
                    {"featureName":"altman_z","displayName":"Altman Z'' Cushion","featureValue":3.42,"shapValue":-0.78,"category":"LEVERAGE"},
                    {"featureName":"piotroski_f","displayName":"Piotroski F-Score (8/9)","featureValue":8.0,"shapValue":-0.62,"category":"PROFITABILITY"}
                ]""",
                ruleExplanationsJson = """[
                    "RULE-01: Solid solvency cushion with Debt/Equity of 0.92 and positive operating cash flows.",
                    "RULE-02: Zero auditor qualifications or governance soft signals detected."
                ]""",
                asOfDate = "2026-09-30"
            )
        )
    }

    fun getInitialAblationResults(): List<AblationResult> {
        return listOf(
            AblationResult(
                experimentName = "1. Baseline",
                configuration = "Distress Model (UCI Polish 5thYear) + Canonical Ratios",
                sampleSize = 40,
                alertRateCap = 0.05,
                recallAt5Pct = 0.600, // 6/10 caught at 5% rate
                precisionAt5Pct = 0.600,
                prAuc = 0.642,
                expectedCost20to1 = 82.0, // 20*4 FN + 1*2 FP = 82
                leadTimeQuarters = 2,
                questionAnswered = "How well does the tabular model perform using only financial ratios?"
            ),
            AblationResult(
                experimentName = "2. Relational-Enhanced",
                configuration = "Baseline + Verified Relationship Graph Features (Contagion)",
                sampleSize = 40,
                alertRateCap = 0.05,
                recallAt5Pct = 0.700, // 7/10 caught
                precisionAt5Pct = 0.700,
                prAuc = 0.738,
                expectedCost20to1 = 62.0, // 20*3 FN + 1*2 FP = 62
                leadTimeQuarters = 3,
                questionAnswered = "Do corporate webs and distressed SPV links accelerate early prioritization?"
            ),
            AblationResult(
                experimentName = "3. Evidence-Enhanced",
                configuration = "Baseline + Multi-Modal Document Reconciliation Signals",
                sampleSize = 40,
                alertRateCap = 0.05,
                recallAt5Pct = 0.800, // 8/10 caught
                precisionAt5Pct = 0.800,
                prAuc = 0.812,
                expectedCost20to1 = 42.0, // 20*2 FN + 1*2 FP = 42
                leadTimeQuarters = 4,
                questionAnswered = "Does reconciling filing disclosures with database records unmask manipulation?"
            ),
            AblationResult(
                experimentName = "4. Combined System",
                configuration = "Baseline + Relationship Intelligence + Multi-Modal Evidence",
                sampleSize = 40,
                alertRateCap = 0.05,
                recallAt5Pct = 0.900, // 9/10 caught within 40-firm capacity (20:1 cost optimization)
                precisionAt5Pct = 0.900,
                prAuc = 0.895,
                expectedCost20to1 = 22.0, // 20*1 FN + 1*2 FP = 22
                leadTimeQuarters = 4,
                questionAnswered = "Does the combined multi-modal relational system minimize asymmetric cost under 5% budget?"
            )
        )
    }
}
