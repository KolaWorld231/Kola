/**
 * Email templates for different notification types
 */

export interface EmailTemplateData {
  userName?: string;
  [key: string]: any;
}

/**
 * Base email template wrapper
 */
function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #D63A3A 0%, #1B3F91 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🇱🇷 Volo</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Learn Liberian Languages</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    ${content}
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
      You're receiving this email because you have email notifications enabled in your Volo settings.<br>
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings/notifications" style="color: #D63A3A;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Product updates & learning tips email
 */
export function productUpdatesTemplate(data: EmailTemplateData = {}): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">New Features & Learning Tips</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    <p>We're excited to share some updates and tips to help you on your language learning journey:</p>
    ${data.content || `
    <ul>
      <li>🎯 New interactive exercises added</li>
      <li>📚 Expanded vocabulary library</li>
      <li>🏆 Weekly challenges now available</li>
    </ul>
    `}
    <p>Keep up the great work! Every lesson brings you closer to fluency.</p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #D63A3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Continue Learning</a>
  `;
  return baseTemplate(content, "Product Updates");
}

/**
 * New follower notification email
 */
export function newFollowerTemplate(data: { userName?: string; followerName: string; followerUsername?: string }): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">New Follower! 👋</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    <p><strong>${data.followerName}${data.followerUsername ? ` (@${data.followerUsername})` : ""}</strong> started following you on Volo!</p>
    <p>Connect with your new follower and see their progress:</p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/friends" style="display: inline-block; background: #1B3F91; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Profile</a>
  `;
  return baseTemplate(content, "New Follower");
}

/**
 * Friend activity notification email
 */
export function friendActivityTemplate(data: { userName?: string; friendName: string; activity: string }): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">Friend Activity 🎉</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    <p><strong>${data.friendName}</strong> ${data.activity}</p>
    <p>Keep the momentum going and stay connected with your learning community!</p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/friends" style="display: inline-block; background: #1B3F91; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Activity</a>
  `;
  return baseTemplate(content, "Friend Activity");
}

/**
 * Weekly progress summary email
 */
export function weeklyProgressTemplate(data: { userName?: string; xpGained: number; lessonsCompleted: number; currentStreak: number; rank?: number }): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">Your Weekly Progress 📊</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    <p>Here's your progress this week:</p>
    <div style="background: #F7F4EF; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <div style="display: flex; justify-content: space-around; text-align: center;">
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #D63A3A;">${data.xpGained}</div>
          <div style="color: #666; font-size: 14px;">XP Gained</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #1B3F91;">${data.lessonsCompleted}</div>
          <div style="color: #666; font-size: 14px;">Lessons</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #3A9D5A;">${data.currentStreak}</div>
          <div style="color: #666; font-size: 14px;">Day Streak</div>
        </div>
      </div>
      ${data.rank ? `<p style="text-align: center; margin-top: 15px; color: #666;">You're ranked #${data.rank} this week! 🏆</p>` : ""}
    </div>
    <p>Great job! Keep up the excellent work.</p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #D63A3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Continue Learning</a>
  `;
  return baseTemplate(content, "Weekly Progress");
}

/**
 * Special promotions email
 */
export function specialPromotionsTemplate(data: { userName?: string; promotionTitle: string; promotionContent: string; ctaText?: string; ctaLink?: string }): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">${data.promotionTitle} 🎁</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    ${data.promotionContent}
    ${data.ctaLink ? `
    <a href="${data.ctaLink}" style="display: inline-block; background: #D63A3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">${data.ctaText || "Learn More"}</a>
    ` : ""}
  `;
  return baseTemplate(content, data.promotionTitle);
}

/**
 * Research opportunities email
 */
export function researchOpportunitiesTemplate(data: { userName?: string; studyTitle: string; studyDescription: string; studyLink?: string }): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">Research Opportunity 🔬</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    <p>We have a research opportunity that might interest you:</p>
    <div style="background: #F7F4EF; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1B3F91;">${data.studyTitle}</h3>
      <p>${data.studyDescription}</p>
    </div>
    ${data.studyLink ? `
    <a href="${data.studyLink}" style="display: inline-block; background: #1B3F91; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Learn More</a>
    ` : ""}
  `;
  return baseTemplate(content, "Research Opportunity");
}

/**
 * Practice reminder email
 */
export function practiceReminderTemplate(data: { userName?: string; streakDays?: number }): string {
  const content = `
    <h2 style="color: #2E2D2C; margin-top: 0;">Time to Practice! ⏰</h2>
    <p>Hello${data.userName ? ` ${data.userName}` : ""}!</p>
    <p>Don't forget to practice today! ${data.streakDays ? `You're on a ${data.streakDays}-day streak - keep it going! 🔥` : "Start building your learning streak!"}</p>
    <p>Just 10 minutes a day can make a huge difference in your language learning journey.</p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #D63A3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Start Practicing</a>
  `;
  return baseTemplate(content, "Practice Reminder");
}




