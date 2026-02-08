import { prisma } from "@/lib/prisma";

/**
 * Checks if the user is an admin (has an AdminUser record)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = await prisma.adminUser.findUnique({ where: { userId } });
  return !!admin;
}


