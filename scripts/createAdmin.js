const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@volo.test';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create or update the admin user
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name: 'Admin User' },
    create: { 
      email, 
      password: hashedPassword, 
      name: 'Admin User',
      totalXP: 100,
      currentStreak: 5,
      longestStreak: 10,
    },
  });

  // Create or update the AdminUser record with superadmin role
  await prisma.adminUser.upsert({
    where: { userId: adminUser.id },
    update: { role: 'admin' },
    create: {
      userId: adminUser.id,
      role: 'admin',
    },
  });

  console.log('✅ Super admin user created/updated!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: admin (super admin)`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());