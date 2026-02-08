# 🔐 How to Access the Admin CMS Portal

## Quick Access Guide

### ✅ Option 1: Use Default Admin Account (Easiest)

If you've run the seed script, you can use the default admin account:

**Credentials**:
- **Email**: `admin@volo.test`
- **Password**: `password123`

**Steps**:
1. Make sure your development server is running:
   ```bash
   npm run dev
   ```
2. Go to: http://localhost:3000/auth/signin
3. Sign in with the admin credentials above
4. Navigate to: http://localhost:3000/admin

**That's it!** You should now see the Admin Portal dashboard.

---

## 📋 Option 2: Create Your Own Admin User

If you want to use your own account as admin:

### Step 1: Sign Up or Sign In

1. Go to: http://localhost:3000/auth/signup
2. Create your account (or sign in if you already have one)

### Step 2: Get Your User ID

**Option A: Using Prisma Studio (Recommended)**

```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

1. In Prisma Studio, click on the **"User"** table
2. Find your user (by email)
3. Click on your user to view details
4. Copy the **`id`** field (it's a long string like `clx123abc...`)

**Option B: Using SQL**

Connect to your database and run:
```sql
SELECT id, email, name FROM users WHERE email = 'your-email@example.com';
```

### Step 3: Create AdminUser Record

**Option A: Using Prisma Studio**

1. In Prisma Studio (still open), click on **"AdminUser"** table
2. Click **"Add record"**
3. Fill in:
   - `userId`: Paste your user ID (the one you copied in Step 2)
   - `role`: Type `admin`
   - Leave `id`, `createdAt`, `updatedAt` as auto-generated
4. Click **"Save 1 change"**

**Option B: Using SQL**

```sql
INSERT INTO admin_users (id, user_id, role, created_at, updated_at)
VALUES (gen_random_uuid(), 'your-user-id-here', 'admin', NOW(), NOW());
```

**Option C: Using a Script**

I can create a script to make this easier - let me know if you'd like that!

### Step 4: Access Admin Portal

1. Sign out if you're signed in
2. Sign in again with your account
3. Navigate to: http://localhost:3000/admin

You should now see the Admin Portal! 🎉

---

## 🔍 Verify Admin Access

To verify you have admin access:

1. **Check Admin Dashboard**:
   - Go to: http://localhost:3000/admin
   - You should see statistics and admin options
   - If you see "Redirecting..." or go to dashboard, you don't have admin access yet

2. **Check AdminUser Table**:
   - Open Prisma Studio: `npm run db:studio`
   - Go to "AdminUser" table
   - Your user ID should be listed there

---

## 🚨 Troubleshooting

### Issue: "Redirecting to dashboard" when accessing `/admin`

**Cause**: You don't have an AdminUser record yet.

**Solution**: Follow "Option 2: Create Your Own Admin User" above.

### Issue: Can't find my User ID in Prisma Studio

**Solution**: 
1. Make sure you've signed up/signed in at least once
2. Check the email matches exactly (case-sensitive)
3. Try refreshing Prisma Studio

### Issue: "Unauthorized" error in admin pages

**Cause**: Your session might be expired or AdminUser record not found.

**Solution**:
1. Sign out completely
2. Sign in again
3. Try accessing `/admin` again

### Issue: Prisma Studio won't open

**Solution**:
```bash
# Check if port 5555 is already in use
lsof -ti:5555

# If needed, kill the process
kill $(lsof -ti:5555)

# Try again
npm run db:studio
```

---

## 📍 Admin Portal URLs

Once you have admin access:

- **Main Dashboard**: http://localhost:3000/admin
- **Content Management**: http://localhost:3000/admin/content
- **Language Management**: http://localhost:3000/admin/languages
- **Vocabulary Management**: http://localhost:3000/admin/vocabulary

---

## ✅ Quick Test

To quickly verify everything works:

1. Sign in with admin account
2. Go to: http://localhost:3000/admin
3. You should see:
   - Statistics (Languages, Units, Lessons, Exercises, Vocabulary, Users)
   - Admin action cards
   - Navigation buttons

If you see this, you have admin access! ✅

---

## 🎯 Next Steps

Once you have admin access:

1. **Explore Content Management** (`/admin/content`)
   - Create units, lessons, and exercises
   - View the content tree

2. **Manage Languages** (`/admin/languages`)
   - Add new languages
   - Edit existing languages

3. **Manage Vocabulary** (`/admin/vocabulary`)
   - Add vocabulary words
   - Edit translations

---

## 💡 Pro Tips

- **Bookmark**: Bookmark http://localhost:3000/admin for easy access
- **Multiple Admins**: You can create multiple admin users - just repeat Step 3 for each user
- **Remove Admin**: To remove admin access, delete the AdminUser record in Prisma Studio

---

**Need Help?** If you're still having issues accessing the admin portal, let me know!


