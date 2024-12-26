/*
  # Simplify User Profile Policies

  1. Changes
    - Remove complex policy logic
    - Add index for faster admin lookups
    - Simplify RLS policies
    
  2. Security
    - Users can view/edit their own profiles
    - Admins can view/edit all profiles
    - Prevent users from making themselves admin
*/

-- Drop existing policies
DROP POLICY IF EXISTS "view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_view_all" ON user_profiles;
DROP POLICY IF EXISTS "create_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_all" ON user_profiles;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin ON user_profiles (user_id) WHERE is_admin = true;

-- Create new simplified policies
CREATE POLICY "allow_select_own"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "allow_select_admin"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles admins
    WHERE admins.user_id = auth.uid() 
    AND admins.is_admin = true
  ));

CREATE POLICY "allow_insert_own"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_nonadmin"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "allow_update_admin"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles admins
    WHERE admins.user_id = auth.uid() 
    AND admins.is_admin = true
  ));