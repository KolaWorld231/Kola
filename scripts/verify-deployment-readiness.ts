#!/usr/bin/env tsx

/**
 * Deployment Readiness Verification
 * Comprehensive check before pushing to production
 */

import { existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warning" | "info";
  message: string;
  action?: string;
}

const checks: CheckResult[] = [];

// Git Repository Check
function checkGitRepo(): CheckResult {
  try {
    execSync("git rev-parse --git-dir", { stdio: "ignore" });
    return {
      name: "Git Repository",
      status: "pass",
      message: "Git repository initialized",
    };
  } catch {
    return {
      name: "Git Repository",
      status: "fail",
      message: "Git repository not initialized",
      action: "Run: git init",
    };
  }
}

// GitHub Remote Check
function checkGitRemote(): CheckResult {
  try {
    const remotes = execSync("git remote -v", { encoding: "utf8" });
    if (remotes.includes("origin")) {
      return {
        name: "GitHub Remote",
        status: "pass",
        message: "GitHub remote configured",
      };
    }
    return {
      name: "GitHub Remote",
      status: "warning",
      message: "No 'origin' remote found",
      action: "Run: git remote add origin [your-repo-url]",
    };
  } catch {
    return {
      name: "GitHub Remote",
      status: "info",
      message: "Git repository not initialized",
    };
  }
}

// Workflow Files Check
function checkWorkflows(): CheckResult {
  const ciWorkflow = existsSync(".github/workflows/ci.yml");
  const deployWorkflow = existsSync(".github/workflows/deploy.yml");

  if (ciWorkflow && deployWorkflow) {
    return {
      name: "CI/CD Workflows",
      status: "pass",
      message: "CI/CD workflows configured",
    };
  }

  return {
    name: "CI/CD Workflows",
    status: "fail",
    message: "Missing workflow files",
    action: "Ensure .github/workflows/ci.yml and deploy.yml exist",
  };
}

// Secrets Documentation Check
function checkSecretsDocs(): CheckResult {
  const hasDocs = existsSync("GITHUB_SECRETS_SETUP.md");
  return {
    name: "Secrets Documentation",
    status: hasDocs ? "pass" : "warning",
    message: hasDocs
      ? "Secrets setup guide available"
      : "Secrets documentation missing",
    action: hasDocs ? undefined : "Review deployment documentation",
  };
}

// Environment Variables Documentation
function checkEnvDocs(): CheckResult {
  const hasChecklist = existsSync("PRODUCTION_DEPLOYMENT_CHECKLIST.md");
  return {
    name: "Environment Variables Docs",
    status: hasChecklist ? "pass" : "warning",
    message: hasChecklist
      ? "Environment variables documented"
      : "Environment documentation missing",
  };
}

// Build Check
function checkBuild(): CheckResult {
  try {
    execSync("npm run build", { stdio: "pipe" });
    return {
      name: "Production Build",
      status: "pass",
      message: "Build succeeds",
    };
  } catch {
    return {
      name: "Production Build",
      status: "fail",
      message: "Build fails",
      action: "Fix build errors before deployment",
    };
  }
}

// Required Files Check
function checkRequiredFiles(): CheckResult {
  const required = [
    "package.json",
    "next.config.js",
    "prisma/schema.prisma",
    "app/layout.tsx",
  ];

  const missing = required.filter((file) => !existsSync(file));

  if (missing.length === 0) {
    return {
      name: "Required Files",
      status: "pass",
      message: "All required files present",
    };
  }

  return {
    name: "Required Files",
    status: "fail",
    message: `Missing files: ${missing.join(", ")}`,
    action: "Ensure all required files exist",
  };
}

// Database Migrations Check
function checkMigrations(): CheckResult {
  const migrationsDir = path.join("prisma", "migrations");
  if (!existsSync(migrationsDir)) {
    return {
      name: "Database Migrations",
      status: "warning",
      message: "No migrations directory found",
      action: "Migrations will be created on first deploy if needed",
    };
  }

  try {
    const files = require("fs").readdirSync(migrationsDir);
    if (files.length > 0) {
      return {
        name: "Database Migrations",
        status: "pass",
        message: `${files.length} migration(s) ready`,
      };
    }
    return {
      name: "Database Migrations",
      status: "info",
      message: "No migrations yet (will be created on deploy)",
    };
  } catch {
    return {
      name: "Database Migrations",
      status: "info",
      message: "Migrations directory exists",
    };
  }
}

// Run all checks
function runChecks() {
  checks.push(checkGitRepo());
  checks.push(checkGitRemote());
  checks.push(checkWorkflows());
  checks.push(checkSecretsDocs());
  checks.push(checkEnvDocs());
  checks.push(checkBuild());
  checks.push(checkRequiredFiles());
  checks.push(checkMigrations());
}

function displayResults() {
  console.log("");
  console.log("🔍 Deployment Readiness Check");
  console.log("=" .repeat(60));
  console.log("");

  const statusIcons = {
    pass: "✅",
    fail: "❌",
    warning: "⚠️ ",
    info: "ℹ️ ",
  };

  checks.forEach((check) => {
    const icon = statusIcons[check.status];
    console.log(`${icon} ${check.name}: ${check.message}`);
    if (check.action) {
      console.log(`   → ${check.action}`);
    }
    console.log("");
  });

  // Summary
  console.log("=" .repeat(60));
  console.log("");
  console.log("📊 Summary");
  console.log("=" .repeat(60));

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warning").length;
  const info = checks.filter((c) => c.status === "info").length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`ℹ️  Info: ${info}`);
  console.log("");

  // Deployment readiness
  const criticalFailed = checks.some(
    (c) => c.status === "fail" && ["Production Build", "Required Files", "CI/CD Workflows"].includes(c.name)
  );

  if (criticalFailed) {
    console.log("❌ NOT READY FOR DEPLOYMENT");
    console.log("");
    console.log("Critical checks failed. Please fix issues before deploying.");
    return 1;
  }

  console.log("✅ READY FOR DEPLOYMENT");
  console.log("");
  console.log("📋 Next Steps:");
  console.log("");
  console.log("1. Configure GitHub Secrets");
  console.log("   → Open: GITHUB_SECRETS_SETUP.md");
  console.log("   → Go to: GitHub → Settings → Secrets → Actions");
  console.log("   → Add all required secrets");
  console.log("");

  if (!checks.find((c) => c.name === "GitHub Remote")?.message.includes("configured")) {
    console.log("2. Connect to GitHub");
    console.log("   → git remote add origin [your-repo-url]");
    console.log("");
  }

  console.log("3. Push to Main");
  console.log("   → git add .");
  console.log("   → git commit -m 'Ready for production'");
  console.log("   → git push origin main");
  console.log("");

  if (warnings > 0) {
    console.log("⚠️  Note: Some warnings detected.");
    console.log("   Review warnings above, but deployment can proceed.");
    console.log("");
  }

  return 0;
}

// Main
runChecks();
const exitCode = displayResults();
process.exit(exitCode);


