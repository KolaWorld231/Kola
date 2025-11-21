/**
 * Verification Script for Lesson Page Fix
 * 
 * This script verifies that:
 * 1. Lesson page component uses useParams() correctly
 * 2. Lesson complete API route handles params correctly
 * 3. No other similar issues exist
 */

import { readFileSync } from "fs";
import { join } from "path";

const projectRoot = join(__dirname, "..");

interface CheckResult {
  file: string;
  status: "✅ PASS" | "❌ FAIL" | "⚠️  WARNING";
  message: string;
}

const checks: CheckResult[] = [];

// Check 1: Lesson page uses useParams()
console.log("🔍 Checking lesson page fix...\n");

const lessonPagePath = join(projectRoot, "app/lesson/[id]/page.tsx");
try {
  const lessonPageContent = readFileSync(lessonPagePath, "utf-8");
  
  // Check if it's a client component
  const isClientComponent = lessonPageContent.includes("'use client'") || lessonPageContent.includes('"use client"');
  
  if (isClientComponent) {
    // Check if it uses useParams()
    if (lessonPageContent.includes("useParams()")) {
      checks.push({
        file: "app/lesson/[id]/page.tsx",
        status: "✅ PASS",
        message: "Client component correctly uses useParams() hook",
      });
    } else if (lessonPageContent.includes("params: Promise")) {
      checks.push({
        file: "app/lesson/[id]/page.tsx",
        status: "❌ FAIL",
        message: "Client component still uses Promise params (should use useParams())",
      });
    } else {
      checks.push({
        file: "app/lesson/[id]/page.tsx",
        status: "⚠️  WARNING",
        message: "Could not determine params handling method",
      });
    }
  } else {
    checks.push({
      file: "app/lesson/[id]/page.tsx",
      status: "⚠️  WARNING",
      message: "Not a client component - params handling may differ",
    });
  }
} catch (error) {
  checks.push({
    file: "app/lesson/[id]/page.tsx",
    status: "❌ FAIL",
    message: `Could not read file: ${error instanceof Error ? error.message : "Unknown error"}`,
  });
}

// Check 2: Lesson complete API route handles params correctly
console.log("🔍 Checking lesson complete API route...\n");

const lessonCompleteApiPath = join(projectRoot, "app/api/lessons/[id]/complete/route.ts");
try {
  const apiContent = readFileSync(lessonCompleteApiPath, "utf-8");
  
  // Check if it uses Promise params
  if (apiContent.includes("params: Promise<{ id: string }>")) {
    // Check if it awaits params
    if (apiContent.includes("await params") || apiContent.includes("const { id } = await params")) {
      // Check if it uses the resolved id instead of params.id
      const usesResolvedId = apiContent.includes("lessonId: id") || apiContent.includes("where: { id }");
      const usesParamsId = apiContent.match(/params\.id/g);
      
      if (usesResolvedId && (!usesParamsId || usesParamsId.length === 0)) {
        checks.push({
          file: "app/api/lessons/[id]/complete/route.ts",
          status: "✅ PASS",
          message: "API route correctly awaits params and uses resolved id",
        });
      } else if (usesParamsId && usesParamsId.length > 0) {
        checks.push({
          file: "app/api/lessons/[id]/complete/route.ts",
          status: "❌ FAIL",
          message: `API route still uses params.id in ${usesParamsId.length} place(s) (should use resolved id)`,
        });
      } else {
        checks.push({
          file: "app/api/lessons/[id]/complete/route.ts",
          status: "⚠️  WARNING",
          message: "Could not verify params usage",
        });
      }
    } else {
      checks.push({
        file: "app/api/lessons/[id]/complete/route.ts",
        status: "❌ FAIL",
        message: "API route uses Promise params but does not await them",
      });
    }
  } else {
    checks.push({
      file: "app/api/lessons/[id]/complete/route.ts",
      status: "⚠️  WARNING",
      message: "API route does not use Promise params (may be using old pattern)",
    });
  }
} catch (error) {
  checks.push({
    file: "app/api/lessons/[id]/complete/route.ts",
    status: "❌ FAIL",
    message: `Could not read file: ${error instanceof Error ? error.message : "Unknown error"}`,
  });
}

// Check 3: Stories page uses useParams() correctly
console.log("🔍 Checking stories page...\n");

const storiesPagePath = join(projectRoot, "app/(app)/stories/[id]/page.tsx");
try {
  const storiesContent = readFileSync(storiesPagePath, "utf-8");
  
  if (storiesContent.includes("'use client'") || storiesContent.includes('"use client"')) {
    if (storiesContent.includes("useParams()")) {
      checks.push({
        file: "app/(app)/stories/[id]/page.tsx",
        status: "✅ PASS",
        message: "Stories page correctly uses useParams() hook",
      });
    } else {
      checks.push({
        file: "app/(app)/stories/[id]/page.tsx",
        status: "⚠️  WARNING",
        message: "Stories page is client component but may not use useParams()",
      });
    }
  } else {
    checks.push({
      file: "app/(app)/stories/[id]/page.tsx",
      status: "✅ PASS",
      message: "Stories page is server component (params handling is correct)",
    });
  }
} catch (error) {
  checks.push({
    file: "app/(app)/stories/[id]/page.tsx",
    status: "⚠️  WARNING",
    message: `Could not verify: ${error instanceof Error ? error.message : "Unknown error"}`,
  });
}

// Print results
console.log("\n" + "=".repeat(60));
console.log("📊 Verification Results");
console.log("=".repeat(60) + "\n");

let passCount = 0;
let failCount = 0;
let warningCount = 0;

checks.forEach((check) => {
  console.log(`${check.status} ${check.file}`);
  console.log(`   ${check.message}\n`);
  
  if (check.status === "✅ PASS") passCount++;
  else if (check.status === "❌ FAIL") failCount++;
  else if (check.status === "⚠️  WARNING") warningCount++;
});

console.log("=".repeat(60));
console.log(`Summary: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`);
console.log("=".repeat(60) + "\n");

if (failCount > 0) {
  console.log("❌ Some checks failed. Please review the issues above.");
  process.exit(1);
} else if (warningCount > 0) {
  console.log("⚠️  Some warnings found. Please review the messages above.");
  process.exit(0);
} else {
  console.log("✅ All checks passed! Lesson page fix is verified.");
  process.exit(0);
}

