package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * Canonical Corporate Borrower Entity
 */
@Entity(tableName = "companies")
data class Company(
    @PrimaryKey val companyId: String = UUID.randomUUID().toString(),
    val cin: String, // Corporate Identification Number (e.g. L65922MH1987PLC044567)
    val legalName: String,
    val tradeName: String,
    val sectorCode: String,
    val industryName: String,
    val listingStatus: String = "LISTED",
    val peerGroupId: String,
    val isDefaulted: Boolean = false,
    val defaultEventDate: String? = null,
    val distressType: String? = null // e.g. "IBC_ADMISSION", "DEBT_SERVICE_DEFAULT"
)

/**
 * Historical Point-in-Time Financial Period
 */
@Entity(tableName = "financial_periods")
data class FinancialPeriod(
    @PrimaryKey val periodId: String = UUID.randomUUID().toString(),
    val companyId: String,
    val fiscalYear: Int,
    val fiscalQuarter: Int, // 0 for Annual, 1..4 for Quarters
    val periodEndDate: String,
    val filingDate: String,
    val publiclyAvailableAt: String,
    val statementVersion: Int = 1,
    val isConsolidated: Boolean = true,
    val currency: String = "INR",
    val unitScale: String = "CRORES",
    val revenue: Double,
    val cogs: Double,
    val ebit: Double,
    val netIncome: Double,
    val totalAssets: Double,
    val currentAssets: Double,
    val currentLiabilities: Double,
    val totalLiabilities: Double,
    val totalDebt: Double,
    val operatingCashFlow: Double,
    val retainedEarnings: Double,
    val receivables: Double,
    val depreciation: Double,
    val sgaExpenses: Double,
    val ppeNet: Double,
    val securities: Double = 0.0,
    val commonSharesOutstanding: Double,
    val bookEquity: Double
)

/**
 * Governance and Market Soft Signal
 */
@Entity(tableName = "soft_signals")
data class SoftSignal(
    @PrimaryKey val signalId: String = UUID.randomUUID().toString(),
    val companyId: String,
    val signalType: String, // "AUDITOR_RESIGNATION", "PROMOTER_PLEDGE", "DELAYED_FILING", "RATING_DOWNGRADE"
    val severity: String, // "LOW", "MEDIUM", "HIGH", "CRITICAL"
    val eventDate: String,
    val sourceName: String,
    val details: String,
    val verificationStatus: String = "VERIFIED"
)

/**
 * Sourced Corporate Entity Relationship Edge
 */
@Entity(tableName = "entity_relationships")
data class EntityRelationship(
    @PrimaryKey val relationshipId: String = UUID.randomUUID().toString(),
    val companyId: String,
    val sourceEntityName: String,
    val targetEntityName: String,
    val targetEntityType: String, // "INDIVIDUAL_PROMOTER", "AUDITOR_FIRM", "LENDER", "SUBSIDIARY", "COUNTERPARTY"
    val relationshipType: String, // "COMMON_DIRECTOR", "SHARED_PROMOTER", "COMMON_AUDITOR", "RELATED_PARTY", "LENDER_EXPOSURE"
    val validFrom: String,
    val validTo: String? = null,
    val confidence: Double = 1.0,
    val verificationStatus: String = "VERIFIED", // "PROPOSED", "VERIFIED", "REJECTED"
    val isDistressedLink: Boolean = false,
    val distressDetails: String? = null,
    val pathDescription: String
)

/**
 * Multi-Modal Document Registry
 */
@Entity(tableName = "evidence_documents")
data class EvidenceDocument(
    @PrimaryKey val documentId: String = UUID.randomUUID().toString(),
    val companyId: String,
    val documentType: String, // "ANNUAL_REPORT", "AUDITOR_NOTE", "RATING_DISCLOSURE"
    val title: String,
    val filingDate: String,
    val storageRef: String,
    val fileHash: String,
    val processingStatus: String = "EXTRACTED" // "UPLOADED", "PROCESSING", "EXTRACTED", "FAILED"
)

/**
 * Extracted Financial Fact vs Structured Database Claim
 */
@Entity(tableName = "evidence_claims")
data class EvidenceClaim(
    @PrimaryKey val claimId: String = UUID.randomUUID().toString(),
    val documentId: String,
    val companyId: String,
    val metricName: String,
    val claimedValue: Double,
    val structuredValue: Double,
    val unitScale: String = "CRORES",
    val fiscalPeriod: String,
    val pageNumber: Int,
    val tableRef: String,
    val extractionConfidence: Double,
    val reconciliationStatus: String, // "MATCH", "POSSIBLE_MISMATCH", "PERIOD_MISMATCH", "UNIT_OR_CURRENCY_MISMATCH", "RESTATEMENT_REVIEW_REQUIRED"
    val verificationStatus: String = "AWAITING_VERIFICATION", // "AWAITING_VERIFICATION", "VERIFIED", "REJECTED"
    val verifiedBy: String? = null,
    val contextSnippet: String
)

/**
 * Persisted Risk Assessment and Decision Record
 */
@Entity(tableName = "risk_assessments")
data class RiskAssessment(
    @PrimaryKey val assessmentId: String = UUID.randomUUID().toString(),
    val runId: String,
    val companyId: String,
    val defaultProbability: Double?,
    val defaultRiskScore: Double?, // 0-100
    val manipulationRiskScore: Double?, // 0-100
    val beneishMScore: Double?,
    val beneishStatus: String, // "MANIPULATOR", "NON_MANIPULATOR", "UNAVAILABLE"
    val piotroskiFScore: Int?,
    val piotroskiStatus: String, // "STRONG", "MODERATE", "WEAK"
    val altmanZScore: Double?,
    val altmanStatus: String, // "SAFE", "GREY", "DISTRESS", "EXCLUDED_FINANCIAL_SECTOR"
    val priorityScore: Double,
    val priorityRank: Int,
    val alertSelected: Boolean,
    val scorableStatus: String = "SCORED", // "SCORED", "PARTIALLY_SCORED", "UNSCORABLE"
    val topRiskDrivers: String, // Comma separated tags
    val shapContributionsJson: String,
    val ruleExplanationsJson: String,
    val asOfDate: String
)

/**
 * Immutable Analyst Review Action
 */
@Entity(tableName = "review_actions")
data class ReviewAction(
    @PrimaryKey val actionId: String = UUID.randomUUID().toString(),
    val assessmentId: String,
    val companyId: String,
    val analystName: String,
    val disposition: String, // "ESCALATE_TO_COMMITTEE", "REJECT_ALERT", "MONITOR", "REQUEST_AUDIT"
    val notes: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Feature Attribution for SHAP Waterfall Display
 */
data class ShapFeature(
    val featureName: String,
    val displayName: String,
    val featureValue: Double,
    val shapValue: Double, // Contribution to model log-odds
    val category: String // "LIQUIDITY", "LEVERAGE", "PROFITABILITY", "GOVERNANCE", "NETWORK"
)

/**
 * Quarterly Assessment Run Record
 */
data class AssessmentRun(
    val runId: String,
    val asOfDate: String,
    val eligibleCompanyCount: Int,
    val alertBudgetCap: Int, // floor(N * 0.05)
    val alertsSelectedCount: Int,
    val modelVersion: String,
    val policyVersion: String = "topk-cost20-v1",
    val executionStatus: String = "COMPLETED"
)

/**
 * Benchmark & Ablation Evaluation Outcome
 */
data class AblationResult(
    val experimentName: String,
    val configuration: String,
    val sampleSize: Int,
    val alertRateCap: Double = 0.05,
    val recallAt5Pct: Double,
    val precisionAt5Pct: Double,
    val prAuc: Double,
    val expectedCost20to1: Double,
    val leadTimeQuarters: Int,
    val questionAnswered: String
)
