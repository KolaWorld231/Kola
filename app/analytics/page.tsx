import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      selectedLanguage: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-liberian-red mb-2">
            📊 Learning Analytics
          </h1>
          <p className="text-lg text-gray-700">
            Track your progress and see detailed statistics about your learning journey
          </p>
        </div>

        <AnalyticsDashboard selectedLanguage={user.selectedLanguage} />
      </div>
    </div>
  );
}







