/*
  # Fix user profiles policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new non-recursive policies for user profiles
    - Add function to check admin status without recursion
    - Add index for better performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_own" ON user_profiles;
DROP POLICY IF EXISTS "allow_select_admin" ON user_profiles;
DROP POLICY IF EXISTS "allow_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_nonadmin" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_admin" ON user_profiles;

-- Create function to check admin status
CREATE OR REPLACE FUNCTION check_is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = check_user_id
    AND is_admin = true
  );
$$;

-- Create index for admin checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin_check
ON user_profiles (user_id, is_admin);

-- Create new policies
CREATE POLICY "select_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "select_if_admin"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (check_is_admin(auth.uid()));

CREATE POLICY "insert_own_profile"
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

CREATE POLICY "update_if_admin"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (check_is_admin(auth.uid()))
  WITH CHECK (check_is_admin(auth.uid()));