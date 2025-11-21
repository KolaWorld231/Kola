#!/usr/bin/env tsx

/**
 * Pre-Deployment Verification Script
 * Checks that everything is ready for production deployment
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import path from "path";

const checks: Array<{ name: string; check: () => boolean; error?: string }> = [];

// Check 1: Build succeeds
checks.push({
  name: "Production build",
  check: () => {
    try {
      console.log("  ✓ Checking production build...");
      execSync("npm run build", { stdio: "pipe" });
      return true;
    } catch (error) {
      console.error("  ✗ Build failed!");
      return false;
    }
  },
  error: "Build must succeed before deployment",
});

// Check 2: TypeScript compilation
checks.push({
  name: "TypeScript compilation",
  check: () => {
    try {
      console.log("  ✓ Checking TypeScript...");
      execSync("npm run type-check", { stdio: "pipe" });
      return true;
    } catch (error) {
      console.error("  ✗ TypeScript errors found!");
      return false;
    }
  },
  error: "Fix TypeScript errors before deployment",
});

// Check 3: Required files exist
checks.push({
  name: "Required files",
  check: () => {
    const requiredFiles = [
      "package.json",
      "next.config.js",
      "prisma/schema.prisma",
      "app/layout.tsx",
    ];
    
    console.log("  ✓ Checking required files...");
    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        console.error(`  ✗ Missing: ${file}`);
        return false;
      }
    }
    return true;
  },
  error: "Required files missing",
});

// Check 4: Environment variables documented
checks.push({
  name: "Environment variables",
  check: () => {
    console.log("  ✓ Checking environment documentation...");
    // Check if deployment guide exists with env vars
    return existsSync("PRODUCTION_DEPLOYMENT_CHECKLIST.md");
  },
  error: "Environment variables should be documented",
});

// Check 5: Database migrations ready
checks.push({
  name: "Database migrations",
  check: () => {
    console.log("  ✓ Checking database migrations...");
    const migrationsDir = path.join("prisma", "migrations");
    if (!existsSync(migrationsDir)) {
      return false;
    }
    
    // Check if there are migration files
    const files = require("fs").readdirSync(migrationsDir);
    return files.length > 0;
  },
  error: "Database migrations should be ready",
});

async function runChecks() {
  console.log("🔍 Pre-Deployment Verification");
  console.log("=" .repeat(40));
  console.log("");

  let allPassed = true;
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];

  for (const check of checks) {
    try {
      const passed = check.check();
      results.push({ name: check.name, passed, error: check.error });
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`  ✗ Error checking ${check.name}:`, error);
      results.push({ name: check.name, passed: false, error: check.error });
      allPassed = false;
    }
    console.log("");
  }

  // Summary
  console.log("📊 Results");
  console.log("=" .repeat(40));
  
  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   ${result.error}`);
    }
  });

  console.log("");
  
  if (allPassed) {
    console.log("🎉 All checks passed! Ready for production deployment.");
    console.log("");
    console.log("📋 Next Steps:");
    console.log("   1. Set environment variables in deployment platform");
    console.log("   2. Deploy application");
    console.log("   3. Run database migrations: npx prisma migrate deploy");
    console.log("   4. Verify deployment");
    return 0;
  } else {
    console.log("⚠️  Some checks failed. Fix issues before deploying.");
    return 1;
  }
}

runChecks()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

