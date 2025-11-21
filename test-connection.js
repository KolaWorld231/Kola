// Quick connection test
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();






