/*
  # Update proposal circuits validation
  
  1. Drop and recreate policies with unique names
  2. Update validation trigger
*/

-- Drop existing policies
DROP POLICY IF EXISTS "view_proposal_circuits" ON proposal_circuits;
DROP POLICY IF EXISTS "insert_proposal_circuits" ON proposal_circuits;
DROP POLICY IF EXISTS "update_proposal_circuits" ON proposal_circuits;
DROP POLICY IF EXISTS "delete_proposal_circuits" ON proposal_circuits;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS validate_proposal_circuit ON proposal_circuits;
DROP FUNCTION IF EXISTS validate_circuit_location();

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
CREATE TRIGGER validate_proposal_circuit
  BEFORE INSERT OR UPDATE ON proposal_circuits
  FOR EACH ROW
  EXECUTE FUNCTION validate_circuit_location();

-- Create new policies with unique names
CREATE POLICY "proposal_circuits_select"
  ON proposal_circuits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "proposal_circuits_insert"
  ON proposal_circuits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "proposal_circuits_update"
  ON proposal_circuits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "proposal_circuits_delete"
  ON proposal_circuits
  FOR DELETE
  TO authenticated
  USING (true);