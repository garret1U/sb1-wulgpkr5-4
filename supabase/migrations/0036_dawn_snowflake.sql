/*
  # Rename proposal_items to proposal_circuits

  1. Changes
    - Rename proposal_items table to proposal_circuits
    - Remove duplicated circuit data columns
    - Keep only the essential reference to circuit and location

  2. Data Migration
    - Move existing data to new structure
    - Clean up old table
*/

-- Create new table
CREATE TABLE IF NOT EXISTS proposal_circuits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  circuit_id uuid REFERENCES circuits(id) NOT NULL,
  location_id uuid REFERENCES locations(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data from old table
INSERT INTO proposal_circuits (
  proposal_id,
  circuit_id,
  location_id,
  created_at,
  updated_at
)
SELECT 
  proposal_id,
  circuit_id,
  location_id,
  created_at,
  updated_at
FROM proposal_items;

-- Enable RLS
ALTER TABLE proposal_circuits ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposal_circuits_proposal ON proposal_circuits(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_circuits_circuit ON proposal_circuits(circuit_id);
CREATE INDEX IF NOT EXISTS idx_proposal_circuits_location ON proposal_circuits(location_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_proposal_circuits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposal_circuits_updated_at
  BEFORE UPDATE ON proposal_circuits
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_circuits_updated_at();

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON proposal_circuits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON proposal_circuits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON proposal_circuits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON proposal_circuits
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop old table
DROP TABLE IF EXISTS proposal_items;