"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface NotificationEvent {
  type: "connected" | "notification" | "ping" | "error";
  message?: string;
  timestamp?: string;
  data?: unknown;
}

/**
 * Hook for real-time notifications using Server-Sent Events
 */
export function useNotificationStream() {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<NotificationEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    // Create EventSource connection
    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("Notification stream connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as NotificationEvent;
        setLastEvent(data);

        // Handle different event types
        if (data.type === "connected") {
          setIsConnected(true);
        } else if (data.type === "notification") {
          // Trigger a callback or update notification list
          // This could trigger a refetch of notifications
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
          // The useEffect will recreate the connection
        }
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [session, status]);

  return {
    isConnected,
    lastEvent,
    reconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    },
  };
}







