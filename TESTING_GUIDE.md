# 🧪 Testing Guide - Post-Fix Verification

**Date**: After lesson page and API fixes  
**Purpose**: Comprehensive testing guide for verifying all fixes work correctly

---

## ✅ Pre-Testing Checklist

Before starting tests, ensure:
- [ ] Development server is running: `npm run dev`
- [ ] Server accessible at: http://localhost:3000
- [ ] Database is connected and migrations applied
- [ ] You have test accounts ready:
  - Admin account (for language activation testing)
  - Regular user account (for lesson testing)
  - New user account (for onboarding testing)

---

## 🎯 Test 1: Lesson Page Fix (High Priority)

### Objective
Verify that clicking a lesson card no longer shows "params.then is not a function" error.

### Steps
1. **Navigate to Language Learning Page**:
   - Go to: http://localhost:3000/learn/bassa
   - Or navigate from dashboard → Learn → Select a language

2. **Click a Lesson Card**:
   - Find "Basic Greetings" or any lesson card
   - Click on it
   - **Expected**: Should navigate to `/lesson/[lesson-id]` without errors

3. **Verify Lesson Loads**:
   - Lesson page should load completely
   - Exercises should be visible
   - No console errors
   - URL should be: `/lesson/bassa-lesson-1-1` (or similar)

### Success Criteria
- ✅ No "params.then is not a function" error
- ✅ Lesson page loads successfully
- ✅ Exercises are visible
- ✅ No errors in browser console
- ✅ URL is correct

### If Test Fails
- Check browser console for specific error
- Verify the fix was applied: Check `app/lesson/[id]/page.tsx` uses `useParams()`
- Check server logs for errors

---

## 🎯 Test 2: Lesson Completion Flow (High Priority)

### Objective
Verify that completing a lesson works end-to-end, including API calls.

### Steps
1. **Start a Lesson**:
   - Navigate to a lesson (from Test 1)
   - Or go directly to: http://localhost:3000/lesson/bassa-lesson-1-1

2. **Complete Exercises**:
   - Answer all exercises in the lesson
   - Submit each answer
   - Progress through all exercises

3. **Complete the Lesson**:
   - After all exercises, click "Complete Lesson" or similar
   - **Expected**: Lesson completion API should be called successfully

4. **Verify Results**:
   - XP should be awarded
   - Progress should be saved
   - Achievement notifications (if applicable)
   - Redirect to next lesson or dashboard

### Success Criteria
- ✅ All exercises can be completed
- ✅ Lesson completion API works (no params errors)
- ✅ XP is awarded correctly
- ✅ Progress is saved
- ✅ No errors in console or network tab

### If Test Fails
- Check Network tab for failed API calls
- Verify API route: `app/api/lessons/[id]/complete/route.ts`
- Check server logs for errors
- Verify params are awaited correctly in API route

---

## 🎯 Test 3: Language Activation Feature (Medium Priority)

### Objective
Verify that admins can activate/deactivate languages and it affects public visibility.

### Steps
1. **Access Admin Portal**:
   - Sign in with admin account
   - Navigate to: http://localhost:3000/admin/languages
   - **Expected**: Should see list of all languages

2. **Test Activation Toggle**:
   - Find a language (e.g., "Bassa")
   - Toggle the switch from Active → Inactive
   - **Expected**: 
     - Status updates immediately
     - Success notification appears
     - Status icon changes

3. **Verify Public Behavior**:
   - Go to: http://localhost:3000/learn
   - **Expected**: Deactivated language should NOT appear in the list
   - Go back to admin panel
   - Toggle language back to Active
   - Go back to `/learn`
   - **Expected**: Language should appear again

4. **Test Onboarding Behavior**:
   - Sign out
   - Create a new account or sign in as new user
   - Go through onboarding
   - **Expected**: Deactivated languages should NOT appear in onboarding language selection

### Success Criteria
- ✅ Toggle works smoothly
- ✅ Status updates immediately
- ✅ Success notifications appear
- ✅ Deactivated languages hidden from `/learn`
- ✅ Deactivated languages hidden from onboarding
- ✅ Reactivated languages appear again
- ✅ User progress preserved

### If Test Fails
- Check Network tab for API errors
- Verify API route: `app/api/admin/languages/[id]/route.ts`
- Check admin access (verify AdminUser record exists)
- Check database: `languages.isActive` field

---

## 🎯 Test 4: Onboarding Protection (Medium Priority)

### Objective
Verify that onboarding only shows to first-time users.

### Steps
1. **Test New User Flow**:
   - Sign out (if logged in)
   - Create a new account
   - **Expected**: Should redirect to `/onboarding`
   - Complete onboarding
   - **Expected**: Should redirect to `/dashboard`

2. **Test Returning User Flow**:
   - Sign out
   - Sign in with an account that completed onboarding
   - **Expected**: Should go directly to `/dashboard` (no onboarding)
   - Try navigating to `/onboarding` directly
   - **Expected**: Should redirect back to `/dashboard`

3. **Test Edge Cases**:
   - Bookmark `/onboarding` URL after completion
   - Try accessing it
   - **Expected**: Should redirect to `/dashboard`
   - Try direct URL: http://localhost:3000/onboarding
   - **Expected**: Should redirect if already completed

### Success Criteria
- ✅ New users see onboarding
- ✅ Returning users don't see onboarding
- ✅ Direct URL access is blocked for completed users
- ✅ Redirects work correctly
- ✅ No redirect loops

### If Test Fails
- Check server logs for redirect issues
- Verify `lib/onboarding.ts` logic
- Check database: `user_settings.assessment_completed`
- Verify layout files: `app/onboarding/layout.tsx` and `app/(app)/layout.tsx`

---

## 🎯 Test 5: General Navigation & UI (Low Priority)

### Objective
Verify that general navigation and UI work correctly after fixes.

### Steps
1. **Navigate Between Pages**:
   - Dashboard → Learn → Language → Lesson
   - Lesson → Dashboard
   - Dashboard → Profile
   - Profile → Settings
   - **Expected**: All navigation should work smoothly

2. **Check for Console Errors**:
   - Open browser DevTools
   - Navigate through the app
   - **Expected**: No console errors

3. **Check Network Requests**:
   - Open Network tab
   - Navigate through the app
   - **Expected**: No failed API requests

### Success Criteria
- ✅ All navigation works
- ✅ No console errors
- ✅ No failed network requests
- ✅ UI is responsive
- ✅ Loading states work correctly

---

## 🐛 Common Issues & Solutions

### Issue: "params.then is not a function"
**Solution**: Verify `app/lesson/[id]/page.tsx` uses `useParams()` hook

### Issue: Lesson completion API fails
**Solution**: Verify `app/api/lessons/[id]/complete/route.ts` awaits params correctly

### Issue: Language toggle doesn't work
**Solution**: 
- Check admin access
- Verify API route exists
- Check network tab for errors

### Issue: Onboarding shows to returning users
**Solution**: 
- Check `user_settings.assessment_completed` in database
- Verify layout protection logic

---

## 📊 Test Results Template

Use this template to track test results:

```
Test 1: Lesson Page Fix
- Status: [ ] Pass [ ] Fail
- Notes: ________________

Test 2: Lesson Completion Flow
- Status: [ ] Pass [ ] Fail
- Notes: ________________

Test 3: Language Activation
- Status: [ ] Pass [ ] Fail
- Notes: ________________

Test 4: Onboarding Protection
- Status: [ ] Pass [ ] Fail
- Notes: ________________

Test 5: General Navigation
- Status: [ ] Pass [ ] Fail
- Notes: ________________
```

---

## 🚀 Quick Test Script

Run this verification script:

```bash
# From project root
npm run dev

# In another terminal
npx tsx scripts/verify-lesson-fix.ts
```

---

## 📝 Next Steps After Testing

1. **If All Tests Pass**:
   - ✅ Mark fixes as complete
   - ✅ Update documentation
   - ✅ Proceed with next features

2. **If Tests Fail**:
   - ❌ Document the failures
   - ❌ Review error messages
   - ❌ Fix issues and retest

3. **If Warnings Found**:
   - ⚠️ Review warnings
   - ⚠️ Decide if action needed
   - ⚠️ Document decisions

---

## 🎉 Success Criteria

All tests are successful when:
- ✅ No console errors
- ✅ No network errors
- ✅ All features work as expected
- ✅ User flows are smooth
- ✅ Data persists correctly
- ✅ Error handling works

---

*Last Updated: After lesson page and API fixes*  
*Next Review: After testing completion*


