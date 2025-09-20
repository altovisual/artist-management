-- Refactor Step 3: Drop redundant columns from the artists table
-- These columns are now obsolete as the data has been migrated to the participants table.

ALTER TABLE public.artists
DROP COLUMN IF EXISTS id_number,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS bank_info,
DROP COLUMN IF EXISTS management_entity,
DROP COLUMN IF EXISTS ipi;
