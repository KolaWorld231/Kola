"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { PageTransition } from "@/components/page-transition";
import { Suspense } from "react";

interface DashboardClientProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for dashboard to add error boundary and loading states with smooth transitions
 */
export function DashboardClient({ children }: DashboardClientProps) {
  return (
    <PageTransition>
      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </PageTransition>
  );
}


