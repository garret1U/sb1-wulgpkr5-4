-- Add default value for created_by in proposals table
ALTER TABLE proposals
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Update existing records to use the system user if needed
UPDATE proposals 
SET created_by = (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
WHERE created_by IS NULL;