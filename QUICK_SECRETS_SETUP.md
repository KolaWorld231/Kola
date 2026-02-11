# ⚡ Quick GitHub Secrets Setup for Deployment

**Time Required**: 10-15 minutes  
**Goal**: Configure GitHub Secrets needed for Vercel deployment

---

## 📋 What You Need

Before setting up secrets, gather these from your accounts:

| Secret | Where to Find | Format |
|--------|---------------|--------|
| `VERCEL_TOKEN` | https://vercel.com/settings/tokens | Long alphanumeric string |
| `VERCEL_ORG_ID` | https://vercel.com/settings/general | team_xxxxx or similar |
| `VERCEL_PROJECT_ID` | Vercel Dashboard → Project → Settings | prj_xxxxx or similar |
| `DATABASE_URL` | Your database provider | postgresql://user:pass@host/db |
| `NEXTAUTH_URL` | Your domain or vercel URL | https://your-app.vercel.app |
| `NEXTAUTH_SECRET` | Use provided value | l3Y...E= (provided below) |
| `VERCEL_DEPLOYMENT_URL` | Same as NEXTAUTH_URL | https://your-app.vercel.app |

---

## 🔑 Step 1: Get Your Vercel Credentials

### 1.1 Get VERCEL_TOKEN

1. Go to: **https://vercel.com/settings/tokens**
2. Click **"Create Token"** (if no token exists)
3. Fill in:
   - **Token name**: `github-actions` (or any name)
   - **Scope**: Select your team
   - **Expiration**: 30 days or 90 days
4. Click **"Create"**
5. **Copy the token** (it appears once, so save it!)

**Value to copy**:
```
VERCEL_TOKEN = [Long string starting with a number]
```

---

### 1.2 Get VERCEL_ORG_ID

1. Go to: **https://vercel.com/settings/general**
2. Look for **"Team ID"** or **"Org ID"** section
3. **Copy the ID** (looks like `team_XXXXXXXXX`)
4. If using personal account, it might be different format

**Value to copy**:
```
VERCEL_ORG_ID = [ID like team_XXXXXXXX]
```

---

### 1.3 Get VERCEL_PROJECT_ID

1. Go to: **https://vercel.com/dashboard**
2. Click on your project
3. Go to **Settings → General**
4. Look for **"Project ID"** (looks like `prj_XXXXXXXXX`)
5. **Copy the Project ID**

**Value to copy**:
```
VERCEL_PROJECT_ID = [ID like prj_XXXXXXXX]
```

---

## 🗄️ Step 2: Get Your Database URL

Choose one based on your setup:

### Option A: PostgreSQL (Recommended for Production)
```
DATABASE_URL = postgresql://username:password@host:5432/database_name?schema=public
```

### Option B: MySQL
```
DATABASE_URL = mysql://username:password@host:3306/database_name
```

### Option C: SQLite (Dev Only - not for production)
```
DATABASE_URL = file:./prisma/prod.db
```

**Common Providers**:
- **Railway**: https://railway.app (free tier available)
- **Render**: https://render.com
- **AWS RDS**: https://aws.amazon.com/rds/
- **Supabase**: https://supabase.com (PostgreSQL)
- **PlanetScale**: https://planetscale.com (MySQL)

---

## 🔐 Step 3: Set GitHub Secrets

### Navigate to GitHub Settings

1. Go to: **https://github.com/your-org/your-repo/settings/secrets/actions**
   - Replace `your-org` and `your-repo` with your actual values
2. You should see a **"New repository secret"** button

### Add Each Secret

**Click "New repository secret" and add these 7 secrets**:

#### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: [Paste from Vercel Step 1.1]
```

#### Secret 2: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: [Paste from Vercel Step 1.2]
```

#### Secret 3: VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: [Paste from Vercel Step 1.3]
```

#### Secret 4: DATABASE_URL
```
Name: DATABASE_URL
Value: [Your production database connection string]
```

#### Secret 5: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://your-app.vercel.app
```
(Replace `your-app` with your actual project name)

#### Secret 6: NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: l3Y1z1mBxwmWWobSQxjjExU/Ldv2dB8R4sOnoYKMRRE=
```
(Use this exact value - it's pre-generated and tested)

#### Secret 7: VERCEL_DEPLOYMENT_URL
```
Name: VERCEL_DEPLOYMENT_URL
Value: https://your-app.vercel.app
```
(Same as NEXTAUTH_URL)

---

## ✅ Verification

After adding all 7 secrets, verify:

1. Go to: **https://github.com/your-org/your-repo/settings/secrets/actions**
2. All 7 secrets should be listed:
   - [ ] VERCEL_TOKEN
   - [ ] VERCEL_ORG_ID
   - [ ] VERCEL_PROJECT_ID
   - [ ] DATABASE_URL
   - [ ] NEXTAUTH_URL
   - [ ] NEXTAUTH_SECRET
   - [ ] VERCEL_DEPLOYMENT_URL

3. Each should show the date it was created (not "Update")

---

## 🚀 Next: Deploy

Once all secrets are set:

```bash
cd /Users/visionalventure/Volo

# Switch to main and merge feature branch
git checkout main
git merge feature/kola-brand-assets

# Push to GitHub (triggers deployment)
git push origin main
```

**Watch deployment at**: https://github.com/your-org/your-repo/actions

---

## 🆘 Troubleshooting

### Error: "Vercel API Error: Could not authenticate"
**Solution**: VERCEL_TOKEN expired or incorrect
- Regenerate token at https://vercel.com/settings/tokens
- Update GitHub secret

### Error: "Project not found"
**Solution**: VERCEL_PROJECT_ID incorrect
- Double-check from Vercel dashboard
- Update GitHub secret

### Error: "Database connection failed"
**Solution**: DATABASE_URL invalid
- Test connection locally: `psql [DATABASE_URL]`
- Verify database is running and accessible
- Update GitHub secret

---

## 📞 Quick Links

| Link | Purpose |
|------|---------|
| https://vercel.com/settings/tokens | Get VERCEL_TOKEN |
| https://vercel.com/settings/general | Get VERCEL_ORG_ID |
| https://vercel.com/dashboard | Get VERCEL_PROJECT_ID |
| https://github.com/your-org/your-repo/settings/secrets/actions | Add GitHub Secrets |
| https://github.com/your-org/your-repo/actions | Monitor deployment |

---

**All set? Time to deploy! 🚀**
