import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getUserDailyChallenges } from "@/lib/daily-challenges";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const challenges = await getUserDailyChallenges(session.user.id, date);

    return NextResponse.json({
      challenges,
    });
  } catch (error) {
    console.error("Error fetching daily challenges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






