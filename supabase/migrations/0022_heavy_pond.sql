/*
  # Add Azure Maps API Key to Environment Variables

  1. New Table
    - `environment_variables` table to store API keys and other sensitive data
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access only
*/

-- Create environment_variables table
CREATE TABLE IF NOT EXISTS environment_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE environment_variables ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Allow admins to view environment variables"
  ON environment_variables
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to insert environment variables"
  ON environment_variables
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update environment variables"
  ON environment_variables
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_environment_variables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_environment_variables_updated_at
  BEFORE UPDATE ON environment_variables
  FOR EACH ROW
  EXECUTE FUNCTION update_environment_variables_updated_at();