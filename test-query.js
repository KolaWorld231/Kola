const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

(async () => {
  try {
    console.log('Attempting query...');
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      take: 1
    });
    console.log('✅ Query successful! Found languages:', languages.length);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
})();

setTimeout(() => {
  console.error('❌ Query timed out after 10 seconds');
  process.exit(1);
}, 10000);
