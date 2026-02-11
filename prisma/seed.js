const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const email = process.env.SEED_USER_EMAIL || 'demo@kola.local';
  const password = process.env.SEED_USER_PASSWORD || 'password123';

  const hashed = await bcrypt.hash(password, 10);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: 'Demo User', password: hashed } });
    console.log('Created user:', user.id, user.email);
  } else {
    console.log('User exists:', user.id, user.email);
  }

  // Seed achievements
  const achievements = [
    { code: 'first-lesson', name: 'First Lesson', description: 'Complete your first lesson', xpReward: 10, category: 'milestone' },
    { code: 'five-words', name: 'Five Words', description: 'Learn 5 new words', xpReward: 20, category: 'milestone' },
    { code: 'streak-3', name: '3-Day Streak', description: 'Practice 3 days in a row', xpReward: 15, category: 'streak' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {},
      create: {
        code: a.code,
        name: a.name,
        description: a.description,
        xpReward: a.xpReward,
        category: a.category,
      },
    });
  }

  // Unlock the first achievement for the user
  const first = await prisma.achievement.findUnique({ where: { code: 'first-lesson' } });
  if (first) {
    const exists = await prisma.userAchievement.findFirst({ where: { userId: user.id, achievementId: first.id } });
    if (!exists) {
      await prisma.userAchievement.create({ data: { userId: user.id, achievementId: first.id } });
      console.log('Unlocked achievement for user:', first.code);
    }
  }

  // Create a user streak
  let streak = await prisma.userStreak.findFirst({ where: { userId: user.id } });
  if (!streak) {
    streak = await prisma.userStreak.create({ data: { userId: user.id, currentStreak: 2, longestStreak: 5, totalDays: 7 } });
    console.log('Created streak for user');
  }

  // Seed some vocabulary and flashcard progress
  const language = await prisma.language.findFirst();
  if (language) {
    const vocab = await prisma.vocabulary.create({ data: { languageId: language.id, word: 'salaam', translation: 'hello', difficulty: 'easy' } });
    await prisma.flashcardProgress.upsert({
      where: { userId_vocabularyId: { userId: user.id, vocabularyId: vocab.id } },
      update: {},
      create: { userId: user.id, vocabularyId: vocab.id, easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date() },
    });
    console.log('Seeded vocab + flashcard progress');
  }

  await prisma.$disconnect();
  console.log('Seeding complete. Demo login:', email, '/', password);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
