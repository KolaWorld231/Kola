# 🔧 Sentry Setup Guide - Error Tracking

**Date**: Sentry integration setup  
**Status**: ⏳ Configuration Complete - DSN Required

---

## ✅ What's Been Done

### 1. Sentry SDK Installed ✅
- ✅ `@sentry/nextjs` package installed
- ✅ All Sentry dependencies added

### 2. Configuration Files Created ✅
- ✅ `sentry.client.config.ts` - Client-side configuration
- ✅ `sentry.server.config.ts` - Server-side configuration
- ✅ `sentry.edge.config.ts` - Edge runtime configuration
- ✅ `instrumentation.ts` - Runtime initialization
- ✅ `next.config.js` - Updated with Sentry webpack plugin

### 3. Error Boundary Integration ✅
- ✅ `components/ui/error-boundary.tsx` - Updated to use Sentry
- ✅ Automatic error reporting to Sentry
- ✅ Error context (component stack, URL, user agent)

---

## 📋 Next Steps: Get Your Sentry DSN

### Step 1: Create Sentry Account (if needed)

1. Go to https://sentry.io/signup/
2. Sign up for a free account
3. Create a new project
4. Select "Next.js" as the platform

### Step 2: Get Your DSN

After creating a project, Sentry will show you your DSN. It looks like:
```
https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxx
```

### Step 3: Add Environment Variables

Add these to your `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxx

# Optional: Sentry Organization and Project (for source maps)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# Optional: Auth Token (for source map uploads)
SENTRY_AUTH_TOKEN=your-auth-token
```

**Note**: 
- `SENTRY_DSN` is used for server-side errors
- `NEXT_PUBLIC_SENTRY_DSN` is used for client-side errors (publicly accessible)
- `SENTRY_ORG` and `SENTRY_PROJECT` are needed for source map uploads
- `SENTRY_AUTH_TOKEN` is needed for automated source map uploads during build

### Step 4: Update .env.example

Add the Sentry variables to your `.env.example` file for documentation:

```bash
# Sentry Error Tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

---

## 🧪 Testing Sentry Integration

### Test Client-Side Error Reporting

1. **Add a test error button** (temporarily):
```tsx
// In any client component, add this for testing:
<button onClick={() => {
  throw new Error("Test Sentry error!");
}}>
  Test Sentry
</button>
```

2. **Trigger the error** in production mode:
```bash
NODE_ENV=production npm run build
npm start
```

3. **Check Sentry dashboard** - You should see the error appear!

### Test Server-Side Error Reporting

Create a test API route:
```typescript
// app/api/test-sentry/route.ts
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Test server-side Sentry error!");
  } catch (error) {
    Sentry.captureException(error);
    return new Response("Error reported to Sentry", { status: 500 });
  }
}
```

Visit `/api/test-sentry` in production mode.

---

## ⚙️ Configuration Details

### Client Configuration (`sentry.client.config.ts`)

- **Traces Sample Rate**: 100% (adjust in production)
- **Replay Sample Rate**: 10% for sessions, 100% for errors
- **Environment**: Automatically set from `NODE_ENV`
- **Filtering**: Filters out network errors and development errors

### Server Configuration (`sentry.server.config.ts`)

- **Traces Sample Rate**: 100% (adjust in production)
- **Environment**: Automatically set from `NODE_ENV`
- **Filtering**: Filters out database connection errors during deployment

### Error Boundary Integration

The ErrorBoundary component now automatically:
- Captures errors to Sentry with full context
- Includes component stack trace
- Adds URL and user agent information
- Tags errors as from error boundary
- Silently fails if Sentry is not configured

---

## 📊 What Gets Tracked

### Automatic Tracking

1. **Client-Side Errors**:
   - React component errors (via ErrorBoundary)
   - Unhandled promise rejections
   - JavaScript runtime errors
   - Network errors (filtered out by default)

2. **Server-Side Errors**:
   - API route errors
   - Server component errors
   - Database errors (filtered during deployment)

3. **Context Included**:
   - Error message and stack trace
   - Component stack (for React errors)
   - URL where error occurred
   - User agent
   - Environment (development/production)

### Manual Error Reporting

You can also manually report errors:

```typescript
import * as Sentry from "@sentry/nextjs";

// Report an error
Sentry.captureException(new Error("Something went wrong"));

// Report with context
Sentry.captureException(error, {
  tags: {
    feature: "checkout",
    userId: user.id,
  },
  extra: {
    orderId: order.id,
    paymentMethod: "credit_card",
  },
});

// Add user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Add custom tags
Sentry.setTag("feature", "checkout");
```

---

## 🎯 Best Practices

### Production Settings

1. **Adjust Sample Rates**:
   - Lower `tracesSampleRate` to 0.1 (10%) in production
   - Lower `replaysSessionSampleRate` to 0.01 (1%) for high-traffic apps

2. **Filter Sensitive Data**:
   - Add `beforeSend` hooks to filter out sensitive information
   - Don't send passwords, tokens, or PII

3. **Set Up Alerts**:
   - Configure alerts for critical errors
   - Set up email/Slack notifications for new issues

### Development

1. **Disable in Development**:
   - Sentry is automatically disabled in development
   - Errors are still logged to console

2. **Test Error Reporting**:
   - Use test errors to verify integration
   - Check Sentry dashboard regularly

---

## 🔗 Useful Links

- **Sentry Dashboard**: https://sentry.io/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Error Tracking Docs**: https://docs.sentry.io/product/issues/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/

---

## ⚠️ Important Notes

### Environment Variables

- **Required**: `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
- **Optional**: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (for source maps)

### Source Maps

If you want source maps uploaded automatically during build:
1. Get auth token from Sentry: Settings → Auth Tokens
2. Add `SENTRY_AUTH_TOKEN` to your `.env`
3. Add `SENTRY_ORG` and `SENTRY_PROJECT`
4. Source maps will be uploaded on build

### Error Filtering

The configuration filters out:
- Network errors (users can retry)
- Database connection errors during deployment
- Development errors (only production errors are sent)

You can customize filtering in `beforeSend` hooks.

---

## 📝 Checklist

### Setup
- [ ] Sentry account created
- [ ] Project created (Next.js platform)
- [ ] DSN obtained
- [ ] Environment variables added to `.env`
- [ ] Environment variables added to `.env.example`
- [ ] Production environment variables set (if deploying)

### Testing
- [ ] Client-side error test
- [ ] Server-side error test
- [ ] Error appears in Sentry dashboard
- [ ] Error context is correct
- [ ] Alerts configured (optional)

### Production
- [ ] Sample rates adjusted
- [ ] Source maps configured (optional)
- [ ] Alerts set up
- [ ] Team members added
- [ ] Notification channels configured

---

**Status**: 🟡 Configuration Complete - DSN Required  
**Next Step**: Add Sentry DSN to `.env` file  
**Last Updated**: Sentry integration setup


