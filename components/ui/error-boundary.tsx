"use client";

import { Component, ReactNode } from "react";
import { Button } from "./button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error("[ErrorBoundary] Error caught:", error, errorInfo);

    // Store error info for display
    this.setState({ errorInfo });

    // Call optional error reporting callback
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (reportingError) {
        console.error("[ErrorBoundary] Error in onError callback:", reportingError);
      }
    }

    // Send to Sentry for error tracking
    if (typeof window !== "undefined") {
      try {
        // Dynamically import Sentry to avoid issues if not configured
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
            tags: {
              errorBoundary: true,
              componentName: errorInfo.componentStack?.split("\n")[0] || "Unknown",
            },
            extra: {
              errorInfo,
              url: window.location.href,
              userAgent: navigator.userAgent,
            },
          });
        }).catch((err) => {
          // Silently fail if Sentry is not configured
          console.debug("[ErrorBoundary] Sentry not available:", err);
        });
      } catch (err) {
        // Silently fail if Sentry is not available
        console.debug("[ErrorBoundary] Failed to report to Sentry:", err);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const showDetails = this.props.showDetails ?? process.env.NODE_ENV === "development";

      return (
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
                {error?.message || "An unexpected error occurred. We're sorry for the inconvenience."}
              </p>
            </div>

            {showDetails && error && (
              <details className="text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2 hover:text-gray-900">
                  Error Details (Development)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Error:</p>
                    <pre className="text-xs text-gray-800 bg-white p-2 rounded border overflow-auto max-h-32">
                      {error.toString()}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Stack:</p>
                      <pre className="text-xs text-gray-800 bg-white p-2 rounded border overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Component Stack:</p>
                      <pre className="text-xs text-gray-800 bg-white p-2 rounded border overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-liberian-red hover:bg-liberian-red/90"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {process.env.NODE_ENV === "production" && (
              <p className="text-xs text-gray-500 pt-2">
                If this problem persists, please contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}






