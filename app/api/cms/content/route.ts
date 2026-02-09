import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (slug) {
    const item = await prisma.content.findFirst({ where: { slug, status: "published" } });
    if (!item) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(item);
  }

  // list published content
  const items = await prisma.content.findMany({ where: { status: "published" }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await requireAdmin();
  const data = await req.json();
  const created = await prisma.content.create({
    data: {
      slug: data.slug,
      title: data.title,
      body: data.body,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      locale: data.locale || "en",
      status: data.status || "draft",
      authorId: data.authorId || undefined,
    },
  });
  return NextResponse.json(created);
}

export async function PUT(req: Request) {
  await requireAdmin();
  const data = await req.json();
  const updated = await prisma.content.update({
    where: { id: data.id },
    data: {
      title: data.title,
      body: data.body,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      status: data.status,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.content.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
