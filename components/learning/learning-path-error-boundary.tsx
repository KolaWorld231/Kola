"use client";

import { Component, ReactNode } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LearningPathErrorBoundaryProps {
  children: ReactNode;
}

interface LearningPathErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for learning path components
 * Provides graceful error handling with recovery options
 */
export class LearningPathErrorBoundary extends Component<
  LearningPathErrorBoundaryProps,
  LearningPathErrorBoundaryState
> {
  constructor(props: LearningPathErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): LearningPathErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[LearningPath] Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Unable to Load Learning Path
          </h2>
          <p className="text-foreground-light text-center mb-6 max-w-md">
            We encountered an error while loading the learning path. Please try refreshing the page.
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleReset} variant="default">
              Reload Page
            </Button>
            <Button
              onClick={() => window.location.href = "/learn"}
              variant="outline"
            >
              Back to Languages
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-6 p-4 bg-gray-100 rounded-lg max-w-2xl w-full">
              <summary className="cursor-pointer font-semibold mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs overflow-auto">
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

