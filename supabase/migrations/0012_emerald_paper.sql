/*
  # Simplify User Profiles

  1. Changes
    - Remove role column
    - Use only is_admin boolean for permissions
    - Update policies to use is_admin
    - Update handle_new_user function
    
  2. Security
    - Users can view/edit their own profiles
    - Admins can view/edit all profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_view_own" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_view" ON user_profiles;
DROP POLICY IF EXISTS "allow_create_own" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_update" ON user_profiles;

-- Remove role column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS role;

-- Create new simplified policies
CREATE POLICY "view_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_view_all"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ));

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
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  INSERT INTO public.user_profiles (user_id, is_admin, full_name)
  VALUES (
    NEW.id,
    user_count = 0,  -- First user is admin
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;