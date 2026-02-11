# Volo - Liberian Languages Learning Platform

A Duolingo-style language learning platform designed specifically for teaching Liberian local languages. Built with Next.js 14, TypeScript, TailwindCSS, and modern best practices.

## 🌍 Languages Supported

- **Kpelle** - Most widely spoken language in Liberia
- **Bassa** - Central Liberia
- **Gio** - Northeastern Liberia
- **Mano** - Northern Liberia
- **Grebo** - Southeastern Liberia
- **Kru** - Southeastern Liberia
- **Vai** - Northwestern Liberia (has own writing system)
- **Gola** - Western Liberia
- **Kissi** - Northern Liberia
- **Loma** - Northern Liberia

## ✨ Features

- **Interactive Lessons**: Multiple choice, translation, matching, and more exercise types
- **Gamification**: XP points, daily streaks, hearts (lives), achievements, and leaderboards
- **Progress Tracking**: Track learning progress across all languages
- **Admin Portal**: Content management system for adding lessons and exercises
- **Mobile Responsive**: Works beautifully on web and mobile devices
- **Accessibility**: WCAG AA compliant with keyboard navigation and ARIA labels

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **shadcn/ui** components
- **Framer Motion** for animations

### State Management
- **Zustand** for client state
- **React Query (TanStack Query)** for server state caching

### Backend & Database
- **Next.js API Routes** for REST API
- **Prisma ORM** with PostgreSQL
- **Supabase** for database hosting (PostgreSQL)

### Authentication
- **NextAuth.js** (JWT + OAuth support)
- Email/password authentication
- Google OAuth (optional)

### Testing & Quality
- **Jest** + **React Testing Library** for unit tests
- **ESLint** + **Prettier** for code quality
- **TypeScript** strict mode

### CI/CD
- **GitHub Actions** for automated testing and linting

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Volo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Optional: OAuth providers
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed database with sample data (10 languages + Kpelle lessons)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database

The project uses Prisma ORM with PostgreSQL. Key models include:

- `User`: User accounts and profiles
- `Language`: Supported languages
- `Unit`: Course units (groups of lessons)
- `Lesson`: Individual lessons
- `Exercise`: Practice exercises with multiple types
- `ExerciseOption`: Options for multiple choice/match exercises
- `UserProgress`: Track user's progress through lessons
- `UserXP`: XP earning history
- `Achievement`: Achievement definitions
- `LeaderboardEntry`: Leaderboard rankings

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database
npm run db:seed
```

## 📁 Project Structure

```
/Volo
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── learn/             # Language selection and lesson tree
│   │   └── [language]/    # Language-specific routes
│   │       └── lesson/    # Lesson pages
│   ├── practice/          # Practice mode
│   ├── leaderboard/       # Leaderboards
│   ├── settings/          # User settings
│   ├── admin/             # Admin portal
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── languages/     # Language endpoints
│   │   ├── lessons/       # Lesson endpoints
│   │   └── user/          # User endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── progress-bar.tsx
│   │   ├── chip.tsx
│   │   ├── avatar.tsx
│   │   └── __tests__/     # Component tests
│   └── providers.tsx      # App providers
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── utils.ts           # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── react-query.tsx    # React Query provider
│   ├── queries/           # React Query hooks
│   │   ├── languages.ts
│   │   ├── lessons.ts
│   │   ├── user.ts
│   │   └── leaderboard.ts
│   └── store/             # Zustand stores
│       ├── use-user-store.ts
│       ├── use-learning-store.ts
│       └── use-ui-store.ts
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/
│   └── assets/            # Static assets (images, audio)
├── tests/                 # Test files
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## 🎨 Design System

### Brand Colors

- **Primary (Liberian Red)**: `#D63A3A` - Main CTA buttons
- **Secondary (Deep Blue)**: `#1B3F91` - Secondary actions
- **Success (Palm Green)**: `#3A9D5A` - Success states
- **Accent (Sun Gold)**: `#F3C24F` - Highlights and accents

### Neutrals

- **Off-White**: `#F7F4EF` - Background
- **Charcoal**: `#2E2D2C` - Primary text
- **Soft Gray**: `#E8E6E1` - Borders and subtle elements

### Typography

- **Font**: Inter (Google Fonts)
- **Base Size**: 16px
- **Headings**: Bold

### Components

All UI components are in `components/ui/`:
- `Button` - Primary action buttons
- `Card` - Content containers
- `Input` - Form inputs with validation
- `Modal` - Dialog modals
- `ProgressBar` - Progress indicators
- `Chip` - Tag/chip components
- `Avatar` - User avatars

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Playwright E2E (Browser)

1. Install Playwright browsers (one-time):
```bash
npm run playwright:install
```

2. Run the E2E suite:
```bash
npx playwright test
```

CI notes — required secrets

- `NEXTAUTH_SECRET` (required): used to sign NextAuth JWTs; CI will fail if missing.
- `DATABASE_URL` (required): connection string for the test database.

We include a pre-flight GitHub Action that fails fast when `NEXTAUTH_SECRET` is not configured in the repository secrets. Ensure those are added in the repository Settings → Secrets before running the E2E workflow.

### Test Structure

- Component tests: `components/**/__tests__/**/*.test.tsx`
- Unit tests: `lib/**/__tests__/**/*.test.ts`
- Example tests provided for Button, ProgressBar, and utils

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # Type check with TypeScript

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:ci          # CI mode

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

## 🔐 Authentication

### Sign Up / Login

1. Visit `/auth/signup` to create an account
2. Visit `/auth/signin` to sign in
3. OAuth providers (Google) can be configured in `.env`

### Creating Admin Users

After signing up:

1. **Using Prisma Studio**:
   ```bash
   npm run db:studio
   ```
   - Go to "AdminUser" table
   - Create new record with your `userId` and `role: "admin"`

2. **Using SQL**:
   ```sql
   INSERT INTO admin_users (id, user_id, role, created_at, updated_at)
   VALUES (gen_random_uuid(), 'your-user-id', 'admin', NOW(), NOW());
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - Optional OAuth credentials

3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-secret-key"
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Database Setup in Production

1. Use Supabase, Railway, or any PostgreSQL provider
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Seed initial data:
   ```bash
   npm run db:seed
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Languages
- `GET /api/languages` - Get all languages
- `GET /api/languages/[code]` - Get single language
- `GET /api/languages/[code]/tree` - Get language with units/lessons

### Lessons
- `GET /api/lessons/[id]` - Get lesson with exercises
- `POST /api/lessons/[id]/complete` - Complete lesson

### User
- `GET /api/user` - Get current user
- `GET /api/user/progress` - Get user progress
- `GET /api/user/xp` - Get XP history
- `GET /api/user/achievements` - Get achievements

### Leaderboard
- `GET /api/leaderboard?period=weekly&languageId=...` - Get leaderboard

## 🎯 Sample Data

The seed script creates:

- **10 Liberian languages** (Kpelle, Bassa, Gio, etc.)
- **Kpelle content**: 2 units, 3 lessons each
  - Unit 1: Greetings and Basics
    - Lesson 1: Basic Greetings (3 exercises)
    - Lesson 2: Common Phrases (3 exercises)
    - Lesson 3: Introducing Yourself (3 exercises)
  - Unit 2: Family and Numbers
    - Lesson 1: Family Members (3 exercises)
    - Lesson 2: Numbers 1-5 (3 exercises)
    - Lesson 3: Numbers 6-10 (3 exercises)
- **6 achievements** (First Steps, Streak achievements, etc.)
- **Test users** (admin@volo.test, test@volo.test - password: password123)

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct in `.env`
- Check if PostgreSQL is running (if local)
- For Supabase: Ensure IP restrictions are disabled for development

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Port Already in Use

```bash
PORT=3001 npm run dev
```

### Type Errors

```bash
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🗺️ Roadmap

- [ ] Additional exercise types (drag-drop, speaking, listening)
- [ ] Text-to-speech for Liberian languages
- [ ] Speech recognition for pronunciation practice
- [ ] AI-powered lesson generation
- [ ] Stories mode
- [ ] Grammar explanations
- [ ] Mobile app (React Native)
- [ ] Social features (friends, challenges)

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the project maintainers.

---

**Made with ❤️ for preserving Liberian languages** 🇱🇷
