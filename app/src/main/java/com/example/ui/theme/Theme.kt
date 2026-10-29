package com.example.ui.theme

import android.os.Build
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

enum class ThemeMode {
    DEEP_MIDNIGHT_NAVY,
    WHITE_EMBEDDED
}

/**
 * Controller class using Jetpack Compose State allowing the application to toggle
 * between Deep Midnight Navy dark mode and high-contrast White-embedded light mode.
 */
@Stable
class ThemeController(initialMode: ThemeMode = ThemeMode.WHITE_EMBEDDED) {
    private val _themeMode = mutableStateOf(initialMode)
    val themeMode: ThemeMode get() = _themeMode.value

    val isDark: Boolean
        get() = _themeMode.value == ThemeMode.DEEP_MIDNIGHT_NAVY

    fun toggleTheme() {
        _themeMode.value = if (_themeMode.value == ThemeMode.WHITE_EMBEDDED) {
            ThemeMode.DEEP_MIDNIGHT_NAVY
        } else {
            ThemeMode.WHITE_EMBEDDED
        }
    }

    fun setThemeMode(mode: ThemeMode) {
        _themeMode.value = mode
    }
}

val LocalThemeController = staticCompositionLocalOf { ThemeController() }
val LocalCorporateEwsColors = staticCompositionLocalOf { WhiteEmbeddedColors }

object CorporateEwsTheme {
    val colors: CorporateEwsColors
        @Composable
        @ReadOnlyComposable
        get() = LocalCorporateEwsColors.current

    val controller: ThemeController
        @Composable
        @ReadOnlyComposable
        get() = LocalThemeController.current
}

@Composable
fun CorporateEwsTheme(
    themeController: ThemeController = remember { ThemeController(ThemeMode.WHITE_EMBEDDED) },
    content: @Composable () -> Unit
) {
    val isDark = themeController.isDark
    val corporateColors = if (isDark) DeepMidnightNavyColors else WhiteEmbeddedColors

    val colorScheme = if (isDark) {
        darkColorScheme(
            primary = corporateColors.primaryAccent,
            onPrimary = SolidBlack,
            primaryContainer = corporateColors.surfaceVariant,
            onPrimaryContainer = corporateColors.textPrimary,
            secondary = corporateColors.tealAccent,
            onSecondary = SolidBlack,
            secondaryContainer = corporateColors.cardStroke,
            onSecondaryContainer = corporateColors.textPrimary,
            tertiary = corporateColors.redRuby,
            background = corporateColors.background,
            onBackground = corporateColors.textPrimary,
            surface = corporateColors.surface,
            onSurface = corporateColors.textPrimary,
            surfaceVariant = corporateColors.surfaceVariant,
            onSurfaceVariant = corporateColors.textMuted,
            outline = corporateColors.cardStroke,
            error = corporateColors.redPrimary,
            onError = PureWhite
        )
    } else {
        lightColorScheme(
            primary = corporateColors.primaryAccent,
            onPrimary = PureWhite,
            primaryContainer = corporateColors.surfaceVariant,
            onPrimaryContainer = SolidBlack,
            secondary = CharcoalSlate,
            onSecondary = PureWhite,
            secondaryContainer = corporateColors.cardStroke,
            onSecondaryContainer = SolidBlack,
            tertiary = corporateColors.redRuby,
            background = corporateColors.background,
            onBackground = SolidBlack,
            surface = corporateColors.surface,
            onSurface = SolidBlack,
            surfaceVariant = corporateColors.surfaceVariant,
            onSurfaceVariant = corporateColors.textMuted,
            outline = corporateColors.cardStroke,
            error = corporateColors.redPrimary,
            onError = PureWhite
        )
    }

    CompositionLocalProvider(
        LocalThemeController provides themeController,
        LocalCorporateEwsColors provides corporateColors
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}

// Backward-compatibility overload
@Composable
fun CorporateEwsTheme(
    darkTheme: Boolean,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val mode = if (darkTheme) ThemeMode.DEEP_MIDNIGHT_NAVY else ThemeMode.WHITE_EMBEDDED
    val controller = remember(darkTheme) { ThemeController(mode) }
    CorporateEwsTheme(themeController = controller, content = content)
}

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = false,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) = CorporateEwsTheme(darkTheme = darkTheme, content = content)
