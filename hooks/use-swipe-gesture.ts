"use client";

import { useEffect, useRef, useState } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels for a swipe
  velocity?: number; // Minimum velocity for a swipe (pixels per ms)
}

/**
 * Custom hook for swipe gesture detection
 * Enables swipe navigation on mobile devices
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocity = 0.3,
}: SwipeGestureOptions) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const minSwipeDistance = threshold;
  const minSwipeVelocity = velocity;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const time = touchEnd.time - touchStart.time;
    const velocity = distance / time;

    // Check if swipe meets minimum distance and velocity
    if (distance < minSwipeDistance || velocity < minSwipeVelocity) {
      return;
    }

    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal) {
      if (distanceX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else {
      if (distanceY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
        time: Date.now(),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
        time: Date.now(),
      });
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setTouchStart(null);
        setTouchEnd(null);
        return;
      }

      const distanceX = touchEnd.x - touchStart.x;
      const distanceY = touchEnd.y - touchStart.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const time = touchEnd.time - touchStart.time;
      const velocity = distance / time;

      // Check if swipe meets minimum distance and velocity
      if (distance < minSwipeDistance || velocity < minSwipeVelocity) {
        setTouchStart(null);
        setTouchEnd(null);
        return;
      }

      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

      if (isHorizontal) {
        if (distanceX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        if (distanceY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      // Reset
      setTouchStart(null);
      setTouchEnd(null);
    };

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove);
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance, minSwipeVelocity]);

  return elementRef;
}

