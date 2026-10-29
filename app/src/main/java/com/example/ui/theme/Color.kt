package com.example.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.Stable
import androidx.compose.ui.graphics.Color

// Embedded Pure White & Light Surfaces
val PureWhite = Color(0xFFFFFFFF)
val OffWhite = Color(0xFFF8FAFC)
val SlateBackgroundLight = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceVariant = Color(0xFFF1F5F9)
val LightCardStroke = Color(0xFFE2E8F0)
val SolidBlack = Color(0xFF0A0A0A)
val CharcoalSlate = Color(0xFF334155)
val MutedSlate = Color(0xFF64748B)

// Deep Midnight Navy & Institutional Dark Surfaces
val DeepMidnightNavy = Color(0xFF080D1A)
val MidnightSurface = Color(0xFF0F172A)
val MidnightSurfaceVariant = Color(0xFF172239)
val MidnightCardStroke = Color(0xFF233554)
val FrostWhite = Color(0xFFF8FAFC)
val IceSlate = Color(0xFFCBD5E1)
val NavySlateTextMuted = Color(0xFF94A3B8)

// Red Shades Suite for Institutional Risk Polish
val RedCrimsonPrimary = Color(0xFFDC2626) // Pure institutional crimson for severe default risk
val RedRuby = Color(0xFFE11D48)           // Vivid ruby for top 5% desk alert badges & priority flags
val RedDeepBurgundy = Color(0xFF881337)   // Rich executive burgundy for alert headers & badges
val RedScarlet = Color(0xFFF43F5E)        // Scarlet accent for manipulation signals & warnings
val RedCoralAlert = Color(0xFFFB7185)     // Soft coral for secondary indicators
val RedWineDark = Color(0xFF9F1239)       // Glowing wine for dark theme containers
val RedSubtleTintLight = Color(0xFFFFF1F2)// Light theme subtle red-tinted container background
val RedSubtleTintDark = Color(0xFF2B0B12) // Dark theme deep crimson-tinted container background
val RedBorderLight = Color(0xFFFECDD3)    // Soft crimson border for light cards
val RedBorderDark = Color(0xFF7F1D1D)     // Deep ruby-crimson border for dark cards

// Analytical Cyan, Forest Teal & Status Tokens
val TealPrimary = Color(0xFF0F766E)
val TealBright = Color(0xFF14B8A6)
val CyanPrimary = Color(0xFF0284C7)
val CyanBright = Color(0xFF38BDF8)
val WarningAmber = Color(0xFFD97706)
val WarningAmberBright = Color(0xFFF59E0B)
val SafeEmeraldGreen = Color(0xFF16A34A)
val SafeEmeraldBright = Color(0xFF10B981)

@Stable
class CorporateEwsColors(
    val isDark: Boolean,
    val background: Color,
    val surface: Color,
    val surfaceVariant: Color,
    val cardStroke: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val primaryAccent: Color,
    val cyanAccent: Color,
    val tealAccent: Color,
    // Red Shades Suite
    val redPrimary: Color,
    val redRuby: Color,
    val redBurgundy: Color,
    val redScarlet: Color,
    val redAlertTint: Color,
    val redAlertBorder: Color,
    // Status
    val warningAmber: Color,
    val safeGreen: Color,
    // Navigation
    val navContainer: Color,
    val navSelectedIndicator: Color,
    val navSelectedIcon: Color,
    val navUnselectedIcon: Color
)

val WhiteEmbeddedColors = CorporateEwsColors(
    isDark = false,
    background = PureWhite,
    surface = PureWhite,
    surfaceVariant = OffWhite,
    cardStroke = LightCardStroke,
    textPrimary = SolidBlack,
    textSecondary = CharcoalSlate,
    textMuted = MutedSlate,
    primaryAccent = SolidBlack,
    cyanAccent = CyanPrimary,
    tealAccent = TealPrimary,
    redPrimary = RedCrimsonPrimary,
    redRuby = RedRuby,
    redBurgundy = RedDeepBurgundy,
    redScarlet = RedScarlet,
    redAlertTint = RedSubtleTintLight,
    redAlertBorder = RedBorderLight,
    warningAmber = WarningAmber,
    safeGreen = SafeEmeraldGreen,
    navContainer = PureWhite,
    navSelectedIndicator = SolidBlack,
    navSelectedIcon = PureWhite,
    navUnselectedIcon = MutedSlate
)

val DeepMidnightNavyColors = CorporateEwsColors(
    isDark = true,
    background = DeepMidnightNavy,
    surface = MidnightSurface,
    surfaceVariant = MidnightSurfaceVariant,
    cardStroke = MidnightCardStroke,
    textPrimary = FrostWhite,
    textSecondary = IceSlate,
    textMuted = NavySlateTextMuted,
    primaryAccent = CyanBright,
    cyanAccent = CyanBright,
    tealAccent = TealBright,
    redPrimary = RedCrimsonPrimary,
    redRuby = RedRuby,
    redBurgundy = RedWineDark,
    redScarlet = RedScarlet,
    redAlertTint = RedSubtleTintDark,
    redAlertBorder = RedBorderDark,
    warningAmber = WarningAmberBright,
    safeGreen = SafeEmeraldBright,
    navContainer = MidnightSurface,
    navSelectedIndicator = CyanBright,
    navSelectedIcon = DeepMidnightNavy,
    navUnselectedIcon = NavySlateTextMuted
)

// Reactive Composable accessors for seamless migration and dynamic theme switching
val NavyBackgroundDark: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.background

val NavySurfaceDark: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.surface

val NavySurfaceVariantDark: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.surfaceVariant

val NavyCardStrokeDark: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.cardStroke

val AnalyticalCyan: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.cyanAccent

val AnalyticalTeal: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.tealAccent

val AnalyticalSecondary: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.textSecondary

val RiskDistressRed: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.redPrimary

val RiskWarningAmber: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.warningAmber

val HealthSafeGreen: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.safeGreen

val NeutralSlate: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.textMuted

val TextFrostWhite: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalCorporateEwsColors.current.textPrimary

// Static aliases for light palette tokens
val SlateSurfaceLight = PureWhite
val SlateSurfaceVariantLight = LightSurfaceVariant
val SlateCardStrokeLight = LightCardStroke
val SlatePrimaryLight = SolidBlack
val SlateTextDark = SolidBlack
val SlateTextMuted = MutedSlate
