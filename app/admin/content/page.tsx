import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContentManager } from "@/components/admin/content-manager";

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { userId: session.user.id },
  });

  if (!adminUser) {
    redirect("/dashboard");
  }

  const languages = await prisma.language.findMany({
    where: { isActive: true },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              _count: {
                select: { exercises: true },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              ← Back to Admin
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">Content Management</h1>
          <p className="text-lg text-foreground-light">Create and manage units, lessons, and exercises</p>
        </div>

        <ContentManager languages={languages} />
      </div>
    </div>
  );
}


