-- Refactor Step 1: Link artists to participants

-- Add the participant_id column to the artists table to create the link.
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS participant_id UUID;

-- Add a foreign key constraint. We make it UNIQUE to enforce a one-to-one relationship.
-- This ensures one artist corresponds to exactly one participant.
ALTER TABLE public.artists
ADD CONSTRAINT fk_artists_participant
FOREIGN KEY (participant_id)
REFERENCES public.participants(id)
ON DELETE SET NULL; -- If a participant is deleted, the link is severed but the artist remains.

ALTER TABLE public.artists
ADD CONSTRAINT unique_artist_participant_id
UNIQUE (participant_id);

-- Create an index for faster lookups on the new column
CREATE INDEX IF NOT EXISTS idx_artists_participant_id ON public.artists(participant_id);

-- Now, populate the new column.
-- This statement finds the participant with the same user_id as the artist and links them.
UPDATE public.artists a
SET participant_id = p.id
FROM public.participants p
WHERE a.user_id = p.user_id
  AND a.participant_id IS NULL; -- Only update artists that haven't been linked yet.
