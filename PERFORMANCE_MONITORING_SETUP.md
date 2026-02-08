# 📊 Performance Monitoring Setup Guide

**Date**: Performance monitoring integration  
**Status**: 🟢 **Configuration Complete**

---

## ✅ What's Been Done

### 1. Web Vitals Tracking ✅
- ✅ `web-vitals` package installed
- ✅ `WebVitalsTracker` component created
- ✅ Integrated into root layout
- ✅ Tracks Core Web Vitals:
  - LCP (Largest Contentful Paint)
  - FID/INP (First Input Delay / Interaction to Next Paint)
  - CLS (Cumulative Layout Shift)
  - FCP (First Contentful Paint)
  - TTFB (Time to First Byte)

### 2. Performance Monitoring Library ✅
- ✅ `lib/monitoring.ts` - Performance utilities
- ✅ `lib/api-performance.ts` - API performance tracking
- ✅ Performance thresholds and ratings
- ✅ Custom metric tracking
- ✅ Function execution time measurement

### 3. API Performance Monitoring ✅
- ✅ `middleware.ts` - API route monitoring
- ✅ Request/response time tracking
- ✅ Status code monitoring
- ✅ Slow API call detection (> 1 second)
- ✅ Error response tracking

### 4. Sentry Performance Integration ✅
- ✅ Sentry performance monitoring enabled
- ✅ HTTP request instrumentation
- ✅ Traces sample rate configured (10% in production)
- ✅ Performance breadcrumbs added

---

## 📊 What Gets Tracked

### Core Web Vitals

#### Largest Contentful Paint (LCP)
- **Good**: ≤ 2.5s
- **Needs Improvement**: ≤ 4.0s
- **Poor**: > 4.0s

#### First Input Delay (FID) / Interaction to Next Paint (INP)
- **Good**: ≤ 100ms
- **Needs Improvement**: ≤ 300ms
- **Poor**: > 300ms

#### Cumulative Layout Shift (CLS)
- **Good**: ≤ 0.1
- **Needs Improvement**: ≤ 0.25
- **Poor**: > 0.25

#### First Contentful Paint (FCP)
- **Good**: ≤ 1.8s
- **Needs Improvement**: ≤ 3.0s
- **Poor**: > 3.0s

#### Time to First Byte (TTFB)
- **Good**: ≤ 800ms
- **Needs Improvement**: ≤ 1.8s
- **Poor**: > 1.8s

### API Performance

- **Endpoint**: Tracked route
- **Method**: HTTP method (GET, POST, etc.)
- **Status**: HTTP status code
- **Duration**: Response time in milliseconds
- **Errors**: Error messages for failed requests

### Custom Metrics

- Custom performance measurements
- Function execution times
- Component render times
- Database query times

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file (optional):

```bash
# Performance Monitoring API (optional - for custom monitoring service)
NEXT_PUBLIC_MONITORING_API=https://your-monitoring-api.com/metrics
```

### Sentry Performance

Performance monitoring is integrated with Sentry. Configure Sentry DSN (see `SENTRY_SETUP_GUIDE.md`).

### Sample Rates

Current configuration:
- **Development**: 100% of traces (full monitoring)
- **Production**: 10% of traces (optimized)

To adjust, modify in:
- `sentry.client.config.ts`: `tracesSampleRate`
- `sentry.server.config.ts`: `tracesSampleRate`

---

## 📈 Monitoring Dashboards

### Sentry Dashboard

If Sentry is configured, view:
1. **Performance**: https://sentry.io/organizations/[org]/performance/
2. **Core Web Vitals**: Automatically tracked
3. **API Performance**: Tracked via breadcrumbs and transactions
4. **Slow Queries**: Automatic detection (> 1 second)

### Custom Dashboard (Optional)

If you set `NEXT_PUBLIC_MONITORING_API`, you can:
1. Build custom dashboard
2. Set up alerts
3. Create performance reports

---

## 🧪 Testing Performance Monitoring

### Test Web Vitals

1. **Open browser DevTools**
2. **Go to Performance tab**
3. **Record page load**
4. **Check Core Web Vitals**:
   - LCP, FCP, CLS, TTFB, FID/INP

5. **Check console** (development):
   ```
   [Performance] Metric: { name: "LCP", value: 1200, rating: "good" }
   ```

### Test API Monitoring

1. **Make API request**:
   ```typescript
   fetch("/api/user/me")
   ```

2. **Check middleware logs** (development):
   ```
   [API Performance] Metric: { endpoint: "/api/user/me", duration: 150, ... }
   ```

3. **Check Sentry** (production):
   - View breadcrumbs for API calls
   - Check performance transactions
   - See slow API warnings

### Test Custom Metrics

```typescript
import { trackCustomMetric, measureExecutionTime } from "@/lib/monitoring";

// Track custom metric
trackCustomMetric("custom_operation", 250);

// Measure function execution
await measureExecutionTime("database_query", async () => {
  return await prisma.user.findMany();
});
```

---

## 📊 Usage Examples

### Track Custom Performance Metric

```typescript
import { trackCustomMetric } from "@/lib/monitoring";

// Track component render time
const start = performance.now();
// ... component render ...
trackCustomMetric("component_render", performance.now() - start);
```

### Measure API Call

```typescript
import { trackedFetch } from "@/lib/api-performance";

// Use tracked fetch instead of regular fetch
const response = await trackedFetch("/api/user/me");
```

### Measure Database Query

```typescript
import { measureExecutionTime } from "@/lib/monitoring";

const users = await measureExecutionTime("get_users", async () => {
  return await prisma.user.findMany();
});
```

---

## 🎯 Performance Targets

### Page Load Performance
- **LCP**: < 2.5s (Good)
- **FCP**: < 1.8s (Good)
- **TTFB**: < 800ms (Good)
- **CLS**: < 0.1 (Good)
- **FID/INP**: < 100ms (Good)

### API Performance
- **Fast**: < 200ms
- **Acceptable**: < 500ms
- **Slow**: < 1000ms (logged to Sentry)
- **Very Slow**: > 1000ms (alerted)

### Database Query Performance
- **Fast**: < 100ms
- **Acceptable**: < 300ms
- **Slow**: < 1000ms (logged)
- **Very Slow**: > 1000ms (alerted)

---

## ⚠️ Important Notes

### Production Settings

1. **Sample Rates**:
   - Current: 10% of traces in production
   - Adjust based on traffic and costs
   - Lower = less data, lower cost
   - Higher = more data, higher cost

2. **Error Reporting**:
   - Poor performance metrics are logged to Sentry
   - Slow API calls are logged as warnings
   - Error responses are logged as errors

3. **Privacy**:
   - No sensitive data is logged
   - URLs are included (sanitize if needed)
   - User IDs can be added via Sentry.setUser()

### Development

- Full monitoring in development (100% traces)
- Console logs for debugging
- Errors logged to console
- Sentry disabled in development

---

## 🔗 Related Documentation

- **Sentry Setup**: `SENTRY_SETUP_GUIDE.md`
- **Error Tracking**: `SENTRY_INTEGRATION_COMPLETE.md`
- **Monitoring Library**: `lib/monitoring.ts`
- **API Performance**: `lib/api-performance.ts`

---

## ✅ Checklist

### Setup
- [x] Web Vitals tracking enabled
- [x] API performance monitoring enabled
- [x] Sentry performance integration
- [x] Custom metrics utilities created
- [ ] Sentry DSN configured (optional but recommended)
- [ ] Custom monitoring API configured (optional)

### Testing
- [ ] Web Vitals tested in browser
- [ ] API monitoring tested
- [ ] Custom metrics tested
- [ ] Sentry dashboard verified (if configured)

### Production
- [ ] Sample rates adjusted
- [ ] Alerts configured in Sentry
- [ ] Performance targets documented
- [ ] Monitoring dashboard set up

---

**Status**: 🟢 Configuration Complete  
**Next Step**: Configure Sentry DSN (optional)  
**Last Updated**: Performance monitoring setup complete


