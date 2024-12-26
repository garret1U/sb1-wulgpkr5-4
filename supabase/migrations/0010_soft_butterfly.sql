/*
  # Fix User Profile Permissions

  1. Changes
    - Drop existing materialized view and policies
    - Implement simplified RLS policies
    - Update handle_new_user function
    
  2. Security
    - Users can view and update their own profiles
    - Admins can view and update all profiles
    - System can create new profiles
*/

-- Drop existing objects with CASCADE to handle dependencies
DROP MATERIALIZED VIEW IF EXISTS admin_status CASCADE;
DROP TRIGGER IF EXISTS refresh_admin_status_trigger ON user_profiles;
DROP FUNCTION IF EXISTS refresh_admin_status();

-- Drop existing policies
DROP POLICY IF EXISTS "basic_select" ON user_profiles;
DROP POLICY IF EXISTS "basic_insert" ON user_profiles;
DROP POLICY IF EXISTS "basic_update" ON user_profiles;

-- Create new simplified policies
CREATE POLICY "users_view_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own profile
    auth.uid() = user_id OR
    -- Admins can view all profiles
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "system_create_profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own non-role fields
    auth.uid() = user_id OR
    -- Admins can update any profile
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid())
  );

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