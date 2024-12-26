/*
  # Fix User Profiles Policies and Add Default Admin

  1. Changes
    - Drop and recreate policies with proper checks
    - Add policy for users to update their own profile
    - Ensure first user gets admin role
    
  2. Security
    - Maintain proper access control
    - Allow users to manage their own profiles
    - Admins can manage all profiles
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;

-- Create new policies with proper checks
CREATE POLICY "Users can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Enable profile creation"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to make first user admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  IF user_count = 0 THEN
    -- First user becomes admin
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Subsequent users become viewers
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'viewer');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;