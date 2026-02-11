import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[TEST-AUTH] Request body:", body);

    // Find the credentials provider
    const credentialsProvider = authOptions.providers.find(
      p => (p as any).name === "Credentials" || (p as any).id === "credentials"
    ) as any;

    if (!credentialsProvider) {
      return NextResponse.json({ error: "Credentials provider not found" }, { status: 500 });
    }

    console.log("[TEST-AUTH] Calling authorize with:", body);
    console.log("[TEST-AUTH] authorize function exists:", !!credentialsProvider.authorize);
    let user;
    try {
      user = await credentialsProvider.authorize(body, request);
      console.log("[TEST-AUTH] Authorize succeeded, returned:", user);
    } catch (authError) {
      console.log("[TEST-AUTH] Authorize threw error:", authError);
      throw authError;
    }
    
    return NextResponse.json({ success: true, user });
  } catch (e) {
    console.error("[TEST-AUTH] Error:", e);
    return NextResponse.json({ error: String(e), stack: (e as any)?.stack }, { status: 500 });
  }
}

