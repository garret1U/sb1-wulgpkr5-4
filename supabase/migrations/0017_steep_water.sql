/*
  # Fix User Profiles Schema

  1. Changes
    - Drop existing triggers and functions
    - Add role column
    - Update policies for role-based access
    - Add sync with auth data
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS sync_is_admin_on_update ON user_profiles;
DROP TRIGGER IF EXISTS sync_profile_with_auth_trigger ON user_profiles;
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS sync_profile_with_auth();

-- Add role column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'viewer'));

-- Migrate data: Convert is_admin to role
UPDATE user_profiles
SET role = CASE 
  WHEN is_admin = true THEN 'admin'
  ELSE 'viewer'
END
WHERE role IS NULL;

-- Drop is_admin column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS is_admin;

-- Make role NOT NULL
ALTER TABLE user_profiles ALTER COLUMN role SET NOT NULL;

-- Create function to sync profile with auth data
CREATE OR REPLACE FUNCTION sync_user_profile()
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
CREATE TRIGGER sync_profile_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

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
CREATE OR REPLACE FUNCTION check_admin_role(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_view_all" ON user_profiles;
DROP POLICY IF EXISTS "create_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_all" ON user_profiles;

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
  USING (check_admin_role(auth.uid()));

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
  USING (check_admin_role(auth.uid()))
  WITH CHECK (check_admin_role(auth.uid()));