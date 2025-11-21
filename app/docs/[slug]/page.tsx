import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Allowed documentation files
const DOCS_DIR = path.join(process.cwd(), "docs");
const ALLOWED_DOCS = ["user-guide", "faq", "troubleshooting", "admin-guide"];

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;

  if (!ALLOWED_DOCS.includes(slug)) {
    notFound();
  }

  const filePath = path.join(DOCS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(fileContents);

  // Process markdown to HTML
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // Get title from frontmatter or slug
  const title = data.title || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{title}</h1>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

