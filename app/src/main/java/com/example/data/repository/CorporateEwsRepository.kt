package com.example.data.repository

import android.content.Context
import com.example.data.local.AppDatabase
import com.example.data.local.CompanyDao
import com.example.data.local.SeedDataProvider
import com.example.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

enum class ConnectionMode {
    EMBEDDED_OFFLINE,
    LIVE_REST_API
}

enum class ActiveCohort {
    INDIAN_CASE_PANEL,
    UCI_POLISH_BENCHMARK,
    UCI_TAIWANESE_BENCHMARK,
    ALL_COHORTS
}

class CorporateEwsRepository(
    private val dao: CompanyDao,
    private val externalScope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) {

    private val _connectionMode = MutableStateFlow(ConnectionMode.EMBEDDED_OFFLINE)
    val connectionMode: StateFlow<ConnectionMode> = _connectionMode

    private val _apiBaseUrl = MutableStateFlow("http://10.0.2.2:8000/api/v1")
    val apiBaseUrl: StateFlow<String> = _apiBaseUrl

    private val _activeCohort = MutableStateFlow(ActiveCohort.ALL_COHORTS)
    val activeCohort: StateFlow<ActiveCohort> = _activeCohort

    private val _currentRun = MutableStateFlow(
        AssessmentRun(
            runId = "run-2026-q3",
            asOfDate = "2026-09-30",
            eligibleCompanyCount = 40,
            alertBudgetCap = 2, // floor(40 * 0.05)
            alertsSelectedCount = 2,
            modelVersion = "distress-polish-v0.1.0",
            policyVersion = "topk-cost20-v1",
            executionStatus = "COMPLETED"
        )
    )
    val currentRun: StateFlow<AssessmentRun> = _currentRun

    init {
        externalScope.launch {
            seedDatabaseIfEmpty()
        }
    }

    private suspend fun seedDatabaseIfEmpty() {
        val existing = dao.getAllCompanies().firstOrNull()
        if (existing.isNullOrEmpty()) {
            dao.insertCompanies(SeedDataProvider.getInitialCompanies())
            dao.insertFinancialPeriods(SeedDataProvider.getInitialFinancialPeriods())
            dao.insertSoftSignals(SeedDataProvider.getInitialSoftSignals())
            dao.insertRelationships(SeedDataProvider.getInitialRelationships())
            dao.insertClaims(SeedDataProvider.getInitialEvidenceClaims())
            dao.insertAssessments(SeedDataProvider.getInitialAssessments())
        }
    }

    fun getAllCompanies(): Flow<List<Company>> = dao.getAllCompanies()

    fun getCompany(companyId: String): Flow<Company?> = dao.getCompanyById(companyId)

    fun getFinancialPeriods(companyId: String): Flow<List<FinancialPeriod>> = dao.getFinancialPeriods(companyId)

    fun getSoftSignals(companyId: String): Flow<List<SoftSignal>> = dao.getSoftSignals(companyId)

    fun getRelationships(companyId: String): Flow<List<EntityRelationship>> = dao.getRelationships(companyId)

    fun getAllAssessments(): Flow<List<RiskAssessment>> = dao.getAllAssessments()

    fun getAssessmentForCompany(companyId: String): Flow<RiskAssessment?> = dao.getAssessmentForCompany(companyId)

    fun getClaimsForCompany(companyId: String): Flow<List<EvidenceClaim>> = dao.getClaimsForCompany(companyId)

    fun getAllClaims(): Flow<List<EvidenceClaim>> = dao.getAllClaims()

    fun getReviewActions(companyId: String): Flow<List<ReviewAction>> = dao.getReviewActions(companyId)

    fun getAblationResults(): List<AblationResult> = SeedDataProvider.getInitialAblationResults()

    suspend fun updateClaimStatus(claimId: String, status: String, verifiedBy: String) {
        dao.updateClaimStatus(claimId, status, verifiedBy)
    }

    suspend fun updateRelationshipStatus(relationshipId: String, status: String) {
        dao.updateRelationshipStatus(relationshipId, status)
    }

    suspend fun recordReviewAction(assessmentId: String, companyId: String, analystName: String, disposition: String, notes: String) {
        val action = ReviewAction(
            assessmentId = assessmentId,
            companyId = companyId,
            analystName = analystName,
            disposition = disposition,
            notes = notes
        )
        dao.insertReviewAction(action)
    }

    fun setConnectionMode(mode: ConnectionMode) {
        _connectionMode.value = mode
    }

    fun setApiBaseUrl(url: String) {
        _apiBaseUrl.value = url
    }

    fun setActiveCohort(cohort: ActiveCohort) {
        _activeCohort.value = cohort
    }

    companion object {
        @Volatile
        private var INSTANCE: CorporateEwsRepository? = null

        fun getInstance(context: Context): CorporateEwsRepository {
            return INSTANCE ?: synchronized(this) {
                val db = AppDatabase.getDatabase(context)
                val instance = CorporateEwsRepository(db.companyDao())
                INSTANCE = instance
                instance
            }
        }
    }
}
