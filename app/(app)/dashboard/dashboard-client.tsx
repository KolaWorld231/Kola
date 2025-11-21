"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { Suspense } from "react";

interface DashboardClientProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for dashboard to add error boundary and loading states
 */
export function DashboardClient({ children }: DashboardClientProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

