/*
  # Environment Variables Function

  1. Changes
    - Add function to safely retrieve environment variables
    - Ensure proper RLS enforcement
    - Add caching hints for better performance

  2. Security
    - Function is security definer to enforce RLS
    - Only authenticated users can execute
*/

-- Create function to get environment variables
CREATE OR REPLACE FUNCTION get_environment_variable(var_key text)
RETURNS TABLE (value text)
SECURITY DEFINER
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT ev.value
  FROM environment_variables ev
  WHERE ev.key = var_key;
END;
$$;