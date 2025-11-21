import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with connection pool settings for serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// In serverless environments, reuse the Prisma client
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Ensure Prisma client is properly initialized
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}





