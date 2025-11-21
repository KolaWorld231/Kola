import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white">
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-8 w-1/3 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}






