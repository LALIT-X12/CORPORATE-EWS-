package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun CapacityMeterCard(
    usedSlots: Int,
    totalCapacitySlots: Int,
    totalPortfolioCount: Int,
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors
    val isNearCap = usedSlots >= totalCapacitySlots
    val percentage = if (totalCapacitySlots > 0) (usedSlots.toFloat() / totalCapacitySlots).coerceIn(0f, 1f) else 0f
    val animatedProgress by animateFloatAsState(targetValue = percentage, label = "capacity")
    val portfolioPct = if (totalPortfolioCount > 0) (usedSlots.toFloat() / totalPortfolioCount) * 100f else 5.0f

    val cardBg = if (isNearCap) colors.redAlertTint else colors.surfaceVariant
    val cardStroke = if (isNearCap) colors.redAlertBorder else colors.cardStroke

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("capacity_meter_card"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = cardBg),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(cardStroke))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "5% Operational Alert Budget",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.textPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        if (isNearCap) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = colors.redPrimary,
                                modifier = Modifier.padding(start = 2.dp)
                            ) {
                                Text(
                                    text = "MAX CAP",
                                    color = PureWhite,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }
                        }
                    }
                    Text(
                        text = "Credit desk capacity constraint ($totalPortfolioCount monitored borrowers)",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textMuted
                    )
                }
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (isNearCap) colors.redRuby.copy(alpha = 0.15f) else colors.tealAccent.copy(alpha = 0.15f),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(if (isNearCap) colors.redRuby else colors.tealAccent)
                    )
                ) {
                    Text(
                        text = "${String.format("%.1f", portfolioPct)}% Port. Cap",
                        color = if (isNearCap) colors.redRuby else colors.tealAccent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Capacity indicator bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(colors.cardStroke)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(animatedProgress)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (isNearCap) colors.redRuby else colors.primaryAccent)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "$usedSlots / $totalCapacitySlots alert slots used",
                    style = MaterialTheme.typography.labelMedium,
                    fontFamily = FontFamily.Monospace,
                    color = if (isNearCap) colors.redPrimary else colors.textPrimary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${totalCapacitySlots - usedSlots} slots remaining",
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.textMuted
                )
            }
        }
    }
}

@Composable
fun RiskBadge(
    label: String,
    level: String, // "CRITICAL", "HIGH", "WARNING", "SAFE", "INFO", "BURGUNDY"
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors
    val (bgColor, textColor, strokeColor) = when (level.uppercase()) {
        "CRITICAL", "DISTRESS", "POTENTIAL_MANIPULATOR", "5% CAP ALERT", "DESK_ALERT" ->
            Triple(colors.redAlertTint, colors.redRuby, colors.redAlertBorder)
        "BURGUNDY", "HIGH_PRIORITY", "SEVERE" ->
            Triple(colors.redBurgundy.copy(alpha = 0.15f), colors.redBurgundy, colors.redBurgundy.copy(alpha = 0.4f))
        "HIGH", "WARNING", "GREY", "WEAK" ->
            Triple(colors.warningAmber.copy(alpha = 0.15f), colors.warningAmber, colors.warningAmber.copy(alpha = 0.4f))
        "SAFE", "STRONG", "NON_MANIPULATOR", "VERIFIED" ->
            Triple(colors.safeGreen.copy(alpha = 0.15f), colors.safeGreen, colors.safeGreen.copy(alpha = 0.4f))
        else ->
            Triple(colors.textMuted.copy(alpha = 0.12f), colors.textMuted, colors.cardStroke)
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = bgColor,
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(strokeColor))
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun MetricValueCard(
    title: String,
    value: String,
    subtitle: String,
    statusColor: Color = Color.Unspecified,
    modifier: Modifier = Modifier
) {
    val colors = CorporateEwsTheme.colors
    val resolvedStatusColor = if (statusColor != Color.Unspecified) statusColor else colors.primaryAccent

    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surfaceVariant),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = colors.textMuted
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = resolvedStatusColor
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = colors.textMuted,
                fontSize = 10.sp
            )
        }
    }
}

@Composable
fun SectionHeader(
    title: String,
    subtitle: String? = null,
    modifier: Modifier = Modifier,
    action: (@Composable () -> Unit)? = null
) {
    val colors = CorporateEwsTheme.colors
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.textMuted
                )
            }
        }
        if (action != null) {
            action()
        }
    }
}
