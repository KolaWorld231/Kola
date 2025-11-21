# Onboarding Protection Logic

## Overview

The onboarding flow is protected to ensure it **only shows to first-time users** who are logging in for the first time. Once a user completes onboarding, they will **never see it again**.

## Protection Mechanisms

### 1. **Server-Side Layout Protection** (Primary)

#### Onboarding Layout (`app/onboarding/layout.tsx`)
- **Purpose**: Prevents completed users from accessing onboarding pages
- **Logic**: Checks `assessmentCompleted` flag before allowing access
- **Action**: If completed → redirects to `/dashboard`
- **Result**: Returning users cannot access onboarding routes

#### App Layout (`app/(app)/layout.tsx`)
- **Purpose**: Requires onboarding completion for all app routes
- **Logic**: Checks `assessmentCompleted` flag before allowing app access
- **Action**: If not completed → redirects to `/onboarding`
- **Result**: First-time users are forced to complete onboarding

### 2. **Shared Utility Function** (`lib/onboarding.ts`)

```typescript
hasCompletedOnboarding(userId: string): Promise<boolean>
```

- **Purpose**: Centralized check for onboarding status
- **Logic**: 
  - Returns `false` if UserSettings doesn't exist (new user)
  - Returns `false` if `assessmentCompleted` is `false` or `null`
  - Returns `true` only if `assessmentCompleted === true`
- **Usage**: Used by layouts and server components

### 3. **Client-Side Checks** (Secondary Safeguard)

#### Sign In Page (`app/auth/signin/page.tsx`)
- Checks assessment status after login
- Redirects new users to `/onboarding`
- Redirects returning users to `/dashboard`

#### Onboarding Page (`app/onboarding/page.tsx`)
- Client-side check as fallback
- If assessment completed → redirects to `/dashboard`
- Prevents accidental access by returning users

### 4. **API Endpoint** (`/api/user/assessment/status`)

- Returns onboarding completion status
- Used by client-side components
- Returns `completed: false` if UserSettings doesn't exist (new user)

## User Flows

### First-Time User Flow

1. **Sign Up** → User created (no UserSettings yet)
2. **Auto Login** → Redirected to `/onboarding`
3. **Onboarding Layout** → Allows access (assessmentCompleted = false)
4. **Complete Onboarding** → UserSettings created with `assessmentCompleted: true`
5. **Redirect to Dashboard** → App layout allows access

### Returning User Flow (Completed Onboarding)

1. **Sign In** → Assessment check shows `completed: true`
2. **Redirect to Dashboard** → App layout allows access
3. **If somehow navigates to `/onboarding`**:
   - Onboarding layout checks → `assessmentCompleted === true`
   - **Immediately redirects to `/dashboard`**
   - User never sees onboarding page

### Social Auth Flow (Google/Facebook)

1. **First-Time Social Login**:
   - PrismaAdapter creates user (no UserSettings)
   - Redirects to `/dashboard`
   - App layout checks → `assessmentCompleted = false`
   - **Redirects to `/onboarding`**

2. **Returning Social Login**:
   - User exists with UserSettings
   - Redirects to `/dashboard`
   - App layout checks → `assessmentCompleted === true`
   - **Stays on dashboard**

## Key Protection Points

### ✅ Onboarding Route Protection
```typescript
// app/onboarding/layout.tsx
if (userSettings?.assessmentCompleted) {
  redirect("/dashboard"); // Never show onboarding to completed users
}
```

### ✅ App Route Protection
```typescript
// app/(app)/layout.tsx
if (!completed) {
  redirect("/onboarding"); // Force new users to complete onboarding
}
```

### ✅ Database State
- **New User**: No UserSettings record → `assessmentCompleted` = undefined → treated as `false`
- **Completed User**: UserSettings with `assessmentCompleted: true` → never sees onboarding again

## Edge Cases Handled

1. **User navigates directly to `/onboarding` after completion**
   - → Onboarding layout redirects to `/dashboard`

2. **User bookmarks `/onboarding` and visits later**
   - → Onboarding layout checks server-side → redirects

3. **Session expires during onboarding**
   - → Redirected to sign in → completes onboarding → never sees it again

4. **Social auth bypass attempt**
   - → App layout always checks → redirects to onboarding if not completed

5. **Direct URL manipulation**
   - → All routes protected by server-side layouts → cannot bypass

## Testing Checklist

- [x] New user signup → sees onboarding
- [x] New user completes onboarding → never sees it again
- [x] Returning user login → goes to dashboard (not onboarding)
- [x] Returning user navigates to `/onboarding` → redirected to dashboard
- [x] Social auth new user → redirected to onboarding
- [x] Social auth returning user → goes to dashboard
- [x] Session refresh → onboarding status persists
- [x] Multiple login sessions → consistent behavior

## Implementation Files

- `lib/onboarding.ts` - Centralized onboarding check utility
- `app/onboarding/layout.tsx` - Onboarding route protection
- `app/(app)/layout.tsx` - App route protection (requires onboarding)
- `app/auth/signin/page.tsx` - Login redirect logic
- `app/onboarding/page.tsx` - Client-side safeguard
- `app/api/user/assessment/status/route.ts` - API endpoint for status check
- `app/api/user/assessment/route.ts` - Sets `assessmentCompleted: true` on completion

## Summary

**The onboarding prompt is ONLY shown to:**
- ✅ New users who just signed up
- ✅ Users logging in for the first time
- ✅ Users who haven't completed the assessment yet

**The onboarding prompt is NEVER shown to:**
- ❌ Users who have completed onboarding (`assessmentCompleted === true`)
- ❌ Returning users
- ❌ Users who have UserSettings with `assessmentCompleted: true`

The system uses multiple layers of protection (server-side layouts, client-side checks, and API validation) to ensure onboarding is a **one-time experience** for each user.

