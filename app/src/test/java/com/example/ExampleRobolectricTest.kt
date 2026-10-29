package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.AppDatabase
import com.example.data.local.SeedDataProvider
import com.example.data.model.Company
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun readStringFromContext() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Corporate EWS", appName)
    }

    @Test
    fun testRoomDatabaseSeedingAndRetrieval() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val db = AppDatabase.getDatabase(context)
        val dao = db.companyDao()

        dao.insertCompanies(SeedDataProvider.getInitialCompanies())
        val companies = dao.getAllCompanies().first()

        assertNotNull(companies)
        // 10 defaulters + 30 matched controls = 40 companies
        assertEquals(40, companies.size)

        // Verify IL&FS
        val ilfs = companies.firstOrNull { it.cin == "L65922MH1987PLC044567" }
        assertNotNull(ilfs)
        assertEquals("IL&FS", ilfs?.tradeName)
    }
}
