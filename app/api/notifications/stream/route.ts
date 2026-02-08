import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

/**
 * Server-Sent Events (SSE) endpoint for real-time notifications
 * GET /api/notifications/stream
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const send = (data: string) => {
        try {
          // Check if controller is still open before sending
          if (controller.desiredSize !== null && controller.desiredSize >= 0) {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (error) {
          console.error("Error sending SSE data:", error);
        }
      };

      send(JSON.stringify({ type: "connected", message: "Notification stream connected" }));

      // Poll for new notifications every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          // In a real implementation, you'd query the database for new notifications
          // For now, we'll just keep the connection alive
          send(JSON.stringify({ type: "ping", timestamp: new Date().toISOString() }));
        } catch (error) {
          console.error("Error polling notifications:", error);
          send(JSON.stringify({ type: "error", message: "Error checking notifications" }));
        }
      }, 5000);

      // Keep connection alive with periodic ping
      const keepAliveInterval = setInterval(() => {
        try {
          send(JSON.stringify({ type: "ping", timestamp: new Date().toISOString() }));
        } catch (error) {
          // Controller might be closed, clean up intervals
          clearInterval(keepAliveInterval);
          clearInterval(pollInterval);
          try {
            controller.close();
          } catch (closeError) {
            // Stream might already be closed
          }
        }
      }, 30000); // Every 30 seconds

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
        clearInterval(keepAliveInterval);
        try {
          controller.close();
        } catch (error) {
          // Stream might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}

