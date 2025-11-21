import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/study-groups/[id]/join - Join a study group
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if group exists
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Study group not found" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId: session.user.id,
          studyGroupId: id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member of this group" },
        { status: 400 }
      );
    }

    // Check if group is full
    if (group._count.members >= group.maxMembers) {
      return NextResponse.json(
        { error: "Study group is full" },
        { status: 400 }
      );
    }

    // Join group
    await prisma.studyGroupMember.create({
      data: {
        userId: session.user.id,
        studyGroupId: id,
        role: "member",
      },
    });

    const updatedGroup = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            flagEmoji: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                totalXP: true,
                currentStreak: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error("Error joining study group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/study-groups/[id]/leave - Leave a study group
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if member
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId: session.user.id,
          studyGroupId: id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 400 }
      );
    }

    // Can't leave if owner (must transfer ownership first or delete group)
    if (membership.role === "owner") {
      return NextResponse.json(
        { error: "Owner cannot leave group. Transfer ownership or delete the group." },
        { status: 400 }
      );
    }

    // Leave group
    await prisma.studyGroupMember.delete({
      where: {
        userId_studyGroupId: {
          userId: session.user.id,
          studyGroupId: id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving study group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






