import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { claimChallengeReward } from "@/lib/daily-challenges";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const result = await claimChallengeReward(
      session.user.id,
      resolvedParams.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Challenge not found or already claimed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      xpEarned: result.rewardXP,
      rewardXP: result.rewardXP,
    });
  } catch (error) {
    console.error("Error claiming challenge reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

