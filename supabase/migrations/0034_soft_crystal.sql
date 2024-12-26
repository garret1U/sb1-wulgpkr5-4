/*
  # Add proposal locations table

  1. New Tables
    - `proposal_locations`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, references proposals)
      - `location_id` (uuid, references locations)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `proposal_locations` table
    - Add indexes for performance
*/

-- Create proposal_locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS proposal_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, location_id)
);

-- Enable RLS if not already enabled
ALTER TABLE proposal_locations ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_proposal_locations_proposal ON proposal_locations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_locations_location ON proposal_locations(location_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_proposal_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_proposal_locations_updated_at ON proposal_locations;
CREATE TRIGGER update_proposal_locations_updated_at
  BEFORE UPDATE ON proposal_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_locations_updated_at();