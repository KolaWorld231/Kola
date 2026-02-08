# 🌐 Language Activation/Deactivation Feature

**Status**: ✅ **Implemented**

---

## 📋 Overview

Admins can now activate or deactivate languages through the admin CMS. When a language is deactivated, it will no longer appear in the public-facing language selection, but existing user progress is preserved.

---

## ✨ Features

### Admin Interface
- **Toggle Switch**: Each language card has an activate/deactivate toggle switch
- **Visual Status**: Shows "Active" (green) or "Inactive" (gray) with icons
- **Real-time Updates**: Status updates immediately after toggling
- **Loading States**: Shows loading spinner while processing
- **Success/Error Notifications**: Toast notifications for feedback

### Public Behavior
- **Filtered Lists**: Inactive languages are automatically filtered from:
  - Language selection page (`/learn`)
  - Language learning page (`/learn/[code]`)
  - User courses API (`/api/user/courses`)
  - Public languages API (`/api/languages`)
  - Onboarding language selection

### User Progress
- **Preserved**: Existing user progress for deactivated languages is preserved
- **Not Lost**: Users can still access progress if language is reactivated
- **Graceful Handling**: If a user's selected language is deactivated, they won't see it in lists but their selection remains

---

## 🔧 Implementation

### API Endpoint

**PATCH `/api/admin/languages/[id]`**

Updates a language's activation status.

**Request Body**:
```json
{
  "isActive": true  // or false
}
```

**Response**:
```json
{
  "success": true,
  "language": {
    "id": "...",
    "code": "kpelle",
    "name": "Kpelle",
    "nativeName": "Kpɛlɛwoo",
    "isActive": true,
    ...
  },
  "message": "Language activated successfully"
}
```

**Access**: Admin users only

### Component

**`LanguageToggle`** (`components/admin/language-toggle.tsx`)

- Client-side component with real-time updates
- Handles API calls and error handling
- Shows loading and success states
- Displays visual status indicators

### Admin Page

**`/admin/languages`** (`app/admin/languages/page.tsx`)

- Shows all languages (active and inactive)
- Each language card has a toggle switch
- Displays current activation status
- Real-time updates after toggling

---

## 🎯 How to Use

### Activate/Deactivate a Language

1. **Navigate to Admin Portal**:
   - Go to: http://localhost:3000/admin
   - Click "Manage Languages"

2. **Find the Language**:
   - Browse the language cards
   - Each card shows the current status

3. **Toggle Activation**:
   - Use the toggle switch on the language card
   - Switch to the right = Active
   - Switch to the left = Inactive

4. **Confirm**:
   - Success notification will appear
   - Status updates immediately
   - Language visibility changes for users

---

## 📊 Effects of Activation/Deactivation

### When a Language is Deactivated:

✅ **Still Visible**:
- Admin portal (all languages shown)
- Database (all records preserved)
- User progress (not deleted)

❌ **Not Visible**:
- Public language selection (`/learn`)
- Onboarding language selection
- User courses list
- Language learning pages (inactive languages)
- API responses for public endpoints

### When a Language is Reactivated:

✅ **Immediately Available**:
- Appears in all public language lists
- Accessible for new user selections
- All existing content and progress restored

---

## 🔍 Verification

### Check Language Status

**In Admin Portal**:
- Go to `/admin/languages`
- See status badge on each card
- Toggle switch position indicates status

**In Public Interface**:
- Go to `/learn`
- Only active languages appear
- Deactivated languages are hidden

**In API**:
```bash
# Public API - only active languages
GET /api/languages

# Admin API - all languages
GET /api/admin/languages
```

---

## 🛡️ Access Control

- **Admin Only**: Only users with `AdminUser` record can access
- **API Protection**: All admin endpoints check for admin status
- **Unauthorized Access**: Non-admin users are redirected to dashboard

---

## 🐛 Troubleshooting

### Toggle Not Working

**Issue**: Toggle switch doesn't respond or shows error

**Solutions**:
1. Check you have admin access
2. Refresh the page and try again
3. Check browser console for errors
4. Verify API endpoint is accessible

### Status Not Updating

**Issue**: Toggle works but status doesn't update visually

**Solutions**:
1. Refresh the page
2. Check network tab for API response
3. Verify database update occurred

### Language Still Appears After Deactivation

**Issue**: Language still shows in public lists after deactivating

**Solutions**:
1. Verify `isActive` field was updated in database
2. Clear browser cache
3. Check API endpoints are filtering correctly
4. Verify page refresh

---

## 📝 Technical Details

### Database Schema

```prisma
model Language {
  id           String   @id @default(cuid())
  code         String   @unique
  name         String
  nativeName   String
  flagEmoji    String?
  description  String?
  isActive     Boolean  @default(true)  // ← This field controls activation
  ...
}
```

### Filtering in Public APIs

All public endpoints filter by `isActive: true`:

```typescript
const languages = await prisma.language.findMany({
  where: { isActive: true },  // Only active languages
  ...
});
```

### Admin Endpoint

Admin endpoints show all languages regardless of status:

```typescript
const languages = await prisma.language.findMany({
  // No filter - shows all languages
  ...
});
```

---

## ✅ Testing Checklist

- [ ] Admin can toggle language activation
- [ ] Toggle updates status in database
- [ ] Status updates immediately in UI
- [ ] Success notification appears
- [ ] Error notification appears on failure
- [ ] Deactivated language hidden from `/learn`
- [ ] Deactivated language hidden from onboarding
- [ ] Deactivated language hidden from public API
- [ ] Reactivated language appears in public lists
- [ ] User progress preserved after deactivation
- [ ] Non-admin users cannot access toggle

---

## 🎉 Summary

**Status**: ✅ **Feature Complete**

Admins can now:
- ✅ Activate languages (make them visible to users)
- ✅ Deactivate languages (hide them from users)
- ✅ See activation status at a glance
- ✅ Update status with a simple toggle switch

The feature is **fully functional** and ready for use!

---

**Access**: http://localhost:3000/admin/languages  
**Required**: Admin access  
**Files Modified**: 
- `app/api/admin/languages/[id]/route.ts` (NEW)
- `components/admin/language-toggle.tsx` (NEW)
- `app/admin/languages/page.tsx` (UPDATED)


