-- Add columns for Auco integration to the participants table
ALTER TABLE "public"."participants"
ADD COLUMN "auco_verification_id" text,
ADD COLUMN "verification_status" text;