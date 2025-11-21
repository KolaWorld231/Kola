import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { GrammarClient } from "@/components/grammar/grammar-client";

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Get all exercises with grammar tips
  const exercisesWithGrammar = await prisma.exercise.findMany({
    where: {
      grammarTip: {
        not: null,
      },
    },
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              language: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  nativeName: true,
                  flagEmoji: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get available languages for filter
  const languages = await prisma.language.findMany({
    where: {
      isActive: true,
      units: {
        some: {
          lessons: {
            some: {
              exercises: {
                some: {
                  grammarTip: {
                    not: null,
                  },
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      code: true,
      name: true,
      flagEmoji: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Group grammar tips by language and extract unique tips
  const grammarTips = exercisesWithGrammar.map((exercise) => ({
    id: exercise.id,
    title: exercise.grammarTip?.substring(0, 100) || "Grammar Tip",
    content: exercise.grammarTip || "",
    language: {
      id: exercise.lesson.unit.language.id,
      code: exercise.lesson.unit.language.code,
      name: exercise.lesson.unit.language.name,
      nativeName: exercise.lesson.unit.language.nativeName || undefined,
      flagEmoji: exercise.lesson.unit.language.flagEmoji || undefined,
    },
    lesson: {
      id: exercise.lesson.id,
      title: exercise.lesson.title,
      unitTitle: exercise.lesson.unit.title,
    },
    difficulty: exercise.difficulty,
    question: exercise.question,
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-liberian-red mb-2 flex items-center gap-3">
            💡 Grammar Tips & Explanations
          </h1>
          <p className="text-lg text-gray-600">
            Learn grammar rules and explanations for Liberian languages
          </p>
        </div>

        {/* Grammar Tips */}
        <GrammarClient grammarTips={grammarTips} languages={languages} />
      </div>
    </div>
  );
}






