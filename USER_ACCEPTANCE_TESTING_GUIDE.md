# 👥 User Acceptance Testing (UAT) Guide

**Date**: UAT guide for learning path  
**Status**: 🟢 **UAT Guide Complete**

---

## 🎯 Overview

This guide provides a comprehensive User Acceptance Testing (UAT) plan for the Duolingo-inspired learning path implementation.

---

## 📋 Test Scenarios

### 1. Learning Path Display

**Test Case**: User can view learning path with all units and lessons

**Steps**:
1. Navigate to `/learn/[language-code]`
2. Verify learning path loads
3. Check that units are displayed
4. Verify lessons are shown within units

**Expected Results**:
- ✅ Learning path displays correctly
- ✅ All units visible
- ✅ All lessons visible
- ✅ Visual states clear (completed/locked/current)

**Pass Criteria**: All expected results met

---

### 2. Lesson States

**Test Case**: Visual states are correct for each lesson

**Steps**:
1. View learning path
2. Identify completed lessons (green checkmarks)
3. Identify current lesson (highlighted, larger)
4. Identify locked lessons (greyed out)
5. Identify available lessons (blue)

**Expected Results**:
- ✅ Completed lessons: Green circle with checkmark
- ✅ Current lesson: Large, highlighted, glowing
- ✅ Locked lessons: Greyed out, non-clickable
- ✅ Available lessons: Blue, clickable

**Pass Criteria**: All states visually distinct and correct

---

### 3. Navigation to Lessons

**Test Case**: User can navigate to unlocked lessons

**Steps**:
1. Click on an unlocked lesson
2. Verify navigation to lesson page
3. Click back button
4. Click on current lesson
5. Verify navigation works

**Expected Results**:
- ✅ Clicking unlocked lesson navigates to lesson page
- ✅ Lesson page loads correctly
- ✅ Back navigation works
- ✅ Current lesson is clickable

**Pass Criteria**: Navigation works for all unlocked lessons

---

### 4. Locked Lesson Prevention

**Test Case**: Locked lessons cannot be accessed

**Steps**:
1. Find a locked lesson
2. Attempt to click it
3. Verify no navigation occurs
4. Check visual feedback (cursor, tooltip)

**Expected Results**:
- ✅ Locked lessons not clickable
- ✅ Visual indication of locked state
- ✅ No navigation when clicked
- ✅ User understands lesson is locked

**Pass Criteria**: Locked lessons properly restricted

---

### 5. Stats Bar Display

**Test Case**: Stats bar shows correct user metrics

**Steps**:
1. View learning path
2. Check stats bar at top
3. Verify streak, XP, and hearts display
4. Verify numbers are correct

**Expected Results**:
- ✅ Stats bar visible at top
- ✅ Streak displays correctly
- ✅ XP/Gems display correctly
- ✅ Hearts display correctly
- ✅ Numbers match user account

**Pass Criteria**: All stats accurate and visible

---

### 6. Unit Banners

**Test Case**: Current unit banner displays correctly

**Steps**:
1. Navigate to learning path
2. Find current lesson
3. Verify unit banner displays for current unit
4. Check banner shows correct section/unit info

**Expected Results**:
- ✅ Banner displays for current unit
- ✅ Shows "SECTION X, UNIT Y"
- ✅ Shows unit title
- ✅ Banner is prominent and colorful

**Pass Criteria**: Banner displays correctly for current unit

---

### 7. Progress Indicators

**Test Case**: Unit progress indicators show correct progress

**Steps**:
1. View learning path
2. Check progress indicators for each unit
3. Verify completed/total counts
4. Verify progress bars
5. Verify percentages

**Expected Results**:
- ✅ Progress indicators visible
- ✅ Counts accurate (completed/total)
- ✅ Progress bars accurate
- ✅ Percentages correct
- ✅ Completed units show green

**Pass Criteria**: All progress indicators accurate

---

### 8. Character/Mascot Display

**Test Case**: Character displays on current lesson

**Steps**:
1. View learning path
2. Find current lesson
3. Verify character/mascot appears
4. Check character animation
5. Verify character position

**Expected Results**:
- ✅ Character visible on current lesson
- ✅ Character animates (bounces)
- ✅ Character positioned correctly
- ✅ Character has glow effect

**Pass Criteria**: Character displays and animates correctly

---

### 9. Treasure Chest Bonus

**Test Case**: Treasure chest appears after unit completion

**Steps**:
1. Complete all lessons in a unit
2. Verify treasure chest appears
3. Click treasure chest
4. Verify bonus XP awarded
5. Check treasure chest changes to claimed state

**Expected Results**:
- ✅ Treasure chest appears after unit completion
- ✅ Treasure chest is clickable
- ✅ Clicking awards bonus XP
- ✅ Toast notification appears
- ✅ Treasure chest shows claimed state

**Pass Criteria**: Bonus system works correctly

---

### 10. Swipe Navigation (Mobile)

**Test Case**: Swipe gestures navigate between lessons

**Steps**:
1. Open learning path on mobile device
2. Find current lesson
3. Swipe left (next lesson)
4. Verify navigation to next lesson
5. Swipe right (previous lesson)
6. Verify navigation to previous lesson

**Expected Results**:
- ✅ Swipe left navigates to next unlocked lesson
- ✅ Swipe right navigates to previous unlocked lesson
- ✅ Gestures feel natural
- ✅ Navigation is smooth

**Pass Criteria**: Swipe navigation works correctly

---

### 11. Mobile Responsiveness

**Test Case**: Learning path is responsive on mobile devices

**Steps**:
1. View learning path on mobile device
2. Check icon sizes (should be smaller)
3. Check text sizes (should be readable)
4. Check spacing (should be touch-friendly)
5. Verify layout adapts correctly

**Expected Results**:
- ✅ Icons appropriately sized for mobile
- ✅ Text readable on mobile
- ✅ Touch targets large enough (44-48px)
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling

**Pass Criteria**: Mobile experience is optimal

---

### 12. Keyboard Navigation

**Test Case**: Learning path is accessible via keyboard

**Steps**:
1. Tab to learning path
2. Tab through lesson links
3. Press Enter/Space on lesson
4. Verify navigation works
5. Verify focus indicators visible

**Expected Results**:
- ✅ All lessons focusable with Tab
- ✅ Enter/Space activates lesson
- ✅ Focus indicators visible
- ✅ Tab order logical
- ✅ Locked lessons not focusable

**Pass Criteria**: Full keyboard accessibility

---

### 13. Screen Reader Compatibility

**Test Case**: Screen reader can navigate learning path

**Steps**:
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate learning path
3. Verify all elements announced
4. Check ARIA labels are descriptive
5. Verify progress announced

**Expected Results**:
- ✅ All elements announced correctly
- ✅ ARIA labels descriptive
- ✅ Progress announced
- ✅ States announced (locked/completed/current)
- ✅ Navigation instructions clear

**Pass Criteria**: Screen reader fully functional

---

### 14. Performance

**Test Case**: Learning path loads and performs well

**Steps**:
1. Measure initial load time
2. Check animation smoothness (60fps)
3. Test with slow connection
4. Test with many units/lessons
5. Check memory usage

**Expected Results**:
- ✅ Initial load < 3s
- ✅ Animations smooth (60fps)
- ✅ Works on slow connections
- ✅ Handles large datasets
- ✅ No memory leaks

**Pass Criteria**: Performance meets targets

---

### 15. Error Handling

**Test Case**: Errors are handled gracefully

**Steps**:
1. Simulate network error
2. Check error boundary displays
3. Verify recovery options work
4. Test with invalid data
5. Check error messages are user-friendly

**Expected Results**:
- ✅ Error boundary catches errors
- ✅ User-friendly error messages
- ✅ Recovery options available
- ✅ No application crashes
- ✅ Errors logged appropriately

**Pass Criteria**: Errors handled gracefully

---

## 🎯 Test Execution Plan

### Phase 1: Core Functionality (Days 1-2)
- Learning path display
- Lesson states
- Navigation
- Stats bar

### Phase 2: Enhanced Features (Days 3-4)
- Unit banners
- Progress indicators
- Character display
- Treasure chest bonuses

### Phase 3: Mobile & Accessibility (Days 5-6)
- Mobile responsiveness
- Swipe navigation
- Keyboard navigation
- Screen reader compatibility

### Phase 4: Performance & Polish (Days 7-8)
- Performance testing
- Error handling
- Edge cases
- Final review

---

## 📊 Test Results Template

```
Test Case: [Name]
Date: [Date]
Tester: [Name]
Status: [Pass/Fail/Blocked]
Notes: [Observations]

Issues Found:
- [Issue 1]
- [Issue 2]

Screenshots: [Attach if needed]
```

---

## ✅ Acceptance Criteria

**UAT Passes When**:
- ✅ All core functionality works
- ✅ Mobile experience is optimal
- ✅ Accessibility requirements met
- ✅ Performance targets achieved
- ✅ User feedback is positive
- ✅ No critical bugs

---

## 🐛 Bug Reporting

### Bug Report Template

**Title**: [Brief description]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]

**Actual Result**: [What actually happened]

**Environment**:
- Device: [Desktop/Mobile/Tablet]
- Browser: [Browser and version]
- OS: [Operating system]

**Screenshots**: [Attach if relevant]

**Priority**: [Critical/High/Medium/Low]

---

## 📈 Success Metrics

**UAT Successful When**:
- **Functionality**: 100% of core features working
- **Accessibility**: WCAG 2.1 AA compliance verified
- **Performance**: All targets met
- **User Satisfaction**: > 4/5 rating
- **Critical Bugs**: 0

---

*Last Updated: After UAT guide creation*

