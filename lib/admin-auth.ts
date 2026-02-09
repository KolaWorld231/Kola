import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { adminUser: true },
  });

  if (!user || !user.adminUser || user.adminUser.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
