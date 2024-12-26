/*
  # Convert to Role-Based Access Control

  1. Changes
    - Drops existing policies and triggers
    - Adds role field for access control
    - Updates profile sync functionality
    - Creates new RLS policies using role-based checks
  
  2. Security
    - Enables RLS
    - Adds policies for viewing and updating profiles
    - Ensures proper role-based access control
*/

-- First drop all existing policies to avoid dependency issues
DROP POLICY IF EXISTS "view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_view_all" ON user_profiles;
DROP POLICY IF EXISTS "create_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_all" ON user_profiles;

-- Drop triggers first, then functions to handle dependencies correctly
DROP TRIGGER IF EXISTS sync_profile_trigger ON user_profiles;
DROP TRIGGER IF EXISTS sync_is_admin_on_update ON user_profiles;
DROP TRIGGER IF EXISTS sync_profile_with_auth_trigger ON user_profiles;

-- Now we can safely drop functions
DROP FUNCTION IF EXISTS sync_user_profile();
DROP FUNCTION IF EXISTS check_admin_role(uuid);
DROP FUNCTION IF EXISTS sync_profile_with_auth();

-- Add role column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'viewer'));

-- Set default role for any NULL values
UPDATE user_profiles
SET role = 'viewer'
WHERE role IS NULL;

-- Make role NOT NULL
ALTER TABLE user_profiles ALTER COLUMN role SET NOT NULL;

-- Create function to sync profile with auth data
CREATE OR REPLACE FUNCTION sync_profile_data()
RETURNS TRIGGER AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  -- Get auth user data
  SELECT * INTO auth_user
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Update profile with auth data if available
  NEW.email = COALESCE(NEW.email, auth_user.email);
  NEW.phone = COALESCE(NEW.phone, auth_user.phone);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync profile
CREATE TRIGGER sync_profile_data_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_data();

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  INSERT INTO public.user_profiles (
    user_id,
    role,
    email,
    phone
  )
  VALUES (
    NEW.id,
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'viewer' END,
    NEW.email,
    NEW.phone
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION has_admin_role(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_profiles.user_id = $1
    AND role = 'admin'
  );
$$;

-- Create new policies
CREATE POLICY "view_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_view_all"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (has_admin_role(auth.uid()));

CREATE POLICY "create_own_profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_update_all"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (has_admin_role(auth.uid()))
  WITH CHECK (has_admin_role(auth.uid()));

-- Create index for faster role checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_role
  ON user_profiles (user_id)
  WHERE role = 'admin';