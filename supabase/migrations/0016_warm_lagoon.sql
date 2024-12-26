/*
  # Sync user profile with auth data
  
  1. Changes
    - Add function to sync user profile with auth data
    - Add trigger to automatically update profile when auth data changes
  
  2. Security
    - Function runs with security definer to access auth.users
*/

-- Create function to sync profile with auth data
CREATE OR REPLACE FUNCTION sync_profile_with_auth()
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

-- Create trigger to sync profile on insert/update
DROP TRIGGER IF EXISTS sync_profile_with_auth_trigger ON user_profiles;
CREATE TRIGGER sync_profile_with_auth_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_with_auth();