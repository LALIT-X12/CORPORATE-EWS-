package com.example.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.CorporateEwsViewModel
import com.example.ui.WatchlistItem
import com.example.ui.WatchlistSort
import com.example.ui.components.RiskBadge
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WatchlistScreen(
    viewModel: CorporateEwsViewModel,
    modifier: Modifier = Modifier
) {
    val items by viewModel.watchlistItems.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedSector by viewModel.selectedSector.collectAsState()
    val alertOnly by viewModel.filterAlertSelectedOnly.collectAsState()
    val manipOnly by viewModel.filterManipulatorsOnly.collectAsState()
    val currentSort by viewModel.currentSort.collectAsState()

    val sectors = listOf("INFRA", "NBFC", "AIR", "TEX", "STL", "TRV", "TEL", "AUTO", "ENG")

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("watchlist_screen")
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Header Title
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Corporate Risk Watchlist",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = TextFrostWhite
                )
                Text(
                    text = "Prioritized borrower queue • 5% Alert Budget Constrained",
                    style = MaterialTheme.typography.bodySmall,
                    color = NeutralSlate
                )
            }
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = AnalyticalCyan.copy(alpha = 0.15f),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(AnalyticalCyan))
            ) {
                Text(
                    text = "${items.size} Borrowers",
                    color = AnalyticalCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { viewModel.searchQuery.value = it },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("search_input"),
            placeholder = { Text("Search by name, trade name, or CIN...", color = NeutralSlate) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = AnalyticalCyan) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { viewModel.searchQuery.value = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = null, tint = NeutralSlate)
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = NavySurfaceVariantDark,
                unfocusedContainerColor = NavySurfaceVariantDark,
                focusedBorderColor = AnalyticalCyan,
                unfocusedBorderColor = NavyCardStrokeDark,
                focusedTextColor = TextFrostWhite,
                unfocusedTextColor = TextFrostWhite
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Filter Chips Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                selected = !alertOnly && !manipOnly && selectedSector == null,
                onClick = {
                    viewModel.filterAlertSelectedOnly.value = false
                    viewModel.filterManipulatorsOnly.value = false
                    viewModel.selectedSector.value = null
                },
                label = { Text("All (40)") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = SolidBlack,
                    selectedLabelColor = PureWhite,
                    containerColor = LightSurfaceVariant,
                    labelColor = NeutralSlate
                )
            )

            FilterChip(
                selected = alertOnly,
                onClick = { viewModel.filterAlertSelectedOnly.value = !alertOnly },
                label = { Text("Alert Selected (5% Cap)") },
                leadingIcon = { Icon(Icons.Default.NotificationImportant, contentDescription = null, modifier = Modifier.size(14.dp)) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = RiskDistressRed,
                    selectedLabelColor = Color.White,
                    containerColor = LightSurfaceVariant,
                    labelColor = NeutralSlate
                )
            )

            FilterChip(
                selected = manipOnly,
                onClick = { viewModel.filterManipulatorsOnly.value = !manipOnly },
                label = { Text("Manipulators (M-Score)") },
                leadingIcon = { Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(14.dp)) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = RiskWarningAmber,
                    selectedLabelColor = PureWhite,
                    containerColor = LightSurfaceVariant,
                    labelColor = NeutralSlate
                )
            )

            sectors.forEach { sec ->
                FilterChip(
                    selected = selectedSector == sec,
                    onClick = {
                        viewModel.selectedSector.value = if (selectedSector == sec) null else sec
                    },
                    label = { Text(sec) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SolidBlack,
                        selectedLabelColor = PureWhite,
                        containerColor = LightSurfaceVariant,
                        labelColor = NeutralSlate
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Watchlist Items
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(items, key = { it.company.companyId }) { item ->
                WatchlistRowCard(
                    item = item,
                    onClick = { viewModel.selectCompany(item.company.companyId) }
                )
            }
        }
    }
}

@Composable
fun WatchlistRowCard(
    item: WatchlistItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors
    val isAlert = item.isAlertSelected

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("watchlist_item_${item.company.companyId}"),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isAlert) colors.redAlertTint else colors.surfaceVariant
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(
                if (isAlert) colors.redRuby else colors.cardStroke
            )
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Top Row: Rank, Legal Name, Sector, Alert Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = if (isAlert) colors.redRuby else colors.surface,
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(if (isAlert) colors.redRuby else colors.cardStroke)
                        )
                    ) {
                        Text(
                            text = "#${item.rank}",
                            style = MaterialTheme.typography.labelSmall,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = if (isAlert) PureWhite else colors.textMuted,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = item.company.tradeName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = NavyBackgroundDark
                    ) {
                        Text(
                            text = item.company.sectorCode,
                            style = MaterialTheme.typography.labelSmall,
                            color = AnalyticalCyan,
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    if (item.isAlertSelected) {
                        RiskBadge("5% ALERT", "CRITICAL")
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = item.company.legalName,
                style = MaterialTheme.typography.bodySmall,
                color = NeutralSlate,
                maxLines = 1
            )
            Text(
                text = "CIN: ${item.company.cin}",
                style = MaterialTheme.typography.bodySmall,
                fontFamily = FontFamily.Monospace,
                color = NeutralSlate.copy(alpha = 0.7f),
                fontSize = 10.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Risk Metrics Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Default Risk
                Column(modifier = Modifier.weight(1f)) {
                    Text("Default Distress", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, fontSize = 10.sp)
                    val defProb = item.assessment?.defaultProbability
                    Text(
                        text = if (defProb != null) "${String.format("%.1f", defProb * 100)}%" else "N/A",
                        style = MaterialTheme.typography.titleSmall,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if ((defProb ?: 0.0) > 0.8) RiskDistressRed else AnalyticalTeal
                    )
                }

                // Manipulation Screening
                Column(modifier = Modifier.weight(1f)) {
                    Text("Beneish M-Score", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, fontSize = 10.sp)
                    val mScore = item.assessment?.beneishMScore
                    Text(
                        text = if (mScore != null) String.format("%.2f", mScore) else "N/A",
                        style = MaterialTheme.typography.titleSmall,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if ((mScore ?: -9.0) > -1.78) RiskWarningAmber else HealthSafeGreen
                    )
                }

                // Altman Z''
                Column(modifier = Modifier.weight(1f)) {
                    Text("Altman Z''", style = MaterialTheme.typography.labelSmall, color = NeutralSlate, fontSize = 10.sp)
                    val zScore = item.assessment?.altmanZScore
                    val isExcluded = item.assessment?.altmanStatus == "EXCLUDED_FINANCIAL_SECTOR"
                    Text(
                        text = if (isExcluded) "EXCLUDED" else if (zScore != null) String.format("%.2f", zScore) else "N/A",
                        style = MaterialTheme.typography.titleSmall,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if (isExcluded) NeutralSlate else if ((zScore ?: 9.0) < 1.1) RiskDistressRed else HealthSafeGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Main Risk Driver Tagline
            Text(
                text = "Drivers: ${item.topRiskDrivers}",
                style = MaterialTheme.typography.bodySmall,
                color = NeutralSlate,
                fontSize = 11.sp,
                maxLines = 1
            )
        }
    }
}
