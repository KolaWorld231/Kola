/**
 * Integration Tests - API Routes
 * 
 * Tests API routes for:
 * - Languages API
 * - User Courses API
 * - Lesson Completion API
 * - Language Activation API
 */

import { NextRequest } from "next/server";
import { GET as getLanguages } from "@/app/api/languages/route";
import { GET as getUserCourses } from "@/app/api/user/courses/route";
import { PATCH as patchLanguage } from "@/app/api/admin/languages/[id]/route";
import { POST as postAssessment } from "@/app/api/user/assessment/route";
import { POST as postLessonComplete } from "@/app/api/lessons/[id]/complete/route";
import { POST as postExerciseComplete } from "@/app/api/exercises/[id]/complete/route";

// Mock NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    language: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userProgress: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    adminUser: {
      findUnique: jest.fn(),
    },
    userSettings: {
      upsert: jest.fn(),
    },
    exercise: {
      findUnique: jest.fn(),
    },
    lesson: {
      findUnique: jest.fn(),
    },
    userXP: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

describe("API Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/languages", () => {
    it("should return active languages", async () => {
      const mockLanguages = [
        {
          id: "lang-1",
          code: "bassa",
          name: "Bassa",
          nativeName: "Basa",
          flagEmoji: "🇱🇷",
          description: "Bassa language",
          isActive: true,
        },
        {
          id: "lang-2",
          code: "kpelle",
          name: "Kpelle",
          nativeName: "Kpɛlɛ",
          flagEmoji: "🇱🇷",
          description: "Kpelle language",
          isActive: true,
        },
      ];

      (prisma.language.findMany as jest.Mock).mockResolvedValue(mockLanguages);

      const request = new NextRequest("http://localhost:3000/api/languages");
      const response = await getLanguages(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.languages).toHaveLength(2);
      expect(data.languages[0].code).toBe("bassa");
      expect(data.languages[1].code).toBe("kpelle");
      expect(prisma.language.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          nativeName: true,
          flagEmoji: true,
          description: true,
        },
        orderBy: { name: "asc" },
      });
    });

    it("should include cache headers", async () => {
      (prisma.language.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/languages");
      const response = await getLanguages(request);

      expect(response.headers.get("Cache-Control")).toBe(
        "public, s-maxage=1800, stale-while-revalidate=3600"
      );
    });

    it("should handle errors gracefully", async () => {
      (prisma.language.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost:3000/api/languages");
      const response = await getLanguages(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("GET /api/user/courses", () => {
    it("should return user's enrolled languages", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        selectedLanguageId: "lang-1",
      });
      (prisma.userProgress.findMany as jest.Mock).mockResolvedValue([
        {
          lesson: {
            unit: {
              languageId: "lang-2",
            },
          },
        },
      ]);
      (prisma.language.findMany as jest.Mock).mockResolvedValue([
        {
          id: "lang-1",
          code: "bassa",
          name: "Bassa",
          nativeName: "Basa",
          flagEmoji: "🇱🇷",
        },
        {
          id: "lang-2",
          code: "kpelle",
          name: "Kpelle",
          nativeName: "Kpɛlɛ",
          flagEmoji: "🇱🇷",
        },
      ]);

      const request = new NextRequest("http://localhost:3000/api/user/courses");
      const response = await getUserCourses(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.languages).toHaveLength(2);
      expect(data.selectedLanguageId).toBe("lang-1");
    });

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/user/courses");
      const response = await getUserCourses(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("PATCH /api/admin/languages/[id]", () => {
    it("should update language activation status", async () => {
      const mockSession = {
        user: { id: "admin-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({
        id: "admin-123",
        userId: "admin-123",
      });
      (prisma.language.findUnique as jest.Mock).mockResolvedValue({
        id: "lang-1",
        name: "Bassa",
        isActive: true,
      });
      (prisma.language.update as jest.Mock).mockResolvedValue({
        id: "lang-1",
        name: "Bassa",
        isActive: false,
      });

      const request = new NextRequest("http://localhost:3000/api/admin/languages/lang-1", {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      });
      
      const response = await patchLanguage(request, { params: Promise.resolve({ id: "lang-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.language.isActive).toBe(false);
      expect(prisma.language.update).toHaveBeenCalledWith({
        where: { id: "lang-1" },
        data: { isActive: false },
      });
    });

    it("should return 403 if not admin", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/languages/lang-1", {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      });
      
      const response = await patchLanguage(request, { params: Promise.resolve({ id: "lang-1" }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/languages/lang-1", {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      });
      
      const response = await patchLanguage(request, { params: Promise.resolve({ id: "lang-1" }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/user/assessment", () => {
    it("should save user assessment data", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.language.findUnique as jest.Mock).mockResolvedValue({
        id: "lang-1",
        code: "bassa",
        name: "Bassa",
        isActive: true,
      });
      (prisma.userSettings.upsert as jest.Mock).mockResolvedValue({
        userId: "user-123",
        assessmentCompleted: true,
        selectedLanguageId: "lang-1",
        learningLevel: "beginner",
        selectedTribe: "bassa",
        learningGoals: ["speaking", "reading"],
        dailyGoal: 50,
      });

      const requestBody = {
        languageId: "lang-1",
        level: "beginner",
        tribe: "bassa",
        learningGoals: ["speaking", "reading"],
        dailyGoal: 50,
      };

      const request = new NextRequest("http://localhost:3000/api/user/assessment", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await postAssessment(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.assessmentCompleted).toBe(true);
    });

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/user/assessment", {
        method: "POST",
        body: JSON.stringify({
          languageId: "lang-1",
          level: "beginner",
        }),
      });

      const response = await postAssessment(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if required fields are missing", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost:3000/api/user/assessment", {
        method: "POST",
        body: JSON.stringify({
          level: "beginner",
          // languageId missing
        }),
      });

      const response = await postAssessment(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Language and level are required");
    });
  });

  describe("POST /api/lessons/[id]/complete", () => {
    it("should complete a lesson and award XP", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue({
        id: "lesson-1",
        title: "Test Lesson",
        xpReward: 100,
        unit: { languageId: "lang-1" },
      });
      (prisma.userProgress.upsert as jest.Mock).mockResolvedValue({
        userId: "user-123",
        lessonId: "lesson-1",
        isCompleted: true,
        correctAnswers: 8,
        totalQuestions: 10,
        accuracy: 80,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "user-123",
        totalXP: 100,
        currentStreak: 1,
        longestStreak: 1,
      });

      const requestBody = {
        correctAnswers: 8,
        totalQuestions: 10,
      };

      const request = new NextRequest("http://localhost:3000/api/lessons/lesson-1/complete", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await postLessonComplete(request, { params: Promise.resolve({ id: "lesson-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.xpEarned).toBe(100);
      expect(data.message).toBe("Lesson completed");
    });

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/lessons/lesson-1/complete", {
        method: "POST",
        body: JSON.stringify({
          correctAnswers: 8,
          totalQuestions: 10,
        }),
      });

      const response = await postLessonComplete(request, { params: Promise.resolve({ id: "lesson-1" }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if lesson not found", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/lessons/invalid/complete", {
        method: "POST",
        body: JSON.stringify({
          correctAnswers: 8,
          totalQuestions: 10,
        }),
      });

      const response = await postLessonComplete(request, { params: Promise.resolve({ id: "invalid" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Lesson not found");
    });
  });

  describe("POST /api/exercises/[id]/complete", () => {
    it("should complete an exercise and track progress", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.exercise.findUnique as jest.Mock).mockResolvedValue({
        id: "exercise-1",
        xpReward: 10,
        lesson: { id: "lesson-1" },
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "user-123",
        hearts: 4,
        totalXP: 10,
      });

      const requestBody = {
        isCorrect: true,
      };

      const request = new NextRequest("http://localhost:3000/api/exercises/exercise-1/complete", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await postExerciseComplete(request, { params: Promise.resolve({ id: "exercise-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.xpEarned).toBe(10);
      expect(data.heartsRemaining).toBeDefined();
    });

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/exercises/exercise-1/complete", {
        method: "POST",
        body: JSON.stringify({
          isCorrect: true,
        }),
      });

      const response = await postExerciseComplete(request, { params: Promise.resolve({ id: "exercise-1" }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });
});

