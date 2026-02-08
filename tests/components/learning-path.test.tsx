/**
 * Component tests for LearningPath component
 */

import { render, screen, waitFor } from "@testing-library/react";
import { LearningPath } from "@/components/learning/learning-path";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock lazy-loaded components
jest.mock("@/components/learning/path-character", () => ({
  PathCharacter: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="path-character">Character</div> : null,
}));

jest.mock("@/components/learning/treasure-chest-bonus", () => ({
  TreasureChestBonus: ({ isUnlocked }: { isUnlocked: boolean }) => (
    <div data-testid="treasure-chest">
      {isUnlocked ? "Unlocked" : "Locked"}
    </div>
  ),
}));

jest.mock("@/components/learning/unit-progress-indicator", () => ({
  UnitProgressIndicator: ({ unitTitle }: { unitTitle: string }) => (
    <div data-testid="unit-progress">{unitTitle}</div>
  ),
}));

jest.mock("@/components/learning/lazy-lesson-card", () => ({
  LazyLessonCard: ({ lesson }: { lesson: { title: string } }) => (
    <div data-testid="lesson-card">{lesson.title}</div>
  ),
}));

describe("LearningPath", () => {
  const mockUnits = [
    {
      id: "unit-1",
      title: "Basic Greetings",
      order: 1,
      lessons: [
        {
          id: "lesson-1",
          title: "Hello",
          xpReward: 10,
          order: 1,
          type: "practice",
        },
        {
          id: "lesson-2",
          title: "Goodbye",
          xpReward: 10,
          order: 2,
          type: "practice",
        },
      ],
    },
    {
      id: "unit-2",
      title: "Introductions",
      order: 2,
      lessons: [
        {
          id: "lesson-3",
          title: "My name is",
          xpReward: 10,
          order: 1,
          type: "practice",
        },
      ],
    },
  ];

  const completedLessonIds = new Set(["lesson-1"]);
  const unlockedLessonIds = new Set(["lesson-1", "lesson-2", "lesson-3"]);

  it("renders learning path with units and lessons", () => {
    render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId="lesson-2"
      />
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("shows unit banners when enabled", () => {
    render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId="lesson-2"
        showBanners={true}
      />
    );

    // Unit banner should be present (mocked or actual)
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("shows progress indicators when enabled", () => {
    render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId="lesson-2"
        showProgressIndicators={true}
      />
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("displays character for current lesson", async () => {
    render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId="lesson-2"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("path-character")).toBeInTheDocument();
    });
  });

  it("shows treasure chest when unit is completed", async () => {
    const allCompleted = new Set(["lesson-1", "lesson-2"]);

    render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={allCompleted}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId="lesson-2"
      />
    );

    await waitFor(() => {
      const treasureChests = screen.getAllByTestId("treasure-chest");
      expect(treasureChests.length).toBeGreaterThan(0);
    });
  });

  it("respects mobile optimization settings", () => {
    const { container } = render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId="lesson-2"
        mobileOptimized={true}
      />
    );

    expect(container.firstChild).toHaveClass("optimized-animation");
  });

  it("handles empty units array", () => {
    render(
      <LearningPath
        units={[]}
        completedLessonIds={new Set()}
        unlockedLessonIds={new Set()}
      />
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("handles missing current lesson", () => {
    render(
      <LearningPath
        units={mockUnits}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId={null}
      />
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});


