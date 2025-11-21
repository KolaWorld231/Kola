/**
 * Email service for sending notifications
 * Supports Resend API (recommended) or can be extended for other providers
 */

export type EmailNotificationType =
  | "product-updates"
  | "new-follower"
  | "friend-activity"
  | "weekly-progress"
  | "special-promotions"
  | "research-opportunities"
  | "practice-reminder";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Resend API
 * To use: Set RESEND_API_KEY in environment variables
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set. Email sending is disabled.");
    // In development, log the email instead of sending
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email would be sent:", {
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      return {
        success: true,
        messageId: "dev-mode",
      };
    }
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Volo <noreply@volo.app>",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Email sending failed:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Check if user wants to receive this type of email
 */
export async function shouldSendEmail(
  userId: string,
  type: EmailNotificationType,
  prisma: any
): Promise<boolean> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      emailProductUpdates: true,
      emailNewFollower: true,
      emailFriendActivity: true,
      emailWeeklyProgress: true,
      emailSpecialPromotions: true,
      emailResearchOpportunities: true,
      emailPracticeReminder: true,
    },
  });

  if (!settings) {
    return false; // Default to not sending if settings don't exist
  }

  switch (type) {
    case "product-updates":
      return settings.emailProductUpdates;
    case "new-follower":
      return settings.emailNewFollower;
    case "friend-activity":
      return settings.emailFriendActivity;
    case "weekly-progress":
      return settings.emailWeeklyProgress;
    case "special-promotions":
      return settings.emailSpecialPromotions;
    case "research-opportunities":
      return settings.emailResearchOpportunities;
    case "practice-reminder":
      return settings.emailPracticeReminder;
    default:
      return false;
  }
}




