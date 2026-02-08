# Production Environment Variables

## Required Variables

Copy these to your Vercel Dashboard (Settings → Environment Variables):

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="[see .env.production.template for generated value]"
```

## Optional Variables

```env
CRON_SECRET="[see .env.production.template for generated value]"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Getting Your Generated Secrets

Your secrets have been generated and saved to `.env.production.template`.

**Important**: 
- Keep these secrets secure
- Never commit `.env.production.template` to Git
- Use different secrets for each environment (dev, staging, production)

## Setting Up in Vercel

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your production database connection string
   - **Environment**: Production, Preview, Development
4. Repeat for all required variables
5. Save changes

## Generating New Secrets

If you need to generate new secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -base64 32
```

---

**Next Step**: Deploy to Vercel (see DEPLOYMENT_STATUS.md)



