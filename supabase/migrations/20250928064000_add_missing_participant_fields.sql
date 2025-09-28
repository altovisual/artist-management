-- Add missing fields to participants table for complete form support
ALTER TABLE "public"."participants"
ADD COLUMN IF NOT EXISTS "document_type" text;

-- Add comment for clarity
COMMENT ON COLUMN "public"."participants"."document_type" IS 'Type of identification document (DNI, CC, PASSPORT, etc.)';
