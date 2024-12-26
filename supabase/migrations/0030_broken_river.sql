/*
  # Fix circuit location relationships

  1. Changes
    - Add proper foreign key constraint for circuits.location_id
    - Add index for faster joins
    - Update RLS policies to include proper joins

  2. Security
    - Maintain existing RLS policies while adding proper join support
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON circuits;

-- Add proper foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'circuits_location_id_fkey'
  ) THEN
    ALTER TABLE circuits
    ADD CONSTRAINT circuits_location_id_fkey
    FOREIGN KEY (location_id) REFERENCES locations(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for faster joins
CREATE INDEX IF NOT EXISTS idx_circuits_location_id ON circuits(location_id);

-- Create new policies with proper join support
CREATE POLICY "Enable read access for authenticated users" ON circuits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON circuits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON circuits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON circuits
  FOR DELETE
  TO authenticated
  USING (true);