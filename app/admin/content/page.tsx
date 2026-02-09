"use client";
import React, { useEffect, useState } from "react";

type ContentItem = {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: string;
};

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    fetch("/api/cms/content")
      .then((r) => r.json())
      .then((d) => setItems(d))
      .catch(() => setItems([]));
  }, []);

  async function create() {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await fetch("/api/cms/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, body, status }),
    });
    const res = await fetch("/api/cms/content");
    setItems(await res.json());
    setTitle("");
    setBody("");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin CMS — Content</h1>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
        <textarea placeholder="Body (HTML)" value={body} onChange={(e) => setBody(e.target.value)} rows={8} style={{ width: "100%", padding: 8 }} />
        <div style={{ marginTop: 8 }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={create} style={{ marginLeft: 8 }}>Create</button>
        </div>
      </div>

      <section>
        <h2>Content</h2>
        <ul>
          {items?.map((it) => (
            <li key={it.id}>{it.title} — {it.status}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContentManager } from "@/components/admin/content-manager";

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { userId: session.user.id },
  });

  if (!adminUser) {
    redirect("/dashboard");
  }

  const languages = await prisma.language.findMany({
    where: { isActive: true },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              _count: {
                select: { exercises: true },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              ← Back to Admin
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">
            Content Management
          </h1>
          <p className="text-lg text-foreground-light">
            Create and manage units, lessons, and exercises
          </p>
        </div>

        <ContentManager languages={languages} />
      </div>
    </div>
  );
}

