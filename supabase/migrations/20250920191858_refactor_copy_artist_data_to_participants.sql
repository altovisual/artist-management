-- Refactor Step 2: Copy redundant data from artists to participants

-- This UPDATE statement joins artists with participants on the participant_id link.
-- It then copies the data from the old columns in 'artists' to the corresponding
-- columns in 'participants'.
-- We use COALESCE to avoid overwriting existing data in 'participants' with
-- NULLs from 'artists' if an artist field happens to be empty.

UPDATE public.participants p
SET
    id_number = COALESCE(a.id_number, p.id_number),
    address = COALESCE(a.address, p.address),
    phone = COALESCE(a.phone, p.phone),
    bank_info = COALESCE(a.bank_info, p.bank_info),
    management_entity = COALESCE(a.management_entity, p.management_entity),
    ipi = COALESCE(a.ipi, p.ipi)
FROM public.artists a
WHERE p.id = a.participant_id;
