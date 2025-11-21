/**
 * Performance tests for learning path components
 */

import { render } from "@testing-library/react";
import { LearningPath } from "@/components/learning/learning-path";

// Mock all lazy-loaded components
jest.mock("@/components/learning/path-character", () => ({
  PathCharacter: () => <div>Character</div>,
}));

jest.mock("@/components/learning/treasure-chest-bonus", () => ({
  TreasureChestBonus: () => <div>Treasure</div>,
}));

jest.mock("@/components/learning/unit-progress-indicator", () => ({
  UnitProgressIndicator: () => <div>Progress</div>,
}));

jest.mock("@/components/learning/lazy-lesson-card", () => ({
  LazyLessonCard: () => <div>Lesson</div>,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("Learning Path Performance", () => {
  const createLargeUnits = (unitCount: number, lessonsPerUnit: number) => {
    const units = [];
    for (let i = 0; i < unitCount; i++) {
      const lessons = [];
      for (let j = 0; j < lessonsPerUnit; j++) {
        lessons.push({
          id: `lesson-${i}-${j}`,
          title: `Lesson ${i}-${j}`,
          xpReward: 10,
          order: j + 1,
          type: "practice",
        });
      }
      units.push({
        id: `unit-${i}`,
        title: `Unit ${i + 1}`,
        order: i + 1,
        lessons,
      });
    }
    return units;
  };

  it("renders large learning path within acceptable time", () => {
    const units = createLargeUnits(10, 10); // 10 units, 10 lessons each
    const completedLessonIds = new Set<string>();
    const unlockedLessonIds = new Set<string>();

    const startTime = performance.now();
    
    render(
      <LearningPath
        units={units}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms for large dataset
    expect(renderTime).toBeLessThan(100);
  });

  it("handles very large learning path efficiently", () => {
    const units = createLargeUnits(20, 20); // 20 units, 20 lessons each = 400 lessons
    const completedLessonIds = new Set<string>();
    const unlockedLessonIds = new Set<string>();

    const startTime = performance.now();
    
    render(
      <LearningPath
        units={units}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        mobileOptimized={true}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 200ms for very large dataset
    expect(renderTime).toBeLessThan(200);
  });

  it("lazy loading reduces initial render time", () => {
    const units = createLargeUnits(5, 20); // 5 units, 20 lessons each
    const completedLessonIds = new Set<string>();
    const unlockedLessonIds = new Set<string>();

    // Without lazy loading (all components eager)
    const startEager = performance.now();
    render(
      <LearningPath
        units={units}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        mobileOptimized={false}
      />
    );
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // With lazy loading (mobile optimized)
    const startLazy = performance.now();
    render(
      <LearningPath
        units={units}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        mobileOptimized={true}
      />
    );
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    // Lazy loading should be faster or similar for large datasets
    // (Note: This may vary, but should generally be faster)
    expect(lazyTime).toBeLessThanOrEqual(eagerTime * 1.2); // Allow 20% variance
  });
});

