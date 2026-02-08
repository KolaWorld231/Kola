import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accept } = await request.json();

    const friendRequest = await prisma.friend.findUnique({
      where: { id: params.id },
    });

    if (!friendRequest || friendRequest.friendId !== session.user.id) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (friendRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const updatedRequest = await prisma.friend.update({
      where: { id: params.id },
      data: {
        status: accept ? "accepted" : "declined",
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error responding to friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}