import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { sendEmail, shouldSendEmail, type EmailNotificationType } from "@/lib/email-service";
import {
  productUpdatesTemplate,
  newFollowerTemplate,
  friendActivityTemplate,
  weeklyProgressTemplate,
  specialPromotionsTemplate,
  researchOpportunitiesTemplate,
  practiceReminderTemplate,
} from "@/lib/email-templates";

/**
 * POST /api/email/send - Send email notification
 * This endpoint is typically called internally by the system, not directly by users
 */
export async function POST(request: Request) {
  try {
    const _session = await getServerSession(authOptions);

    // Allow internal calls without session (for background jobs)
    // In production, add API key authentication for security
    const body = await request.json();
    const { userId, type, data } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "userId and type are required" },
        { status: 400 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "User not found or no email" },
        { status: 404 }
      );
    }

    // Check if user wants to receive this type of email
    const shouldSend = await shouldSendEmail(userId, type as EmailNotificationType, prisma);
    if (!shouldSend) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "User has disabled this notification type",
      });
    }

    // Generate email content based on type
    let html: string;
    let subject: string;

    switch (type) {
      case "product-updates":
        html = productUpdatesTemplate({ userName: user.name || undefined, ...data });
        subject = "New Features & Learning Tips from Volo";
        break;
      case "new-follower":
        html = newFollowerTemplate({ userName: user.name || undefined, ...data });
        subject = "New Follower on Volo";
        break;
      case "friend-activity":
        html = friendActivityTemplate({ userName: user.name || undefined, ...data });
        subject = "Friend Activity on Volo";
        break;
      case "weekly-progress":
        html = weeklyProgressTemplate({ userName: user.name || undefined, ...data });
        subject = "Your Weekly Progress Summary";
        break;
      case "special-promotions":
        html = specialPromotionsTemplate({ userName: user.name || undefined, ...data });
        subject = data.promotionTitle || "Special Offer from Volo";
        break;
      case "research-opportunities":
        html = researchOpportunitiesTemplate({ userName: user.name || undefined, ...data });
        subject = "Research Opportunity - Volo";
        break;
      case "practice-reminder":
        html = practiceReminderTemplate({ userName: user.name || undefined, ...data });
        subject = "Time to Practice - Volo";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    // Send email
    const result = await sendEmail({
      to: user.email,
      subject,
      html,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



