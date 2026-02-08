const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@volo.test';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name: 'Admin' },
    create: { email, password: hashedPassword, name: 'Admin' },
  });

  console.log('Admin user upserted!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());