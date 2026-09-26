CREATE TYPE "public"."article_featured" AS ENUM('lead', 'headline');--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "featured" "article_featured";--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "is_breaking" boolean DEFAULT false NOT NULL;