const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillSocialActivity() {
  console.log('Backfilling SocialActivity.data -> Json');
  const rows = await prisma.socialActivity.findMany({ where: { data: { not: null } }, select: { id: true, data: true } });
  let updated = 0;
  for (const row of rows) {
    const { id, data } = row;
    let parsed = null;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      // Not valid JSON — try comma-separated list heuristic
      if (typeof data === 'string' && data.includes(',')) {
        parsed = data.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        // fallback: store original string under `raw`
        parsed = { raw: data };
      }
    }
    try {
      // store normalized JSON string in the String column for SQLite compatibility
      await prisma.socialActivity.update({ where: { id }, data: { data: JSON.stringify(parsed) } });
      updated += 1;
    } catch (err) {
      console.error('Failed to update SocialActivity', id, err.message);
    }
  }
  console.log(`SocialActivity backfilled: ${updated}/${rows.length}`);
}

async function backfillUserSettings() {
  console.log('Backfilling UserSettings.assessmentLearningGoals -> Json');
  const rows = await prisma.userSettings.findMany({ where: { assessmentLearningGoals: { not: null } }, select: { id: true, assessmentLearningGoals: true } });
  let updated = 0;
  for (const row of rows) {
    const { id, assessmentLearningGoals } = row;
    let parsed = null;
    try {
      parsed = JSON.parse(assessmentLearningGoals);
    } catch (e) {
      if (typeof assessmentLearningGoals === 'string' && assessmentLearningGoals.includes(',')) {
        parsed = assessmentLearningGoals.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        parsed = { raw: assessmentLearningGoals };
      }
    }
    try {
      // store normalized JSON string in the String column for SQLite compatibility
      await prisma.userSettings.update({ where: { id }, data: { assessmentLearningGoals: JSON.stringify(parsed) } });
      updated += 1;
    } catch (err) {
      console.error('Failed to update UserSettings', id, err.message);
    }
  }
  console.log(`UserSettings backfilled: ${updated}/${rows.length}`);
}

async function main() {
  try {
    await backfillSocialActivity();
    await backfillUserSettings();
  } catch (err) {
    console.error('Backfill failed', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
