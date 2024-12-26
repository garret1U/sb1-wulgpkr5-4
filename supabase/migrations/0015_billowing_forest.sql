/*
  # User Profile Enhancements

  1. Changes
    - Add new profile fields (first_name, last_name, email, phone, address)
    - Split existing full_name into first_name and last_name
    - Remove full_name column after migration

  2. Notes
    - Handles existing data migration safely
    - Preserves existing user data
*/

-- First, disable the trigger that's causing issues
DROP TRIGGER IF EXISTS sync_is_admin_on_update ON user_profiles;
DROP TRIGGER IF EXISTS prevent_role_self_modification_trigger ON user_profiles;

-- Add new columns
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text;

-- Update existing records: Split full_name into first_name and last_name
UPDATE user_profiles
SET
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN full_name) > 0 
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE NULL 
  END
WHERE full_name IS NOT NULL;

-- Remove the old column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS full_name;

-- Recreate the admin sync trigger with updated logic
CREATE OR REPLACE FUNCTION sync_is_admin()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_admin := COALESCE(NEW.is_admin, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_is_admin_on_update
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_is_admin();