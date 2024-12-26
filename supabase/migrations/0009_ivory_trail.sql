/*
  # Fix User Profiles Policies

  1. Changes
    - Drop all existing policies
    - Create simplified non-recursive policies
    - Add materialized admin status view for performance
    - Update triggers to maintain materialized status
    
  2. Security
    - Maintain proper access control
    - Prevent recursion in policy checks
    - Keep admin privileges secure
*/

-- Drop existing policies
DROP POLICY IF EXISTS "view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_view_all" ON user_profiles;
DROP POLICY IF EXISTS "create_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_all" ON user_profiles;

-- Create materialized admin status
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_status AS
SELECT user_id, is_admin
FROM user_profiles
WHERE is_admin = true;

-- Create index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS admin_status_user_id_idx ON admin_status (user_id);

-- Function to refresh admin status
CREATE OR REPLACE FUNCTION refresh_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_status;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh admin status
DROP TRIGGER IF EXISTS refresh_admin_status_trigger ON user_profiles;
CREATE TRIGGER refresh_admin_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_admin_status();

-- Create new simplified policies
CREATE POLICY "basic_select"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM admin_status WHERE user_id = auth.uid())
  );

CREATE POLICY "basic_insert"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "basic_update"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM admin_status WHERE user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM admin_status WHERE user_id = auth.uid())
  );

-- Initial refresh of admin status
REFRESH MATERIALIZED VIEW admin_status;