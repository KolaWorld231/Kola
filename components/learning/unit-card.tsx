import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  xpReward: number;
  exerciseCount: number;
}

interface UnitCardProps {
  unit: {
    id: string;
    title: string;
    description?: string | null;
    difficulty: string;
    order: number;
  };
  lessons: Lesson[];
  completedLessons: number;
  totalLessons: number;
  lessonCards: React.ReactNode;
}

export function UnitCard({
  unit,
  completedLessons,
  totalLessons,
  lessonCards,
}: UnitCardProps) {
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isCompleted = completedLessons === totalLessons;

  const difficultyColors = {
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-accent/10 text-accent border-accent/20",
    advanced: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <Card
      className={cn(
        "transition-smooth hover-lift",
        isCompleted && "border-success/30 bg-success/5"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">
              Unit {unit.order}: {unit.title}
            </CardTitle>
            {unit.description && (
              <CardDescription className="text-base mt-2">
                {unit.description}
              </CardDescription>
            )}
          </div>
          <Chip
            variant="outline"
            size="sm"
            className={cn(
              "flex-shrink-0",
              difficultyColors[unit.difficulty as keyof typeof difficultyColors] ||
                difficultyColors.beginner
            )}
          >
            {unit.difficulty}
          </Chip>
        </div>

        {/* Unit Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-light">Unit Progress</span>
            <span className="font-semibold text-foreground">
              {completedLessons} / {totalLessons} lessons
            </span>
          </div>
          <ProgressBar
            value={progress}
            variant={isCompleted ? "success" : "default"}
            className="h-2"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonCards}
        </div>
      </CardContent>
    </Card>
  );
}

