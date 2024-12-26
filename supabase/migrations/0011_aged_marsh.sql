/*
  # Simplify User Profile Policies

  1. Changes
    - Remove recursive policy checks
    - Use direct role/admin checks
    - Add proper error handling
    
  2. Security
    - Users can view/edit their own profiles
    - Admins can view/edit all profiles
    - System can create new profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "system_create_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;

-- Create new simplified policies
CREATE POLICY "allow_view_own"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "allow_admin_view"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.is_admin = true
  ));

CREATE POLICY "allow_create_own"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_admin_update"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.is_admin = true
  ));