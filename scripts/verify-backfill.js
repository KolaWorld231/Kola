const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTable(tableName, fieldName) {
  const rows = await prisma[tableName].findMany({ take: 50 });
  let total = rows.length;
  let nonNull = 0;
  let parseable = 0;
  const samples = [];
  for (const r of rows) {
    const val = r[fieldName];
    if (val !== null && val !== undefined) {
      nonNull++;
      try {
        const parsed = JSON.parse(val);
        parseable++;
        if (samples.length < 3) samples.push({ id: r.id, parsed });
      } catch (e) {
        if (samples.length < 3) samples.push({ id: r.id, raw: val, error: e.message });
      }
    }
  }
  console.log(`${tableName}.${fieldName}: total=${total}, nonNull=${nonNull}, parseable=${parseable}`);
  if (samples.length > 0) console.log('  Samples:', samples);
}

async function main() {
  try {
    console.log('Verifying dev DB JSON fields...\n');
    await verifyTable('socialActivity', 'data');
    await verifyTable('userSettings', 'assessmentLearningGoals');
    await verifyTable('achievement', 'criteria');
    await verifyTable('adminUser', 'permissions');
    console.log('\nVerification complete.');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
