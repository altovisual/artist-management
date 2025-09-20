-- Rename the 'work_id' column in the 'contracts' table to 'project_id'
-- for clarity and consistency, as it refers to an ID from the 'projects' table.

ALTER TABLE public.contracts
RENAME COLUMN work_id TO project_id;
