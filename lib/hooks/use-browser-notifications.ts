"use client";

import { useState, useEffect, useCallback } from "react";
import {
  requestNotificationPermission,
  isNotificationSupported,
  getNotificationPermission,
  sendBrowserNotification,
  sendStudyReminderNotification,
  setupDailyReminder,
  type NotificationPermission,
} from "@/lib/browser-notifications";

interface UseBrowserNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isRequesting: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  sendReminder: (message?: string) => void;
  setupReminder: (time: string, message?: string) => () => void;
}

/**
 * Hook for managing browser notifications
 */
export function useBrowserNotifications(): UseBrowserNotificationsReturn {
  const [isSupported] = useState(isNotificationSupported());
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Update permission if it changes externally
    const interval = setInterval(() => {
      const currentPermission = getNotificationPermission();
      if (currentPermission !== permission) {
        setPermission(currentPermission);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [permission]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    setIsRequesting(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission === "granted") {
        sendBrowserNotification(title, options);
      }
    },
    [permission]
  );

  const sendReminder = useCallback(
    (message?: string) => {
      if (permission === "granted") {
        sendStudyReminderNotification(message);
      }
    },
    [permission]
  );

  const setupReminder = useCallback(
    (time: string, message?: string) => {
      if (permission === "granted") {
        return setupDailyReminder(time, message);
      }
      return () => {}; // No-op if permission not granted
    },
    [permission]
  );

  return {
    isSupported,
    permission,
    isRequesting,
    requestPermission,
    sendNotification,
    sendReminder,
    setupReminder,
  };
}


