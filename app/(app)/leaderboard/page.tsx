import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const languages = await prisma.language.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      flagEmoji: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <LeaderboardClient languages={languages} />
      </div>
    </div>
  );
}
