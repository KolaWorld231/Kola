const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.adminUser.findMany();
    console.log('admin_users rows:', rows.length);
    console.log(rows);
  } catch (e) {
    console.error('Error querying admin_users:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
