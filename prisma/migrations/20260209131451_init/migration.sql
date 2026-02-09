-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "email_verified" DATETIME,
    "image" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "selected_language_id" TEXT,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "hearts" INTEGER NOT NULL DEFAULT 5,
    "last_activity_date" DATETIME,
    "last_ad_watch_time" DATETIME,
    CONSTRAINT "users_selected_language_id_fkey" FOREIGN KEY ("selected_language_id") REFERENCES "languages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "flag_emoji" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "language_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT true,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "units_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'practice',
    "xp_reward" INTEGER NOT NULL DEFAULT 10,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lessons_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lesson_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "question_audio" TEXT,
    "question_image" TEXT,
    "correct_answer" TEXT NOT NULL,
    "grammar_tip" TEXT,
    "order" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 5,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "exercises_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exercise_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audio_url" TEXT,
    "image_url" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercise_options_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vocabularies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "language_id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "phonetic" TEXT,
    "audio_url" TEXT,
    "image_url" TEXT,
    "category" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "vocabularies_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "accuracy" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_xp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "source_id" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_xp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "criteria" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "language_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'moderator',
    "permissions" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "reward_xp" INTEGER NOT NULL DEFAULT 20,
    "date" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_daily_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    "reward_claimed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_daily_challenges_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "daily_challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_daily_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lesson_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "translation" TEXT,
    "audio_url" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "stories_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "story_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "story_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "story_questions_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "story_question_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "story_question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "story_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "flashcard_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "vocabulary_id" TEXT NOT NULL,
    "ease_factor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "next_review" DATETIME NOT NULL,
    "last_reviewed" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "flashcard_progress_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "friends" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "author_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "contents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "challenges_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challenges_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "study_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language_id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "max_members" INTEGER NOT NULL DEFAULT 50,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "study_groups_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "study_group_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "study_group_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "study_group_members_study_group_id_fkey" FOREIGN KEY ("study_group_id") REFERENCES "study_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "study_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "sound_effects" BOOLEAN NOT NULL DEFAULT true,
    "animations" BOOLEAN NOT NULL DEFAULT true,
    "motivational_messages" BOOLEAN NOT NULL DEFAULT true,
    "listening_exercises" BOOLEAN NOT NULL DEFAULT true,
    "dark_mode" TEXT NOT NULL DEFAULT 'system',
    "email_product_updates" BOOLEAN NOT NULL DEFAULT true,
    "email_new_follower" BOOLEAN NOT NULL DEFAULT true,
    "email_friend_activity" BOOLEAN NOT NULL DEFAULT true,
    "email_weekly_progress" BOOLEAN NOT NULL DEFAULT true,
    "email_special_promotions" BOOLEAN NOT NULL DEFAULT true,
    "email_research_opportunities" BOOLEAN NOT NULL DEFAULT false,
    "email_practice_reminder" BOOLEAN NOT NULL DEFAULT true,
    "practice_reminder_time" TEXT,
    "profile_public" BOOLEAN NOT NULL DEFAULT true,
    "personalized_ads" BOOLEAN NOT NULL DEFAULT true,
    "friend_streaks" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "assessment_completed" BOOLEAN NOT NULL DEFAULT false,
    "assessment_completed_at" DATETIME,
    "assessment_daily_goal" INTEGER,
    "assessment_language_id" TEXT,
    "assessment_learning_goals" TEXT,
    "assessment_level" TEXT,
    "assessment_tribe" TEXT,
    CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_selected_language_id_idx" ON "users"("selected_language_id");

-- CreateIndex
CREATE INDEX "users_total_xp_idx" ON "users"("total_xp" DESC);

-- CreateIndex
CREATE INDEX "users_current_streak_idx" ON "users"("current_streak" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "units_language_id_idx" ON "units"("language_id");

-- CreateIndex
CREATE INDEX "units_language_id_order_idx" ON "units"("language_id", "order");

-- CreateIndex
CREATE INDEX "lessons_unit_id_idx" ON "lessons"("unit_id");

-- CreateIndex
CREATE INDEX "lessons_unit_id_order_idx" ON "lessons"("unit_id", "order");

-- CreateIndex
CREATE INDEX "exercises_lesson_id_idx" ON "exercises"("lesson_id");

-- CreateIndex
CREATE INDEX "exercises_lesson_id_order_idx" ON "exercises"("lesson_id", "order");

-- CreateIndex
CREATE INDEX "user_progress_user_id_idx" ON "user_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_progress_user_id_is_completed_idx" ON "user_progress"("user_id", "is_completed");

-- CreateIndex
CREATE INDEX "user_progress_lesson_id_idx" ON "user_progress"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_lesson_id_key" ON "user_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "user_xp_user_id_idx" ON "user_xp"("user_id");

-- CreateIndex
CREATE INDEX "user_xp_user_id_source_idx" ON "user_xp"("user_id", "source");

-- CreateIndex
CREATE INDEX "user_xp_user_id_created_at_idx" ON "user_xp"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE INDEX "leaderboard_entries_user_id_idx" ON "leaderboard_entries"("user_id");

-- CreateIndex
CREATE INDEX "leaderboard_entries_period_period_start_idx" ON "leaderboard_entries"("period", "period_start");

-- CreateIndex
CREATE INDEX "leaderboard_entries_period_period_start_xp_idx" ON "leaderboard_entries"("period", "period_start", "xp" DESC);

-- CreateIndex
CREATE INDEX "leaderboard_entries_language_id_period_period_start_xp_idx" ON "leaderboard_entries"("language_id", "period", "period_start", "xp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_user_id_period_period_start_key" ON "leaderboard_entries"("user_id", "period", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_user_id_key" ON "admin_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenges_type_date_key" ON "daily_challenges"("type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_challenges_user_id_challenge_id_key" ON "user_daily_challenges"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "stories_lesson_id_key" ON "stories"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_progress_user_id_vocabulary_id_key" ON "flashcard_progress"("user_id", "vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "friends_user_id_friend_id_key" ON "friends"("user_id", "friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "contents_slug_key" ON "contents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "study_group_members_user_id_study_group_id_key" ON "study_group_members"("user_id", "study_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");
