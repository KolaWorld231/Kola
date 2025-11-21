import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LanguageToggle } from "@/components/admin/language-toggle";

export default async function AdminLanguagesPage() {
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
          <h1 className="text-4xl font-bold text-primary mb-2">
            Manage Languages
          </h1>
          <p className="text-lg text-foreground-light">
            Activate or deactivate languages for users
          </p>
        </div>

        <div className="mb-6">
          <Button disabled>Add New Language</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((language) => (
            <Card key={language.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{language.flagEmoji || "🏳️"}</span>
                  <div>
                    <div>{language.name}</div>
                    <div className="text-sm text-foreground-light font-normal">
                      {language.nativeName}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Code:</span> {language.code}
                    </div>
                    {language.description && (
                      <div className="text-sm text-foreground-light">
                        {language.description}
                      </div>
                    )}
                  </div>
                  
                  {/* Toggle Switch */}
                  <div className="border-t pt-4">
                    <LanguageToggle
                      languageId={language.id}
                      languageName={language.name}
                      isActive={language.isActive}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {languages.length === 0 && (
          <div className="text-center py-12 text-foreground-light">
            <p>No languages found. Add your first language!</p>
          </div>
        )}
      </div>
    </div>
  );
}

