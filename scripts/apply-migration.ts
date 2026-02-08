#!/usr/bin/env tsx

/**
 * Script to apply the performance indexes migration
 * 
 * This script:
 * 1. Checks database connectivity
 * 2. Verifies migration file exists
 * 3. Shows what will be applied
 * 4. Applies the migration
 * 5. Verifies indexes were created
 * 
 * Usage:
 *   npx tsx scripts/apply-migration.ts
 * 
 * Or with npm:
 *   npm run apply-migration
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

const MIGRATION_FILE = join(
  process.cwd(),
  "prisma/migrations/20250101000000_add_performance_indexes/migration.sql"
);

async function checkDatabaseConnection() {
  console.log("🔍 Checking database connection...\n");
  
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();
    
    console.log("✅ Database connection successful\n");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}\n`);
    }
    console.log("💡 Make sure:");
    console.log("   • DATABASE_URL is set correctly in .env");
    console.log("   • Database server is accessible");
    console.log("   • Network/firewall allows connection\n");
    return false;
  }
}

function showMigrationPreview() {
  console.log("📋 Migration Preview:\n");
  
  try {
    const migrationSQL = readFileSync(MIGRATION_FILE, "utf-8");
    const indexCount = (migrationSQL.match(/CREATE INDEX/g) || []).length;
    
    console.log(`   Migration file: ${MIGRATION_FILE}`);
    console.log(`   Indexes to create: ${indexCount}\n`);
    
    // Extract table names
    const tables = new Set<string>();
    const tableMatches = migrationSQL.matchAll(/ON\s+"(\w+)"/g);
    for (const match of tableMatches) {
      tables.add(match[1]);
    }
    
    console.log(`   Tables affected: ${tables.size}`);
    console.log(`   ${Array.from(tables).join(", ")}\n`);
    
    console.log("📝 First few lines of migration:");
    const lines = migrationSQL.split("\n").slice(0, 5);
    lines.forEach(line => console.log(`   ${line}`));
    console.log("   ...\n");
    
    return true;
  } catch (error) {
    console.error(`❌ Error reading migration file:`, error);
    return false;
  }
}

async function applyMigration() {
  console.log("🚀 Applying migration...\n");
  
  try {
    // Use Prisma migrate deploy (for production) or migrate dev (for development)
    const command = process.env.NODE_ENV === "production" 
      ? "npx prisma migrate deploy"
      : "npm run db:migrate";
    
    console.log(`   Running: ${command}\n`);
    
    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    
    console.log("\n✅ Migration applied successfully!\n");
    return true;
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}\n`);
    }
    
    console.log("💡 Alternative: Apply migration manually");
    console.log("   1. Copy SQL from migration file");
    console.log("   2. Run in Supabase SQL Editor or psql");
    console.log(`   3. File: ${MIGRATION_FILE}\n`);
    
    return false;
  }
}

async function main() {
  console.log("🚀 Performance Indexes Migration Tool\n");
  console.log("=" .repeat(50) + "\n");
  
  // Step 1: Check connection
  const connected = await checkDatabaseConnection();
  if (!connected) {
    console.log("⚠️  Cannot proceed without database connection");
    process.exit(1);
  }
  
  // Step 2: Show preview
  const previewOk = showMigrationPreview();
  if (!previewOk) {
    console.log("⚠️  Cannot proceed without migration file");
    process.exit(1);
  }
  
  // Step 3: Confirm
  console.log("⚠️  Ready to apply migration");
  console.log("   This will create indexes on your database.");
  console.log("   Large tables may take time to index.\n");
  
  // In non-interactive mode, proceed automatically
  // In interactive mode, you'd ask for confirmation here
  const shouldProceed = process.env.FORCE === "true" || process.argv.includes("--force");
  
  if (!shouldProceed && process.stdout.isTTY) {
    console.log("💡 To apply automatically, use: --force flag");
    console.log("   Or set FORCE=true environment variable\n");
    process.exit(0);
  }
  
  // Step 4: Apply migration
  const applied = await applyMigration();
  if (!applied) {
    process.exit(1);
  }
  
  // Step 5: Verify (if verify script exists)
  console.log("🔍 Verifying indexes...\n");
  try {
    execSync("npx tsx scripts/verify-indexes.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.log("⚠️  Verification script not available or failed");
    console.log("   Run manually: npx tsx scripts/verify-indexes.ts\n");
  }
  
  console.log("✅ Migration process complete!\n");
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});


