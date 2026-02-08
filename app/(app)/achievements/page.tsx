import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { AchievementGallery } from "@/components/achievements/achievement-gallery";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background-darkMode">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-liberian-red dark:text-primary mb-2">
            🏆 Achievements
          </h1>
          <p className="text-lg text-gray-700 dark:text-foreground-darkModeLight">
            Track your progress and unlock rewards as you learn!
          </p>
        </div>

        <AchievementGallery userId={session.user.id} />
      </div>
    </div>
  );
}


