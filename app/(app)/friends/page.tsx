import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { FriendsList } from "@/components/social/friends-list";
import { ChallengesList } from "@/components/social/challenges-list";
import { SocialFeed } from "@/components/social/social-feed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Get user's friends for challenges
  const friendships = await prisma.friend.findMany({
    where: {
      OR: [
        { userId: session.user.id, status: "accepted" },
        { friendId: session.user.id, status: "accepted" },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          totalXP: true,
          currentStreak: true,
        },
      },
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          totalXP: true,
          currentStreak: true,
        },
      },
    },
  });

  const friends = friendships.map((friendship) => {
    const isSent = friendship.userId === session.user.id;
    return {
      id: isSent ? friendship.friend.id : friendship.user.id,
      name: isSent ? friendship.friend.name : friendship.user.name,
      email: isSent ? friendship.friend.email : friendship.user.email,
      image: isSent ? friendship.friend.image : friendship.user.image,
      totalXP: isSent ? friendship.friend.totalXP : friendship.user.totalXP,
      currentStreak: isSent ? friendship.friend.currentStreak : friendship.user.currentStreak,
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-liberian-red mb-2">
            👥 Friends & Social
          </h1>
          <p className="text-lg text-gray-700">
            Connect with friends, challenge each other, and learn together!
          </p>
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <FriendsList userId={session.user.id} />
          </TabsContent>

          <TabsContent value="challenges">
            <ChallengesList userId={session.user.id} type="all" friends={friends} />
          </TabsContent>

          <TabsContent value="feed">
            <SocialFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

