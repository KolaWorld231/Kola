import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { StudyGroupsList } from "@/components/social/study-groups-list";
import { CreateStudyGroupModal } from "@/components/social/create-study-group-modal";
import { Users } from "lucide-react";

export default async function StudyGroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      selectedLanguageId: true,
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-liberian-red mb-2 flex items-center gap-3">
                <Users className="h-10 w-10" />
                Study Groups
              </h1>
              <p className="text-lg text-gray-700">
                Join or create study groups to learn together with friends!
              </p>
            </div>
            <CreateStudyGroupModal />
          </div>
        </div>

        <StudyGroupsList userId={session.user.id} languageId={user?.selectedLanguageId || null} />
      </div>
    </div>
  );
}

