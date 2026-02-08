# 🧪 Testing Checklist for Settings & User Control

## ✅ Pre-Testing Setup

- [x] Database migration completed
- [x] Prisma client generated
- [x] Build successful
- [ ] Development server running (`npm run dev`)

## 📋 Settings Pages Testing

### 1. Preferences Page (`/settings/preferences`)

- [ ] **Navigation**
  - [ ] Navigate to `/settings/preferences` from dashboard
  - [ ] Verify "Preferences" is highlighted in sidebar
  - [ ] Verify page title displays correctly

- [ ] **Lesson Experience Settings**
  - [ ] Toggle "Sound effects" on/off
  - [ ] Toggle "Animations" on/off
  - [ ] Toggle "Motivational messages" on/off
  - [ ] Toggle "Listening exercises" on/off
  - [ ] Verify Save button appears when changes are made
  - [ ] Click Save and verify success toast
  - [ ] Refresh page and verify settings persisted

- [ ] **Appearance Settings**
  - [ ] Change dark mode dropdown to "LIGHT"
  - [ ] Change dark mode dropdown to "DARK"
  - [ ] Change dark mode dropdown to "SYSTEM DEFAULT"
  - [ ] Verify Save button appears
  - [ ] Save and verify persistence

### 2. Profile Page (`/settings/profile`)

- [ ] **Navigation**
  - [ ] Navigate to `/settings/profile`
  - [ ] Verify "Profile" is highlighted in sidebar

- [ ] **Avatar Display**
  - [ ] Verify avatar displays (or placeholder with initial)
  - [ ] Click edit button (should show placeholder functionality)

- [ ] **Profile Fields**
  - [ ] Update "Name" field
  - [ ] Update "Username" field
  - [ ] Verify "Email" field is read-only
  - [ ] Verify Save button appears when changes made
  - [ ] Save and verify success message
  - [ ] Refresh and verify changes persisted

- [ ] **Password Change**
  - [ ] Enter current password
  - [ ] Enter new password (at least 8 characters)
  - [ ] Enter confirm password (matching)
  - [ ] Verify eye icons toggle password visibility
  - [ ] Save and verify success
  - [ ] Log out and log back in with new password

- [ ] **Password Validation**
  - [ ] Try to save with non-matching passwords (should show error)
  - [ ] Try to save with password less than 8 characters (should show error)
  - [ ] Try to save without current password (should show error)

- [ ] **Data Export**
  - [ ] Click "EXPORT MY DATA"
  - [ ] Verify JSON file downloads
  - [ ] Open JSON file and verify all data is present
  - [ ] Verify passwords are NOT included

- [ ] **Account Deletion**
  - [ ] Click "DELETE MY ACCOUNT" (use test account!)
  - [ ] Verify confirmation dialog appears
  - [ ] Cancel deletion
  - [ ] Confirm deletion
  - [ ] If password exists, verify password prompt appears
  - [ ] Enter password and verify account is deleted
  - [ ] Verify redirect to home page

### 3. Notifications Page (`/settings/notifications`)

- [ ] **Navigation**
  - [ ] Navigate to `/settings/notifications`
  - [ ] Verify "Notifications" is highlighted in sidebar

- [ ] **General Notifications**
  - [ ] Toggle "Product updates + learning tips"
  - [ ] Toggle "New follower"
  - [ ] Toggle "Friend activity"
  - [ ] Toggle "Weekly progress"
  - [ ] Toggle "Special promotions"
  - [ ] Toggle "Research participation opportunities"
  - [ ] Save and verify persistence

- [ ] **Daily Reminders**
  - [ ] Toggle "Practice reminder" on
  - [ ] Verify time selector appears
  - [ ] Change time to different value (e.g., "6:00 PM")
  - [ ] Toggle "Practice reminder" off
  - [ ] Verify time selector hides
  - [ ] Save and verify persistence

### 4. Courses Page (`/settings/courses`)

- [ ] **Navigation**
  - [ ] Navigate to `/settings/courses`
  - [ ] Verify "Courses" is highlighted in sidebar

- [ ] **Course List**
  - [ ] Verify all active languages are displayed
  - [ ] Verify flag emojis display correctly
  - [ ] Verify "ACTIVE" badge shows for selected language
  - [ ] Verify "REMOVE" button exists for each course

- [ ] **Remove Course**
  - [ ] Try to remove currently selected language
  - [ ] Verify error message appears
  - [ ] Select a different language first
  - [ ] Try to remove non-selected language
  - [ ] Verify confirmation dialog
  - [ ] Cancel removal
  - [ ] Confirm removal
  - [ ] Verify "coming soon" message (or actual removal if implemented)

- [ ] **Add Course**
  - [ ] Click "+ Add a Course"
  - [ ] Verify redirect to language selection page

### 5. Privacy Page (`/settings/privacy`)

- [ ] **Navigation**
  - [ ] Navigate to `/settings/privacy`
  - [ ] Verify "Privacy settings" is highlighted in sidebar

- [ ] **Privacy Settings**
  - [ ] Toggle "Make my profile public"
  - [ ] Toggle "Personalized ads"
  - [ ] Toggle "Friend Streaks"
  - [ ] Verify Save button appears
  - [ ] Save and verify success message
  - [ ] Refresh and verify settings persisted

## 🔍 Settings Sidebar Testing

- [ ] Verify all navigation links work
- [ ] Verify active page highlighting
- [ ] Verify "Subscription" section has "Choose a plan" link
- [ ] Verify "Support" section has "Help Center" link
- [ ] Verify sidebar is responsive on mobile

## 🔄 API Endpoints Testing

### Settings API (`/api/user/settings`)
- [ ] GET request returns current settings
- [ ] PUT request updates settings correctly
- [ ] Auto-creates settings if they don't exist
- [ ] Returns 401 if not authenticated

### Profile API (`/api/user/profile`)
- [ ] GET request returns user profile
- [ ] PUT request updates name correctly
- [ ] PUT request updates username correctly
- [ ] PUT request updates password correctly (with validation)
- [ ] Returns 400 for invalid password
- [ ] Returns 401 if not authenticated

### Export Data API (`/api/user/export-data`)
- [ ] Returns JSON with all user data
- [ ] Excludes sensitive information (passwords)
- [ ] Includes profile, progress, XP, achievements, etc.
- [ ] Returns 401 if not authenticated

### Delete Account API (`/api/user/delete-account`)
- [ ] Requires password confirmation if password exists
- [ ] Deletes user and all related data
- [ ] Returns 400 for invalid password
- [ ] Returns 401 if not authenticated

## 🐛 Edge Cases & Error Handling

- [ ] Test with user that has no settings (should auto-create)
- [ ] Test with user that has no password (account deletion)
- [ ] Test with user that has OAuth-only account
- [ ] Test network error handling
- [ ] Test with invalid data formats
- [ ] Test session expiration during settings update

## 📱 Responsive Design Testing

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify sidebar collapses appropriately
- [ ] Verify all forms are usable on mobile

## ⚡ Performance Testing

- [ ] Settings page loads quickly (< 2 seconds)
- [ ] Settings save quickly (< 1 second)
- [ ] Data export completes in reasonable time
- [ ] No memory leaks on navigation

## 🔐 Security Testing

- [ ] Verify users can only access their own settings
- [ ] Verify password change requires current password
- [ ] Verify account deletion requires confirmation
- [ ] Verify exported data doesn't include passwords
- [ ] Verify XSS protection in form inputs

## ✅ Completion Criteria

- [ ] All settings pages function correctly
- [ ] All settings persist after page refresh
- [ ] All API endpoints work as expected
- [ ] Error handling works correctly
- [ ] Responsive design works on all devices
- [ ] Security measures are in place
- [ ] No console errors
- [ ] No build warnings (except acceptable ones)

---

## 📝 Test Results

**Date**: _________________  
**Tester**: _________________  
**Status**: ⬜ Pass / ⬜ Fail / ⬜ Partial

### Issues Found:
1. 
2. 
3. 

### Notes:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________







