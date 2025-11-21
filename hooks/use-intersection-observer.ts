"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Custom hook for Intersection Observer API
 * Enables lazy loading and visibility detection
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  root = null,
  rootMargin = "0px",
  enabled = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: assume visible if IntersectionObserver is not supported
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;

        setIsIntersecting(isVisible);

        // Track if element has ever been visible (for lazy loading)
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, enabled, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
}

