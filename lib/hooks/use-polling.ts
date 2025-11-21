"use client";

import { useEffect, useRef } from "react";

interface UsePollingOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Custom hook for polling API endpoints
 * Useful for keeping data fresh without full real-time infrastructure
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 30000, enabled = true } = options; // Default 30 seconds
  const callbackRef = useRef(callback);

  // Always use the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const execute = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Execute immediately
    execute();

    // Set up interval
    const intervalId = setInterval(execute, interval);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [interval, enabled]);
}






