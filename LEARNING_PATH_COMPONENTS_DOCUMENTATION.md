# 📚 Learning Path Components Documentation

**Date**: Complete documentation for all learning path components  
**Status**: 🟢 **Comprehensive Documentation**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Supporting Components](#supporting-components)
4. [Hooks](#hooks)
5. [API Routes](#api-routes)
6. [Usage Examples](#usage-examples)
7. [Styling & Theming](#styling--theming)
8. [Accessibility](#accessibility)
9. [Performance](#performance)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The learning path system provides a Duolingo-inspired interface for displaying and navigating through language learning content. It includes:

- **Visual Learning Path**: Vertical path showing lesson progression
- **Progress Tracking**: Unit and section progress indicators
- **Gamification**: Character placement, treasure chest bonuses
- **Mobile Optimization**: Touch-friendly, swipe navigation
- **Accessibility**: WCAG 2.1 AA compliant

---

## Core Components

### 1. `LearningPath`

**File**: `components/learning/learning-path.tsx`

**Description**: Main component that renders the complete learning path with units and lessons.

**Props**:
```typescript
interface LearningPathProps {
  units: Unit[];                    // Array of units with lessons
  completedLessonIds: Set<string>; // Set of completed lesson IDs
  unlockedLessonIds: Set<string>;  // Set of unlocked lesson IDs
  languageCode?: string;            // Language code (optional)
  currentLessonId?: string | null;  // Current lesson ID
  showBanners?: boolean;            // Show unit banners (default: true)
  bannerColors?: Array<"green" | "purple" | "teal" | "blue">; // Banner colors
  showProgressIndicators?: boolean; // Show progress indicators (default: true)
  mobileOptimized?: boolean;        // Mobile optimization (default: true)
  enableSwipeNavigation?: boolean;  // Enable swipe navigation (default: true)
}
```

**Features**:
- Vertical learning path with visual progression
- Unit banners for current unit
- Progress indicators per unit
- Character/mascot placement
- Treasure chest bonuses
- Swipe navigation (mobile)
- Lazy loading for performance
- Full accessibility support

**Usage**:
```tsx
<LearningPath
  units={units}
  completedLessonIds={completedLessonIds}
  unlockedLessonIds={unlockedLessonIds}
  currentLessonId={currentLessonId}
  showBanners={true}
  showProgressIndicators={true}
  mobileOptimized={true}
  enableSwipeNavigation={true}
/>
```

---

### 2. `UnitBanner`

**File**: `components/learning/unit-banner.tsx`

**Description**: Prominent banner displaying current unit information (Duolingo-style).

**Props**:
```typescript
interface UnitBannerProps {
  section: string;                  // Section name (e.g., "SECTION 1")
  unit: number;                     // Unit number
  title: string;                    // Unit title
  color?: "green" | "purple" | "teal" | "blue"; // Banner color
  className?: string;               // Additional CSS classes
}
```

**Features**:
- Large, colorful banner
- Section and unit display
- Checklist icon
- Hover effects
- Responsive design

**Usage**:
```tsx
<UnitBanner
  section="SECTION 1"
  unit={1}
  title="Basic Greetings"
  color="green"
/>
```

---

### 3. `PathStatsBar`

**File**: `components/learning/path-stats-bar.tsx`

**Description**: Stats bar displaying user metrics (streak, XP, hearts).

**Props**:
```typescript
interface PathStatsBarProps {
  streak: number;      // Current streak
  totalXP?: number;    // Total XP (optional)
  hearts: number;      // Current hearts
  gems?: number;       // Gems (optional, alternative to XP)
  className?: string;  // Additional CSS classes
}
```

**Features**:
- Always visible at top
- Responsive design
- ARIA labels
- Icon + number format

**Usage**:
```tsx
<PathStatsBar
  streak={5}
  totalXP={1250}
  hearts={5}
/>
```

---

### 4. `PathCharacter`

**File**: `components/learning/path-character.tsx`

**Description**: Animated character/mascot placed on current lesson position.

**Props**:
```typescript
interface PathCharacterProps {
  isVisible: boolean;                    // Show/hide character
  position?: "left" | "right" | "center"; // Character position
  className?: string;                    // Additional CSS classes
  character?: "default" | "happy" | "excited"; // Character state
}
```

**Features**:
- Animated bounce
- Glow effect
- Floating particles
- Circular base/platform
- GPU-accelerated

**Usage**:
```tsx
<PathCharacter
  isVisible={true}
  position="left"
  character="excited"
/>
```

---

### 5. `TreasureChestBonus`

**File**: `components/learning/treasure-chest-bonus.tsx`

**Description**: Interactive treasure chest for claiming unit completion bonuses.

**Props**:
```typescript
interface TreasureChestBonusProps {
  unitId: string;              // Unit ID
  unitTitle: string;          // Unit title
  isUnlocked: boolean;        // Whether bonus is unlocked
  bonusXP?: number;            // Bonus XP amount (default: 50)
  onClaim?: (unitId: string) => Promise<void>; // Custom claim handler
  className?: string;          // Additional CSS classes
}
```

**Features**:
- Clickable treasure chest
- Visual states (locked/unlocked/claimed)
- Tooltip with bonus details
- Claiming animation
- Toast notifications
- Full accessibility

**Usage**:
```tsx
<TreasureChestBonus
  unitId={unit.id}
  unitTitle={unit.title}
  isUnlocked={allLessonsCompleted}
  bonusXP={50}
/>
```

---

### 6. `UnitProgressIndicator`

**File**: `components/learning/unit-progress-indicator.tsx`

**Description**: Progress indicator showing unit completion status.

**Props**:
```typescript
interface UnitProgressIndicatorProps {
  completedLessons: number;    // Number of completed lessons
  totalLessons: number;         // Total lessons in unit
  unitTitle: string;            // Unit title
  unitOrder: number;            // Unit order number
  className?: string;           // Additional CSS classes
  showPercentage?: boolean;     // Show percentage (default: true)
  size?: "sm" | "md" | "lg";   // Size variant (default: "md")
}
```

**Features**:
- Visual progress bar
- Percentage and count display
- Color-coded states
- Responsive sizing
- ARIA labels

**Usage**:
```tsx
<UnitProgressIndicator
  completedLessons={3}
  totalLessons={5}
  unitTitle="Basic Greetings"
  unitOrder={1}
  size="md"
/>
```

---

### 7. `SectionProgressBar`

**File**: `components/learning/section-progress-bar.tsx`

**Description**: Progress bar showing overall section progress.

**Props**:
```typescript
interface SectionProgressBarProps {
  completedUnits: number;       // Number of completed units
  totalUnits: number;            // Total units in section
  sectionTitle?: string;        // Section title (optional)
  sectionNumber?: number;       // Section number
  className?: string;           // Additional CSS classes
  size?: "sm" | "md" | "lg";    // Size variant (default: "md")
}
```

**Features**:
- Overall section progress
- Visual progress bar
- Percentage and count
- Responsive sizing
- ARIA labels

**Usage**:
```tsx
<SectionProgressBar
  completedUnits={2}
  totalUnits={5}
  sectionTitle="Section 1: Basics"
  sectionNumber={1}
/>
```

---

## Supporting Components

### `LearningPathErrorBoundary`

**File**: `components/learning/learning-path-error-boundary.tsx`

**Description**: Error boundary specifically for learning path components.

**Features**:
- Graceful error handling
- Recovery options
- Development error details
- User-friendly messages

**Usage**:
```tsx
<LearningPathErrorBoundary>
  <LearningPath {...props} />
</LearningPathErrorBoundary>
```

---

## Hooks

### `useSwipeGesture`

**File**: `hooks/use-swipe-gesture.ts`

**Description**: Custom hook for detecting swipe gestures on mobile devices.

**Options**:
```typescript
interface SwipeGestureOptions {
  onSwipeLeft?: () => void;   // Callback for left swipe
  onSwipeRight?: () => void;  // Callback for right swipe
  onSwipeUp?: () => void;     // Callback for up swipe
  onSwipeDown?: () => void;   // Callback for down swipe
  threshold?: number;          // Minimum distance (default: 50px)
  velocity?: number;           // Minimum velocity (default: 0.3px/ms)
}
```

**Returns**: `React.RefObject<HTMLElement>` - Ref to attach to element

**Usage**:
```tsx
const swipeRef = useSwipeGesture({
  onSwipeLeft: () => navigateNext(),
  onSwipeRight: () => navigatePrevious(),
  threshold: 50,
  velocity: 0.3,
});

<div ref={swipeRef}>...</div>
```

---

### `useIntersectionObserver`

**File**: `hooks/use-intersection-observer.ts`

**Description**: Custom hook for Intersection Observer API (lazy loading).

**Options**:
```typescript
interface UseIntersectionObserverOptions {
  threshold?: number | number[]; // Visibility threshold (default: 0.1)
  root?: Element | null;         // Root element (default: null)
  rootMargin?: string;            // Root margin (default: "0px")
  enabled?: boolean;               // Enable/disable (default: true)
}
```

**Returns**:
```typescript
{
  elementRef: React.RefObject<T>; // Ref to attach to element
  isIntersecting: boolean;         // Current intersection state
  hasIntersected: boolean;         // Has ever been visible
}
```

**Usage**:
```tsx
const { elementRef, hasIntersected } = useIntersectionObserver({
  threshold: 0.1,
  rootMargin: "100px",
  enabled: true,
});

<div ref={elementRef}>
  {hasIntersected && <ExpensiveComponent />}
</div>
```

---

## API Routes

### `POST /api/units/[id]/claim-bonus`

**File**: `app/api/units/[id]/claim-bonus/route.ts`

**Description**: Claims unit completion bonus (awards bonus XP).

**Request**:
- Method: `POST`
- Path: `/api/units/{unitId}/claim-bonus`
- Auth: Required (session)

**Response**:
```json
{
  "success": true,
  "bonusXP": 50,
  "message": "Bonus claimed! +50 XP earned!"
}
```

**Errors**:
- `401`: Unauthorized
- `404`: Unit not found
- `400`: Unit not completed or bonus already claimed
- `500`: Internal server error

**Usage**:
```typescript
const response = await fetch(`/api/units/${unitId}/claim-bonus`, {
  method: "POST",
});
const data = await response.json();
```

---

## Usage Examples

### Basic Learning Path

```tsx
import { LearningPath } from "@/components/learning/learning-path";
import { PathStatsBar } from "@/components/learning/path-stats-bar";

export default function LanguagePage() {
  const units = [...]; // Your units data
  const completedLessonIds = new Set([...]);
  const unlockedLessonIds = new Set([...]);
  const currentLessonId = "...";

  return (
    <div>
      <PathStatsBar
        streak={5}
        totalXP={1250}
        hearts={5}
      />
      <LearningPath
        units={units}
        completedLessonIds={completedLessonIds}
        unlockedLessonIds={unlockedLessonIds}
        currentLessonId={currentLessonId}
      />
    </div>
  );
}
```

### With Error Boundary

```tsx
import { LearningPathErrorBoundary } from "@/components/learning/learning-path-error-boundary";
import { LearningPath } from "@/components/learning/learning-path";

<LearningPathErrorBoundary>
  <LearningPath {...props} />
</LearningPathErrorBoundary>
```

### Custom Swipe Navigation

```tsx
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";

const swipeRef = useSwipeGesture({
  onSwipeLeft: () => {
    // Navigate to next lesson
    router.push(`/lesson/${nextLessonId}`);
  },
  onSwipeRight: () => {
    // Navigate to previous lesson
    router.push(`/lesson/${prevLessonId}`);
  },
});

<div ref={swipeRef}>...</div>
```

---

## Styling & Theming

### CSS Classes

**Performance Optimizations**:
- `.gpu-accelerated`: GPU acceleration for animations
- `.optimized-animation`: Optimized animation performance

**Animations**:
- `.animate-lesson-complete`: Lesson completion animation
- `.animate-path-progress`: Path progression animation
- `.animate-treasure-glow`: Treasure chest glow
- `.animate-character-bounce`: Character bounce

**Responsive**:
- Mobile: `w-12 h-12`, `p-3`, `text-base`
- Desktop: `md:w-16 md:h-16`, `md:p-4`, `md:text-lg`

### Color Scheme

- **Completed**: Green (#10B981)
- **Current**: Liberian Red with glow
- **Locked**: Grey (#9CA3AF) with 60% opacity
- **Available**: Liberian Blue
- **Banners**: Green, Purple, Teal, Blue (rotating)

---

## Accessibility

### ARIA Labels

All interactive elements have descriptive `aria-label` attributes:
- Lesson links: `"Lesson {title} - Click to start"`
- Locked lessons: `"Lesson {title} is locked"`
- Current lesson: `"Current lesson: {title} - Click to continue"`
- Treasure chest: `"Click to claim +{XP} XP bonus"`

### Keyboard Navigation

- `tabIndex={0}`: Interactive elements
- `tabIndex={-1}`: Non-interactive elements
- Enter/Space: Activate buttons
- Tab: Navigate between elements

### Screen Reader Support

- `role="navigation"`: Learning path container
- `role="progressbar"`: Progress indicators
- `role="button"`: Interactive elements
- `aria-valuenow/min/max`: Progress values

### Reduced Motion

Respects `prefers-reduced-motion`:
- Disables animations for users who prefer reduced motion
- Maintains functionality
- Better for users with vestibular disorders

---

## Performance

### Lazy Loading

Lessons are lazy-loaded using Intersection Observer:
- First 3 lessons: Loaded immediately
- Remaining lessons: Loaded when visible (100px before)
- Placeholder shown while loading

### GPU Acceleration

Animations use GPU acceleration:
- `transform: translateZ(0)`
- `will-change: transform`
- Reduced repaints
- 60fps animations

### Touch Optimization

- `touch-manipulation`: Removes 300ms delay
- `active:scale-95`: Touch feedback
- Minimum 44-48px touch targets

---

## Troubleshooting

### Common Issues

**1. Swipe navigation not working**
- Check if `enableSwipeNavigation={true}`
- Verify touch events are not blocked
- Check browser compatibility

**2. Animations not smooth**
- Ensure GPU acceleration is enabled
- Check for CSS conflicts
- Verify `will-change` is applied

**3. Lazy loading not working**
- Check Intersection Observer support
- Verify `enabled` prop is true
- Check `rootMargin` value

**4. Accessibility issues**
- Verify ARIA labels are present
- Check keyboard navigation
- Test with screen reader

---

## Best Practices

1. **Always wrap in ErrorBoundary**: Prevents crashes
2. **Use lazy loading**: Improves performance
3. **Enable mobile optimization**: Better mobile UX
4. **Provide ARIA labels**: Better accessibility
5. **Test with screen readers**: Ensure compatibility
6. **Respect reduced motion**: Better for all users

---

*Last Updated: After Phase 4 implementation*


