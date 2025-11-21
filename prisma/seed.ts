import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Liberian Languages
  const languages = [
    {
      code: "kpelle",
      name: "Kpelle",
      nativeName: "Kpɛlɛwoo",
      flagEmoji: "🇱🇷",
      description: "Kpelle is the most widely spoken language in Liberia, used by the Kpelle people.",
    },
    {
      code: "bassa",
      name: "Bassa",
      nativeName: "Kru",
      flagEmoji: "🇱🇷",
      description: "Bassa is spoken by the Bassa people in central Liberia.",
    },
    {
      code: "gio",
      name: "Gio",
      nativeName: "Dan",
      flagEmoji: "🇱🇷",
      description: "Gio (Dan) is spoken in northeastern Liberia.",
    },
    {
      code: "mano",
      name: "Mano",
      nativeName: "Mano",
      flagEmoji: "🇱🇷",
      description: "Mano is spoken in northern Liberia.",
    },
    {
      code: "grebo",
      name: "Grebo",
      nativeName: "Grebo",
      flagEmoji: "🇱🇷",
      description: "Grebo is spoken in southeastern Liberia.",
    },
    {
      code: "kru",
      name: "Kru",
      nativeName: "Kru",
      flagEmoji: "🇱🇷",
      description: "Kru is spoken in southeastern Liberia.",
    },
    {
      code: "vai",
      name: "Vai",
      nativeName: "Vai",
      flagEmoji: "🇱🇷",
      description: "Vai is spoken in northwestern Liberia and has its own writing system.",
    },
    {
      code: "gola",
      name: "Gola",
      nativeName: "Gola",
      flagEmoji: "🇱🇷",
      description: "Gola is spoken in western Liberia.",
    },
    {
      code: "kissi",
      name: "Kissi",
      nativeName: "Kisi",
      flagEmoji: "🇱🇷",
      description: "Kissi is spoken in northern Liberia.",
    },
    {
      code: "loma",
      name: "Loma",
      nativeName: "Loma",
      flagEmoji: "🇱🇷",
      description: "Loma is spoken in northern Liberia.",
    },
  ];

  for (const langData of languages) {
    await prisma.language.upsert({
      where: { code: langData.code },
      update: langData,
      create: langData,
    });
  }

  console.log("✅ Languages created");

  // Create test users
  const hashedPassword = await hash("password123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@volo.test" },
    update: {},
    create: {
      email: "admin@volo.test",
      name: "Admin User",
      password: hashedPassword,
      totalXP: 100,
      currentStreak: 5,
      longestStreak: 10,
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: "test@volo.test" },
    update: {},
    create: {
      email: "test@volo.test",
      name: "Test User",
      password: hashedPassword,
      totalXP: 50,
      currentStreak: 2,
    },
  });

  // Create admin role for admin user
  await prisma.adminUser.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: "admin",
    },
  });

  console.log("✅ Test users created");

  // Create Kpelle sample content - 2 Units, 3 Lessons each
  const kpelle = await prisma.language.findUnique({
    where: { code: "kpelle" },
  });

  if (kpelle) {
    // ========================================================================
    // UNIT 1: Greetings and Basics
    // ========================================================================
    const unit1 = await prisma.unit.upsert({
      where: { id: "kpelle-unit-1" },
      update: {},
      create: {
        id: "kpelle-unit-1",
        languageId: kpelle.id,
        title: "Greetings and Basics",
        description: "Learn how to greet people and introduce yourself in Kpelle",
        order: 1,
        isLocked: false,
        difficulty: "beginner",
      },
    });

    // Lesson 1.1: Basic Greetings
    const lesson1_1 = await prisma.lesson.upsert({
      where: { id: "kpelle-lesson-1-1" },
      update: {},
      create: {
        id: "kpelle-lesson-1-1",
        unitId: unit1.id,
        title: "Basic Greetings",
        description: "Learn common greeting words in Kpelle",
        order: 1,
        type: "practice",
        xpReward: 10,
      },
    });

    // Exercise 1.1.1: Multiple Choice
    const ex1_1_1 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-1-1" },
      update: {},
      create: {
        id: "kpelle-ex-1-1-1",
        lessonId: lesson1_1.id,
        type: "multiple_choice",
        question: "How do you say 'Hello' in Kpelle?",
        correctAnswer: "I ni su",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex1_1_1.id, [
      { text: "I ni su", isCorrect: true },
      { text: "Wo su", isCorrect: false },
      { text: "I ni taa", isCorrect: false },
      { text: "I ni ma", isCorrect: false },
    ]);

    // Exercise 1.1.2: Translation
    await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-1-2" },
      update: {},
      create: {
        id: "kpelle-ex-1-1-2",
        lessonId: lesson1_1.id,
        type: "translation",
        question: "Translate to Kpelle: 'How are you?'",
        correctAnswer: "I ni taa",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    // Exercise 1.1.3: Multiple Choice
    const ex1_1_3 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-1-3" },
      update: {},
      create: {
        id: "kpelle-ex-1-1-3",
        lessonId: lesson1_1.id,
        type: "multiple_choice",
        question: "What does 'I ni ma' mean?",
        correctAnswer: "Goodbye",
        order: 3,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex1_1_3.id, [
      { text: "Hello", isCorrect: false },
      { text: "Goodbye", isCorrect: true },
      { text: "Thank you", isCorrect: false },
      { text: "Please", isCorrect: false },
    ]);

    // Lesson 1.2: Common Phrases
    const lesson1_2 = await prisma.lesson.upsert({
      where: { id: "kpelle-lesson-1-2" },
      update: {},
      create: {
        id: "kpelle-lesson-1-2",
        unitId: unit1.id,
        title: "Common Phrases",
        description: "Learn everyday phrases for conversation",
        order: 2,
        type: "practice",
        xpReward: 10,
      },
    });

    // Exercise 1.2.1: Multiple Choice
    const ex1_2_1 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-2-1" },
      update: {},
      create: {
        id: "kpelle-ex-1-2-1",
        lessonId: lesson1_2.id,
        type: "multiple_choice",
        question: "How do you say 'Thank you' in Kpelle?",
        correctAnswer: "I ba pele",
        grammarTip: "In Kpelle, 'I ba pele' is a polite expression of gratitude. 'I' means 'you' or indicates the subject. 'ba pele' means 'thank you'. This phrase is commonly used in both formal and informal settings.",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex1_2_1.id, [
      { text: "I ba pele", isCorrect: true },
      { text: "I ni su", isCorrect: false },
      { text: "Wo su", isCorrect: false },
      { text: "I ni ma", isCorrect: false },
    ]);

    // Exercise 1.2.2: Translation
    await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-2-2" },
      update: {},
      create: {
        id: "kpelle-ex-1-2-2",
        lessonId: lesson1_2.id,
        type: "translation",
        question: "Translate to Kpelle: 'Please'",
        correctAnswer: "Kɔ kɔ",
        grammarTip: "'Kɔ kɔ' is the Kpelle word for 'please'. It can be used at the beginning or end of a request to make it more polite. Unlike English, Kpelle politeness markers often involve repetition.",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    // Exercise 1.2.3: Match (simulated with multiple choice)
    const ex1_2_3 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-2-3" },
      update: {},
      create: {
        id: "kpelle-ex-1-2-3",
        lessonId: lesson1_2.id,
        type: "match",
        question: "Match the phrase: 'Excuse me'",
        correctAnswer: "Wo le",
        order: 3,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    await createExerciseOptions(ex1_2_3.id, [
      { text: "Wo le", isCorrect: true },
      { text: "I ni su", isCorrect: false },
      { text: "I ba pele", isCorrect: false },
      { text: "Kɔ kɔ", isCorrect: false },
    ]);

    // Lesson 1.3: Introducing Yourself
    const lesson1_3 = await prisma.lesson.upsert({
      where: { id: "kpelle-lesson-1-3" },
      update: {},
      create: {
        id: "kpelle-lesson-1-3",
        unitId: unit1.id,
        title: "Introducing Yourself",
        description: "Learn how to introduce yourself and ask for names",
        order: 3,
        type: "practice",
        xpReward: 15,
      },
    });

    // Exercise 1.3.1: Multiple Choice
    const ex1_3_1 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-3-1" },
      update: {},
      create: {
        id: "kpelle-ex-1-3-1",
        lessonId: lesson1_3.id,
        type: "multiple_choice",
        question: "How do you say 'My name is...' in Kpelle?",
        correctAnswer: "Nɛɛ ɓɛɛ...",
        order: 1,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    await createExerciseOptions(ex1_3_1.id, [
      { text: "Nɛɛ ɓɛɛ...", isCorrect: true },
      { text: "Wo ɓɛɛ...", isCorrect: false },
      { text: "I ni su", isCorrect: false },
      { text: "Wo su", isCorrect: false },
    ]);

    // Exercise 1.3.2: Translation
    await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-3-2" },
      update: {},
      create: {
        id: "kpelle-ex-1-3-2",
        lessonId: lesson1_3.id,
        type: "translation",
        question: "Translate to Kpelle: 'What is your name?'",
        correctAnswer: "Wo ɓɛɛ li ma?",
        order: 2,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    // Exercise 1.3.3: Multiple Choice
    const ex1_3_3 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-1-3-3" },
      update: {},
      create: {
        id: "kpelle-ex-1-3-3",
        lessonId: lesson1_3.id,
        type: "multiple_choice",
        question: "How do you respond to 'How are you?'",
        correctAnswer: "Nɛɛ ɓɛɛ mu",
        order: 3,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    await createExerciseOptions(ex1_3_3.id, [
      { text: "Nɛɛ ɓɛɛ mu", isCorrect: true },
      { text: "I ni su", isCorrect: false },
      { text: "I ba pele", isCorrect: false },
      { text: "Wo su", isCorrect: false },
    ]);

    // ========================================================================
    // UNIT 2: Family and Numbers
    // ========================================================================
    const unit2 = await prisma.unit.upsert({
      where: { id: "kpelle-unit-2" },
      update: {},
      create: {
        id: "kpelle-unit-2",
        languageId: kpelle.id,
        title: "Family and Numbers",
        description: "Learn to talk about family and count from 1 to 10",
        order: 2,
        isLocked: true, // Locked until Unit 1 is completed
        difficulty: "beginner",
      },
    });

    // Lesson 2.1: Family Members
    const lesson2_1 = await prisma.lesson.upsert({
      where: { id: "kpelle-lesson-2-1" },
      update: {},
      create: {
        id: "kpelle-lesson-2-1",
        unitId: unit2.id,
        title: "Family Members",
        description: "Learn words for family members",
        order: 1,
        type: "practice",
        xpReward: 10,
      },
    });

    // Exercise 2.1.1: Multiple Choice
    const ex2_1_1 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-1-1" },
      update: {},
      create: {
        id: "kpelle-ex-2-1-1",
        lessonId: lesson2_1.id,
        type: "multiple_choice",
        question: "How do you say 'Mother' in Kpelle?",
        correctAnswer: "Na",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex2_1_1.id, [
      { text: "Na", isCorrect: true },
      { text: "Ba", isCorrect: false },
      { text: "Wo", isCorrect: false },
      { text: "Su", isCorrect: false },
    ]);

    // Exercise 2.1.2: Multiple Choice
    const ex2_1_2 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-1-2" },
      update: {},
      create: {
        id: "kpelle-ex-2-1-2",
        lessonId: lesson2_1.id,
        type: "multiple_choice",
        question: "How do you say 'Father' in Kpelle?",
        correctAnswer: "Ba",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex2_1_2.id, [
      { text: "Ba", isCorrect: true },
      { text: "Na", isCorrect: false },
      { text: "Wo", isCorrect: false },
      { text: "Mu", isCorrect: false },
    ]);

    // Exercise 2.1.3: Translation
    await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-1-3" },
      update: {},
      create: {
        id: "kpelle-ex-2-1-3",
        lessonId: lesson2_1.id,
        type: "translation",
        question: "Translate to Kpelle: 'Sister'",
        correctAnswer: "Nɛɛŋa",
        order: 3,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    // Lesson 2.2: Numbers 1-5
    const lesson2_2 = await prisma.lesson.upsert({
      where: { id: "kpelle-lesson-2-2" },
      update: {},
      create: {
        id: "kpelle-lesson-2-2",
        unitId: unit2.id,
        title: "Numbers 1-5",
        description: "Learn to count from one to five",
        order: 2,
        type: "practice",
        xpReward: 10,
      },
    });

    // Exercise 2.2.1: Multiple Choice
    const ex2_2_1 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-2-1" },
      update: {},
      create: {
        id: "kpelle-ex-2-2-1",
        lessonId: lesson2_2.id,
        type: "multiple_choice",
        question: "How do you say 'One' in Kpelle?",
        correctAnswer: "Foloŋ",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex2_2_1.id, [
      { text: "Foloŋ", isCorrect: true },
      { text: "Fela", isCorrect: false },
      { text: "Feela", isCorrect: false },
      { text: "Fe", isCorrect: false },
    ]);

    // Exercise 2.2.2: Translation
    await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-2-2" },
      update: {},
      create: {
        id: "kpelle-ex-2-2-2",
        lessonId: lesson2_2.id,
        type: "translation",
        question: "Translate to Kpelle: 'Three'",
        correctAnswer: "Feela",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    // Exercise 2.2.3: Multiple Choice
    const ex2_2_3 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-2-3" },
      update: {},
      create: {
        id: "kpelle-ex-2-2-3",
        lessonId: lesson2_2.id,
        type: "multiple_choice",
        question: "What number is 'Fela'?",
        correctAnswer: "Two",
        order: 3,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(ex2_2_3.id, [
      { text: "One", isCorrect: false },
      { text: "Two", isCorrect: true },
      { text: "Three", isCorrect: false },
      { text: "Four", isCorrect: false },
    ]);

    // Lesson 2.3: Numbers 6-10
    const lesson2_3 = await prisma.lesson.upsert({
      where: { id: "kpelle-lesson-2-3" },
      update: {},
      create: {
        id: "kpelle-lesson-2-3",
        unitId: unit2.id,
        title: "Numbers 6-10",
        description: "Learn to count from six to ten",
        order: 3,
        type: "practice",
        xpReward: 15,
      },
    });

    // Exercise 2.3.1: Multiple Choice
    const ex2_3_1 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-3-1" },
      update: {},
      create: {
        id: "kpelle-ex-2-3-1",
        lessonId: lesson2_3.id,
        type: "multiple_choice",
        question: "How do you say 'Six' in Kpelle?",
        correctAnswer: "Feela-foloŋ",
        order: 1,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    await createExerciseOptions(ex2_3_1.id, [
      { text: "Feela-foloŋ", isCorrect: true },
      { text: "Fela-foloŋ", isCorrect: false },
      { text: "Foloŋ-fela", isCorrect: false },
      { text: "Feela-fela", isCorrect: false },
    ]);

    // Exercise 2.3.2: Translation
    await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-3-2" },
      update: {},
      create: {
        id: "kpelle-ex-2-3-2",
        lessonId: lesson2_3.id,
        type: "translation",
        question: "Translate to Kpelle: 'Ten'",
        correctAnswer: "Feela-feela",
        order: 2,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    // Exercise 2.3.3: Multiple Choice
    const ex2_3_3 = await prisma.exercise.upsert({
      where: { id: "kpelle-ex-2-3-3" },
      update: {},
      create: {
        id: "kpelle-ex-2-3-3",
        lessonId: lesson2_3.id,
        type: "multiple_choice",
        question: "What number is 'Fela-feela'?",
        correctAnswer: "Eight",
        order: 3,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    await createExerciseOptions(ex2_3_3.id, [
      { text: "Six", isCorrect: false },
      { text: "Seven", isCorrect: false },
      { text: "Eight", isCorrect: true },
      { text: "Nine", isCorrect: false },
    ]);

    console.log("✅ Kpelle sample content created (2 units, 3 lessons each)");

    // Create a sample story lesson for Kpelle
    const storyLesson = await prisma.lesson.upsert({
      where: { id: "kpelle-story-1" },
      update: {},
      create: {
        id: "kpelle-story-1",
        unitId: unit1.id,
        title: "A Day in Monrovia",
        description: `Kpɛlɛwoo! Mɛn nɛɛ ɓɛɛ James. Mɛn ɓɛɛ Monrovia la.

I ni taa! Mɛn ɓɛɛ tɔɔ tɔɔ kpɛlɛ. Wo tɔɔ tɔɔ kpɛlɛ li ma?

Mɛn ɓɛɛ kpɛlɛwoo la ni su. Wo ni taa ma? Mɛn ɓɛɛ mu.

I ni ma! Mɛn ɓɛɛ ba pele.`,
        order: 4,
        type: "story",
        xpReward: 20,
      },
    });

    // Add comprehension questions for the story
    const storyEx1 = await prisma.exercise.upsert({
      where: { id: "kpelle-story-ex-1" },
      update: {},
      create: {
        id: "kpelle-story-ex-1",
        lessonId: storyLesson.id,
        type: "multiple_choice",
        question: "What is the main character's name?",
        correctAnswer: "James",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(storyEx1.id, [
      { text: "James", isCorrect: true },
      { text: "John", isCorrect: false },
      { text: "Mary", isCorrect: false },
      { text: "Sarah", isCorrect: false },
    ]);

    const storyEx2 = await prisma.exercise.upsert({
      where: { id: "kpelle-story-ex-2" },
      update: {},
      create: {
        id: "kpelle-story-ex-2",
        lessonId: storyLesson.id,
        type: "multiple_choice",
        question: "Where does the story take place?",
        correctAnswer: "Monrovia",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(storyEx2.id, [
      { text: "Monrovia", isCorrect: true },
      { text: "Gbarnga", isCorrect: false },
      { text: "Buchanan", isCorrect: false },
      { text: "Kakata", isCorrect: false },
    ]);

    const storyEx3 = await prisma.exercise.upsert({
      where: { id: "kpelle-story-ex-3" },
      update: {},
      create: {
        id: "kpelle-story-ex-3",
        lessonId: storyLesson.id,
        type: "translation",
        question: "What greeting is used in the story?",
        correctAnswer: "Kpɛlɛwoo",
        order: 3,
        xpReward: 5,
        difficulty: "medium",
      },
    });

    console.log("✅ Kpelle story lesson created");
  }

  // Create Bassa sample content
  const bassa = await prisma.language.findUnique({
    where: { code: "bassa" },
  });

  if (bassa) {
    const bassaUnit1 = await prisma.unit.upsert({
      where: { id: "bassa-unit-1" },
      update: {},
      create: {
        id: "bassa-unit-1",
        languageId: bassa.id,
        title: "Greetings and Basics",
        description: "Learn basic greetings in Bassa",
        order: 1,
        isLocked: false,
        difficulty: "beginner",
      },
    });

    const bassaLesson1 = await prisma.lesson.upsert({
      where: { id: "bassa-lesson-1-1" },
      update: {},
      create: {
        id: "bassa-lesson-1-1",
        unitId: bassaUnit1.id,
        title: "Basic Greetings",
        description: "Learn common greeting words in Bassa",
        order: 1,
        type: "practice",
        xpReward: 10,
      },
    });

    const bassaEx1 = await prisma.exercise.upsert({
      where: { id: "bassa-ex-1-1-1" },
      update: {},
      create: {
        id: "bassa-ex-1-1-1",
        lessonId: bassaLesson1.id,
        type: "multiple_choice",
        question: "How do you say 'Hello' in Bassa?",
        correctAnswer: "Tò",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(bassaEx1.id, [
      { text: "Tò", isCorrect: true },
      { text: "Boò", isCorrect: false },
      { text: "Sèè", isCorrect: false },
      { text: "Nà", isCorrect: false },
    ]);

    const bassaEx2 = await prisma.exercise.upsert({
      where: { id: "bassa-ex-1-1-2" },
      update: {},
      create: {
        id: "bassa-ex-1-1-2",
        lessonId: bassaLesson1.id,
        type: "translation",
        question: "Translate to Bassa: 'Thank you'",
        correctAnswer: "Boò",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    const bassaEx3 = await prisma.exercise.upsert({
      where: { id: "bassa-ex-1-1-3" },
      update: {},
      create: {
        id: "bassa-ex-1-1-3",
        lessonId: bassaLesson1.id,
        type: "multiple_choice",
        question: "What does 'Sèè' mean?",
        correctAnswer: "Goodbye",
        order: 3,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(bassaEx3.id, [
      { text: "Hello", isCorrect: false },
      { text: "Thank you", isCorrect: false },
      { text: "Goodbye", isCorrect: true },
      { text: "Please", isCorrect: false },
    ]);

    console.log("✅ Bassa sample content created");
  }

  // Create Gio sample content
  const gio = await prisma.language.findUnique({
    where: { code: "gio" },
  });

  if (gio) {
    const gioUnit1 = await prisma.unit.upsert({
      where: { id: "gio-unit-1" },
      update: {},
      create: {
        id: "gio-unit-1",
        languageId: gio.id,
        title: "Greetings and Basics",
        description: "Learn basic greetings in Gio (Dan)",
        order: 1,
        isLocked: false,
        difficulty: "beginner",
      },
    });

    const gioLesson1 = await prisma.lesson.upsert({
      where: { id: "gio-lesson-1-1" },
      update: {},
      create: {
        id: "gio-lesson-1-1",
        unitId: gioUnit1.id,
        title: "Basic Greetings",
        description: "Learn common greeting words in Gio",
        order: 1,
        type: "practice",
        xpReward: 10,
      },
    });

    const gioEx1 = await prisma.exercise.upsert({
      where: { id: "gio-ex-1-1-1" },
      update: {},
      create: {
        id: "gio-ex-1-1-1",
        lessonId: gioLesson1.id,
        type: "multiple_choice",
        question: "How do you say 'Hello' in Gio?",
        correctAnswer: "Sèè",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(gioEx1.id, [
      { text: "Sèè", isCorrect: true },
      { text: "Boò", isCorrect: false },
      { text: "Tò", isCorrect: false },
      { text: "Nà", isCorrect: false },
    ]);

    const gioEx2 = await prisma.exercise.upsert({
      where: { id: "gio-ex-1-1-2" },
      update: {},
      create: {
        id: "gio-ex-1-1-2",
        lessonId: gioLesson1.id,
        type: "translation",
        question: "Translate to Gio: 'Thank you'",
        correctAnswer: "Boò",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    console.log("✅ Gio sample content created");
  }

  // Create Mano sample content
  const mano = await prisma.language.findUnique({
    where: { code: "mano" },
  });

  if (mano) {
    const manoUnit1 = await prisma.unit.upsert({
      where: { id: "mano-unit-1" },
      update: {},
      create: {
        id: "mano-unit-1",
        languageId: mano.id,
        title: "Greetings and Basics",
        description: "Learn basic greetings in Mano",
        order: 1,
        isLocked: false,
        difficulty: "beginner",
      },
    });

    const manoLesson1 = await prisma.lesson.upsert({
      where: { id: "mano-lesson-1-1" },
      update: {},
      create: {
        id: "mano-lesson-1-1",
        unitId: manoUnit1.id,
        title: "Basic Greetings",
        description: "Learn common greeting words in Mano",
        order: 1,
        type: "practice",
        xpReward: 10,
      },
    });

    const manoEx1 = await prisma.exercise.upsert({
      where: { id: "mano-ex-1-1-1" },
      update: {},
      create: {
        id: "mano-ex-1-1-1",
        lessonId: manoLesson1.id,
        type: "multiple_choice",
        question: "How do you say 'Hello' in Mano?",
        correctAnswer: "Nà",
        order: 1,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    await createExerciseOptions(manoEx1.id, [
      { text: "Nà", isCorrect: true },
      { text: "Sèè", isCorrect: false },
      { text: "Boò", isCorrect: false },
      { text: "Tò", isCorrect: false },
    ]);

    const manoEx2 = await prisma.exercise.upsert({
      where: { id: "mano-ex-1-1-2" },
      update: {},
      create: {
        id: "mano-ex-1-1-2",
        lessonId: manoLesson1.id,
        type: "translation",
        question: "Translate to Mano: 'Thank you'",
        correctAnswer: "Boò",
        order: 2,
        xpReward: 5,
        difficulty: "easy",
      },
    });

    console.log("✅ Mano sample content created");
  }

  // Helper function to create exercise options
  async function createExerciseOptions(
    exerciseId: string,
    options: Array<{ text: string; isCorrect: boolean }>
  ) {
    for (let i = 0; i < options.length; i++) {
      await prisma.exerciseOption.upsert({
        where: { id: `${exerciseId}-opt-${i + 1}` },
        update: {},
        create: {
          id: `${exerciseId}-opt-${i + 1}`,
          exerciseId,
          text: options[i].text,
          isCorrect: options[i].isCorrect,
          order: i + 1,
        },
      });
    }
  }

  // Create Achievements
  const achievements = [
    {
      code: "first_lesson",
      name: "First Steps",
      description: "Complete your first lesson",
      icon: "🎉",
      xpReward: 10,
      category: "lesson",
    },
    {
      code: "streak_3",
      name: "On Fire",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      xpReward: 20,
      category: "streak",
    },
    {
      code: "streak_7",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "⚡",
      xpReward: 50,
      category: "streak",
    },
    {
      code: "streak_30",
      name: "Monthly Master",
      description: "Maintain a 30-day streak",
      icon: "💪",
      xpReward: 200,
      category: "streak",
    },
    {
      code: "perfect_10",
      name: "Perfect Score",
      description: "Get 100% correct on 10 exercises",
      icon: "⭐",
      xpReward: 30,
      category: "exercise",
    },
    {
      code: "xp_100",
      name: "Centurion",
      description: "Earn 100 XP",
      icon: "🏆",
      xpReward: 25,
      category: "special",
    },
  ];

  for (const achievementData of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievementData.code },
      update: achievementData,
      create: achievementData,
    });
  }

  console.log("✅ Achievements created");

  // Create Vocabulary for Kpelle
  if (kpelle) {
    const kpelleVocabulary = [
    {
      word: "Kpɛlɛwoo",
      translation: "Hello / Good morning",
      phonetic: "Kpɛlɛwoo",
      category: "greetings",
      difficulty: "easy",
    },
    {
      word: "I ni su",
      translation: "Thank you",
      phonetic: "I ni su",
      category: "greetings",
      difficulty: "easy",
    },
    {
      word: "Wo",
      translation: "You",
      phonetic: "Wo",
      category: "basic",
      difficulty: "easy",
    },
    {
      word: "Mɛn",
      translation: "I / Me",
      phonetic: "Mɛn",
      category: "basic",
      difficulty: "easy",
    },
    {
      word: "Foloŋ",
      translation: "One",
      phonetic: "Foloŋ",
      category: "numbers",
      difficulty: "easy",
    },
    {
      word: "Fela",
      translation: "Two",
      phonetic: "Fela",
      category: "numbers",
      difficulty: "easy",
    },
    {
      word: "Feela",
      translation: "Three",
      phonetic: "Feela",
      category: "numbers",
      difficulty: "easy",
    },
    {
      word: "Kpɛlɛ",
      translation: "Water",
      phonetic: "Kpɛlɛ",
      category: "food",
      difficulty: "medium",
    },
    {
      word: "Ni",
      translation: "Food",
      phonetic: "Ni",
      category: "food",
      difficulty: "easy",
    },
    {
      word: "Su",
      translation: "House",
      phonetic: "Su",
      category: "basic",
      difficulty: "easy",
    },
  ];

  for (const vocabData of kpelleVocabulary) {
    await prisma.vocabulary.upsert({
      where: {
        id: `kpelle-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `kpelle-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
        languageId: kpelle.id,
        word: vocabData.word,
        translation: vocabData.translation,
        phonetic: vocabData.phonetic,
        category: vocabData.category,
        difficulty: vocabData.difficulty,
      },
    });
  }

    console.log("✅ Kpelle vocabulary created");
  }

  // Create Bassa Vocabulary
  if (bassa) {
    const bassaVocabulary = [
      {
        word: "Tò",
        translation: "Hello",
        phonetic: "Tò",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Boò",
        translation: "Thank you",
        phonetic: "Boò",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Sèè",
        translation: "Goodbye",
        phonetic: "Sèè",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Mèn",
        translation: "I / Me",
        phonetic: "Mèn",
        category: "basic",
        difficulty: "easy",
      },
      {
        word: "Wò",
        translation: "You",
        phonetic: "Wò",
        category: "basic",
        difficulty: "easy",
      },
      {
        word: "Fóloŋ",
        translation: "One",
        phonetic: "Fóloŋ",
        category: "numbers",
        difficulty: "easy",
      },
      {
        word: "Fela",
        translation: "Two",
        phonetic: "Fela",
        category: "numbers",
        difficulty: "easy",
      },
      {
        word: "Feela",
        translation: "Three",
        phonetic: "Feela",
        category: "numbers",
        difficulty: "easy",
      },
    ];

    for (const vocabData of bassaVocabulary) {
      await prisma.vocabulary.upsert({
        where: {
          id: `bassa-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          id: `bassa-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
          languageId: bassa.id,
          word: vocabData.word,
          translation: vocabData.translation,
          phonetic: vocabData.phonetic,
          category: vocabData.category,
          difficulty: vocabData.difficulty,
        },
      });
    }

    console.log("✅ Bassa vocabulary created");
  }

  // Create Gio Vocabulary
  if (gio) {
    const gioVocabulary = [
      {
        word: "Sèè",
        translation: "Hello",
        phonetic: "Sèè",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Boò",
        translation: "Thank you",
        phonetic: "Boò",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Mèn",
        translation: "I / Me",
        phonetic: "Mèn",
        category: "basic",
        difficulty: "easy",
      },
      {
        word: "Wò",
        translation: "You",
        phonetic: "Wò",
        category: "basic",
        difficulty: "easy",
      },
      {
        word: "Fóloŋ",
        translation: "One",
        phonetic: "Fóloŋ",
        category: "numbers",
        difficulty: "easy",
      },
      {
        word: "Fela",
        translation: "Two",
        phonetic: "Fela",
        category: "numbers",
        difficulty: "easy",
      },
    ];

    for (const vocabData of gioVocabulary) {
      await prisma.vocabulary.upsert({
        where: {
          id: `gio-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          id: `gio-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
          languageId: gio.id,
          word: vocabData.word,
          translation: vocabData.translation,
          phonetic: vocabData.phonetic,
          category: vocabData.category,
          difficulty: vocabData.difficulty,
        },
      });
    }

    console.log("✅ Gio vocabulary created");
  }

  // Create Mano Vocabulary
  if (mano) {
    const manoVocabulary = [
      {
        word: "Nà",
        translation: "Hello",
        phonetic: "Nà",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Boò",
        translation: "Thank you",
        phonetic: "Boò",
        category: "greetings",
        difficulty: "easy",
      },
      {
        word: "Mèn",
        translation: "I / Me",
        phonetic: "Mèn",
        category: "basic",
        difficulty: "easy",
      },
      {
        word: "Wò",
        translation: "You",
        phonetic: "Wò",
        category: "basic",
        difficulty: "easy",
      },
      {
        word: "Fóloŋ",
        translation: "One",
        phonetic: "Fóloŋ",
        category: "numbers",
        difficulty: "easy",
      },
      {
        word: "Fela",
        translation: "Two",
        phonetic: "Fela",
        category: "numbers",
        difficulty: "easy",
      },
    ];

    for (const vocabData of manoVocabulary) {
      await prisma.vocabulary.upsert({
        where: {
          id: `mano-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          id: `mano-vocab-${vocabData.word.toLowerCase().replace(/\s+/g, "-")}`,
          languageId: mano.id,
          word: vocabData.word,
          translation: vocabData.translation,
          phonetic: vocabData.phonetic,
          category: vocabData.category,
          difficulty: vocabData.difficulty,
        },
      });
    }

    console.log("✅ Mano vocabulary created");
  }

  console.log("✅ All vocabulary created");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
