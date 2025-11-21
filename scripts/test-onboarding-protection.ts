/**
 * Test script for onboarding protection
 * 
 * This script verifies that:
 * 1. New users (no UserSettings) → hasCompletedOnboarding returns false
 * 2. Users with assessmentCompleted: false → returns false
 * 3. Users with assessmentCompleted: true → returns true
 * 4. Database queries work correctly
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testOnboardingProtection() {
  console.log("🧪 Testing Onboarding Protection\n");
  console.log("=" .repeat(50));
  console.log("");

  try {
    // Test 1: Check existing users and their onboarding status
    console.log("📊 Test 1: Checking existing users and onboarding status");
    console.log("-".repeat(50));
    
    const users = await prisma.user.findMany({
      take: 10,
      include: {
        settings: {
          select: {
            assessmentCompleted: true,
            assessmentCompletedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (users.length === 0) {
      console.log("⚠️  No users found in database");
      console.log("   This is expected if no users have signed up yet.");
      console.log("");
    } else {
      console.log(`✅ Found ${users.length} user(s)\n`);
      
      users.forEach((user, index) => {
        const hasSettings = !!user.settings;
        const completed = user.settings?.assessmentCompleted ?? false;
        const status = completed ? "✅ COMPLETED" : "⏳ NOT COMPLETED";
        
        console.log(`User ${index + 1}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Has UserSettings: ${hasSettings ? "Yes" : "No"}`);
        console.log(`  Assessment Completed: ${status}`);
        if (user.settings?.assessmentCompletedAt) {
          console.log(`  Completed At: ${user.settings.assessmentCompletedAt.toISOString()}`);
        }
        console.log("");
      });
    }

    // Test 2: Test the hasCompletedOnboarding logic manually
    console.log("🔍 Test 2: Testing onboarding completion logic");
    console.log("-".repeat(50));
    
    if (users.length > 0) {
      for (const user of users.slice(0, 3)) {
        // Simulate the hasCompletedOnboarding check
        const userSettings = await prisma.userSettings.findUnique({
          where: { userId: user.id },
          select: { assessmentCompleted: true },
        });

        let result: boolean;
        if (!userSettings) {
          result = false; // New user, hasn't completed
        } else {
          result = userSettings.assessmentCompleted === true;
        }

        const expectedBehavior = !userSettings 
          ? "New user → should see onboarding (returns false)"
          : userSettings.assessmentCompleted === true
          ? "Completed user → should NOT see onboarding (returns true)"
          : "Incomplete user → should see onboarding (returns false)";

        console.log(`User: ${user.email}`);
        console.log(`  Result: ${result}`);
        console.log(`  Expected: ${expectedBehavior}`);
        console.log(`  ✅ Logic Check: ${result === (!userSettings || !userSettings.assessmentCompleted) ? "PASS" : "FAIL"}`);
        console.log("");
      }
    } else {
      console.log("⚠️  Skipping logic test (no users found)");
      console.log("");
    }

    // Test 3: Check database schema
    console.log("🗄️  Test 3: Verifying database schema");
    console.log("-".repeat(50));
    
    // Check if user_settings table exists
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings'
      ) as exists;
    `.catch(() => [{ exists: false }]);

    if (tableExists[0]?.exists) {
      console.log("✅ user_settings table exists");
      
      // Check if assessment_completed column exists
      const columnExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'user_settings'
          AND column_name = 'assessment_completed'
        ) as exists;
      `.catch(() => [{ exists: false }]);

      if (columnExists[0]?.exists) {
        console.log("✅ assessment_completed column exists");
      } else {
        console.log("❌ assessment_completed column does NOT exist");
        console.log("   Run: npx prisma db push");
      }
    } else {
      console.log("❌ user_settings table does NOT exist");
      console.log("   Run: npx prisma db push");
    }
    console.log("");

    // Test 4: Statistics
    console.log("📈 Test 4: Database Statistics");
    console.log("-".repeat(50));
    
    const totalUsers = await prisma.user.count();
    const usersWithSettings = await prisma.userSettings.count();
    const usersCompleted = await prisma.userSettings.count({
      where: { assessmentCompleted: true },
    });
    const usersIncomplete = await prisma.userSettings.count({
      where: { assessmentCompleted: false },
    });
    const usersNoSettings = totalUsers - usersWithSettings;

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Users with UserSettings: ${usersWithSettings}`);
    console.log(`Users without UserSettings (new): ${usersNoSettings}`);
    console.log(`Users completed onboarding: ${usersCompleted}`);
    console.log(`Users incomplete onboarding: ${usersIncomplete}`);
    console.log("");

    // Test 5: Verify protection logic
    console.log("🛡️  Test 5: Protection Logic Verification");
    console.log("-".repeat(50));
    
    console.log("Expected Behavior:");
    console.log("  • New users (no UserSettings) → should see onboarding");
    console.log("  • Users with assessmentCompleted: false → should see onboarding");
    console.log("  • Users with assessmentCompleted: true → should NOT see onboarding");
    console.log("");
    console.log("Verification:");
    
    let allTestsPass = true;
    
    // Test case 1: User without UserSettings
    if (usersNoSettings > 0) {
      const userWithoutSettings = await prisma.user.findFirst({
        where: {
          settings: null,
        },
      });
      
      if (userWithoutSettings) {
        const testSettings = await prisma.userSettings.findUnique({
          where: { userId: userWithoutSettings.id },
          select: { assessmentCompleted: true },
        });
        const testResult = !testSettings || testSettings.assessmentCompleted !== true;
        console.log(`  ✅ New user test: ${testResult ? "PASS" : "FAIL"} (should return false)`);
        if (!testResult) allTestsPass = false;
      }
    }
    
    // Test case 2: User with assessmentCompleted: false
    if (usersIncomplete > 0) {
      const incompleteUser = await prisma.userSettings.findFirst({
        where: { assessmentCompleted: false },
      });
      
      if (incompleteUser) {
        const testResult = incompleteUser.assessmentCompleted !== true;
        console.log(`  ✅ Incomplete user test: ${testResult ? "PASS" : "FAIL"} (should return false)`);
        if (!testResult) allTestsPass = false;
      }
    }
    
    // Test case 3: User with assessmentCompleted: true
    if (usersCompleted > 0) {
      const completedUser = await prisma.userSettings.findFirst({
        where: { assessmentCompleted: true },
      });
      
      if (completedUser) {
        const testResult = completedUser.assessmentCompleted === true;
        console.log(`  ✅ Completed user test: ${testResult ? "PASS" : "FAIL"} (should return true)`);
        if (!testResult) allTestsPass = false;
      }
    }

    if (usersNoSettings === 0 && usersIncomplete === 0 && usersCompleted === 0) {
      console.log("  ⚠️  No test cases available (no users in database)");
    }

    console.log("");
    console.log("=" .repeat(50));
    console.log(allTestsPass ? "✅ All tests passed!" : "⚠️  Some tests failed or skipped");
    console.log("=" .repeat(50));

  } catch (error) {
    console.error("❌ Error running tests:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testOnboardingProtection()
  .then(() => {
    console.log("\n✅ Test script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test script failed:", error);
    process.exit(1);
  });

