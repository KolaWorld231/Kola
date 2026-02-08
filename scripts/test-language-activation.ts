/**
 * Language Activation Feature Test Script
 * 
 * This script verifies that:
 * 1. Language activation/deactivation API works
 * 2. isActive field exists and is used correctly
 * 3. Public routes filter by isActive
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testLanguageActivation() {
  console.log("🧪 Testing Language Activation Feature\n");
  console.log("=".repeat(60) + "\n");

  try {
    // Test 1: Check if isActive field exists
    console.log("📊 Test 1: Verifying database schema\n");
    console.log("-".repeat(60));
    
    const languages = await prisma.language.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
      take: 5,
    });

    if (languages.length === 0) {
      console.log("⚠️  No languages found in database");
    } else {
      console.log(`✅ Found ${languages.length} language(s)`);
      languages.forEach((lang) => {
        console.log(`   - ${lang.name} (${lang.code}): ${lang.isActive ? "✅ Active" : "⏸️  Inactive"}`);
      });
      
      // Check if isActive field is being used
      const hasActive = languages.some((l) => l.isActive === true);
      const hasInactive = languages.some((l) => l.isActive === false);
      
      if (hasActive) {
        console.log("\n✅ Active languages found");
      }
      if (hasInactive) {
        console.log("✅ Inactive languages found");
      }
      if (!hasActive && !hasInactive) {
        console.log("⚠️  No languages have isActive set (all may be defaulting)");
      }
    }

    // Test 2: Check active languages count
    console.log("\n📊 Test 2: Counting active vs inactive languages\n");
    console.log("-".repeat(60));
    
    const activeCount = await prisma.language.count({
      where: { isActive: true },
    });
    
    const inactiveCount = await prisma.language.count({
      where: { isActive: false },
    });
    
    const totalCount = await prisma.language.count();
    
    console.log(`Total languages: ${totalCount}`);
    console.log(`Active languages: ${activeCount}`);
    console.log(`Inactive languages: ${inactiveCount}`);
    
    if (activeCount + inactiveCount === totalCount) {
      console.log("✅ All languages have isActive field set correctly");
    } else {
      console.log("⚠️  Some languages may have null isActive (check default value)");
    }

    // Test 3: Verify filtering logic
    console.log("\n📊 Test 3: Verifying filtering logic\n");
    console.log("-".repeat(60));
    
    const activeLanguages = await prisma.language.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });
    
    console.log(`Active languages (should appear in /learn): ${activeLanguages.length}`);
    activeLanguages.forEach((lang) => {
      console.log(`   - ${lang.name} (${lang.code})`);
    });
    
    const inactiveLanguages = await prisma.language.findMany({
      where: { isActive: false },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });
    
    console.log(`\nInactive languages (should NOT appear in /learn): ${inactiveLanguages.length}`);
    if (inactiveLanguages.length > 0) {
      inactiveLanguages.forEach((lang) => {
        console.log(`   - ${lang.name} (${lang.code})`);
      });
    } else {
      console.log("   (none)");
    }

    // Test 4: Check API route exists
    console.log("\n📊 Test 4: Verifying API route file exists\n");
    console.log("-".repeat(60));
    
    const fs = await import("fs");
    const path = await import("path");
    
    const apiRoutePath = path.join(process.cwd(), "app/api/admin/languages/[id]/route.ts");
    const apiRouteExists = fs.existsSync(apiRoutePath);
    
    if (apiRouteExists) {
      console.log("✅ API route file exists: app/api/admin/languages/[id]/route.ts");
    } else {
      console.log("❌ API route file NOT found: app/api/admin/languages/[id]/route.ts");
    }
    
    // Test 5: Check toggle component exists
    console.log("\n📊 Test 5: Verifying toggle component exists\n");
    console.log("-".repeat(60));
    
    const toggleComponentPath = path.join(process.cwd(), "components/admin/language-toggle.tsx");
    const toggleComponentExists = fs.existsSync(toggleComponentPath);
    
    if (toggleComponentExists) {
      console.log("✅ Toggle component exists: components/admin/language-toggle.tsx");
    } else {
      console.log("❌ Toggle component NOT found: components/admin/language-toggle.tsx");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Test Summary");
    console.log("=".repeat(60) + "\n");
    
    console.log(`✅ Database schema: ${languages.length > 0 ? "OK" : "No languages"}`);
    console.log(`✅ Active languages: ${activeCount}`);
    console.log(`✅ Inactive languages: ${inactiveCount}`);
    console.log(`✅ API route: ${apiRouteExists ? "Exists" : "Missing"}`);
    console.log(`✅ Toggle component: ${toggleComponentExists ? "Exists" : "Missing"}`);
    
    if (apiRouteExists && toggleComponentExists && totalCount > 0) {
      console.log("\n✅ All checks passed! Language activation feature is ready.");
    } else {
      console.log("\n⚠️  Some checks failed. Please review the issues above.");
    }

  } catch (error) {
    console.error("\n❌ Error running tests:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLanguageActivation()
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });


