package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.EntityRelationship
import com.example.data.model.ShapFeature
import com.example.ui.theme.*
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun ShapWaterfallChart(
    features: List<ShapFeature>,
    baseValue: Double = -2.14,
    finalPrediction: Double = 0.942,
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surfaceVariant),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "SHAP Model Feature Contributions",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "Exact TreeSHAP attributions (Base value: ${String.format("%.2f", baseValue)} log-odds)",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textMuted
                    )
                }
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = colors.redAlertTint,
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(colors.redAlertBorder)
                    )
                ) {
                    Text(
                        text = "P(Default): ${String.format("%.1f", finalPrediction * 100)}%",
                        color = colors.redPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Render each feature as a horizontal delta bar
            features.forEach { feat ->
                val isDistressPush = feat.shapValue > 0
                val barColor = if (isDistressPush) colors.redRuby else colors.tealAccent
                val barLength = (kotlin.math.abs(feat.shapValue).toFloat() / 1.0f).coerceIn(0.05f, 1.0f)

                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = feat.displayName,
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.textPrimary,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = (if (isDistressPush) "+" else "") + String.format("%.2f", feat.shapValue),
                            style = MaterialTheme.typography.labelSmall,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = barColor
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .background(colors.cardStroke, RoundedCornerShape(3.dp))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(barLength)
                                .fillMaxHeight()
                                .background(barColor, RoundedCornerShape(3.dp))
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).background(colors.redRuby, RoundedCornerShape(2.dp)))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Pushes Risk Higher", fontSize = 11.sp, color = colors.textMuted)
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).background(colors.tealAccent, RoundedCornerShape(2.dp)))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Reduces Risk", fontSize = 11.sp, color = colors.textMuted)
                }
            }
        }
    }
}

@Composable
fun RelationshipGraphView(
    companyName: String,
    relationships: List<EntityRelationship>,
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors
    var selectedRel by remember { mutableStateOf<EntityRelationship?>(null) }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surfaceVariant),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Relational Entity Network (Graph)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "Related parties, circular flows, and guarantees",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textMuted
                    )
                }
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = colors.redAlertTint,
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(colors.redAlertBorder)
                    )
                ) {
                    Text(
                        text = "${relationships.count { it.isDistressedLink }} RISKS",
                        color = colors.redPrimary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Canvas rendering node-link topology
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(colors.surface, RoundedCornerShape(8.dp))
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val centerX = size.width / 2f
                    val centerY = size.height / 2f
                    val radius = (size.minDimension / 2f) - 36.dp.toPx()

                    // Draw connecting lines from center to outer satellite nodes
                    relationships.forEachIndexed { index, rel ->
                        val angle = (2.0 * Math.PI * index / relationships.size.coerceAtLeast(1)).toFloat()
                        val nodeX = centerX + (radius * cos(angle))
                        val nodeY = centerY + (radius * sin(angle))

                        val lineColor = if (rel.isDistressedLink) colors.redRuby.copy(alpha = 0.8f) else colors.cardStroke
                        val strokeWidth = if (rel.isDistressedLink) 3.dp.toPx() else 1.5.dp.toPx()

                        drawLine(
                            color = lineColor,
                            start = Offset(centerX, centerY),
                            end = Offset(nodeX, nodeY),
                            strokeWidth = strokeWidth
                        )

                        // Draw outer node circle
                        drawCircle(
                            color = if (rel.isDistressedLink) colors.redRuby else colors.tealAccent,
                            radius = 16.dp.toPx(),
                            center = Offset(nodeX, nodeY)
                        )
                    }

                    // Center Company Node
                    drawCircle(
                        color = colors.primaryAccent,
                        radius = 24.dp.toPx(),
                        center = Offset(centerX, centerY)
                    )
                }

                // Overlay centered label
                Text(
                    text = "BORROWER",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (colors.isDark) SolidBlack else PureWhite,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // List of relationships below
            Text(
                text = "Connected Counterparties & Entities:",
                style = MaterialTheme.typography.labelSmall,
                color = colors.textMuted
            )

            Spacer(modifier = Modifier.height(6.dp))

            relationships.forEach { rel ->
                val isSelected = selectedRel?.relationshipId == rel.relationshipId
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clickable { selectedRel = rel },
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) colors.cardStroke else colors.surface,
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (rel.isDistressedLink) colors.redRuby else colors.cardStroke
                        )
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = rel.targetEntityName,
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                            Text(
                                text = "${rel.relationshipType.replace('_', ' ')} • ${rel.pathDescription}",
                                style = MaterialTheme.typography.bodySmall,
                                fontSize = 10.sp,
                                color = colors.textMuted
                            )
                        }

                        if (rel.isDistressedLink) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = colors.redAlertTint,
                                border = CardDefaults.outlinedCardBorder().copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(colors.redAlertBorder)
                                )
                            ) {
                                Text(
                                    text = "FLAGGED",
                                    color = colors.redPrimary,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LeadTimeCurveChart(
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surfaceVariant),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Lead-Time Detection Curve",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "Detection recall across 4 quarters advance horizon",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textMuted
                    )
                }
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = colors.tealAccent.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "4-Quarter Horizon",
                        color = colors.tealAccent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .background(colors.surface, RoundedCornerShape(8.dp))
                    .padding(horizontal = 24.dp, vertical = 12.dp)
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    // 4 data points for quarters: T-4, T-3, T-2, T-1
                    val combinedPoints = listOf(0.75f, 0.84f, 0.92f, 0.96f)
                    val baselinePoints = listOf(0.42f, 0.55f, 0.68f, 0.78f)

                    // Draw baseline curve
                    val baselinePath = Path().apply {
                        baselinePoints.forEachIndexed { i, pt ->
                            val x = (i / 3f) * w
                            val y = h - (pt * h)
                            if (i == 0) moveTo(x, y) else lineTo(x, y)
                        }
                    }
                    drawPath(
                        path = baselinePath,
                        color = colors.textMuted,
                        style = Stroke(width = 2.dp.toPx())
                    )

                    // Draw combined curve in red/cyan
                    val combinedPath = Path().apply {
                        combinedPoints.forEachIndexed { i, pt ->
                            val x = (i / 3f) * w
                            val y = h - (pt * h)
                            if (i == 0) moveTo(x, y) else lineTo(x, y)
                        }
                    }
                    drawPath(
                        path = combinedPath,
                        color = colors.redRuby,
                        style = Stroke(width = 3.dp.toPx())
                    )

                    // Draw node circles on combined curve
                    combinedPoints.forEachIndexed { i, pt ->
                        val x = (i / 3f) * w
                        val y = h - (pt * h)
                        drawCircle(color = colors.redRuby, radius = 4.dp.toPx(), center = Offset(x, y))
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("T-4 Quarters (1 yr)", fontSize = 10.sp, color = colors.textMuted)
                Text("T-3 Quarters", fontSize = 10.sp, color = colors.textMuted)
                Text("T-2 Quarters", fontSize = 10.sp, color = colors.textMuted)
                Text("T-1 Quarter", fontSize = 10.sp, color = colors.textMuted)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).background(colors.redRuby, CircleShape))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Corporate EWS Combined (90% at T-4)", fontSize = 10.sp, color = colors.textPrimary)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).background(colors.textMuted, CircleShape))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Baseline Tabular (60%)", fontSize = 10.sp, color = colors.textMuted)
                }
            }
        }
    }
}
