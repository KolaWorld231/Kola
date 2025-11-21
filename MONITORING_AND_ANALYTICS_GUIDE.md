# 📊 Monitoring & Analytics Integration Guide

**Date**: Monitoring setup guide  
**Status**: 🟢 **Integration Guide Complete**

---

## 🎯 Overview

This guide provides instructions for integrating monitoring and analytics services into the Volo learning path to track performance, user behavior, and system health.

---

## 📊 Recommended Services

### 1. Error Tracking

**Recommended**: Sentry, LogRocket, or Rollbar

**Benefits**:
- Real-time error tracking
- Stack traces and context
- Performance monitoring
- Release tracking

**Integration Example** (Sentry):
```typescript
// app/instrumentation.ts (Next.js 13+)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  // Filter out known issues
  beforeSend(event) {
    // Filter sensitive data
    return event;
  },
});
```

---

### 2. Analytics

**Recommended**: Google Analytics 4, Vercel Analytics, or Plausible

**Benefits**:
- User behavior tracking
- Conversion tracking
- Performance insights
- User flow analysis

**Integration Example** (Google Analytics 4):
```typescript
// app/layout.tsx or _app.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### 3. Performance Monitoring

**Recommended**: Vercel Analytics, Web Vitals, or New Relic

**Benefits**:
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Performance budgets
- Lighthouse CI

**Integration Example** (Web Vitals):
```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  });
}

// Report metrics
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 📈 Key Metrics to Track

### Learning Path Metrics

**User Engagement**:
- Learning path views
- Lesson clicks
- Unit completions
- Bonus claims
- Swipe gestures (mobile)

**Performance**:
- Page load time
- Time to interactive
- Bundle load time
- Animation FPS

**Accessibility**:
- Keyboard navigation usage
- Screen reader usage
- Reduced motion preference

**Errors**:
- Component errors
- API failures
- Navigation errors

---

## 🔍 Custom Event Tracking

### Learning Path Events

**Track these events**:
```typescript
// lib/analytics.ts
export function trackLearningPathEvent(event: string, properties?: Record<string, unknown>) {
  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      event_category: 'Learning Path',
      ...properties,
    });
  }
}

// Usage examples
trackLearningPathEvent('lesson_clicked', {
  lesson_id: lesson.id,
  lesson_title: lesson.title,
  is_completed: isCompleted,
  is_current: isCurrent,
});

trackLearningPathEvent('unit_bonus_claimed', {
  unit_id: unit.id,
  bonus_xp: 50,
});

trackLearningPathEvent('swipe_navigation', {
  direction: 'left',
  lesson_id: currentLessonId,
});
```

---

## 🎯 Implementation Checklist

### Error Tracking
- [ ] Install error tracking service
- [ ] Configure error boundaries
- [ ] Set up release tracking
- [ ] Configure alerts
- [ ] Test error reporting

### Analytics
- [ ] Install analytics service
- [ ] Configure events
- [ ] Set up conversion tracking
- [ ] Create custom dashboards
- [ ] Test event tracking

### Performance Monitoring
- [ ] Install performance monitoring
- [ ] Configure Core Web Vitals
- [ ] Set up performance budgets
- [ ] Configure alerts
- [ ] Test monitoring

---

## 📊 Dashboard Configuration

### Key Dashboards to Create

1. **Learning Path Dashboard**
   - Daily active users
   - Lesson completions
   - Unit progress
   - Bonus claims

2. **Performance Dashboard**
   - Core Web Vitals
   - Page load times
   - API response times
   - Error rates

3. **User Engagement Dashboard**
   - Time spent on learning path
   - Lesson interaction rate
   - Completion rates
   - Return user rate

---

## 🔔 Alert Configuration

### Critical Alerts

**Errors**:
- Error rate > 1%
- Critical component failures
- API failures > 5%

**Performance**:
- LCP > 4s
- FID > 300ms
- Error rate spike

**Availability**:
- Uptime < 99%
- Response time > 5s
- Database connection failures

---

## 📄 Summary

**Recommended Stack**:
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4 + Vercel Analytics
- **Performance**: Web Vitals + Vercel Analytics
- **Uptime**: UptimeRobot or Pingdom

**Implementation Priority**:
1. Error tracking (Critical)
2. Performance monitoring (High)
3. Analytics (Medium)
4. Advanced analytics (Low)

---

*Last Updated: After monitoring guide creation*

