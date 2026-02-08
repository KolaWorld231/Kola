# 📝 Logging System Setup Guide

**Date**: Structured logging system setup  
**Status**: 🟢 **Configuration Complete**

---

## ✅ What's Been Done

### 1. Structured Logging Library ✅
- ✅ `lib/logger.ts` - Complete logging utility
- ✅ Log levels: DEBUG, INFO, WARN, ERROR
- ✅ Structured log entries with context
- ✅ Error handling and formatting
- ✅ Child loggers with context inheritance

### 2. Middleware Integration ✅
- ✅ `middleware.ts` - Updated with logging
- ✅ Request/response logging
- ✅ Performance metrics logging
- ✅ Request ID tracking
- ✅ Slow request detection

### 3. External Service Integration ✅
- ✅ Sentry integration (if configured)
- ✅ Optional external API integration
- ✅ Console logging (configurable)

---

## 📋 Features

### Log Levels

```typescript
enum LogLevel {
  DEBUG = "debug",   // Detailed debugging information
  INFO = "info",     // General information
  WARN = "warn",     // Warning messages
  ERROR = "error",   // Error messages
}
```

### Log Context

All logs include:
- **Timestamp**: ISO 8601 format
- **Level**: Log level (debug, info, warn, error)
- **Message**: Human-readable message
- **Context**: Additional key-value pairs
- **Error**: Error details (if applicable)
- **Request ID**: Unique request identifier (if available)
- **URL**: Current URL (client-side)
- **User Agent**: Browser/user agent (client-side)

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file (optional):

```bash
# Logging Configuration
LOG_LEVEL=info                    # debug, info, warn, error (default: info in production, debug in development)
LOGGING_API=https://your-api.com/logs  # Optional: External logging service
NEXT_PUBLIC_LOGGING_API=https://your-api.com/logs  # Optional: Client-side logging service
```

### Log Levels by Environment

- **Development**: DEBUG (shows all logs)
- **Production**: INFO (shows info, warn, error)
- **Test**: Disabled (no console logs)

---

## 📊 Usage Examples

### Basic Logging

```typescript
import { logger } from "@/lib/logger";

// Debug logging
logger.debug("User action triggered", { action: "click", button: "submit" });

// Info logging
logger.info("User logged in", { userId: user.id, email: user.email });

// Warning logging
logger.warn("Rate limit approaching", { remaining: 5, limit: 100 });

// Error logging
logger.error("Failed to save data", error, { userId: user.id, data: formData });
```

### Using Helper Functions

```typescript
import { log } from "@/lib/logger";

log.debug("Debug message", { context: "value" });
log.info("Info message", { context: "value" });
log.warn("Warning message", { context: "value" });
log.error("Error message", error, { context: "value" });
```

### Child Loggers (Context Inheritance)

```typescript
import { logger } from "@/lib/logger";

// Create logger with context
const userLogger = logger.child({ userId: user.id, email: user.email });

// All logs from this logger will include userId and email
userLogger.info("User performed action", { action: "lesson_complete" });
// Result: { userId, email, action } in context
```

### Request-Scoped Logging

```typescript
import { logger } from "@/lib/logger";

// In API route
export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const requestLogger = logger.child({ requestId });

  requestLogger.info("Processing request");
  // ... your code ...
  requestLogger.info("Request completed", { duration: `${Date.now() - start}ms` });
}
```

### Error Logging

```typescript
import { logger } from "@/lib/logger";

try {
  await someOperation();
} catch (error) {
  logger.error("Operation failed", error instanceof Error ? error : new Error(String(error)), {
    operation: "someOperation",
    userId: user.id,
  });
  throw error;
}
```

---

## 🔗 Integration with Monitoring Services

### Sentry Integration

Logs are automatically sent to Sentry (if configured):
- **Breadcrumbs**: All logs become Sentry breadcrumbs
- **Errors**: ERROR level logs are captured as Sentry errors
- **Context**: All log context is included in Sentry events

### External API Integration

If `LOGGING_API` is configured:
- All logs are sent to the external API
- Format: JSON with structured log entry
- Async: Doesn't block execution

---

## 📊 Log Format

### Console Output

```
[2024-01-15T10:30:45.123Z] INFO  User logged in {"userId":"123","email":"user@example.com"}
[2024-01-15T10:30:46.456Z] WARN  Slow API request {"duration":"1200ms","threshold":"1000ms"}
[2024-01-15T10:30:47.789Z] ERROR Failed to save data {"userId":"123"}
Error: DatabaseError: Connection timeout
  at ...
```

### JSON Output (External API)

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": 1705318245123,
  "context": {
    "userId": "123",
    "email": "user@example.com"
  },
  "url": "https://example.com/dashboard",
  "userAgent": "Mozilla/5.0..."
}
```

---

## 🔧 Best Practices

### 1. Use Appropriate Log Levels

```typescript
// DEBUG: Detailed debugging information
logger.debug("Entering function", { params });

// INFO: General information about app flow
logger.info("User completed lesson", { lessonId, xp });

// WARN: Warning about potential issues
logger.warn("Cache miss", { key, reason: "expired" });

// ERROR: Errors that need attention
logger.error("Database query failed", error, { query, params });
```

### 2. Include Relevant Context

```typescript
// Good: Includes relevant context
logger.info("Payment processed", {
  orderId: order.id,
  amount: order.total,
  method: order.paymentMethod,
});

// Bad: No context
logger.info("Payment processed");
```

### 3. Use Child Loggers for Scoped Context

```typescript
// Create logger with user context
const userLogger = logger.child({ userId: user.id });

// All subsequent logs include userId
userLogger.info("Lesson started", { lessonId });
userLogger.info("Exercise completed", { exerciseId });
```

### 4. Don't Log Sensitive Data

```typescript
// Bad: Logs password
logger.info("User login", { email, password });

// Good: Doesn't log sensitive data
logger.info("User login", { email, userId });
```

---

## 🎯 Migration Guide

### Replace console.log

**Before:**
```typescript
console.log("User logged in", user.id);
console.error("Error:", error);
```

**After:**
```typescript
import { logger } from "@/lib/logger";

logger.info("User logged in", { userId: user.id });
logger.error("Error occurred", error, { userId: user.id });
```

### Replace console.error

**Before:**
```typescript
try {
  await operation();
} catch (error) {
  console.error("Operation failed:", error);
  throw error;
}
```

**After:**
```typescript
import { logger } from "@/lib/logger";

try {
  await operation();
} catch (error) {
  logger.error("Operation failed", error instanceof Error ? error : new Error(String(error)), {
    operation: "operation",
  });
  throw error;
}
```

---

## 📈 Log Aggregation (Optional)

### Option 1: Sentry

Sentry automatically aggregates logs as breadcrumbs. View in Sentry dashboard.

### Option 2: Custom API

Set up your own logging API:

```bash
LOGGING_API=https://your-api.com/logs
```

Your API should accept POST requests with log entries:

```typescript
POST /logs
Content-Type: application/json

{
  "level": "info",
  "message": "User logged in",
  "timestamp": 1705318245123,
  "context": { "userId": "123" },
  ...
}
```

### Option 3: Logtail / Datadog / Other Services

These services typically have similar APIs. Configure `LOGGING_API` to point to their endpoint.

---

## ⚠️ Important Notes

### Performance

- Logging is **async** - doesn't block execution
- External API calls use `keepalive: true` - don't block page unload
- Console logging can be disabled in test environment

### Privacy

- **Don't log sensitive data**: passwords, tokens, PII
- URLs and user agents are logged (sanitize if needed)
- User IDs can be logged (don't log personal info)

### Production

- **Log Level**: Set to INFO or WARN in production
- **External Logging**: Only enabled in production
- **Console Logging**: Disabled in test environment

---

## 🔗 Related Documentation

- **Monitoring**: `PERFORMANCE_MONITORING_SETUP.md`
- **Error Tracking**: `SENTRY_SETUP_GUIDE.md`
- **Logger Code**: `lib/logger.ts`

---

## ✅ Checklist

### Setup
- [x] Logging utility created
- [x] Middleware integration complete
- [x] Sentry integration configured
- [ ] LOG_LEVEL configured (optional)
- [ ] LOGGING_API configured (optional)

### Migration
- [ ] Replace console.log with logger
- [ ] Replace console.error with logger
- [ ] Add context to existing logs
- [ ] Use child loggers where appropriate

### Production
- [ ] Log level set to INFO or WARN
- [ ] External logging configured (optional)
- [ ] Sensitive data review completed
- [ ] Log aggregation set up (optional)

---

**Status**: 🟢 Configuration Complete  
**Next Step**: Replace console.log/error with logger  
**Last Updated**: Logging system setup complete


