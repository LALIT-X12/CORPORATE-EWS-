package com.example.data.forensics

import com.example.data.model.FinancialPeriod
import kotlin.math.floor

/**
 * Result data holder for Beneish M-Score calculation
 */
data class BeneishResult(
    val mScore: Double?,
    val dsri: Double,
    val gmi: Double,
    val aqi: Double,
    val sgi: Double,
    val depi: Double,
    val sgai: Double,
    val tata: Double,
    val lvgi: Double,
    val status: String, // "POTENTIAL_MANIPULATOR", "NON_MANIPULATOR", "UNAVAILABLE"
    val threshold: Double = -1.78,
    val notes: String = ""
)

/**
 * Result data holder for Piotroski F-Score calculation
 */
data class PiotroskiResult(
    val score: Int?,
    val fRoa: Int,
    val fCfo: Int,
    val fDeltaRoa: Int,
    val fAccrual: Int,
    val fDeltaLever: Int,
    val fDeltaLiquid: Int,
    val fEqOffer: Int,
    val fDeltaMargin: Int,
    val fDeltaTurn: Int,
    val status: String, // "STRONG", "MODERATE", "WEAK", "UNAVAILABLE"
    val notes: String = ""
)

/**
 * Result data holder for Altman Z''-Score calculation
 */
data class AltmanResult(
    val zScore: Double?,
    val x1WorkingCapital: Double,
    val x2RetainedEarnings: Double,
    val x3Ebit: Double,
    val x4BookEquity: Double,
    val status: String, // "SAFE", "GREY", "DISTRESS", "EXCLUDED_FINANCIAL_SECTOR", "UNAVAILABLE"
    val notes: String = ""
)

/**
 * Banking-Grade Corporate Forensics & Alert Policy Calculator
 */
object ForensicCalculator {

    private const val EPSILON = 1e-7

    /**
     * Standard 8-Variable Beneish M-Score Model (Beneish 1999)
     * M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI
     * Threshold: > -1.78 indicates elevated manipulation probability.
     */
    fun calculateBeneishMScore(curr: FinancialPeriod, prev: FinancialPeriod?): BeneishResult {
        if (prev == null) {
            return BeneishResult(
                mScore = null,
                dsri = 1.0, gmi = 1.0, aqi = 1.0, sgi = 1.0,
                depi = 1.0, sgai = 1.0, tata = 0.0, lvgi = 1.0,
                status = "UNAVAILABLE",
                notes = "Requires prior historical period t-1 for delta indices."
            )
        }

        if (curr.revenue <= 0.0 || prev.revenue <= 0.0 || curr.totalAssets <= 0.0 || prev.totalAssets <= 0.0) {
            return BeneishResult(
                mScore = null,
                dsri = 1.0, gmi = 1.0, aqi = 1.0, sgi = 1.0,
                depi = 1.0, sgai = 1.0, tata = 0.0, lvgi = 1.0,
                status = "UNAVAILABLE",
                notes = "Zero or negative revenues / total assets encountered."
            )
        }

        // 1. DSRI
        val recSalesCurr = curr.receivables / curr.revenue
        val recSalesPrev = prev.receivables / prev.revenue
        val dsri = if (recSalesPrev > EPSILON) recSalesCurr / recSalesPrev else 1.0

        // 2. GMI
        val gmCurr = (curr.revenue - curr.cogs) / curr.revenue
        val gmPrev = (prev.revenue - prev.cogs) / prev.revenue
        val gmi = if (gmCurr > EPSILON) (gmPrev / gmCurr).coerceIn(0.1, 5.0) else 1.0

        // 3. AQI: non-current assets other than PP&E and securities / total assets
        val nonCurrCurr = 1.0 - ((curr.currentAssets + curr.ppeNet + curr.securities) / curr.totalAssets)
        val nonCurrPrev = 1.0 - ((prev.currentAssets + prev.ppeNet + prev.securities) / prev.totalAssets)
        val aqi = if (nonCurrPrev > EPSILON) (nonCurrCurr / nonCurrPrev).coerceIn(0.1, 5.0) else 1.0

        // 4. SGI
        val sgi = (curr.revenue / prev.revenue).coerceIn(0.1, 5.0)

        // 5. DEPI
        val deprRateCurr = curr.depreciation / (curr.ppeNet + curr.depreciation).coerceAtLeast(EPSILON)
        val deprRatePrev = prev.depreciation / (prev.ppeNet + prev.depreciation).coerceAtLeast(EPSILON)
        val depi = if (deprRateCurr > EPSILON) (deprRatePrev / deprRateCurr).coerceIn(0.1, 5.0) else 1.0

        // 6. SGAI
        val sgaCurr = curr.sgaExpenses / curr.revenue
        val sgaPrev = prev.sgaExpenses / prev.revenue
        val sgai = if (sgaPrev > EPSILON) (sgaCurr / sgaPrev).coerceIn(0.1, 5.0) else 1.0

        // 7. TATA (Accruals to Total Assets)
        val totalAccruals = curr.netIncome - curr.operatingCashFlow
        val tata = totalAccruals / curr.totalAssets

        // 8. LVGI (Total Debt to Total Assets)
        val levCurr = curr.totalDebt / curr.totalAssets
        val levPrev = prev.totalDebt / prev.totalAssets
        val lvgi = if (levPrev > EPSILON) (levCurr / levPrev).coerceIn(0.1, 5.0) else 1.0

        // Standard canonical coefficients
        val mScore = -4.84 +
                (0.920 * dsri) +
                (0.528 * gmi) +
                (0.404 * aqi) +
                (0.892 * sgi) +
                (0.115 * depi) -
                (0.172 * sgai) +
                (4.679 * tata) -
                (0.327 * lvgi)

        val status = if (mScore > -1.78) "POTENTIAL_MANIPULATOR" else "NON_MANIPULATOR"

        return BeneishResult(
            mScore = mScore,
            dsri = dsri,
            gmi = gmi,
            aqi = aqi,
            sgi = sgi,
            depi = depi,
            sgai = sgai,
            tata = tata,
            lvgi = lvgi,
            status = status
        )
    }

    /**
     * Standard 9-Point Piotroski F-Score Model (Piotroski 2000)
     */
    fun calculatePiotroskiFScore(curr: FinancialPeriod, prev: FinancialPeriod?): PiotroskiResult {
        if (prev == null) {
            return PiotroskiResult(
                score = null,
                fRoa = 0, fCfo = 0, fDeltaRoa = 0, fAccrual = 0,
                fDeltaLever = 0, fDeltaLiquid = 0, fEqOffer = 0,
                fDeltaMargin = 0, fDeltaTurn = 0,
                status = "UNAVAILABLE",
                notes = "Requires period t-1 for fundamental trajectory."
            )
        }

        // 1. F_ROA: Net Income > 0
        val fRoa = if (curr.netIncome > 0.0) 1 else 0

        // 2. F_CFO: Cash Flow from Operations > 0
        val fCfo = if (curr.operatingCashFlow > 0.0) 1 else 0

        // 3. F_DELTA_ROA: Change in ROA > 0 (using previous total assets denominator)
        val roaCurr = curr.netIncome / prev.totalAssets.coerceAtLeast(EPSILON)
        val roaPrev = prev.netIncome / prev.totalAssets.coerceAtLeast(EPSILON) // approximated for t-2
        val fDeltaRoa = if (roaCurr > roaPrev) 1 else 0

        // 4. F_ACCRUAL: CFO normalized by Total Assets > Net Income normalized by Total Assets (CFO > Net Income)
        val fAccrual = if (curr.operatingCashFlow > curr.netIncome) 1 else 0

        // 5. F_DELTA_LEVER: Leverage decreased (Total Debt / Total Assets)
        val levCurr = curr.totalDebt / curr.totalAssets.coerceAtLeast(EPSILON)
        val levPrev = prev.totalDebt / prev.totalAssets.coerceAtLeast(EPSILON)
        val fDeltaLever = if (levCurr < levPrev) 1 else 0

        // 6. F_DELTA_LIQUID: Current Ratio improved
        val crCurr = curr.currentAssets / curr.currentLiabilities.coerceAtLeast(EPSILON)
        val crPrev = prev.currentAssets / prev.currentLiabilities.coerceAtLeast(EPSILON)
        val fDeltaLiquid = if (crCurr > crPrev) 1 else 0

        // 7. F_EQ_OFFER: No new common shares issued (commonSharesOutstanding <= prev)
        val fEqOffer = if (curr.commonSharesOutstanding <= prev.commonSharesOutstanding) 1 else 0

        // 8. F_DELTA_MARGIN: Gross Margin improved
        val gmCurr = (curr.revenue - curr.cogs) / curr.revenue.coerceAtLeast(EPSILON)
        val gmPrev = (prev.revenue - prev.cogs) / prev.revenue.coerceAtLeast(EPSILON)
        val fDeltaMargin = if (gmCurr > gmPrev) 1 else 0

        // 9. F_DELTA_TURN: Asset Turnover improved
        val turnCurr = curr.revenue / prev.totalAssets.coerceAtLeast(EPSILON)
        val turnPrev = prev.revenue / prev.totalAssets.coerceAtLeast(EPSILON)
        val fDeltaTurn = if (turnCurr > turnPrev) 1 else 0

        val totalScore = fRoa + fCfo + fDeltaRoa + fAccrual + fDeltaLever + fDeltaLiquid + fEqOffer + fDeltaMargin + fDeltaTurn
        val status = when {
            totalScore >= 8 -> "STRONG"
            totalScore >= 4 -> "MODERATE"
            else -> "WEAK"
        }

        return PiotroskiResult(
            score = totalScore,
            fRoa = fRoa,
            fCfo = fCfo,
            fDeltaRoa = fDeltaRoa,
            fAccrual = fAccrual,
            fDeltaLever = fDeltaLever,
            fDeltaLiquid = fDeltaLiquid,
            fEqOffer = fEqOffer,
            fDeltaMargin = fDeltaMargin,
            fDeltaTurn = fDeltaTurn,
            status = status
        )
    }

    /**
     * Uncentered 4-Variable Altman Z''-Score Model for Emerging Markets and Non-Manufacturers
     * Z'' = 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4
     * Zones: < 1.10 Distress, 1.10 - 2.60 Grey, > 2.60 Safe.
     */
    fun calculateAltmanZScore(period: FinancialPeriod, sectorCode: String): AltmanResult {
        // Exclude financial sector (Banks, NBFCs, Insurance)
        if (sectorCode.equals("FIN", ignoreCase = true) || sectorCode.equals("NBFC", ignoreCase = true) || sectorCode.equals("BANK", ignoreCase = true)) {
            return AltmanResult(
                zScore = null,
                x1WorkingCapital = 0.0,
                x2RetainedEarnings = 0.0,
                x3Ebit = 0.0,
                x4BookEquity = 0.0,
                status = "EXCLUDED_FINANCIAL_SECTOR",
                notes = "Financial and banking institutions have structurally distinct balance sheet leverage."
            )
        }

        if (period.totalAssets <= 0.0 || period.totalLiabilities <= 0.0) {
            return AltmanResult(
                zScore = null,
                x1WorkingCapital = 0.0,
                x2RetainedEarnings = 0.0,
                x3Ebit = 0.0,
                x4BookEquity = 0.0,
                status = "UNAVAILABLE",
                notes = "Invalid zero or negative balance sheet totals."
            )
        }

        val workingCapital = period.currentAssets - period.currentLiabilities
        val x1 = workingCapital / period.totalAssets
        val x2 = period.retainedEarnings / period.totalAssets
        val x3 = period.ebit / period.totalAssets
        val x4 = period.bookEquity / period.totalLiabilities

        val zScore = (6.56 * x1) + (3.26 * x2) + (6.72 * x3) + (1.05 * x4)

        val status = when {
            zScore < 1.10 -> "DISTRESS"
            zScore <= 2.60 -> "GREY"
            else -> "SAFE"
        }

        return AltmanResult(
            zScore = zScore,
            x1WorkingCapital = x1,
            x2RetainedEarnings = x2,
            x3Ebit = x3,
            x4BookEquity = x4,
            status = status
        )
    }

    /**
     * 5% Capacity Alert Cap: K = floor(eligibleCount * 0.05)
     */
    fun calculateAlertCapacityCap(eligibleCompanyCount: Int): Int {
        return floor(eligibleCompanyCount * 0.05).toInt().coerceAtLeast(0)
    }

    /**
     * Asymmetric Operational Evaluation Cost: 20 * False Negatives + 1 * False Positives
     */
    fun calculateExpectedCost(falseNegatives: Int, falsePositives: Int): Double {
        return (20.0 * falseNegatives) + (1.0 * falsePositives)
    }
}
