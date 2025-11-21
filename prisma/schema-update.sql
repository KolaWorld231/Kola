-- Migration: Add Daily Challenges System
-- Add to schema.prisma manually or run as SQL migration

-- DailyChallenge model for tracking daily challenges
model DailyChallenge {
  id          String   @id @default(cuid())
  type        String   // "xp", "lessons", "practice", "streak"
  target      Int      // Target value (e.g., 100 XP, 3 lessons)
  rewardXP    Int      @default(20) @map("reward_xp") // Bonus XP for completion
  date        DateTime @db.Date // Date of the challenge
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  userProgress UserDailyChallenge[]

  @@unique([type, date])
  @@map("daily_challenges")
}

-- UserDailyChallenge tracks user progress on daily challenges
model UserDailyChallenge {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  challengeId   String   @map("challenge_id")
  progress      Int      @default(0) // Current progress value
  isCompleted   Boolean  @default(false) @map("is_completed")
  completedAt   DateTime? @map("completed_at")
  rewardClaimed Boolean  @default(false) @map("reward_claimed")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  challenge DailyChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  @@unique([userId, challengeId])
  @@map("user_daily_challenges")
}

-- Add relation to User model
-- user User @relation(...)  (add to User model)






