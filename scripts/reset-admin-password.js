const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash('password123', 12);
    const updated = await prisma.user.update({ where: { email: 'admin@volo.test' }, data: { password: hash } });
    console.log('Updated user:', updated.email);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
