import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
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
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight">
              The free, fun, and effective way to learn Liberian languages!
            </h1>
            <p className="text-xl text-foreground leading-relaxed">
              Learning with Volo is fun, and <strong className="text-secondary">research shows that it works!</strong> With quick, bite-sized lessons, you&apos;ll earn points and unlock new levels while gaining real-world communication skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="default" className="w-full sm:w-auto">
                  GET STARTED
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I ALREADY HAVE AN ACCOUNT
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Phone Mockup */}
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none shadow-2xl">
                <CardContent className="p-6 space-y-4 bg-background">
                  {/* Progress Bar */}
                  <ProgressBar value={75} variant="default" size="md" />
                  
                  {/* App Icons */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card className="bg-primary border-none text-white text-center p-4">
                      <div className="text-3xl mb-2">🇱🇷</div>
                      <div className="text-xs font-semibold">Liberia</div>
                    </Card>
                    <Card className="bg-secondary border-none text-white text-center p-4">
                      <div className="text-3xl mb-2">📚</div>
                      <div className="text-xs font-semibold">Learn</div>
                    </Card>
                    <Card className="bg-success border-none text-white text-center p-4">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="text-xs font-semibold">Leader</div>
                    </Card>
                    <Card className="bg-accent border-none text-foreground text-center p-4">
                      <div className="text-3xl mb-2">🔥</div>
                      <div className="text-xs font-semibold">Streak</div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg animate-bounce" aria-label="Fire streak icon">
                🔥
              </div>
              <div className="absolute -bottom-4 -left-4 bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg animate-pulse" aria-label="Star achievement icon">
                ⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Language Carousel */}
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="text-5xl mb-4" aria-hidden="true">free. fun. effective.</div>
              <CardTitle className="text-primary">Interactive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
              Learn through exercises, quizzes, and stories designed specifically for Liberian languages
            </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="text-5xl mb-4" aria-hidden="true">backed by science</div>
              <CardTitle className="text-secondary">Research-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
              We use a combination of research-backed teaching methods and delightful content to create courses that effectively teach reading, writing, listening, and speaking skills!
            </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="text-5xl mb-4" aria-hidden="true">stay motivated</div>
              <CardTitle className="text-success">Gamified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
              We make it easy to form a habit of language learning with game-like features, fun challenges, and reminders to help you stay on track.
            </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
