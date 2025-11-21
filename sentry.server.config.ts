// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0, // 10% in production, 100% in dev

  // Enable performance monitoring
  enableTracing: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  environment: process.env.NODE_ENV || "development",

  // Performance monitoring settings
  integrations: [
    // Automatically instrument HTTP requests
    Sentry.httpIntegration({ tracing: true }),
    // Automatically instrument database queries (Prisma)
    // Note: Prisma integration might need additional setup
  ],

  // Filter out common errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV !== "production") {
      return null;
    }

    // Filter out known non-critical errors
    const error = hint.originalException;
    if (error instanceof Error) {
      // Ignore database connection errors during deployment
      if (error.message.includes("Can't reach database")) {
        return null;
      }
    }

    return event;
  },

  // Add server context
  initialScope: {
    tags: {
      component: "server",
    },
  },
});

