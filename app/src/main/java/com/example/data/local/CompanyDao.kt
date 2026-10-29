package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CompanyDao {

    @Query("SELECT * FROM companies ORDER BY legalName ASC")
    fun getAllCompanies(): Flow<List<Company>>

    @Query("SELECT * FROM companies WHERE companyId = :companyId LIMIT 1")
    fun getCompanyById(companyId: String): Flow<Company?>

    @Query("SELECT * FROM financial_periods WHERE companyId = :companyId ORDER BY fiscalYear DESC, fiscalQuarter DESC")
    fun getFinancialPeriods(companyId: String): Flow<List<FinancialPeriod>>

    @Query("SELECT * FROM soft_signals WHERE companyId = :companyId ORDER BY eventDate DESC")
    fun getSoftSignals(companyId: String): Flow<List<SoftSignal>>

    @Query("SELECT * FROM entity_relationships WHERE companyId = :companyId ORDER BY isDistressedLink DESC, confidence DESC")
    fun getRelationships(companyId: String): Flow<List<EntityRelationship>>

    @Query("SELECT * FROM risk_assessments ORDER BY priorityRank ASC")
    fun getAllAssessments(): Flow<List<RiskAssessment>>

    @Query("SELECT * FROM risk_assessments WHERE companyId = :companyId LIMIT 1")
    fun getAssessmentForCompany(companyId: String): Flow<RiskAssessment?>

    @Query("SELECT * FROM evidence_claims WHERE companyId = :companyId ORDER BY pageNumber ASC")
    fun getClaimsForCompany(companyId: String): Flow<List<EvidenceClaim>>

    @Query("SELECT * FROM evidence_claims ORDER BY reconciliationStatus DESC")
    fun getAllClaims(): Flow<List<EvidenceClaim>>

    @Query("SELECT * FROM review_actions WHERE companyId = :companyId ORDER BY timestamp DESC")
    fun getReviewActions(companyId: String): Flow<List<ReviewAction>>

    @Query("UPDATE evidence_claims SET verificationStatus = :status, verifiedBy = :verifiedBy WHERE claimId = :claimId")
    suspend fun updateClaimStatus(claimId: String, status: String, verifiedBy: String)

    @Query("UPDATE entity_relationships SET verificationStatus = :status WHERE relationshipId = :relationshipId")
    suspend fun updateRelationshipStatus(relationshipId: String, status: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReviewAction(action: ReviewAction)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCompanies(companies: List<Company>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFinancialPeriods(periods: List<FinancialPeriod>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSoftSignals(signals: List<SoftSignal>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRelationships(relationships: List<EntityRelationship>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvidenceDocuments(docs: List<EvidenceDocument>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClaims(claims: List<EvidenceClaim>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssessments(assessments: List<RiskAssessment>)
}
