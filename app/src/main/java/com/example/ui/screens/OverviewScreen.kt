package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.forensics.ForensicCalculator
import com.example.ui.CorporateEwsViewModel
import com.example.ui.NavigationTab
import com.example.ui.components.*
import com.example.ui.theme.*

@Composable
fun OverviewScreen(
    viewModel: CorporateEwsViewModel,
    modifier: Modifier = Modifier
) {
    val companies by viewModel.companies.collectAsState()
    val assessments by viewModel.assessments.collectAsState()
    val currentRun by viewModel.currentRun.collectAsState()

    val totalCompanies = companies.size.coerceAtLeast(40)
    val alertBudgetCap = ForensicCalculator.calculateAlertCapacityCap(totalCompanies) // floor(N * 0.05)
    val alertSelectedCount = assessments.count { it.alertSelected }
    val manipulatorsCount = assessments.count { it.beneishStatus == "POTENTIAL_MANIPULATOR" }
    val highDefaultCount = assessments.count { (it.defaultProbability ?: 0.0) > 0.80 }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("overview_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        // Executive Header
        item {
            Column {
                Text(
                    text = "Executive Credit Risk Overview",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = TextFrostWhite
                )
                Text(
                    text = "Quarterly Early-Warning Run as of ${currentRun.asOfDate} • Model ${currentRun.modelVersion}",
                    style = MaterialTheme.typography.bodySmall,
                    color = NeutralSlate
                )
            }
        }

        // 5% Capacity Constraint Card
        item {
            CapacityMeterCard(
                usedSlots = alertSelectedCount,
                totalCapacitySlots = alertBudgetCap,
                totalPortfolioCount = totalCompanies
            )
        }

        // KPI Summary Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricValueCard(
                    title = "Monitored Portfolio",
                    value = "$totalCompanies",
                    subtitle = "Eligible corporate borrowers",
                    statusColor = AnalyticalCyan,
                    modifier = Modifier.weight(1f)
                )
                MetricValueCard(
                    title = "Alert Capacity (5%)",
                    value = "$alertBudgetCap",
                    subtitle = "Max operational review slots",
                    statusColor = AnalyticalTeal,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            val colors = CorporateEwsTheme.colors
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricValueCard(
                    title = "Default Distress",
                    value = "$highDefaultCount",
                    subtitle = "Probability > 80% (IBC/Default)",
                    statusColor = colors.redRuby,
                    modifier = Modifier.weight(1f)
                )
                MetricValueCard(
                    title = "Manipulation Flags",
                    value = "$manipulatorsCount",
                    subtitle = "Beneish M > -1.78 screening",
                    statusColor = colors.redScarlet,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Separate Default vs Manipulation Distinction Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = null,
                            tint = AnalyticalCyan,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Decoupled Risk Decision Framework",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = TextFrostWhite
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Credit default risk (statistical solvency inability) and financial accounting manipulation (reporting fraud) are reported as two separate risk vectors and are never conflated into an opaque blended score.",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate,
                        fontSize = 11.sp
                    )
                }
            }
        }

        // Lead-Time Detection Performance Curve
        item {
            LeadTimeCurveChart()
        }

        // Benchmark & Ablation Evaluation Matrix
        item {
            SectionHeader(
                title = "Benchmark & Ablation Evaluation Results",
                subtitle = "Impact of Relational & Multi-Modal Evidence on 5% Alert Budget"
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Model Configuration", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, modifier = Modifier.weight(1.8f))
                        Text("Recall@5%", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, modifier = Modifier.weight(1f))
                        Text("PR-AUC", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, modifier = Modifier.weight(0.9f))
                        Text("Cost (20:1)", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, modifier = Modifier.weight(1f))
                    }
                    Divider(color = NavyCardStrokeDark, modifier = Modifier.padding(vertical = 8.dp))

                    viewModel.ablationResults.forEach { ab ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = ab.experimentName,
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.SemiBold,
                                color = TextFrostWhite,
                                modifier = Modifier.weight(1.8f)
                            )
                            Text(
                                text = "${String.format("%.0f", ab.recallAt5Pct * 100)}%",
                                style = MaterialTheme.typography.bodySmall,
                                fontFamily = FontFamily.Monospace,
                                color = AnalyticalTeal,
                                modifier = Modifier.weight(1f)
                            )
                            Text(
                                text = String.format("%.3f", ab.prAuc),
                                style = MaterialTheme.typography.bodySmall,
                                fontFamily = FontFamily.Monospace,
                                color = TextFrostWhite,
                                modifier = Modifier.weight(0.9f)
                            )
                            Text(
                                text = "${ab.expectedCost20to1.toInt()}",
                                style = MaterialTheme.typography.bodySmall,
                                fontFamily = FontFamily.Monospace,
                                color = if (ab.expectedCost20to1 <= 30) AnalyticalTeal else RiskWarningAmber,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
        }

        // Quick Navigation Actions
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = { viewModel.navigateTo(NavigationTab.WATCHLIST) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = SolidBlack, contentColor = PureWhite),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(imageVector = Icons.Default.List, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Open Watchlist", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                OutlinedButton(
                    onClick = { viewModel.navigateTo(NavigationTab.EVIDENCE) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SolidBlack),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(SolidBlack)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(imageVector = Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Audit Evidence", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}
