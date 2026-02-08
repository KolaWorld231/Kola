/**
 * Unit Tests - Onboarding Utility
 * 
 * Tests the onboarding utility functions:
 * - hasCompletedOnboarding
 * - getOnboardingRedirect
 */

import { hasCompletedOnboarding, getOnboardingRedirect } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    userSettings: {
      findUnique: jest.fn(),
    },
  },
}));

describe("Onboarding Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hasCompletedOnboarding", () => {
    it("should return true when user has completed onboarding", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue({
        assessmentCompleted: true,
      });

      const result = await hasCompletedOnboarding(userId);

      expect(result).toBe(true);
      expect(prisma.userSettings.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { assessmentCompleted: true },
      });
    });

    it("should return false when user has not completed onboarding", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue({
        assessmentCompleted: false,
      });

      const result = await hasCompletedOnboarding(userId);

      expect(result).toBe(false);
    });

    it("should return false when user has no UserSettings record", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await hasCompletedOnboarding(userId);

      expect(result).toBe(false);
    });

    it("should return false on error (safety default)", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await hasCompletedOnboarding(userId);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getOnboardingRedirect", () => {
    it("should return /dashboard when onboarding is completed", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue({
        assessmentCompleted: true,
      });

      const result = await getOnboardingRedirect(userId);

      expect(result).toBe("/dashboard");
    });

    it("should return /onboarding when onboarding is not completed", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue({
        assessmentCompleted: false,
      });

      const result = await getOnboardingRedirect(userId);

      expect(result).toBe("/onboarding");
    });

    it("should return /onboarding when user has no UserSettings", async () => {
      const userId = "test-user-id";
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getOnboardingRedirect(userId);

      expect(result).toBe("/onboarding");
    });
  });
});


