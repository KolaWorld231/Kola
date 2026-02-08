/**
 * Browser Notifications System
 * Handles browser notification permissions and sending
 */

export type NotificationPermission = "default" | "granted" | "denied";

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Check if browser notifications are supported
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * Check current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Send a browser notification
 */
export function sendBrowserNotification(
  title: string,
  options: NotificationOptions = {}
): void {
  if (!isNotificationSupported()) {
    console.warn("Browser notifications are not supported");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "volo-notification",
      requireInteraction: false,
      silent: false,
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };
  } catch (error) {
    console.error("Error sending browser notification:", error);
  }
}

/**
 * Send a study reminder notification
 */
export function sendStudyReminderNotification(
  message: string = "Time to practice! Let's learn some Liberian languages! 🎯"
): void {
  sendBrowserNotification("📚 Volo Study Reminder", {
    body: message,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "study-reminder",
    data: {
      url: "/dashboard",
    },
  });
}

/**
 * Schedule a study reminder
 */
export function scheduleStudyReminder(
  reminderTime: string, // Format: "HH:MM AM/PM" (e.g., "5:00 PM")
  message?: string
): () => void {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return () => {}; // Return no-op cancel function
  }

  // Parse reminder time
  const [timePart, period] = reminderTime.split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);

  let hour24 = hours;
  if (period === "PM" && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  // Calculate time until reminder
  const now = new Date();
  const reminderDate = new Date();
  reminderDate.setHours(hour24, minutes, 0, 0);

  // If reminder time has passed today, schedule for tomorrow
  if (reminderDate <= now) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  const timeUntilReminder = reminderDate.getTime() - now.getTime();

  // Schedule notification
  const timeoutId = setTimeout(() => {
    sendStudyReminderNotification(message);
  }, timeUntilReminder);

  // Return cancel function
  return () => {
    clearTimeout(timeoutId);
  };
}

/**
 * Setup daily reminder (recurring)
 */
export function setupDailyReminder(
  reminderTime: string,
  message?: string
): () => void {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return () => {}; // Return no-op cancel function
  }

  const cancelFunctions: (() => void)[] = [];

  // Schedule today's reminder
  const cancelToday = scheduleStudyReminder(reminderTime, message);
  cancelFunctions.push(cancelToday);

  // Schedule recurring reminders (every 24 hours)
  const intervalId = setInterval(() => {
    const cancel = scheduleStudyReminder(reminderTime, message);
    cancelFunctions.push(cancel);
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Return cancel function for all reminders
  return () => {
    clearInterval(intervalId);
    cancelFunctions.forEach((cancel) => cancel());
  };
}


