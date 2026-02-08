const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const outPath = path.join(__dirname, '..', 'prisma', 'schema.postgres.prisma');

async function run() {
  if (!fs.existsSync(schemaPath)) {
    console.error('prisma/schema.prisma not found');
    process.exit(1);
  }

  const src = fs.readFileSync(schemaPath, 'utf8');
  let out = src;

  // Replace specific String? columns with Json? for Postgres
  out = out.replace(/data\s+String\?\s+@map\("data"\)/g, 'data      Json?    @map("data")');
  out = out.replace(/assessmentLearningGoals\s+String\?\s+@map\("assessment_learning_goals"\)/g, 'assessmentLearningGoals    Json?     @map("assessment_learning_goals")');

  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Wrote', outPath);
  console.log('\nNext steps to migrate to Postgres:');
  console.log('1) Provision a Postgres database and set DATABASE_URL in your environment.');
  console.log('2) Replace prisma/schema.prisma with prisma/schema.postgres.prisma (or set PRISMA_SCHEMA_PATH).');
  console.log('3) Run: npx prisma migrate dev --name convert-strings-to-json --schema=prisma/schema.postgres.prisma');
  console.log('4) Run scripts/backfill-to-json.js against the Postgres DB to normalize legacy string values into true Json columns.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
