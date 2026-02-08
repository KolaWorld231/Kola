# 👨‍💼 Volo Admin Guide

**Guide for Administrators Managing the Volo Platform**

---

## 🔐 Admin Access

### How to Become an Admin

1. **Contact Platform Owner**: Request admin access
2. **Account Setup**: Admin user must be created in database
3. **Admin Role**: Assigned by database administrator
4. **Verify Access**: Confirm admin access in dashboard

### Accessing Admin Dashboard

1. **Sign In**: Use your admin account credentials
2. **Navigate to Admin**: Click "Admin" in navigation or go to `/admin`
3. **Verify Access**: You should see admin dashboard

**Note**: Admin access requires special permissions in the database.

---

## 📚 Language Management

### Viewing All Languages

1. **Go to Admin Dashboard**: Navigate to `/admin`
2. **Click "Languages"**: Or go to `/admin/languages`
3. **View List**: See all languages (active and inactive)

### Activating a Language

1. **Go to Admin → Languages**
2. **Find the language** you want to activate
3. **Toggle the switch** to "Active" (green)
4. **Language is now visible** to users

**Impact**: Once activated, the language appears in:
- Languages page (`/learn`)
- User course selection
- Public API endpoints

### Deactivating a Language

1. **Go to Admin → Languages**
2. **Find the language** you want to deactivate
3. **Toggle the switch** to "Inactive" (grey)
4. **Language is hidden** from users

**Impact**: Deactivated languages:
- Don't appear in language selection
- Hidden from public API
- Users with this language can still access it (existing courses)
- New users cannot select it

**Warning**: Deactivating a language hides it from new users but doesn't remove existing user progress.

---

## 👥 User Management

### Viewing Users

1. **Go to Admin Dashboard**: Navigate to `/admin`
2. **Click "Users"**: View user list (if available)
3. **Use Prisma Studio**: For detailed user management

### Managing Users via Prisma Studio

1. **Start Prisma Studio**: Run `npm run db:studio`
2. **Access Studio**: Go to http://localhost:5555
3. **Navigate to Users**: Click "User" model
4. **View/Edit Users**: Manage user data

### Creating Admin Users

**Via Database**:
1. **Identify User ID**: Get the user's ID from database
2. **Create AdminUser Record**:
   ```sql
   INSERT INTO admin_users (user_id, role, created_at, updated_at)
   VALUES ('user-id-here', 'moderator', NOW(), NOW());
   ```

**Via Prisma Studio**:
1. **Open AdminUser model**
2. **Add new record**
3. **Set user_id** to the user's ID
4. **Set role** (moderator, admin, etc.)

---

## 📊 Content Management

### Managing Lessons

**Current Setup**: Lessons are managed via database (Prisma Studio)

**Future**: Admin UI for lesson management may be added.

**Via Prisma Studio**:
1. **Start Prisma Studio**: `npm run db:studio`
2. **Navigate to Lessons**: Click "Lesson" model
3. **View/Edit/Create**: Manage lesson content

### Managing Exercises

**Via Prisma Studio**:
1. **Open Exercise model**
2. **View exercises**: See all exercises
3. **Edit exercises**: Modify question, answers, etc.
4. **Create exercises**: Add new exercises to lessons

### Managing Units

**Via Prisma Studio**:
1. **Open Unit model**
2. **View units**: See all units by language
3. **Edit units**: Modify title, description, order
4. **Create units**: Add new units to languages

---

## 🏆 Leaderboard Management

### Recalculating Leaderboard

**Manual Recalculation**:
1. **Go to Admin Dashboard**
2. **Click "Recalculate Leaderboard"** (if available)
3. **Or use API**: `POST /api/admin/leaderboard/recalculate`
4. **Wait for completion**: Process may take time

**Automated Recalculation**:
- Leaderboard recalculates automatically via cron job
- Scheduled: Daily at midnight (UTC)
- Endpoint: `/api/cron/leaderboard/recalculate`

### Viewing Leaderboard Data

**Via Prisma Studio**:
1. **Open LeaderboardEntry model**
2. **View entries**: See all leaderboard entries
3. **Filter by period**: Daily, weekly, monthly
4. **View rankings**: See user rankings

---

## 📈 Analytics & Monitoring

### Viewing Analytics

**Dashboard Analytics**:
1. **Go to Admin Dashboard**
2. **View Analytics Section** (if available)
3. **See metrics**: Users, lessons, XP, etc.

**Via Database**:
1. **Use Prisma Studio**: View raw data
2. **Query database**: Run custom queries
3. **Export data**: Export for analysis

### Monitoring Errors

**Sentry Dashboard** (if configured):
1. **Access Sentry**: Go to sentry.io
2. **View Errors**: See all errors and exceptions
3. **Filter by environment**: Production, development
4. **Set up alerts**: Get notified of critical errors

### Performance Monitoring

**Sentry Performance** (if configured):
1. **View Performance Tab**: See Core Web Vitals
2. **API Performance**: Check API response times
3. **Slow Queries**: Identify slow database queries
4. **User Experience**: Track user experience metrics

---

## 🗄️ Database Management

### Accessing Database

**Via Prisma Studio** (Recommended):
1. **Run**: `npm run db:studio`
2. **Access**: http://localhost:5555
3. **Browse data**: View all tables and records
4. **Edit data**: Modify records directly

**Via Database Connection**:
- Use database credentials from `.env`
- Connect with database client (pgAdmin, DBeaver, etc.)
- Run SQL queries directly

### Running Migrations

**Creating Migration**:
```bash
npm run db:migrate
```

**Applying Migration**:
```bash
npm run db:migrate
```

**Pushing Schema** (Development only):
```bash
npm run db:push
```

**⚠️ Warning**: Only use `db:push` in development. Use migrations in production.

### Database Backup

**Before Making Changes**:
1. **Backup database**: Use database backup tool
2. **Export data**: Export critical tables
3. **Document changes**: Note what you're changing

**Backup Methods**:
- Database provider backup (Supabase, etc.)
- `pg_dump` for PostgreSQL
- Database GUI export feature

---

## 🔧 System Configuration

### Environment Variables

**Key Environment Variables**:
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL
- `SENTRY_DSN`: Error tracking (optional)
- `LOG_LEVEL`: Logging level (optional)

**Managing Environment Variables**:
1. **Development**: Edit `.env` file
2. **Production**: Set in deployment platform (Vercel, etc.)
3. **Never commit**: `.env` should be in `.gitignore`

### Feature Flags

**Language Activation**: Toggle languages on/off

**Future Features**: Additional feature flags may be added.

---

## 📝 Content Guidelines

### Adding New Languages

**Steps**:
1. **Create Language Record**: Add to `languages` table
2. **Set Properties**:
   - `code`: Language code (e.g., "kpelle")
   - `name`: English name (e.g., "Kpelle")
   - `nativeName`: Native name
   - `flagEmoji`: Flag emoji (e.g., "🇱🇷")
   - `isActive`: Set to `true` to activate
3. **Create Units**: Add units for the language
4. **Create Lessons**: Add lessons to units
5. **Create Exercises**: Add exercises to lessons

### Adding New Lessons

**Structure**:
1. **Belong to Unit**: Lesson must be in a unit
2. **Set Order**: Order within unit
3. **Set Type**: Practice, story, etc.
4. **Set XP Reward**: Default 10 XP
5. **Create Exercises**: Add exercises to lesson

### Content Best Practices

1. **Progressive Difficulty**: Start easy, increase difficulty
2. **Clear Instructions**: Make exercises clear
3. **Grammar Tips**: Include helpful grammar explanations
4. **Cultural Context**: Add cultural information where relevant
5. **Audio Support**: Include audio when possible

---

## 🚨 Troubleshooting

### Language Won't Activate

**Solutions**:
1. **Check database**: Verify language record exists
2. **Verify toggle**: Make sure toggle is set correctly
3. **Clear cache**: Clear application cache
4. **Check API**: Verify API endpoint is working
5. **Database sync**: Ensure database is in sync

### Can't Access Admin Dashboard

**Solutions**:
1. **Verify admin status**: Check AdminUser record exists
2. **Check permissions**: Verify role permissions
3. **Sign out and in**: Refresh session
4. **Check database**: Verify user is linked to AdminUser
5. **Contact developer**: If access still denied

### Changes Not Reflecting

**Solutions**:
1. **Refresh page**: Reload to see changes
2. **Clear cache**: Clear browser/application cache
3. **Wait for sync**: Changes may take time to sync
4. **Check database**: Verify changes in database
5. **Restart app**: Restart application server

---

## 🔒 Security Best Practices

### Admin Account Security

1. **Strong Passwords**: Use complex passwords
2. **Two-Factor Auth**: Enable if available
3. **Limit Access**: Only grant admin to trusted users
4. **Monitor Activity**: Review admin actions regularly
5. **Rotate Credentials**: Change passwords periodically

### Data Protection

1. **Backup Regularly**: Regular database backups
2. **Encrypt Sensitive Data**: Encrypt user data at rest
3. **Access Control**: Limit database access
4. **Audit Logs**: Keep logs of admin actions
5. **Security Updates**: Keep software updated

---

## 📊 Reporting

### User Reports

**Via Prisma Studio**:
1. **Query User table**: Get user data
2. **Export data**: Export for reporting
3. **Analyze metrics**: XP, progress, etc.

### Content Reports

**Lessons**: View lesson completion rates
**Exercises**: View exercise accuracy
**Languages**: View language popularity

---

## 🔗 Useful Commands

### Database Commands

```bash
# Start Prisma Studio
npm run db:studio

# Run migrations
npm run db:migrate

# Push schema (dev only)
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Check types
npm run type-check
```

---

## 📞 Support

### Developer Support

For technical issues:
- **Check logs**: Review application logs
- **Database issues**: Check Prisma Studio
- **Code issues**: Review error messages
- **Contact developer**: For persistent issues

---

**Last Updated**: Current date


