import { prisma } from "@/lib/prisma";

export async function getContentBySlug(slug: string, locale = "en") {
  const item = await prisma.content.findFirst({
    where: { slug, locale, status: "published" },
  });
  return item;
}

export async function listPublishedContent() {
  return prisma.content.findMany({ where: { status: "published" }, orderBy: { updatedAt: "desc" } });
}
