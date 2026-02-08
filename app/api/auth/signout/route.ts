import { NextResponse } from "next/server";

/**
 * Custom signout endpoint
 * Note: NextAuth's signOut from next-auth/react automatically calls
 * /api/auth/signout which is handled by NextAuth itself.
 * This endpoint is kept for compatibility but NextAuth handles the actual signout.
 */
export async function POST(_request: Request) {
  // NextAuth handles the actual signout through its own endpoint
  // This is just a placeholder for any custom logic if needed
  return NextResponse.json({ message: "Signed out" });
}

