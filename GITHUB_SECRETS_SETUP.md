# 🔐 GitHub Secrets Setup Guide

**For Automated CI/CD Deployment**

---

## 📋 Required Secrets

### Critical (Must Have)

These are required for the application to work:

1. **DATABASE_URL**
   - Format: `postgresql://user:password@host:5432/database`
   - Example: `postgresql://postgres:password123@db.example.com:5432/volo_prod`
   - Get from: Your database provider (Supabase, Railway, etc.)

2. **NEXTAUTH_URL**
   - Format: `https://your-domain.com`
   - Example: `https://volo-app.vercel.app` or `https://volo.com`
   - Note: This should match your production domain

3. **NEXTAUTH_SECRET**
   - Generate with: `openssl rand -base64 32`
   - Or use: Random string generator
   - Length: At least 32 characters
   - Example: `aBc123XyZ456...` (random secure string)

---

### Recommended (Optional but Important)

4. **SENTRY_DSN**
   - Format: `https://your-dsn@sentry.io/project-id`
   - Get from: [Sentry.io](https://sentry.io) dashboard
   - Purpose: Error tracking in production

5. **NEXT_PUBLIC_SENTRY_DSN**
   - Same as SENTRY_DSN but for client-side
   - Format: `https://your-dsn@sentry.io/project-id`
   - Get from: Sentry dashboard

6. **SENTRY_ORG**
   - Your Sentry organization slug
   - Example: `my-org`
   - Get from: Sentry dashboard → Settings

7. **SENTRY_PROJECT**
   - Your Sentry project slug
   - Example: `volo-app`
   - Get from: Sentry project settings

8. **SENTRY_AUTH_TOKEN**
   - Sentry authentication token
   - Get from: Sentry → Settings → Account → Auth Tokens
   - Purpose: Source map uploads

---

### Vercel Deployment (Required for CI/CD)

9. **VERCEL_TOKEN**
   - Get from: Vercel Dashboard → Settings → Tokens
   - Click "Create Token"
   - Name: "GitHub Actions"
   - Expiration: Choose appropriate (or no expiration)
   - Copy the token

10. **VERCEL_ORG_ID**
    - Get from: Vercel Dashboard → Settings → General
    - Look for "Team ID" or "User ID"
    - Copy the ID

11. **VERCEL_PROJECT_ID**
    - Get from: Vercel Dashboard → Your Project → Settings → General
    - Look for "Project ID"
    - Copy the ID

12. **VERCEL_DEPLOYMENT_URL**
    - Your production deployment URL
    - Format: `https://your-domain.com`
    - Example: `https://volo-app.vercel.app`
    - Note: Vercel will provide this after first deployment

---

## 🚀 Step-by-Step Setup

### Step 1: Access GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

---

### Step 2: Add Each Secret

For each secret below:

1. Click **New repository secret**
2. Enter the **Name** (exactly as shown)
3. Enter the **Secret** value
4. Click **Add secret**
5. Repeat for all secrets

---

### Step 3: Required Secrets First

Add these in order:

#### 1. DATABASE_URL
```
Name: DATABASE_URL
Secret: postgresql://user:password@host:5432/database
```

#### 2. NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Secret: https://your-domain.vercel.app
```
Note: Use your Vercel deployment URL

#### 3. NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Secret: [generate with: openssl rand -base64 32]
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

Copy the output and use it as the secret.

---

### Step 4: Vercel Secrets

Add these for automated deployment:

#### 4. VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Secret: [from Vercel dashboard → Settings → Tokens]
```

#### 5. VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Secret: [from Vercel → Settings → General → Team ID]
```

#### 6. VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Secret: [from Vercel → Project → Settings → General → Project ID]
```

#### 7. VERCEL_DEPLOYMENT_URL
```
Name: VERCEL_DEPLOYMENT_URL
Secret: https://your-domain.vercel.app
```
Note: You'll know this after first deployment

---

### Step 5: Optional Secrets (Recommended)

Add these if you want error tracking:

#### 8. SENTRY_DSN
```
Name: SENTRY_DSN
Secret: https://your-dsn@sentry.io/project-id
```

#### 9. NEXT_PUBLIC_SENTRY_DSN
```
Name: NEXT_PUBLIC_SENTRY_DSN
Secret: https://your-dsn@sentry.io/project-id
```
(Usually same as SENTRY_DSN)

#### 10-12. Sentry Configuration (Optional)
```
Name: SENTRY_ORG
Secret: your-org-slug

Name: SENTRY_PROJECT
Secret: your-project-slug

Name: SENTRY_AUTH_TOKEN
Secret: your-auth-token
```

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] DATABASE_URL added
- [ ] NEXTAUTH_URL added
- [ ] NEXTAUTH_SECRET added
- [ ] VERCEL_TOKEN added
- [ ] VERCEL_ORG_ID added
- [ ] VERCEL_PROJECT_ID added
- [ ] VERCEL_DEPLOYMENT_URL added (if known)
- [ ] SENTRY secrets added (if using Sentry)

---

## 🔍 How to Find Vercel Credentials

### VERCEL_TOKEN
1. Go to [vercel.com](https://vercel.com)
2. Sign in
3. Click your profile icon → **Settings**
4. Click **Tokens** (left sidebar)
5. Click **Create Token**
6. Name it: "GitHub Actions"
7. Copy the token

### VERCEL_ORG_ID
1. Go to Vercel Dashboard
2. Click **Settings** (gear icon)
3. Go to **General** tab
4. Find **Team ID** or **User ID**
5. Copy the ID

### VERCEL_PROJECT_ID
1. Go to Vercel Dashboard
2. Click your project
3. Go to **Settings** tab
4. Go to **General** section
5. Find **Project ID**
6. Copy the ID

---

## 🚀 After Secrets Are Configured

Once all secrets are added:

1. **Commit and push** any uncommitted changes
2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

3. **Monitor deployment**:
   - Go to GitHub → **Actions** tab
   - Watch the CI/CD pipeline run
   - Wait for deployment to complete

4. **Verify**:
   - Check Vercel dashboard
   - Visit production URL
   - Test critical flows

---

## 📊 Secret Status Overview

### Minimum Required (3)
- ✅ DATABASE_URL
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET

### For CI/CD Deployment (7)
- ✅ Above 3, plus:
- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID
- ✅ VERCEL_DEPLOYMENT_URL

### For Full Monitoring (12)
- ✅ All above, plus:
- ✅ SENTRY_DSN
- ✅ NEXT_PUBLIC_SENTRY_DSN
- ✅ SENTRY_ORG
- ✅ SENTRY_PROJECT
- ✅ SENTRY_AUTH_TOKEN

---

## 🆘 Troubleshooting

### Secret Not Working
- Check spelling (case-sensitive)
- Verify value is correct
- Re-add secret if needed

### Deployment Fails
- Check GitHub Actions logs
- Verify all required secrets are set
- Check Vercel dashboard for errors

### Can't Find Vercel Credentials
- Make sure you're signed in to Vercel
- Check you have access to the project
- Verify project exists

---

## 📝 Quick Reference

**GitHub Secrets Location**:  
`https://github.com/your-org/your-repo/settings/secrets/actions`

**Vercel Tokens**:  
`https://vercel.com/settings/tokens`

**Vercel Settings**:  
`https://vercel.com/settings/general`

---

**Ready to add secrets? Start with DATABASE_URL, NEXTAUTH_URL, and NEXTAUTH_SECRET!**


