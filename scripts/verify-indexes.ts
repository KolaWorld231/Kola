#!/usr/bin/env tsx

/**
 * Script to verify database indexes were created successfully
 * 
 * Usage:
 *   npx tsx scripts/verify-indexes.ts
 * 
 * Or with npm:
 *   npm run verify-indexes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Expected indexes from migration
const expectedIndexes = [
  // UserProgress indexes
  { table: "user_progress", index: "user_progress_user_id_idx" },
  { table: "user_progress", index: "user_progress_user_id_is_completed_idx" },
  { table: "user_progress", index: "user_progress_lesson_id_idx" },
  
  // UserXP indexes
  { table: "user_xp", index: "user_xp_user_id_idx" },
  { table: "user_xp", index: "user_xp_user_id_source_idx" },
  { table: "user_xp", index: "user_xp_user_id_created_at_idx" },
  
  // Unit indexes
  { table: "units", index: "units_language_id_idx" },
  { table: "units", index: "units_language_id_order_idx" },
  
  // Lesson indexes
  { table: "lessons", index: "lessons_unit_id_idx" },
  { table: "lessons", index: "lessons_unit_id_order_idx" },
  
  // Exercise indexes
  { table: "exercises", index: "exercises_lesson_id_idx" },
  { table: "exercises", index: "exercises_lesson_id_order_idx" },
  
  // User indexes
  { table: "users", index: "users_selected_language_id_idx" },
  { table: "users", index: "users_total_xp_idx" },
  { table: "users", index: "users_current_streak_idx" },
  
  // LeaderboardEntry indexes
  { table: "leaderboard_entries", index: "leaderboard_entries_user_id_idx" },
  { table: "leaderboard_entries", index: "leaderboard_entries_period_period_start_idx" },
  { table: "leaderboard_entries", index: "leaderboard_entries_period_period_start_xp_idx" },
  { table: "leaderboard_entries", index: "leaderboard_entries_language_id_period_period_start_xp_idx" },
];

async function verifyIndexes() {
  console.log("🔍 Verifying database indexes...\n");
  
  try {
    // Query to get all indexes from pg_indexes
    const result = await prisma.$queryRaw<Array<{
      tablename: string;
      indexname: string;
      indexdef: string;
    }>>`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN (
          'user_progress', 'user_xp', 'units', 'lessons', 
          'exercises', 'users', 'leaderboard_entries'
        )
      ORDER BY tablename, indexname;
    `;

    const existingIndexes = new Set(
      result.map((row) => `${row.tablename}.${row.indexname}`)
    );

    console.log(`📊 Found ${result.length} indexes across ${new Set(result.map(r => r.tablename)).size} tables\n`);

    let allFound = true;
    let foundCount = 0;
    const missingIndexes: typeof expectedIndexes = [];

    // Check each expected index
    for (const expected of expectedIndexes) {
      const key = `${expected.table}.${expected.index}`;
      if (existingIndexes.has(key)) {
        foundCount++;
        console.log(`✅ ${expected.index} - EXISTS`);
      } else {
        allFound = false;
        missingIndexes.push(expected);
        console.log(`❌ ${expected.index} - MISSING`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Found: ${foundCount}/${expectedIndexes.length}`);
    console.log(`   Missing: ${missingIndexes.length}/${expectedIndexes.length}`);

    if (allFound) {
      console.log(`\n✅ All indexes verified successfully!`);
      
      // Show table breakdown
      console.log(`\n📋 Index breakdown by table:`);
      const byTable = result.reduce((acc, row) => {
        if (!acc[row.tablename]) {
          acc[row.tablename] = [];
        }
        acc[row.tablename].push(row.indexname);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(byTable).forEach(([table, indexes]) => {
        const performanceIndexes = indexes.filter(idx => 
          expectedIndexes.some(exp => exp.table === table && exp.index === idx)
        );
        console.log(`   ${table}: ${performanceIndexes.length} performance indexes`);
      });

      return 0;
    } else {
      console.log(`\n⚠️  Some indexes are missing.`);
      console.log(`\n📋 Missing indexes:`);
      missingIndexes.forEach(({ table, index }) => {
        console.log(`   - ${table}.${index}`);
      });
      console.log(`\n💡 To create missing indexes, run the migration:`);
      console.log(`   npm run db:migrate`);
      return 1;
    }
  } catch (error) {
    console.error(`\n❌ Error verifying indexes:`, error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    return 1;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyIndexes()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

