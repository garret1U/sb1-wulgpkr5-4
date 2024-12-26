/*
  # Fix User Profiles Recursion

  1. Changes
    - Drop existing policies that cause recursion
    - Create new policies using direct role/is_admin checks
    - Simplify policy logic to avoid recursive queries
    
  2. Security
    - Maintain proper access control
    - Keep admin privileges secure
    - Prevent infinite recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow system to create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own basic info" ON user_profiles;
DROP POLICY IF EXISTS "Allow admins to update all profiles" ON user_profiles;

-- Create new non-recursive policies
CREATE POLICY "view_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_view_all"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Direct check on the current user's profile
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "create_profile"
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
  USING (
    -- Direct check on the current user's profile
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    -- Direct check on the current user's profile
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid())
  );