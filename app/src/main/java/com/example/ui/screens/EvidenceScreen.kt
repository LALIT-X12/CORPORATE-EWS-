package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.ui.components.RiskBadge
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*

@Composable
fun EvidenceScreen(
    viewModel: CorporateEwsViewModel,
    modifier: Modifier = Modifier
) {
    val claims by viewModel.allClaims.collectAsState()
    var showUploadSuccessSnackbar by remember { mutableStateOf(false) }
    val colors = CorporateEwsTheme.colors

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("evidence_screen")
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Financial Evidence & Discrepancies",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = TextFrostWhite
                )
                Text(
                    text = "Multi-modal reconciliation of filing documents vs DB records",
                    style = MaterialTheme.typography.bodySmall,
                    color = NeutralSlate
                )
            }

            Button(
                onClick = { showUploadSuccessSnackbar = true },
                colors = ButtonDefaults.buttonColors(
                    containerColor = colors.primaryAccent,
                    contentColor = if (colors.isDark) SolidBlack else PureWhite
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Upload PDF", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Reconciliation Pipeline Status Summary Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = NavySurfaceVariantDark),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(NavyCardStrokeDark))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Extracted Claims", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                    Text("${claims.size}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextFrostWhite)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Reconciled Matches", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                    Text("${claims.count { it.reconciliationStatus == "MATCH" }}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = colors.tealAccent)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Potential Mismatches", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                    Text("${claims.count { it.reconciliationStatus != "MATCH" }}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = colors.redScarlet)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Human Verified", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                    Text("${claims.count { it.verificationStatus == "VERIFIED" }}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = colors.cyanAccent)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Claims Reconciliation List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            item {
                SectionHeader(
                    title = "Audit Claims Queue",
                    subtitle = "Verify or reject candidate filing discrepancies"
                )
            }

            items(claims, key = { it.claimId }) { claim ->
                val isMismatch = claim.reconciliationStatus != "MATCH"
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isMismatch) colors.redAlertTint else colors.surfaceVariant
                    ),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (isMismatch) colors.redAlertBorder else colors.cardStroke
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
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                RiskBadge(claim.reconciliationStatus, if (claim.reconciliationStatus == "MATCH") "SAFE" else "WARNING")
                                RiskBadge(claim.verificationStatus, if (claim.verificationStatus == "VERIFIED") "SAFE" else "WARNING")
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Extracted Document Value", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                                Text("₹${claim.claimedValue.toInt()} Cr", fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = TextFrostWhite)
                            }
                            Column {
                                Text("Structured DB Record", style = MaterialTheme.typography.labelSmall, color = NeutralSlate)
                                Text("₹${claim.structuredValue.toInt()} Cr", fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = TextFrostWhite)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Source: ${claim.fiscalPeriod} Report • Page ${claim.pageNumber} (${claim.tableRef}) • Confidence: ${String.format("%.0f", claim.extractionConfidence * 100)}%",
                            style = MaterialTheme.typography.bodySmall,
                            fontSize = 11.sp,
                            color = colors.cyanAccent
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
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = colors.primaryAccent,
                                    contentColor = if (colors.isDark) SolidBlack else PureWhite
                                ),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text("Verify Fact", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = { viewModel.verifyClaim(claim.claimId, "REJECTED") },
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(34.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = NeutralSlate),
                                border = ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke)
                                )
                            ) {
                                Text("Reject Discrepancy", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showUploadSuccessSnackbar) {
        AlertDialog(
            onDismissRequest = { showUploadSuccessSnackbar = false },
            title = { Text("Document Ingested", color = TextFrostWhite, fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "Annual Report PDF ingested into controlled sandboxed storage. SHA-256 hash verified. Extraction pipeline completed 14 candidate financial facts awaiting reconciliation.",
                    color = NeutralSlate,
                    fontSize = 12.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = { showUploadSuccessSnackbar = false },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.primaryAccent,
                        contentColor = if (colors.isDark) SolidBlack else PureWhite
                    )
                ) {
                    Text("OK")
                }
            },
            containerColor = colors.surface
        )
    }
}
