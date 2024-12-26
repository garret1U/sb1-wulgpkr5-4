/*
  # Add Proposals Schema
  
  1. New Tables
    - `proposals`
      - `id` (uuid, primary key)
      - `name` (text)
      - `company_id` (uuid, references companies)
      - `status` (text) - Draft, Pending, Approved, Rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `valid_until` (date)
      - `notes` (text)
      
    - `proposal_items`
      - `id` (uuid, primary key) 
      - `proposal_id` (uuid, references proposals)
      - `circuit_id` (uuid, references circuits)
      - `location_id` (uuid, references locations)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `monthly_cost` (numeric)
      - `installation_cost` (numeric)
      - `term_months` (integer)
      - `notes` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending', 'Approved', 'Rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  valid_until date,
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create proposal_items table
CREATE TABLE IF NOT EXISTS proposal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  circuit_id uuid REFERENCES circuits(id) NOT NULL,
  location_id uuid REFERENCES locations(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  monthly_cost numeric NOT NULL CHECK (monthly_cost >= 0),
  installation_cost numeric NOT NULL DEFAULT 0 CHECK (installation_cost >= 0),
  term_months integer NOT NULL CHECK (term_months > 0),
  notes text
);

-- Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposals_company ON proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal ON proposal_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_circuit ON proposal_items(circuit_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_location ON proposal_items(location_id);

-- Create policies for proposals
CREATE POLICY "Enable read access for authenticated users" ON proposals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON proposals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON proposals
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for proposal items
CREATE POLICY "Enable read access for authenticated users" ON proposal_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON proposal_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON proposal_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON proposal_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_items_updated_at
  BEFORE UPDATE ON proposal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();