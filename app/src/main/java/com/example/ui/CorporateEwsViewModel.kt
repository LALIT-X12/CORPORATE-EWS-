package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.forensics.ForensicCalculator
import com.example.data.model.*
import com.example.data.repository.ActiveCohort
import com.example.data.repository.ConnectionMode
import com.example.data.repository.CorporateEwsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class NavigationTab {
    OVERVIEW,
    WATCHLIST,
    INVESTIGATE,
    EVIDENCE,
    SETTINGS
}

enum class WatchlistSort {
    PRIORITY_RANK,
    DEFAULT_RISK,
    MANIPULATION_SCORE,
    COMPANY_NAME
}

data class WatchlistItem(
    val company: Company,
    val assessment: RiskAssessment?,
    val isAlertSelected: Boolean,
    val rank: Int,
    val defaultRiskScore: Double?,
    val manipulationRiskScore: Double?,
    val topRiskDrivers: String,
    val dataQualityStatus: String
)

class CorporateEwsViewModel(
    private val repository: CorporateEwsRepository
) : ViewModel() {

    val connectionMode = repository.connectionMode
    val apiBaseUrl = repository.apiBaseUrl
    val activeCohort = repository.activeCohort
    val currentRun = repository.currentRun

    private val _currentTab = MutableStateFlow(NavigationTab.OVERVIEW)
    val currentTab: StateFlow<NavigationTab> = _currentTab

    private val _selectedCompanyId = MutableStateFlow<String?>(null)
    val selectedCompanyId: StateFlow<String?> = _selectedCompanyId

    private val _investigationTabIndex = MutableStateFlow(0)
    val investigationTabIndex: StateFlow<Int> = _investigationTabIndex

    // Filters
    val searchQuery = MutableStateFlow("")
    val selectedSector = MutableStateFlow<String?>(null)
    val filterAlertSelectedOnly = MutableStateFlow(false)
    val filterManipulatorsOnly = MutableStateFlow(false)
    val filterUnverifiedEvidenceOnly = MutableStateFlow(false)
    val currentSort = MutableStateFlow(WatchlistSort.PRIORITY_RANK)

    val companies = repository.getAllCompanies()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val assessments = repository.getAllAssessments()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allClaims = repository.getAllClaims()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val ablationResults = repository.getAblationResults()

    // Combined watchlist reacting to filters
    val watchlistItems: StateFlow<List<WatchlistItem>> = combine(
        companies,
        assessments
    ) { compList, assessList ->
        val assessMap = assessList.associateBy { it.companyId }
        compList.map { comp ->
            val assess = assessMap[comp.companyId]
            WatchlistItem(
                company = comp,
                assessment = assess,
                isAlertSelected = assess?.alertSelected ?: false,
                rank = assess?.priorityRank ?: 999,
                defaultRiskScore = assess?.defaultRiskScore,
                manipulationRiskScore = assess?.manipulationRiskScore,
                topRiskDrivers = assess?.topRiskDrivers ?: "Pending Quarterly Review Run",
                dataQualityStatus = assess?.scorableStatus ?: "SCORED"
            )
        }
    }.combine(searchQuery) { items, query ->
        if (query.isBlank()) items else items.filter {
            it.company.legalName.contains(query, ignoreCase = true) ||
                    it.company.tradeName.contains(query, ignoreCase = true) ||
                    it.company.cin.contains(query, ignoreCase = true)
        }
    }.combine(selectedSector) { items, sector ->
        if (sector == null) items else items.filter { it.company.sectorCode == sector }
    }.combine(filterAlertSelectedOnly) { items, alertOnly ->
        if (!alertOnly) items else items.filter { it.isAlertSelected }
    }.combine(filterManipulatorsOnly) { items, manipOnly ->
        if (!manipOnly) items else items.filter { it.assessment?.beneishStatus == "POTENTIAL_MANIPULATOR" }
    }.combine(currentSort) { items, sort ->
        when (sort) {
            WatchlistSort.PRIORITY_RANK -> items.sortedBy { it.rank }
            WatchlistSort.DEFAULT_RISK -> items.sortedByDescending { it.defaultRiskScore ?: -1.0 }
            WatchlistSort.MANIPULATION_SCORE -> items.sortedByDescending { it.manipulationRiskScore ?: -1.0 }
            WatchlistSort.COMPANY_NAME -> items.sortedBy { it.company.legalName }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Selected company deep dive flows
    val selectedCompany: StateFlow<Company?> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getCompany(id) else flowOf(null)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val selectedFinancialPeriods: StateFlow<List<FinancialPeriod>> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getFinancialPeriods(id) else flowOf(emptyList())
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val selectedSoftSignals: StateFlow<List<SoftSignal>> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getSoftSignals(id) else flowOf(emptyList())
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val selectedRelationships: StateFlow<List<EntityRelationship>> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getRelationships(id) else flowOf(emptyList())
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val selectedAssessment: StateFlow<RiskAssessment?> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getAssessmentForCompany(id) else flowOf(null)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val selectedClaims: StateFlow<List<EvidenceClaim>> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getClaimsForCompany(id) else flowOf(emptyList())
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val selectedReviewActions: StateFlow<List<ReviewAction>> = _selectedCompanyId
        .flatMapLatest { id ->
            if (id != null) repository.getReviewActions(id) else flowOf(emptyList())
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun navigateTo(tab: NavigationTab) {
        _currentTab.value = tab
    }

    fun selectCompany(companyId: String, targetTab: Int = 0) {
        _selectedCompanyId.value = companyId
        _investigationTabIndex.value = targetTab
        _currentTab.value = NavigationTab.INVESTIGATE
    }

    fun setInvestigationTabIndex(index: Int) {
        _investigationTabIndex.value = index
    }

    fun verifyClaim(claimId: String, status: String, verifiedBy: String = "Lead Credit Analyst") {
        viewModelScope.launch {
            repository.updateClaimStatus(claimId, status, verifiedBy)
        }
    }

    fun verifyRelationship(relationshipId: String, status: String) {
        viewModelScope.launch {
            repository.updateRelationshipStatus(relationshipId, status)
        }
    }

    fun submitReviewAction(disposition: String, notes: String, analystName: String = "Lead Credit Analyst") {
        val companyId = _selectedCompanyId.value ?: return
        val assessId = selectedAssessment.value?.assessmentId ?: "ass-default"
        viewModelScope.launch {
            repository.recordReviewAction(assessId, companyId, analystName, disposition, notes)
        }
    }

    fun setConnectionMode(mode: ConnectionMode) {
        repository.setConnectionMode(mode)
    }

    fun setApiBaseUrl(url: String) {
        repository.setApiBaseUrl(url)
    }

    fun setActiveCohort(cohort: ActiveCohort) {
        repository.setActiveCohort(cohort)
    }

    init {
        // Auto select first company if available
        viewModelScope.launch {
            companies.collect { list ->
                if (_selectedCompanyId.value == null && list.isNotEmpty()) {
                    _selectedCompanyId.value = list.first().companyId
                }
            }
        }
    }

    class Factory(private val repository: CorporateEwsRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return CorporateEwsViewModel(repository) as T
        }
    }
}
