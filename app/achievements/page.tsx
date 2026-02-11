import React from "react";
import AchievementsGallery from "@/components/achievements/AchievementsGallery";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions as any);
  const userId = session?.user?.id;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Achievements</h1>
      <div className="max-w-4xl">
        <AchievementsGallery userId={userId || undefined} />
      </div>
    </main>
  );
}
