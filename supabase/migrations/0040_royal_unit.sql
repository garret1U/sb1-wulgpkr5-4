/*
  # Update proposals created_by reference
  
  1. Add new column referencing user_profiles
  2. Migrate data from old column
  3. Drop old column
*/

-- First create the new column
ALTER TABLE proposals 
ADD COLUMN new_created_by uuid REFERENCES user_profiles(user_id);

-- Migrate data from auth.users to user_profiles
UPDATE proposals p
SET new_created_by = (
  SELECT user_id 
  FROM user_profiles up 
  WHERE up.user_id = p.created_by
);

-- Set any NULL values to the first admin (fallback)
UPDATE proposals p
SET new_created_by = (
  SELECT user_id 
  FROM user_profiles 
  WHERE role = 'admin' 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE new_created_by IS NULL;

-- Make new column not null
ALTER TABLE proposals
ALTER COLUMN new_created_by SET NOT NULL;

-- Drop the old column
ALTER TABLE proposals
DROP COLUMN created_by;

-- Rename the new column
ALTER TABLE proposals
RENAME COLUMN new_created_by TO created_by;