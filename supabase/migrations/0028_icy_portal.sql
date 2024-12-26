/*
  # Update locations table schema

  1. Changes
    - Add company relation to locations query
    - Fix column names to match schema
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON locations;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users" ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON locations
  FOR DELETE
  TO authenticated
  USING (true);