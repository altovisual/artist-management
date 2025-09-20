-- Step 1: Standardize existing data
UPDATE public.projects SET status = 'planned' WHERE status ILIKE 'planning';
UPDATE public.projects SET type = 'single' WHERE type ILIKE 'song';
UPDATE public.participants SET type = 'ARTISTA' WHERE type ILIKE 'artist' OR type ILIKE 'artista';
UPDATE public.participants SET type = 'PRODUCTOR' WHERE type ILIKE 'productor';
UPDATE public.participants SET type = 'COMPOSITOR' WHERE type ILIKE 'compositor' OR type ILIKE 'compositora';

-- Step 2: Create ENUM types
CREATE TYPE public.project_type AS ENUM ('single', 'album', 'ep', 'mixtape');
CREATE TYPE public.project_status AS ENUM ('planned', 'in_progress', 'completed', 'released', 'cancelled');
CREATE TYPE public.participant_type AS ENUM ('ARTISTA', 'PRODUCTOR', 'COMPOSITOR', 'MANAGER', 'LAWYER');
CREATE TYPE public.contract_status AS ENUM ('draft', 'sent', 'signed', 'expired', 'archived');

-- Step 3: Alter columns
-- For columns with a default value, we drop it, change the type, and then re-add it.

-- projects.type (no default)
ALTER TABLE public.projects
ALTER COLUMN type SET DATA TYPE public.project_type USING type::public.project_type;

-- projects.status (has a default)
ALTER TABLE public.projects
ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.projects
ALTER COLUMN status SET DATA TYPE public.project_status USING status::public.project_status;
ALTER TABLE public.projects
ALTER COLUMN status SET DEFAULT 'planned'::public.project_status;

-- participants.type (no default)
ALTER TABLE public.participants
ALTER COLUMN type SET DATA TYPE public.participant_type USING type::public.participant_type;

-- contracts.status (has a default)
ALTER TABLE public.contracts
ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.contracts
ALTER COLUMN status SET DATA TYPE public.contract_status USING status::public.contract_status;
ALTER TABLE public.contracts
ALTER COLUMN status SET DEFAULT 'draft'::public.contract_status;
