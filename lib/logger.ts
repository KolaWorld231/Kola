/**
 * Structured Logging Utility
 * Provides consistent, structured logging with levels, context, and optional external service integration
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private enableExternal: boolean;
  private externalEndpoint?: string;

  constructor() {
    // Determine minimum log level from environment
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    this.minLevel = envLevel
      ? (envLevel as LogLevel) || LogLevel.INFO
      : process.env.NODE_ENV === "production"
      ? LogLevel.INFO
      : LogLevel.DEBUG;

    // Enable console logging based on environment
    this.enableConsole = process.env.NODE_ENV !== "test";

    // Enable external logging only in production
    this.enableExternal = process.env.NODE_ENV === "production";

    // Get external logging endpoint (optional)
    this.externalEndpoint = process.env.NEXT_PUBLIC_LOGGING_API || process.env.LOGGING_API;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.minLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
    };

    // Add error information if provided
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Add browser context if available (client-side)
    if (typeof window !== "undefined") {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
    }

    return entry;
  }

  /**
   * Format log entry for console output
   */
  private formatConsoleLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const contextStr = entry.context ? JSON.stringify(entry.context) : "";
    const errorStr = entry.error ? `\nError: ${entry.error.name}: ${entry.error.message}` : "";

    return `[${timestamp}] ${level} ${entry.message} ${contextStr}${errorStr}`;
  }

  /**
   * Send log entry to external service
   */
  private async sendToExternal(entry: LogEntry): Promise<void> {
    if (!this.enableExternal || !this.externalEndpoint) {
      return;
    }

    try {
      await fetch(this.externalEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
        keepalive: true, // Don't block page unload
      });
    } catch (error) {
      // Silently fail - don't break the app
      console.debug("[Logger] Failed to send to external service:", error);
    }
  }

  /**
   * Send log entry to Sentry (if configured)
   */
  private async sendToSentry(entry: LogEntry): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      // Dynamically import Sentry to avoid issues if not configured
      const Sentry = await import("@sentry/nextjs").catch(() => null);
      if (!Sentry) return;

      // Add breadcrumb for all logs
      Sentry.addBreadcrumb({
        category: "log",
        message: entry.message,
        level: entry.level as any,
        data: entry.context,
        timestamp: entry.timestamp / 1000, // Sentry uses seconds
      });

      // Capture errors as Sentry errors
      if (entry.level === LogLevel.ERROR && entry.error) {
        const error = new Error(entry.error.message);
        error.name = entry.error.name;
        error.stack = entry.error.stack;

        Sentry.captureException(error, {
          tags: {
            logLevel: entry.level,
            ...(entry.context as Record<string, string>),
          },
          extra: entry,
        });
      }
    } catch (error) {
      // Silently fail if Sentry is not available
      console.debug("[Logger] Sentry not available:", error);
    }
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, error);

    // Console logging
    if (this.enableConsole) {
      const formatted = this.formatConsoleLog(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          if (entry.error?.stack) {
            console.error(entry.error.stack);
          }
          break;
      }
    }

    // External logging (async, don't block)
    this.sendToExternal(entry).catch(() => {});
    this.sendToSentry(entry).catch(() => {});
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, logContext?: LogContext, error?: Error) => {
      originalLog(level, message, { ...context, ...logContext }, error);
    };

    return childLogger;
  }

  /**
   * Set user context for all subsequent logs
   */
  setUser(userId: string, metadata?: Record<string, unknown>): void {
    // This can be extended to store user context
    // For now, it's used in log entries when creating child loggers
    (this as any)._userId = userId;
    (this as any)._userMetadata = metadata;
  }

  /**
   * Set request ID for all subsequent logs
   */
  setRequestId(requestId: string): void {
    (this as any)._requestId = requestId;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export logger class for custom instances
export { Logger };

/**
 * Helper functions for convenience
 */
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
};


