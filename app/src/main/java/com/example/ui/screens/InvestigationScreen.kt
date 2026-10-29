package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.forensics.ForensicCalculator
import com.example.data.model.*
import com.example.ui.CorporateEwsViewModel
import com.example.ui.NavigationTab
import com.example.ui.components.*
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvestigationScreen(
    viewModel: CorporateEwsViewModel,
    modifier: Modifier = Modifier
) {
    val selectedCompany by viewModel.selectedCompany.collectAsState()
    val periods by viewModel.selectedFinancialPeriods.collectAsState()
    val signals by viewModel.selectedSoftSignals.collectAsState()
    val relationships by viewModel.selectedRelationships.collectAsState()
    val assessment by viewModel.selectedAssessment.collectAsState()
    val claims by viewModel.selectedClaims.collectAsState()
    val reviewActions by viewModel.selectedReviewActions.collectAsState()
    val currentTabIdx by viewModel.investigationTabIndex.collectAsState()

    var showDispositionDialog by remember { mutableStateOf(false) }

    // BackHandler to return to Watchlist
    BackHandler {
        viewModel.navigateTo(NavigationTab.WATCHLIST)
    }

    val tabTitles = listOf(
        "Overview",
        "Financials",
        "Manipulation",
        "Relationship",
        "Evidence",
        "Explainability",
        "Review History"
    )

    if (selectedCompany == null) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No borrower selected for investigation.", color = NeutralSlate)
        }
        return
    }

    val company = selectedCompany!!

    Column(
        modifier = modifier
            .fillMaxSize()
            .testTag("investigation_screen")
    ) {
        // Sticky Header with Company Profile Summary
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = NavySurfaceDark,
            shadowElevation = 4.dp
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = company.tradeName,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = TextFrostWhite
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = NavyBackgroundDark
                            ) {
                                Text(
                                    text = company.sectorCode,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AnalyticalCyan,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = company.legalName,
                            style = MaterialTheme.typography.bodySmall,
                            color = NeutralSlate
                        )
                        Text(
                            text = "CIN: ${company.cin} • Peer Group: ${company.peerGroupId}",
                            style = MaterialTheme.typography.bodySmall,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            color = NeutralSlate.copy(alpha = 0.7f)
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        if (assessment?.alertSelected == true) {
                            RiskBadge("5% ALERT QUEUE", "CRITICAL")
                        } else {
                            RiskBadge("MONITOR ONLY", "SAFE")
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Rank #${assessment?.priorityRank ?: "--"}",
                            style = MaterialTheme.typography.labelSmall,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = AnalyticalCyan
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                val colors = CorporateEwsTheme.colors
                // Scrollable 7 Tabs
                ScrollableTabRow(
                    selectedTabIndex = currentTabIdx,
                    containerColor = colors.surface,
                    contentColor = colors.textPrimary,
                    edgePadding = 0.dp,
                    indicator = { tabPositions ->
                        TabRowDefaults.SecondaryIndicator(
                            modifier = Modifier.tabIndicatorOffset(tabPositions[currentTabIdx]),
                            color = colors.primaryAccent
                        )
                    }
                ) {
                    tabTitles.forEachIndexed { index, title ->
                        Tab(
                            selected = currentTabIdx == index,
                            onClick = { viewModel.setInvestigationTabIndex(index) },
                            text = {
                                Text(
                                    text = title,
                                    fontSize = 12.sp,
                                    fontWeight = if (currentTabIdx == index) FontWeight.Bold else FontWeight.Normal,
                                    color = if (currentTabIdx == index) colors.textPrimary else colors.textMuted
                                )
                            }
                        )
                    }
                }
            }
        }

        // Tab Content
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            when (currentTabIdx) {
                0 -> InvestigationOverviewTab(company, assessment, periods, signals)
                1 -> InvestigationFinancialsTab(periods)
                2 -> InvestigationManipulationTab(periods, company.sectorCode, assessment)
                3 -> InvestigationRelationshipTab(company, relationships, viewModel)
                4 -> InvestigationEvidenceTab(claims, viewModel)
                5 -> InvestigationExplainabilityTab(assessment)
                6 -> InvestigationReviewHistoryTab(reviewActions, onOpenDisposition = { showDispositionDialog = true })
            }
        }
    }

    if (showDispositionDialog) {
        RecordDispositionDialog(
            companyName = company.tradeName,
            onDismiss = { showDispositionDialog = false },
            onSubmit = { disposition, notes ->
                viewModel.submitReviewAction(disposition, notes)
                showDispositionDialog = false
            }
        )
    }
}

@Composable
fun InvestigationOverviewTab(
    company: Company,
    assessment: RiskAssessment?,
    periods: List<FinancialPeriod>,
    signals: List<SoftSignal>
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Executive Risk Assessment Snapshot",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Default Probability", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                            val prob = assessment?.defaultProbability
                            Text(
                                text = if (prob != null) "${String.format("%.1f", prob * 100)}%" else "Pending",
                                style = MaterialTheme.typography.titleMedium,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = if ((prob ?: 0.0) > 0.8) RiskDistressRed else AnalyticalTeal
                            )
                        }

                        Column {
                            Text("Manipulation Risk", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                            val manip = assessment?.manipulationRiskScore
                            Text(
                                text = if (manip != null) "${String.format("%.1f", manip)} / 100" else "Pending",
                                style = MaterialTheme.typography.titleMedium,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = if ((manip ?: 0.0) > 75) RiskWarningAmber else HealthSafeGreen
                            )
                        }

                        Column {
                            Text("Data Quality", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                            Text(
                                text = assessment?.scorableStatus ?: "SCORED",
                                style = MaterialTheme.typography.titleMedium,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = AnalyticalCyan
                            )
                        }
                    }
                }
            }
        }

        // Soft Signals Section
        item {
            SectionHeader(title = "Governance Soft Signals & Alerts", subtitle = "Auditor actions, promoter pledge & regulatory filings")
            if (signals.isEmpty()) {
                Text("No negative governance soft signals detected on record.", color = NeutralSlate, fontSize = 12.sp)
            } else {
                signals.forEach { sig ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = sig.signalType.replace('_', ' '),
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = TextFrostWhite
                                )
                                Text(
                                    text = sig.details,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = NeutralSlate,
                                    fontSize = 11.sp
                                )
                                Text(
                                    text = "Source: ${sig.sourceName} • ${sig.eventDate}",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontSize = 10.sp,
                                    color = AnalyticalCyan
                                )
                            }
                            RiskBadge(sig.severity, sig.severity)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun InvestigationFinancialsTab(periods: List<FinancialPeriod>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            SectionHeader(
                title = "Point-in-Time Financial Statements",
                subtitle = "Values in INR Crores • Historical Pre-Event Filing History"
            )
        }

        items(periods) { p ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "FY${p.fiscalYear} Annual Statement",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextFrostWhite
                        )
                        Text(
                            text = "Filing: ${p.filingDate}",
                            style = MaterialTheme.typography.bodySmall,
                            fontFamily = FontFamily.Monospace,
                            color = AnalyticalCyan
                        )
                    }

                    Divider(color = NavyCardStrokeDark, modifier = Modifier.padding(vertical = 8.dp))

                    // Key Financial Numbers
                    FinancialRow("Revenue", "₹${p.revenue.toInt()} Cr", "COGS", "₹${p.cogs.toInt()} Cr")
                    FinancialRow("EBIT", "₹${p.ebit.toInt()} Cr", "Net Income", "₹${p.netIncome.toInt()} Cr", isNegative = p.netIncome < 0)
                    FinancialRow("Operating Cash Flow", "₹${p.operatingCashFlow.toInt()} Cr", "Total Debt", "₹${p.totalDebt.toInt()} Cr", isNegative = p.operatingCashFlow < 0)
                    FinancialRow("Total Assets", "₹${p.totalAssets.toInt()} Cr", "Current Liabilities", "₹${p.currentLiabilities.toInt()} Cr")
                    FinancialRow("Book Equity", "₹${p.bookEquity.toInt()} Cr", "Receivables", "₹${p.receivables.toInt()} Cr", isNegative = p.bookEquity < 0)
                }
            }
        }
    }
}

@Composable
fun FinancialRow(label1: String, val1: String, label2: String, val2: String, isNegative: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(label1, style = MaterialTheme.typography.labelSmall, color = NeutralSlate, fontSize = 10.sp)
            Text(val1, style = MaterialTheme.typography.bodyMedium, fontFamily = FontFamily.Monospace, color = if (isNegative) RiskDistressRed else TextFrostWhite)
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(label2, style = MaterialTheme.typography.labelSmall, color = NeutralSlate, fontSize = 10.sp)
            Text(val2, style = MaterialTheme.typography.bodyMedium, fontFamily = FontFamily.Monospace, color = TextFrostWhite)
        }
    }
}

@Composable
fun InvestigationManipulationTab(
    periods: List<FinancialPeriod>,
    sectorCode: String,
    assessment: RiskAssessment?
) {
    val curr = periods.firstOrNull()
    val prev = if (periods.size >= 2) periods[1] else null

    val beneish = remember(curr, prev) {
        if (curr != null) ForensicCalculator.calculateBeneishMScore(curr, prev) else null
    }

    val piotroski = remember(curr, prev) {
        if (curr != null) ForensicCalculator.calculatePiotroskiFScore(curr, prev) else null
    }

    val altman = remember(curr) {
        if (curr != null) ForensicCalculator.calculateAltmanZScore(curr, sectorCode) else null
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        // Beneish M-Score Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Beneish M-Score (Manipulation)",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextFrostWhite
                            )
                            Text(
                                text = "Standard 8-variable model (Threshold > -1.78)",
                                style = MaterialTheme.typography.bodySmall,
                                color = NeutralSlate
                            )
                        }
                        val isManip = (beneish?.mScore ?: -9.0) > -1.78
                        RiskBadge(if (isManip) "MANIPULATOR" else "NORMAL", if (isManip) "CRITICAL" else "SAFE")
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Score: ${if (beneish?.mScore != null) String.format("%.2f", beneish.mScore) else "N/A"}",
                        style = MaterialTheme.typography.headlineMedium,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if ((beneish?.mScore ?: -9.0) > -1.78) RiskDistressRed else AnalyticalTeal
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "8-Component Breakdown:",
                        style = MaterialTheme.typography.labelSmall,
                        color = NeutralSlate
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "DSRI: ${String.format("%.2f", beneish?.dsri ?: 1.0)} • GMI: ${String.format("%.2f", beneish?.gmi ?: 1.0)} • AQI: ${String.format("%.2f", beneish?.aqi ?: 1.0)} • SGI: ${String.format("%.2f", beneish?.sgi ?: 1.0)}",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TextFrostWhite
                    )
                    Text(
                        text = "DEPI: ${String.format("%.2f", beneish?.depi ?: 1.0)} • SGAI: ${String.format("%.2f", beneish?.sgai ?: 1.0)} • TATA (+4.679): ${String.format("%.3f", beneish?.tata ?: 0.0)} • LVGI (-0.327): ${String.format("%.2f", beneish?.lvgi ?: 1.0)}",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TextFrostWhite
                    )
                }
            }
        }

        // Piotroski F-Score Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Piotroski F-Score (Fundamental Health)",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextFrostWhite
                            )
                            Text(
                                text = "9 Binary criteria (0-3 Weak, 4-7 Moderate, 8-9 Strong)",
                                style = MaterialTheme.typography.bodySmall,
                                color = NeutralSlate
                            )
                        }
                        RiskBadge(piotroski?.status ?: "MODERATE", piotroski?.status ?: "MODERATE")
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Score: ${piotroski?.score ?: "--"} / 9",
                        style = MaterialTheme.typography.headlineMedium,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if ((piotroski?.score ?: 9) <= 3) RiskDistressRed else AnalyticalTeal
                    )
                }
            }
        }

        // Altman Z''-Score Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Altman Z''-Score (Emerging Market)",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextFrostWhite
                            )
                            Text(
                                text = "Uncentered 4-variable model (<1.10 Distress, >2.60 Safe)",
                                style = MaterialTheme.typography.bodySmall,
                                color = NeutralSlate
                            )
                        }
                        RiskBadge(altman?.status ?: "SAFE", altman?.status ?: "SAFE")
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (altman?.status == "EXCLUDED_FINANCIAL_SECTOR") {
                        Text(
                            text = "EXCLUDED: Financial & Banking Sector",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = NeutralSlate
                        )
                        Text(
                            text = "NBFCs and banks maintain structural leverage that distorts non-financial solvency formulas.",
                            style = MaterialTheme.typography.bodySmall,
                            color = NeutralSlate,
                            fontSize = 11.sp
                        )
                    } else {
                        Text(
                            text = "Z'': ${if (altman?.zScore != null) String.format("%.2f", altman.zScore) else "N/A"}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = if ((altman?.zScore ?: 9.0) < 1.1) RiskDistressRed else AnalyticalTeal
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "X1(WC/TA): ${String.format("%.2f", altman?.x1WorkingCapital ?: 0.0)} • X2(RE/TA): ${String.format("%.2f", altman?.x2RetainedEarnings ?: 0.0)} • X3(EBIT/TA): ${String.format("%.2f", altman?.x3Ebit ?: 0.0)} • X4(Equity/Debt): ${String.format("%.2f", altman?.x4BookEquity ?: 0.0)}",
                            style = MaterialTheme.typography.bodySmall,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = NeutralSlate
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InvestigationRelationshipTab(
    company: Company,
    relationships: List<EntityRelationship>,
    viewModel: CorporateEwsViewModel
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            RelationshipGraphView(
                companyName = company.tradeName,
                relationships = relationships
            )
        }

        item {
            SectionHeader(
                title = "Entity Resolution & Relationship Audit",
                subtitle = "Confirm or reject proposed corporate connections"
            )
        }

        items(relationships) { rel ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = rel.targetEntityName,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = TextFrostWhite
                        )
                        RiskBadge(rel.verificationStatus, rel.verificationStatus)
                    }
                    Text(
                        text = "Path: ${rel.pathDescription}",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate,
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { viewModel.verifyRelationship(rel.relationshipId, "VERIFIED") },
                            colors = ButtonDefaults.buttonColors(containerColor = AnalyticalTeal, contentColor = NavyBackgroundDark),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("Verify Edge", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { viewModel.verifyRelationship(rel.relationshipId, "REJECTED") },
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(34.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = NeutralSlate)
                        ) {
                            Text("Reject Match", fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun InvestigationEvidenceTab(
    claims: List<EvidenceClaim>,
    viewModel: CorporateEwsViewModel
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            SectionHeader(
                title = "Multi-Modal Document Claims & Reconciliation",
                subtitle = "Extracted filing disclosures vs structured database records"
            )
        }

        if (claims.isEmpty()) {
            item {
                Text("No extracted document claims registered for this borrower.", color = NeutralSlate)
            }
        }

        items(claims) { claim ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (claim.reconciliationStatus == "MATCH") NavyCardStrokeDark else RiskWarningAmber
                    )
                )
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = claim.metricName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextFrostWhite
                        )
                        RiskBadge(claim.reconciliationStatus, if (claim.reconciliationStatus == "MATCH") "SAFE" else "WARNING")
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Extracted Filing Claim", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                            Text("₹${claim.claimedValue.toInt()} Cr", fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = TextFrostWhite)
                        }
                        Column {
                            Text("Structured Database Record", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                            Text("₹${claim.structuredValue.toInt()} Cr", fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = TextFrostWhite)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Location: Page ${claim.pageNumber} (${claim.tableRef}) • Conf: ${String.format("%.0f", claim.extractionConfidence * 100)}%",
                        style = MaterialTheme.typography.bodySmall,
                        fontSize = 11.sp,
                        color = AnalyticalCyan
                    )
                    Text(
                        text = "\"${claim.contextSnippet}\"",
                        style = MaterialTheme.typography.bodySmall,
                        fontSize = 11.sp,
                        color = NeutralSlate
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { viewModel.verifyClaim(claim.claimId, "VERIFIED") },
                            colors = ButtonDefaults.buttonColors(containerColor = AnalyticalTeal, contentColor = NavyBackgroundDark),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("Verify Fact", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { viewModel.verifyClaim(claim.claimId, "REJECTED") },
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(34.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = NeutralSlate)
                        ) {
                            Text("Reject Mismatch", fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun InvestigationExplainabilityTab(assessment: RiskAssessment?) {
    val sampleShapFeatures = remember {
        listOf(
            ShapFeature("ocf_debt", "Negative Operating Cash Flow", -1420.0, 0.88, "LIQUIDITY"),
            ShapFeature("tot_debt", "Surge in Total Debt / Assets", 0.78, 0.76, "LEVERAGE"),
            ShapFeature("spv_links", "Connected Distressed Entities (4 SPVs)", 4.0, 0.62, "NETWORK"),
            ShapFeature("aud_resign", "Joint Statutory Auditor Resignation", 1.0, 0.58, "GOVERNANCE"),
            ShapFeature("int_cov", "Interest Coverage (< 1.0x)", 0.62, 0.41, "LIQUIDITY"),
            ShapFeature("asset_base", "Large Asset Base Cushion", 115814.0, -0.45, "SOLVENCY")
        )
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            ShapWaterfallChart(
                features = sampleShapFeatures,
                baseValue = -2.14,
                finalPrediction = assessment?.defaultProbability ?: 0.942
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Deterministic Risk Rule Triggers",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• Working capital negative (-₹24,050 Cr) with high short-term commercial paper debt maturity.",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate
                    )
                    Text(
                        text = "• Altman Z'' score of 0.45 resides deeply in the Distress Zone (< 1.10).",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate
                    )
                    Text(
                        text = "• Auditor resignation: Statutory auditor SRBC & Co LLP resigned citing disclosure gaps.",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate
                    )
                    Text(
                        text = "• Relational contagion: Parent guaranteed defaulting subsidiary debt without board disclosures.",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate
                    )
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Asymmetric Operational Loss Rationale",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Expected Cost = 20 × False Negatives + 1 × False Positives.\nBecause missing a corporate default incurs catastrophic write-downs (20x cost), the alert policy intentionally selects this borrower for mandatory committee review despite capacity constraints.",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

@Composable
fun InvestigationReviewHistoryTab(
    reviews: List<ReviewAction>,
    onOpenDisposition: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Credit Desk Disposition Audit Trail",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Text(
                        text = "Immutable audit log of review decisions",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate
                    )
                }
                Button(
                    onClick = onOpenDisposition,
                    colors = ButtonDefaults.buttonColors(containerColor = AnalyticalCyan, contentColor = NavyBackgroundDark),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Record Action", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (reviews.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("No analyst reviews recorded yet for this quarterly assessment.", color = NeutralSlate, fontSize = 12.sp)
                    }
                }
            }
        }

        items(reviews) { r ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = r.disposition.replace('_', ' '),
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = TextFrostWhite
                        )
                        RiskBadge(r.disposition, if (r.disposition.contains("ESCALATE")) "CRITICAL" else "SAFE")
                    }
                    Text(
                        text = "Analyst: ${r.analystName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = AnalyticalCyan,
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = r.notes,
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate
                    )
                }
            }
        }
    }
}

@Composable
fun RecordDispositionDialog(
    companyName: String,
    onDismiss: () -> Unit,
    onSubmit: (String, String) -> Unit
) {
    var disposition by remember { mutableStateOf("ESCALATE_TO_COMMITTEE") }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Record Review Action: $companyName", color = TextFrostWhite, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Select Credit Desk Disposition:", color = NeutralSlate, fontSize = 12.sp)

                listOf(
                    "ESCALATE_TO_COMMITTEE" to "Escalate to Credit Risk Committee",
                    "MONITOR" to "Keep on Watchlist with Monthly Monitoring",
                    "REQUEST_AUDIT" to "Request Forensic Field Audit",
                    "REJECT_ALERT" to "Reject Alert with Documented Justification"
                ).forEach { (disp, label) ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        RadioButton(
                            selected = disposition == disp,
                            onClick = { disposition = disp },
                            colors = RadioButtonDefaults.colors(selectedColor = SolidBlack)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(label, color = TextFrostWhite, fontSize = 12.sp)
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Credit Committee Memorandum / Notes") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = LightSurfaceVariant,
                        unfocusedContainerColor = LightSurfaceVariant,
                        focusedTextColor = TextFrostWhite,
                        unfocusedTextColor = TextFrostWhite,
                        focusedBorderColor = SolidBlack
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(disposition, notes.ifBlank { "Formal review disposition recorded." }) },
                colors = ButtonDefaults.buttonColors(containerColor = SolidBlack, contentColor = PureWhite)
            ) {
                Text("Confirm & Record", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = NeutralSlate)
            }
        },
        containerColor = PureWhite
    )
}
