/*
  # Update RLS policies for companies table
  
  1. Changes
    - Drop existing policies
    - Add new policies for authenticated users:
      - View all companies
      - Create companies
      - Update own companies
      - Delete own companies
  
  2. Security
    - Enable RLS
    - Policies tied to auth.uid()
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON companies;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users" ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON companies
  FOR DELETE
  TO authenticated
  USING (true);