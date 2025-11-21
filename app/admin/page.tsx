import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
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

  const stats = {
    languages: await prisma.language.count(),
    units: await prisma.unit.count(),
    lessons: await prisma.lesson.count(),
    exercises: await prisma.exercise.count(),
    vocabularies: await prisma.vocabulary.count(),
    users: await prisma.user.count(),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">
            Admin Portal 🔧
          </h1>
          <p className="text-lg text-foreground-light">
            Manage content, users, and system settings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.languages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.units}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.lessons}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.exercises}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.vocabularies}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.users}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Languages</CardTitle>
              <CardDescription>Add, edit, or remove languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/languages">
                <Button className="w-full">Manage Languages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Content</CardTitle>
              <CardDescription>Create units, lessons, and exercises</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/content">
                <Button className="w-full">Manage Content</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Vocabulary</CardTitle>
              <CardDescription>Add, edit, or remove vocabulary words</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/vocabulary">
                <Button className="w-full">Manage Vocabulary</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

