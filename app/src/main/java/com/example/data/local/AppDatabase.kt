package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.model.*

@Database(
    entities = [
        Company::class,
        FinancialPeriod::class,
        SoftSignal::class,
        EntityRelationship::class,
        EvidenceDocument::class,
        EvidenceClaim::class,
        RiskAssessment::class,
        ReviewAction::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun companyDao(): CompanyDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "corporate_ews_local.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
