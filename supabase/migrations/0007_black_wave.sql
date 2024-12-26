/*
  # Fix User Profiles Policies

  1. Changes
    - Drop existing policies
    - Add is_admin column for better performance
    - Create simplified policies without OLD/NEW references
    - Update trigger functions
    
  2. Security
    - Maintain proper access control
    - Prevent role self-modification
    - Keep admin privileges secure
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable profile creation" ON user_profiles;

-- Add is_admin column for better performance
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update existing records
UPDATE user_profiles SET is_admin = (role = 'admin');

-- Create trigger to maintain is_admin
CREATE OR REPLACE FUNCTION sync_is_admin()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_admin := (NEW.role = 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_is_admin_on_update
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_is_admin();

-- Create new simplified policies
CREATE POLICY "Allow users to view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Separate insert policy
CREATE POLICY "Allow system to create profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update policies that don't use OLD/NEW references
CREATE POLICY "Allow users to update own basic info"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Function to prevent role self-modification
CREATE OR REPLACE FUNCTION prevent_role_self_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id = auth.uid() AND OLD.role != NEW.role THEN
    RAISE EXCEPTION 'Users cannot modify their own role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_role_self_modification_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_modification();

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  INSERT INTO public.user_profiles (user_id, role, is_admin)
  VALUES (
    NEW.id,
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'viewer' END,
    user_count = 0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;