const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('ENV DATABASE_URL:', process.env.DATABASE_URL);
    const raw = process.env.DATABASE_URL || '';
    // normalize file path
    let filePath = raw.replace(/^file:\/\//, '').replace(/^file:/, '');
    filePath = filePath.replace(/^"|"$/g, '');
    const fs = require('fs');
    console.log('Resolved DB file path exists:', fs.existsSync(filePath), filePath);
    const res = await prisma.$queryRawUnsafe("PRAGMA database_list;");
    console.log(res);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
