import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { HeroWithMascot } from "@/components/home/hero-with-mascot";
import { FadeIn } from "@/components/animations";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let languages: Array<{
    code: string;
    name: string;
    flagEmoji: string | null;
    description: string | null;
  }> = [];

  try {
    languages = await prisma.language.findMany({
      where: { isActive: true },
      select: {
        code: true,
        name: true,
        flagEmoji: true,
        description: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    // Fallback to empty array if database query fails
    languages = [];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Note: Header and Footer are handled by root layout */}
      
      {/* Hero Section with Mascot */}
      <HeroWithMascot />

      {/* Language Carousel */}
      <FadeIn>
        <section className="border-t border-border bg-background-dark py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={`/learn/${lang.code}`}
                    className="block"
                    aria-label={`Learn ${lang.name}`}
                  >
                    <Chip
                      variant="outline"
                      className="cursor-pointer hover:border-primary hover:text-primary transition-all whitespace-nowrap bg-background"
                  >
                    <span className="text-2xl">{lang.flagEmoji || "🏳️"}</span>
                      <span className="font-medium">{lang.name}</span>
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Features Section */}
      <FadeIn>
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-kola-cream border-kola-accent hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4" aria-hidden="true">🎓</div>
                <CardTitle className="text-kola-primary">Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-kola-bronze">
                Learn through exercises, quizzes, and stories designed specifically for Liberian languages
              </p>
              </CardContent>
            </Card>
            <Card className="text-center bg-kola-cream border-kola-accent hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4" aria-hidden="true">🧠</div>
                <CardTitle className="text-kola-accent">Research-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-kola-bronze">
                We use a combination of research-backed teaching methods and delightful content to create courses that effectively teach reading, writing, listening, and speaking skills!
              </p>
              </CardContent>
            </Card>
            <Card className="text-center bg-kola-cream border-kola-accent hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4" aria-hidden="true">🎮</div>
                <CardTitle className="text-kola-primary">Gamified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-kola-bronze">
                We make it easy to form a habit of language learning with game-like features, fun challenges, and reminders to help you stay on track.
              </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
