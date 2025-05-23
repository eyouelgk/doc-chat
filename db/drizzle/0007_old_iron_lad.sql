ALTER TYPE "public"."message_role" ADD VALUE 'admin' BEFORE 'assistant';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "message_role" DEFAULT 'user' NOT NULL;