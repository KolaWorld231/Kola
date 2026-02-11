import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body && (body.email || body?.username)) || "demo@kola.local";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const token = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
      id: user.id,
    } as any;

    const secret = process.env.NEXTAUTH_SECRET || "";
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const encoded = await encode({ token, secret, maxAge });

    const res = NextResponse.json({ ok: true, userId: user.id });
    res.cookies.set({
      name: "next-auth.session-token",
      value: (encoded as string) || "",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
