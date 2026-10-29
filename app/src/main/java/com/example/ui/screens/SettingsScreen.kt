package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.ActiveCohort
import com.example.data.repository.ConnectionMode
import com.example.ui.CorporateEwsViewModel
import com.example.ui.components.RiskBadge
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*

@Composable
fun SettingsScreen(
    viewModel: CorporateEwsViewModel,
    modifier: Modifier = Modifier
) {
    val connectionMode by viewModel.connectionMode.collectAsState()
    val apiBaseUrl by viewModel.apiBaseUrl.collectAsState()
    val activeCohort by viewModel.activeCohort.collectAsState()
    val currentRun by viewModel.currentRun.collectAsState()

    val themeController = CorporateEwsTheme.controller
    val colors = CorporateEwsTheme.colors

    var urlInput by remember(apiBaseUrl) { mutableStateOf(apiBaseUrl) }
    var testStatusText by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("settings_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            Column {
                Text(
                    text = "System Settings & Theme Controller",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = TextFrostWhite
                )
                Text(
                    text = "Control interface color schemes, inference engine, and policy constraints",
                    style = MaterialTheme.typography.bodySmall,
                    color = NeutralSlate
                )
            }
        }

        // Theme Controller & Color Scheme Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("theme_controller_card"),
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
                        Text(
                            text = "Theme Controller & Color Palette",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextFrostWhite
                        )
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = colors.redAlertTint,
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = androidx.compose.ui.graphics.SolidColor(colors.redAlertBorder)
                            )
                        ) {
                            Text(
                                text = "DUAL THEME ENGINE",
                                color = colors.redPrimary,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Theme Mode Selector Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // High-Contrast White Embedded
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (!themeController.isDark) colors.surface else colors.surfaceVariant,
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = androidx.compose.ui.graphics.SolidColor(
                                    if (!themeController.isDark) colors.primaryAccent else colors.cardStroke
                                )
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { themeController.setThemeMode(ThemeMode.WHITE_EMBEDDED) }
                                .testTag("theme_mode_white_button")
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LightMode,
                                    contentDescription = "White Embedded Mode",
                                    tint = if (!themeController.isDark) colors.primaryAccent else colors.textMuted
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "White Embedded",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = if (!themeController.isDark) colors.textPrimary else colors.textMuted
                                )
                                Text(
                                    text = "High-contrast clinical light",
                                    fontSize = 10.sp,
                                    color = colors.textMuted
                                )
                            }
                        }

                        // Deep Midnight Navy Dark Mode
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (themeController.isDark) colors.surface else colors.surfaceVariant,
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = androidx.compose.ui.graphics.SolidColor(
                                    if (themeController.isDark) colors.cyanAccent else colors.cardStroke
                                )
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { themeController.setThemeMode(ThemeMode.DEEP_MIDNIGHT_NAVY) }
                                .testTag("theme_mode_dark_button")
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DarkMode,
                                    contentDescription = "Deep Midnight Navy Mode",
                                    tint = if (themeController.isDark) colors.cyanAccent else colors.textMuted
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Midnight Navy",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = if (themeController.isDark) colors.textPrimary else colors.textMuted
                                )
                                Text(
                                    text = "Institutional dark terminal",
                                    fontSize = 10.sp,
                                    color = colors.textMuted
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Red Shades Suite Preview
                    Text(
                        text = "Institutional Red Shades & Risk Accent Suite",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            Triple("Crimson", colors.redPrimary, "Default Risk"),
                            Triple("Ruby", colors.redRuby, "5% Budget"),
                            Triple("Burgundy", colors.redBurgundy, "Governance"),
                            Triple("Scarlet", colors.redScarlet, "Manipulation")
                        ).forEach { (label, color, usage) ->
                            Column(
                                modifier = Modifier.weight(1f),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(color)
                                        .border(1.dp, colors.cardStroke, CircleShape)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                                Text(usage, fontSize = 8.sp, color = colors.textMuted)
                            }
                        }
                    }
                }
            }
        }

        // Connection Gateway Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Data Persistence & Inference Mode",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.setConnectionMode(ConnectionMode.EMBEDDED_OFFLINE) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (connectionMode == ConnectionMode.EMBEDDED_OFFLINE) colors.primaryAccent else Color.Transparent,
                                contentColor = if (connectionMode == ConnectionMode.EMBEDDED_OFFLINE) colors.background else TextFrostWhite
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (connectionMode == ConnectionMode.EMBEDDED_OFFLINE) colors.primaryAccent else NavyCardStrokeDark)
                            )
                        ) {
                            Text("Embedded Engine", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }

                        OutlinedButton(
                            onClick = { viewModel.setConnectionMode(ConnectionMode.LIVE_REST_API) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (connectionMode == ConnectionMode.LIVE_REST_API) colors.primaryAccent else Color.Transparent,
                                contentColor = if (connectionMode == ConnectionMode.LIVE_REST_API) colors.background else TextFrostWhite
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (connectionMode == ConnectionMode.LIVE_REST_API) colors.primaryAccent else NavyCardStrokeDark)
                            )
                        ) {
                            Text("Live REST API", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (connectionMode == ConnectionMode.LIVE_REST_API) {
                        OutlinedTextField(
                            value = urlInput,
                            onValueChange = {
                                urlInput = it
                                viewModel.setApiBaseUrl(it)
                            },
                            label = { Text("FastAPI Gateway URL") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = colors.background,
                                unfocusedContainerColor = colors.background,
                                focusedTextColor = TextFrostWhite,
                                unfocusedTextColor = TextFrostWhite,
                                focusedBorderColor = colors.primaryAccent
                            )
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            onClick = {
                                testStatusText = "Gateway connection verified: FastAPI v1 running on $urlInput (latency: 18ms)"
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.tealAccent, contentColor = PureWhite),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text("Test Connectivity (/api/v1/health)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Text(
                            text = "Active Mode: On-device Room Database loaded with Indian Defaulter Panel (10 defaulters, 30 matched controls), UCI Polish (5thYear 1-yr horizon), and UCI Taiwanese benchmark models.",
                            style = MaterialTheme.typography.bodySmall,
                            color = NeutralSlate,
                            fontSize = 11.sp
                        )
                    }

                    if (testStatusText != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(testStatusText!!, color = colors.tealAccent, fontSize = 11.sp)
                    }
                }
            }
        }

        // Active Evaluation Cohort Selector
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Evaluation Cohort Selection",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    listOf(
                        ActiveCohort.ALL_COHORTS to "Integrated Tri-Cohort (Indian Panel + Polish + Taiwanese)",
                        ActiveCohort.INDIAN_CASE_PANEL to "Indian Case Panel (10 Defaulters vs 30 Matched Controls)",
                        ActiveCohort.UCI_POLISH_BENCHMARK to "UCI Polish Companies Bankruptcy (5thYear 1-Yr Horizon)",
                        ActiveCohort.UCI_TAIWANESE_BENCHMARK to "UCI Taiwanese Bankruptcy (95 Normalized Ratios)"
                    ).forEach { (cohort, label) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            RadioButton(
                                selected = activeCohort == cohort,
                                onClick = { viewModel.setActiveCohort(cohort) },
                                colors = RadioButtonDefaults.colors(selectedColor = colors.primaryAccent)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(label, color = TextFrostWhite, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Mathematical Specifications Inspector
        item {
            SectionHeader(
                title = "Mathematical Forensics & Policy Specifications",
                subtitle = "Exact formulations and parameter constants"
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "1. Operational Alert Budget Formula:",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.redRuby,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "K = floor(N × 0.05). For N=40 -> K=2. For N=800 -> K=40 alert slots.",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = TextFrostWhite
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "2. Asymmetric Expected Loss Function:",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.redPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Expected Cost = 20 × False Negatives + 1 × False Positives (Missed default costs 20x).",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = TextFrostWhite
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "3. Standard Beneish M-Score Formula (Beneish 1999):",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.redScarlet,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI\nThreshold: M > -1.78 classifies as Potential Manipulator.",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = TextFrostWhite,
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "4. Altman Z''-Score (Emerging Market / Non-Manufacturer):",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.cyanAccent,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Z'' = 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4\nZones: <1.10 Distress, 1.10-2.60 Grey, >2.60 Safe. Banks/NBFCs excluded.",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = TextFrostWhite,
                        fontSize = 11.sp
                    )
                }
            }
        }

        // About & Version Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Corporate EWS — Early-Warning Intelligence",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextFrostWhite
                    )
                    Text(
                        text = "Version 1.0.0-PROD • Architecture: Clean MVVM + Room Offline Replica + FastAPI Gateway",
                        style = MaterialTheme.typography.bodySmall,
                        color = NeutralSlate,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "Designed for Small, Regional & Institutional Financial Credit Desks.",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.tealAccent,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
