# Manual Testing Checklist

> **Date**: February 11, 2026  
> **Purpose**: Guide for manually testing core features in development environment  
> **Server URL**: http://localhost:3000

---

## 📋 Pre-Testing Setup

- [ ] Dev server is running: `npm run dev`
- [ ] No build errors in terminal
- [ ] Browser console is open (F12)
- [ ] Network tab is open for monitoring requests
- [ ] You have a test user account (demo@kola.local / demo password)

**Status Check**:
```bash
# Verify dev server is running
curl http://localhost:3000

# Verify hot reload is working
npm run dev
```

---

## 🧪 Test Suite 1: Lesson Page Navigation

### Test 1.1: Navigate to Learn Page
**Steps**:
1. Visit http://localhost:3000/learn/bassa
2. Wait for page to load
3. Look for lesson cards/list

**Expected**:
- ✅ Page loads without errors
- ✅ Lesson cards display (e.g., "Basic Greetings", "Common Phrases")
- ✅ No console errors (red messages in browser console)
- ✅ No 404s in Network tab

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: ___________________________________________

---

### Test 1.2: Click Lesson Card to Navigate
**Steps**:
1. On the learn page (/learn/bassa)
2. Click on any lesson card (e.g., "Basic Greetings")
3. Observe navigation

**Expected**:
- ✅ Page navigates to `/lesson/[lesson-id]`
- ✅ URL changes to something like: `/lesson/bassa-lesson-1-1`
- ✅ **No "params.then is not a function" error in console**
- ✅ Lesson content loads (title, exercises, etc.)
- ✅ No 500 errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Error if any**: ___________________________________________

---

### Test 1.3: Lesson Page Loads Exercises
**Steps**:
1. From Test 1.2, you should be on a lesson page
2. Scroll down to see exercises
3. Look for exercise cards/questions

**Expected**:
- ✅ Exercise content visible (questions, options, images if any)
- ✅ Navigation buttons present (Next, Previous, Submit, etc.)
- ✅ No console errors
- ✅ Page is responsive on mobile (press F12 → mobile toggle)

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: ___________________________________________

---

### Test 1.4: Practice Page Parameter Handling
**Steps**:
1. Navigate to: http://localhost:3000/practice/lesson-1
2. Observe page behavior

**Expected**:
- ✅ Page loads (either shows practice interface or friendly redirect)
- ✅ **No "params.then is not a function" error**
- ✅ No 500 errors in Network tab
- ✅ Console shows no critical errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Error if any**: ___________________________________________

---

## 🔐 Test Suite 2: Language Activation/Deactivation (Admin)

### Test 2.1: Access Admin Languages Page
**Steps**:
1. Visit http://localhost:3000/admin/languages
2. Wait for page to load

**Expected**:
- ✅ Page loads without errors
- ✅ You see a list of languages (Bassa, Kru, Mende, Vai, Liberian English)
- ✅ Each language has a status or toggle control
- ✅ No 401/403 unauthorized errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: ___________________________________________

---

### Test 2.2: Find Language Toggle Control
**Steps**:
1. On admin languages page
2. Look for each language row
3. Find the toggle/switch or button to activate/deactivate

**Expected**:
- ✅ Each language has a toggle or checkbox
- ✅ Toggle shows current state (active/inactive, enabled/disabled, or similar)
- ✅ Control is clickable
- ✅ Visual indicator of active status (color, badge, text)

**Pass/Fail**: [ ] Pass [ ] Fail  
**Current State of Languages**:
- [ ] Bassa: Active / Inactive
- [ ] Kru: Active / Inactive
- [ ] Mende: Active / Inactive
- [ ] Vai: Active / Inactive
- [ ] Liberian English: Active / Inactive

---

### Test 2.3: Toggle Language Activation
**Steps**:
1. Pick one language (e.g., Mende)
2. Click its toggle/switch to deactivate it
3. Observe what happens
4. Click again to reactivate

**Expected**:
- ✅ Toggle responds immediately (no lag)
- ✅ Status updates in UI (text or visual indicator changes)
- ✅ Success message appears (toast notification, alert, or similar)
- ✅ No console errors
- ✅ No 500 errors in Network tab

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: ___________________________________________

---

### Test 2.4: Verify Deactivated Language Hidden from User View
**Steps**:
1. From Test 2.3, you should have deactivated Mende
2. Navigate to: http://localhost:3000/learn
3. Look for available languages

**Expected**:
- ✅ Deactivated language (Mende) is **NOT** visible in the learn page
- ✅ Other languages are still visible
- ✅ No broken images or missing content

**Pass/Fail**: [ ] Pass [ ] Fail  
**Visible Languages**: Bassa [ ] Kru [ ] Mende [ ] Vai [ ] Liberian English [ ]

---

### Test 2.5: Reactivate Language
**Steps**:
1. Go back to http://localhost:3000/admin/languages
2. Toggle the language you deactivated (Mende) back to active
3. Return to /learn

**Expected**:
- ✅ Language activates successfully
- ✅ Language reappears in /learn
- ✅ No data was lost
- ✅ User progress preserved (if applicable)

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: ___________________________________________

---

## 👤 Test Suite 3: Onboarding Protection

### Test 3.1: Fresh User Onboarding
**Steps**:
1. Open browser DevTools (F12)
2. Go to Application → Storage → Cookies
3. Clear ALL cookies for localhost:3000
4. Clear browser cache (Cmd+Shift+Delete or similar)
5. Create a new test account: http://localhost:3000/auth/signup
6. Sign up with email: `test-onboard-$(date +%s)@example.com`

**Expected**:
- ✅ New user is prompted with onboarding
- ✅ Onboarding shows language selection or first-time setup
- ✅ User can complete onboarding
- ✅ After completing, redirects to dashboard or home

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: ___________________________________________

---

### Test 3.2: Returning User Skips Onboarding
**Steps**:
1. Stay logged in as the user from Test 3.1
2. Try to navigate to: http://localhost:3000/onboarding
3. Observe behavior

**Expected**:
- ✅ User is **redirected away** from onboarding
- ✅ Redirects to dashboard or learn page (NOT onboarding)
- ✅ No error messages
- ✅ No console errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Redirected To**: ___________________________________________

---

### Test 3.3: Onboarding URL Direct Access
**Steps**:
1. While logged in (returning user)
2. Type directly in URL bar: http://localhost:3000/onboarding
3. Press Enter

**Expected**:
- ✅ **NOT** allowed to view onboarding page
- ✅ Either redirects or shows error message
- ✅ Explains "You've already completed onboarding" or similar
- ✅ No blank page or crashes

**Pass/Fail**: [ ] Pass [ ] Fail  
**Actual Behavior**: ___________________________________________

---

### Test 3.4: Logout and Verify Onboarding Redirect
**Steps**:
1. Logout from current user
2. Attempt to access: http://localhost:3000/onboarding
3. Observe behavior

**Expected**:
- ✅ Redirects to signin/login page
- ✅ Does NOT show onboarding (since user is not authenticated)
- ✅ Message indicates need to sign in
- ✅ No errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Redirected To**: ___________________________________________

---

## 🔧 Test Suite 4: API Endpoints

### Test 4.1: Verify API Responses
**Steps**:
1. Open browser DevTools → Network tab
2. Clear all requests
3. Navigate to http://localhost:3000/learn/bassa
4. Look for API requests in Network tab

**Expected**:
- ✅ Find requests to `/api/...` endpoints
- ✅ All API requests return 200 status (green)
- ✅ No 500 errors (red)
- ✅ Response data looks correct (JSON, not error)

**Pass/Fail**: [ ] Pass [ ] Fail  
**API Endpoints Found**: ___________________________________________

---

### Test 4.2: Check Session API
**Steps**:
1. Open DevTools Console
2. Run: `fetch('/api/auth/session').then(r => r.json()).then(console.log)`
3. Observe the response

**Expected**:
- ✅ Session object returns with user info
- ✅ Contains user ID, email, name (if logged in)
- ✅ Returns null if not logged in
- ✅ No 401/403 errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Response**: ___________________________________________

---

## 🎨 Test Suite 5: UI/UX

### Test 5.1: Responsive Design - Mobile
**Steps**:
1. Press F12 to open DevTools
2. Click device toggle (mobile icon) or press Ctrl+Shift+M
3. Select "iPhone 12" or similar
4. Navigate through: Home → Learn → Lesson → Practice

**Expected**:
- ✅ All pages display correctly on mobile
- ✅ Text is readable (not too small)
- ✅ Buttons are tappable (not too small)
- ✅ No horizontal scroll needed
- ✅ Layout adjusts for screen size

**Pass/Fail**: [ ] Pass [ ] Fail  
**Issues if any**: ___________________________________________

---

### Test 5.2: Responsive Design - Tablet
**Steps**:
1. In DevTools, select iPad or 1024px width
2. Navigate through key pages

**Expected**:
- ✅ Layout is appropriate for tablet
- ✅ Content is well-spaced
- ✅ Navigation works
- ✅ No broken layouts

**Pass/Fail**: [ ] Pass [ ] Fail  
**Issues if any**: ___________________________________________

---

### Test 5.3: Dark Mode (if applicable)
**Steps**:
1. Check if your app supports dark mode
2. Toggle system dark mode or app theme toggle
3. Observe all pages

**Expected**:
- ✅ All pages render correctly in dark mode
- ✅ Text is readable
- ✅ Colors have good contrast
- ✅ No white backgrounds on white text issues

**Pass/Fail**: [ ] Pass [ ] Fail  
**Issues if any**: ___________________________________________

---

## 📊 Test Suite 6: Performance

### Test 6.1: Page Load Time
**Steps**:
1. DevTools → Network tab
2. Press F5 to refresh page
3. Note the time shown at bottom: "X requests | transferred Y | Finished: XXms"

**Expected**:
- ✅ Home page loads in < 3 seconds
- ✅ Learn page loads in < 3 seconds
- ✅ Lesson page loads in < 5 seconds
- ✅ Most API calls complete quickly

**Pass/Fail**: [ ] Pass [ ] Fail  
**Load Times**:
- Home: _______ ms
- Learn: _______ ms
- Lesson: _______ ms

---

### Test 6.2: Console Warnings/Errors
**Steps**:
1. Open DevTools Console
2. Navigate through multiple pages
3. Count warnings/errors

**Expected**:
- ✅ No red errors (except network timeouts)
- ✅ Minimal yellow warnings
- ✅ No "Uncaught ReferenceError" or similar critical errors
- ✅ No "params.then is not a function" errors

**Pass/Fail**: [ ] Pass [ ] Fail  
**Errors/Warnings Found**: ___________________________________________

---

## ✅ Overall Checklist

### Critical Features (Must Pass)
- [ ] Test 1.2: Lesson navigation without params error ⭐
- [ ] Test 1.4: Practice page without params error ⭐
- [ ] Test 2.3: Language toggle works ⭐
- [ ] Test 3.2: Returning user can't access onboarding ⭐

### Important Features (Should Pass)
- [ ] Test 1.1: Learn page loads
- [ ] Test 1.3: Lesson exercises display
- [ ] Test 2.1: Admin page accessible
- [ ] Test 2.4: Deactivated language hidden
- [ ] Test 3.1: New user sees onboarding

### Nice to Have (Ideal)
- [ ] Test 5: Responsive design
- [ ] Test 6: Performance acceptable

---

## 🐛 Bug Report Template

If you find an issue, document it here:

### Bug #1
**Title**: _______________________________________  
**Steps to Reproduce**:
1. _______________________________________
2. _______________________________________
3. _______________________________________

**Expected**: _______________________________________

**Actual**: _______________________________________

**Console Error**: `_______________________________________`

**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low

---

### Bug #2
**Title**: _______________________________________  
**Steps to Reproduce**:
1. _______________________________________

**Expected**: _______________________________________

**Actual**: _______________________________________

**Console Error**: `_______________________________________`

**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low

---

## 📝 Notes

- Test with fresh browser state when possible (Incognito mode recommended)
- Check browser console (Dev Tools F12 → Console tab) for errors after each action
- Note any 404/500 errors in Network tab
- Test on different browsers if possible (Chrome, Safari, Firefox)
- Keep notes on what works and what doesn't for the next development cycle

**Testing Date**: ___________  
**Tester Name**: ___________  
**Browser/OS**: ___________  
**Overall Status**: [ ] All Pass [ ] Minor Issues [ ] Major Issues

---
