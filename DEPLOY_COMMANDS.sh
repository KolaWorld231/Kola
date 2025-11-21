#!/bin/bash
# Exact Commands to Deploy - Copy and Run These

cd "/Users/visionalventure/Volo"

# 1. Login to Vercel
./node_modules/.bin/vercel login

# 2. Link project (will create new project)
./node_modules/.bin/vercel link

# 3. Set environment variables
# Get secrets from .env.production.template first
# Then run these commands one by one:

# DATABASE_URL (replace with your production database URL)
./node_modules/.bin/vercel env add DATABASE_URL production

# NEXTAUTH_URL (use placeholder, update after deployment)
./node_modules/.bin/vercel env add NEXTAUTH_URL production
# Enter: https://volo.vercel.app

# NEXTAUTH_SECRET (copy from .env.production.template)
./node_modules/.bin/vercel env add NEXTAUTH_SECRET production

# CRON_SECRET (copy from .env.production.template)
./node_modules/.bin/vercel env add CRON_SECRET production

# 4. Deploy to production
./node_modules/.bin/vercel --prod --yes

# 5. After deployment, note your URL and update NEXTAUTH_URL if needed
# 6. Run migrations on production database
# 7. Verify deployment

