-- CreateEnum
CREATE TYPE "public"."node_type" AS ENUM ('DIARY', 'QUESTION', 'ANSWER', 'CATEGORY');

-- CreateEnum
CREATE TYPE "public"."emotion_type" AS ENUM ('JOY', 'SADNESS', 'ANGER', 'FEAR', 'SURPRISE', 'DISGUST', 'TRUST', 'ANTICIPATION');

-- CreateEnum
CREATE TYPE "public"."period_type" AS ENUM ('DAILY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "device_info" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diary_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mood" TEXT,
    "tags" TEXT[],
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "diary_entry_id" TEXT NOT NULL,
    "image_data" BYTEA,
    "image_url" TEXT,
    "thumbnail_data" BYTEA,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mindmap_nodes" (
    "id" TEXT NOT NULL,
    "diary_entry_id" TEXT,
    "parent_node_id" TEXT,
    "node_type" "public"."node_type" NOT NULL,
    "content" TEXT NOT NULL,
    "position_x" DOUBLE PRECISION,
    "position_y" DOUBLE PRECISION,
    "is_answered" BOOLEAN NOT NULL DEFAULT false,
    "answered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmap_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."emotion_analyses" (
    "id" TEXT NOT NULL,
    "diary_entry_id" TEXT NOT NULL,
    "emotion_type" "public"."emotion_type" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "color_code" TEXT NOT NULL,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emotion_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."word_frequencies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "period_type" "public"."period_type" NOT NULL,
    "period_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_frequencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "public"."sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "public"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "login_history_user_id_idx" ON "public"."login_history"("user_id");

-- CreateIndex
CREATE INDEX "diary_entries_user_id_entry_date_idx" ON "public"."diary_entries"("user_id", "entry_date");

-- CreateIndex
CREATE INDEX "diary_entries_user_id_created_at_idx" ON "public"."diary_entries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "images_diary_entry_id_idx" ON "public"."images"("diary_entry_id");

-- CreateIndex
CREATE INDEX "mindmap_nodes_diary_entry_id_idx" ON "public"."mindmap_nodes"("diary_entry_id");

-- CreateIndex
CREATE INDEX "mindmap_nodes_parent_node_id_idx" ON "public"."mindmap_nodes"("parent_node_id");

-- CreateIndex
CREATE INDEX "emotion_analyses_diary_entry_id_idx" ON "public"."emotion_analyses"("diary_entry_id");

-- CreateIndex
CREATE INDEX "word_frequencies_user_id_period_type_period_date_idx" ON "public"."word_frequencies"("user_id", "period_type", "period_date");

-- CreateIndex
CREATE UNIQUE INDEX "word_frequencies_user_id_word_period_type_period_date_key" ON "public"."word_frequencies"("user_id", "word", "period_type", "period_date");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diary_entries" ADD CONSTRAINT "diary_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "public"."diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mindmap_nodes" ADD CONSTRAINT "mindmap_nodes_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "public"."diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mindmap_nodes" ADD CONSTRAINT "mindmap_nodes_parent_node_id_fkey" FOREIGN KEY ("parent_node_id") REFERENCES "public"."mindmap_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."emotion_analyses" ADD CONSTRAINT "emotion_analyses_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "public"."diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."word_frequencies" ADD CONSTRAINT "word_frequencies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
