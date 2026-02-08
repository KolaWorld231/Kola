import { LeaderboardRowSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* League Badges Skeleton */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded mt-1 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <CardSkeleton />

      {/* User Rank Skeleton */}
      <CardSkeleton />

      {/* Leaderboard Entries Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}







