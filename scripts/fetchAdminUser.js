const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@volo.test' },
  });
  if (admin) {
    console.log('Admin user found:', admin);
  } else {
    console.log('Admin user does not exist.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
