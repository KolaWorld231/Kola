import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              language: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Liberian Stories</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Immerse yourself in authentic Liberian folklore and stories to learn the languages through culture.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <Badge variant="secondary">{story.difficulty}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {story.lesson.unit.language.name} • {story.lesson.unit.title}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 line-clamp-3">{story.content.substring(0, 150)}...</p>
              {story.translation && (
                <p className="text-sm text-muted-foreground mb-4">
                  Translation: {story.translation.substring(0, 100)}...
                </p>
              )}
              <Link href={`/stories/${story.id}`}>
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Read Story
                </button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stories available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}