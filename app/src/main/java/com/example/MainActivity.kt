package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.CorporateEwsRepository
import com.example.ui.CorporateEwsViewModel
import com.example.ui.NavigationTab
import com.example.ui.screens.*
import com.example.ui.theme.*

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val repository = CorporateEwsRepository.getInstance(applicationContext)
        val viewModelFactory = CorporateEwsViewModel.Factory(repository)

        setContent {
            val viewModel: CorporateEwsViewModel by viewModels { viewModelFactory }
            val themeController = remember { ThemeController(ThemeMode.WHITE_EMBEDDED) }

            CorporateEwsTheme(themeController = themeController) {
                CorporateEwsApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun CorporateEwsApp(viewModel: CorporateEwsViewModel) {
    val currentTab by viewModel.currentTab.collectAsState()
    val themeController = CorporateEwsTheme.controller
    val colors = CorporateEwsTheme.colors

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = colors.background,
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            Surface(
                color = colors.surface,
                tonalElevation = 2.dp,
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("app_top_bar")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Institutional Red Accent Indicator
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(colors.redRuby)
                        )
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "Corporate EWS",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary
                                )
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = colors.redAlertTint,
                                    border = CardDefaults.outlinedCardBorder().copy(
                                        brush = androidx.compose.ui.graphics.SolidColor(colors.redAlertBorder)
                                    )
                                ) {
                                    Text(
                                        text = "5% CAP",
                                        color = colors.redPrimary,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Early-Warning Risk Intelligence",
                                fontSize = 10.sp,
                                color = colors.textMuted
                            )
                        }
                    }

                    // Interactive Theme Toggle Button
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = colors.surfaceVariant,
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(colors.cardStroke)
                        ),
                        modifier = Modifier
                            .clickable { themeController.toggleTheme() }
                            .testTag("theme_toggle_button")
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = if (themeController.isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                                contentDescription = "Toggle theme mode",
                                tint = if (themeController.isDark) colors.cyanAccent else colors.primaryAccent,
                                modifier = Modifier.size(15.dp)
                            )
                            Text(
                                text = if (themeController.isDark) "Midnight Navy" else "White",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary
                            )
                        }
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = colors.navContainer,
                contentColor = colors.textPrimary,
                tonalElevation = 8.dp,
                modifier = Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .testTag("bottom_nav_bar")
            ) {
                NavigationBarItem(
                    selected = currentTab == NavigationTab.OVERVIEW,
                    onClick = { viewModel.navigateTo(NavigationTab.OVERVIEW) },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Overview") },
                    label = { Text("Overview", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = colors.navSelectedIcon,
                        selectedTextColor = colors.textPrimary,
                        indicatorColor = colors.navSelectedIndicator,
                        unselectedIconColor = colors.navUnselectedIcon,
                        unselectedTextColor = colors.navUnselectedIcon
                    ),
                    modifier = Modifier.testTag("nav_overview")
                )

                NavigationBarItem(
                    selected = currentTab == NavigationTab.WATCHLIST,
                    onClick = { viewModel.navigateTo(NavigationTab.WATCHLIST) },
                    icon = { Icon(Icons.Default.FormatListNumbered, contentDescription = "Watchlist") },
                    label = { Text("Watchlist", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = colors.navSelectedIcon,
                        selectedTextColor = colors.textPrimary,
                        indicatorColor = colors.navSelectedIndicator,
                        unselectedIconColor = colors.navUnselectedIcon,
                        unselectedTextColor = colors.navUnselectedIcon
                    ),
                    modifier = Modifier.testTag("nav_watchlist")
                )

                NavigationBarItem(
                    selected = currentTab == NavigationTab.INVESTIGATE,
                    onClick = { viewModel.navigateTo(NavigationTab.INVESTIGATE) },
                    icon = { Icon(Icons.Default.ManageSearch, contentDescription = "Investigate") },
                    label = { Text("Investigate", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = colors.navSelectedIcon,
                        selectedTextColor = colors.textPrimary,
                        indicatorColor = colors.navSelectedIndicator,
                        unselectedIconColor = colors.navUnselectedIcon,
                        unselectedTextColor = colors.navUnselectedIcon
                    ),
                    modifier = Modifier.testTag("nav_investigate")
                )

                NavigationBarItem(
                    selected = currentTab == NavigationTab.EVIDENCE,
                    onClick = { viewModel.navigateTo(NavigationTab.EVIDENCE) },
                    icon = { Icon(Icons.Default.FindInPage, contentDescription = "Evidence") },
                    label = { Text("Evidence", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = colors.navSelectedIcon,
                        selectedTextColor = colors.textPrimary,
                        indicatorColor = colors.navSelectedIndicator,
                        unselectedIconColor = colors.navUnselectedIcon,
                        unselectedTextColor = colors.navUnselectedIcon
                    ),
                    modifier = Modifier.testTag("nav_evidence")
                )

                NavigationBarItem(
                    selected = currentTab == NavigationTab.SETTINGS,
                    onClick = { viewModel.navigateTo(NavigationTab.SETTINGS) },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = colors.navSelectedIcon,
                        selectedTextColor = colors.textPrimary,
                        indicatorColor = colors.navSelectedIndicator,
                        unselectedIconColor = colors.navUnselectedIcon,
                        unselectedTextColor = colors.navUnselectedIcon
                    ),
                    modifier = Modifier.testTag("nav_settings")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentTab) {
                NavigationTab.OVERVIEW -> OverviewScreen(viewModel = viewModel)
                NavigationTab.WATCHLIST -> WatchlistScreen(viewModel = viewModel)
                NavigationTab.INVESTIGATE -> InvestigationScreen(viewModel = viewModel)
                NavigationTab.EVIDENCE -> EvidenceScreen(viewModel = viewModel)
                NavigationTab.SETTINGS -> SettingsScreen(viewModel = viewModel)
            }
        }
    }
}
