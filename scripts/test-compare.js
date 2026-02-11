const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  try {
    const u = await prisma.user.findUnique({ where: { email: 'admin@volo.test' } });
    console.log('fetched hash length', u.password ? u.password.length : null);
    const result = await bcrypt.compare('password123', u.password || '');
    console.log('compare result', result);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
