"use client";

/**
 * Global Error Handler for Next.js App Router
 * Handles errors that occur during root layout rendering
 */

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: "global",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                An unexpected error occurred. We're sorry for the inconvenience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={reset}
                className="flex items-center gap-2 bg-liberian-red hover:bg-liberian-red/90"
              >
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 pt-2">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

