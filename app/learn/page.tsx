import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LanguagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const languages = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { selectedLanguageId: true },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Choose Your Language 🇱🇷
          </h1>
          <p className="text-lg text-foreground-light">
            Select a Liberian language to start learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((language) => {
            const isSelected = user?.selectedLanguageId === language.id;
            return (
              <Card
                key={language.id}
                className={`hover:shadow-lg transition-shadow ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{language.flagEmoji || "🏳️"}</span>
                    <div>
                      <CardTitle className="text-2xl">{language.name}</CardTitle>
                      <CardDescription className="text-base">
                        {language.nativeName}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-sm text-primary font-semibold">
                      ✓ Currently Learning
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {language.description && (
                    <p className="text-sm text-foreground-light mb-4">
                      {language.description.substring(0, 100)}
                      {language.description.length > 100 ? "..." : ""}
                    </p>
                  )}
                  <Link href={`/learn/${language.code}`}>
                    <Button className="w-full">
                      {isSelected ? "Continue Learning" : "Start Learning"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {languages.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-lg text-foreground-light">
                No languages available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

