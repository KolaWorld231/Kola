import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/user/delete-account - Delete user account
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { confirmPassword } = body;

    // Verify password if user has one
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (user?.password) {
      if (!confirmPassword) {
        return NextResponse.json(
          { error: "Password confirmation required" },
          { status: 400 }
        );
      }

      const { compare } = await import("bcryptjs");
      const isPasswordValid = await compare(confirmPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 400 }
        );
      }
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}







