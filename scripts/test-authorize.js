const { compare } = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const credentials = { email: 'admin@volo.test', password: 'password123' };
  try {
    console.log("[NEXTAUTH] Authorization attempt:", { email: credentials?.email });
    
    if (!credentials?.email || !credentials?.password) {
      console.log("[NEXTAUTH] Missing credentials");
      return null;
    }

    const normalizedEmail = credentials.email.toLowerCase().trim();
    console.log("[NEXTAUTH] Looking up user:", normalizedEmail);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log("[NEXTAUTH] User not found:", normalizedEmail);
      return null;
    }

    if (!user.password) {
      console.log("[NEXTAUTH] User has no password (OAuth user)");
      return null;
    }

    console.log("[NEXTAUTH] User found, password hash length:", user.password.length);
    console.log("[NEXTAUTH] Comparing password...");
    const isPasswordValid = await compare(
      credentials.password,
      user.password
    );

    console.log("[NEXTAUTH] Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      console.log("[NEXTAUTH] Invalid password");
      return null;
    }

    console.log("[NEXTAUTH] Authorization successful:", user.id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  } catch (error) {
    console.error("[NEXTAUTH] Authorization error:", error);
    throw error;
  }
})()
  .then(r => {
    console.log('Result:', r);
    prisma.$disconnect().then(() => process.exit(0));
  })
  .catch(e => {
    console.error('Error:', e);
    prisma.$disconnect().then(() => process.exit(1));
  });
