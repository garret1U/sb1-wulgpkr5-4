/*
  # Fix proposal circuits table
  
  1. Add unique constraint for proposal circuits
  2. Add trigger to validate circuit location
  3. Update policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON proposal_circuits;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON proposal_circuits;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON proposal_circuits;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON proposal_circuits;

-- Add unique constraint to prevent duplicate circuits in proposals
ALTER TABLE proposal_circuits
ADD CONSTRAINT proposal_circuits_unique_circuit
UNIQUE (proposal_id, circuit_id);

-- Create function to validate circuit location
CREATE OR REPLACE FUNCTION validate_circuit_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify circuit belongs to location
  IF NOT EXISTS (
    SELECT 1 FROM circuits
    WHERE id = NEW.circuit_id
    AND location_id = NEW.location_id
  ) THEN
    RAISE EXCEPTION 'Circuit must belong to the specified location';
  END IF;

  -- Verify location belongs to proposal's company
  IF NOT EXISTS (
    SELECT 1 FROM proposals p
    JOIN locations l ON l.company_id = p.company_id
    WHERE p.id = NEW.proposal_id
    AND l.id = NEW.location_id
  ) THEN
    RAISE EXCEPTION 'Location must belong to the proposal''s company';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_proposal_circuit ON proposal_circuits;
CREATE TRIGGER validate_proposal_circuit
  BEFORE INSERT OR UPDATE ON proposal_circuits
  FOR EACH ROW
  EXECUTE FUNCTION validate_circuit_location();

-- Create new policies
CREATE POLICY "view_proposal_circuits"
  ON proposal_circuits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "insert_proposal_circuits"
  ON proposal_circuits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "update_proposal_circuits"
  ON proposal_circuits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "delete_proposal_circuits"
  ON proposal_circuits
  FOR DELETE
  TO authenticated
  USING (true);