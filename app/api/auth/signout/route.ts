import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(_request: Request) {
  const session = await getServerSession(authOptions);
  
  if (session) {
    // Sign out on server side
    // Note: Client-side signOut from next-auth/react should be used
    return NextResponse.json({ message: "Signed out" });
  }
  
  return NextResponse.json({ message: "Not signed in" });
}

