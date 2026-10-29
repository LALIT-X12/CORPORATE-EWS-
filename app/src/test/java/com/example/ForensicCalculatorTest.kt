package com.example

import com.example.data.forensics.ForensicCalculator
import com.example.data.model.FinancialPeriod
import org.junit.Assert.*
import org.junit.Test

class ForensicCalculatorTest {

    @Test
    fun testAlertBudgetCapMath() {
        // 800 companies -> 40 alert slots (5%)
        assertEquals(40, ForensicCalculator.calculateAlertCapacityCap(800))

        // 40 companies Indian validation panel -> 2 alert slots (5%)
        assertEquals(2, ForensicCalculator.calculateAlertCapacityCap(40))

        // 0 companies
        assertEquals(0, ForensicCalculator.calculateAlertCapacityCap(0))
    }

    @Test
    fun testAsymmetricExpectedCostMath() {
        // Expected Cost = 20 * FN + 1 * FP
        val cost = ForensicCalculator.calculateExpectedCost(falseNegatives = 2, falsePositives = 2)
        assertEquals(42.0, cost, 0.001)

        val zeroCost = ForensicCalculator.calculateExpectedCost(0, 0)
        assertEquals(0.0, zeroCost, 0.001)

        val fnOnly = ForensicCalculator.calculateExpectedCost(1, 0)
        assertEquals(20.0, fnOnly, 0.001)
    }

    @Test
    fun testBeneishMScoreCalculation() {
        val curr = FinancialPeriod(
            periodId = "curr", companyId = "c1", fiscalYear = 2018, fiscalQuarter = 0,
            periodEndDate = "2018-03-31", filingDate = "2018-06-30", publiclyAvailableAt = "2018-06-30T18:00:00Z",
            revenue = 18000.0, cogs = 13000.0, ebit = 2000.0, netIncome = -2000.0,
            totalAssets = 100000.0, currentAssets = 25000.0, currentLiabilities = 45000.0,
            totalLiabilities = 95000.0, totalDebt = 80000.0, operatingCashFlow = -1500.0,
            retainedEarnings = 1000.0, receivables = 14000.0, depreciation = 1000.0,
            sgaExpenses = 2500.0, ppeNet = 40000.0, securities = 5000.0,
            commonSharesOutstanding = 100.0, bookEquity = 5000.0
        )

        val prev = FinancialPeriod(
            periodId = "prev", companyId = "c1", fiscalYear = 2017, fiscalQuarter = 0,
            periodEndDate = "2017-03-31", filingDate = "2017-06-30", publiclyAvailableAt = "2017-06-30T18:00:00Z",
            revenue = 16000.0, cogs = 11000.0, ebit = 3000.0, netIncome = 500.0,
            totalAssets = 90000.0, currentAssets = 26000.0, currentLiabilities = 35000.0,
            totalLiabilities = 85000.0, totalDebt = 65000.0, operatingCashFlow = 500.0,
            retainedEarnings = 3000.0, receivables = 10000.0, depreciation = 900.0,
            sgaExpenses = 2000.0, ppeNet = 37000.0, securities = 5000.0,
            commonSharesOutstanding = 100.0, bookEquity = 5000.0
        )

        val result = ForensicCalculator.calculateBeneishMScore(curr, prev)
        assertNotNull(result.mScore)

        // Threshold is -1.78
        assertEquals(-1.78, result.threshold, 0.001)

        // Verify DSRI > 1.0 (receivables grew faster than sales)
        assertTrue(result.dsri > 1.0)

        // Verify TATA is calculated as (Net Income - CFO) / Total Assets
        val expectedTata = (-2000.0 - (-1500.0)) / 100000.0
        assertEquals(expectedTata, result.tata, 0.001)
    }

    @Test
    fun testAltmanZScoreFinancialSectorExclusion() {
        val period = FinancialPeriod(
            periodId = "nbfc-p", companyId = "nbfc-1", fiscalYear = 2018, fiscalQuarter = 0,
            periodEndDate = "2018-03-31", filingDate = "2018-06-30", publiclyAvailableAt = "2018-06-30T18:00:00Z",
            revenue = 10000.0, cogs = 6000.0, ebit = 1500.0, netIncome = 800.0,
            totalAssets = 100000.0, currentAssets = 20000.0, currentLiabilities = 30000.0,
            totalLiabilities = 90000.0, totalDebt = 75000.0, operatingCashFlow = 500.0,
            retainedEarnings = 2000.0, receivables = 5000.0, depreciation = 100.0,
            sgaExpenses = 1000.0, ppeNet = 1000.0, securities = 10000.0,
            commonSharesOutstanding = 300.0, bookEquity = 10000.0
        )

        val result = ForensicCalculator.calculateAltmanZScore(period, "NBFC")
        assertEquals("EXCLUDED_FINANCIAL_SECTOR", result.status)
        assertNull(result.zScore)

        val bankResult = ForensicCalculator.calculateAltmanZScore(period, "BANK")
        assertEquals("EXCLUDED_FINANCIAL_SECTOR", bankResult.status)

        // Non-financial firm should be scorable
        val infraResult = ForensicCalculator.calculateAltmanZScore(period, "INFRA")
        assertNotNull(infraResult.zScore)
    }
}
