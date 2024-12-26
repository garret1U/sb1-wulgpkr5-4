/*
  # Fix locations table schema and relations

  1. Changes
    - Add proper foreign key constraint for company relation
    - Update policies to ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON locations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON locations;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON locations;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON locations;

-- Create new policies with proper access control
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

-- Add proper foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'locations_company_id_fkey'
  ) THEN
    ALTER TABLE locations
    ADD CONSTRAINT locations_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE;
  END IF;
END $$;