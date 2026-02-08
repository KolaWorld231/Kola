/**
 * Script to apply the grammar_tip migration directly via Prisma
 * Run with: npx tsx scripts/apply-grammar-tip-migration.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function applyGrammarTipMigration() {
  try {
    console.log("🔄 Checking if grammar_tip column exists...");

    // Check if column exists by trying to query it
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'exercises' AND column_name = 'grammar_tip'
    `;

    if (result.length > 0) {
      console.log("✅ Column 'grammar_tip' already exists. Migration already applied.");
      return;
    }

    console.log("📝 Adding grammar_tip column to exercises table...");

    // Apply the migration
    await prisma.$executeRaw`
      ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "grammar_tip" TEXT
    `;

    console.log("✅ Successfully added grammar_tip column to exercises table!");

    // Verify the column was added
    const verifyResult = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'exercises' AND column_name = 'grammar_tip'
    `;

    if (verifyResult.length > 0) {
      console.log(`✅ Verification successful: Column '${verifyResult[0].column_name}' of type '${verifyResult[0].data_type}' exists.`);
    } else {
      console.warn("⚠️  Warning: Column was created but verification failed.");
    }

    // Mark migration as applied in Prisma's migration history
    try {
      await prisma.$executeRaw`
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        VALUES (
          gen_random_uuid()::text,
          '',
          NOW(),
          'add_grammar_tip_to_exercises',
          NULL,
          NULL,
          NOW(),
          1
        )
        ON CONFLICT DO NOTHING
      `;
      console.log("✅ Migration marked as applied in Prisma migration history.");
    } catch (error) {
      console.warn("⚠️  Could not update migration history (this is OK if using db push):", error);
    }

  } catch (error) {
    console.error("❌ Error applying migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyGrammarTipMigration()
  .then(() => {
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });







