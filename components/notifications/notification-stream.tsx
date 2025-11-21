"use client";

import { useEffect, useState } from "react";
import { useNotificationStream } from "@/lib/hooks/use-notification-stream";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationStreamProps {
  onNewNotification?: () => void;
}

/**
 * Component that handles real-time notifications via SSE
 * Automatically refetches notifications when new ones arrive
 */
export function NotificationStream({ onNewNotification }: NotificationStreamProps) {
  const { isConnected, lastEvent } = useNotificationStream();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");

  useEffect(() => {
    setConnectionStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  useEffect(() => {
    if (lastEvent?.type === "notification") {
      // Show toast notification
      toast.info(lastEvent.message || "New notification", {
        duration: 5000,
      });

      // Trigger callback to refetch notifications
      onNewNotification?.();
    }
  }, [lastEvent, onNewNotification]);

  // Show connection status badge (optional, can be hidden)
  return (
    <div className="hidden">
      {connectionStatus === "connected" && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Wifi className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      )}
      {connectionStatus === "disconnected" && (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <WifiOff className="h-3 w-3 mr-1" />
          Disconnected
        </Badge>
      )}
    </div>
  );
}

