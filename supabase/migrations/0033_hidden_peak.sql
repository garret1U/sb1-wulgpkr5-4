/*
  # Add Proposal Setup Tables

  1. New Tables
    - `proposal_locations`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, references proposals)
      - `location_id` (uuid, references locations)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `setup_complete` boolean to proposals table
    - Add `setup_step` text to proposals table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add new columns to proposals table
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS setup_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_step text CHECK (setup_step IN ('company', 'locations', 'circuits')) DEFAULT 'company';

-- Create proposal_locations table
CREATE TABLE IF NOT EXISTS proposal_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, location_id)
);

-- Enable RLS
ALTER TABLE proposal_locations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposal_locations_proposal ON proposal_locations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_locations_location ON proposal_locations(location_id);

-- Create policies for proposal_locations
CREATE POLICY "Enable read access for authenticated users" ON proposal_locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON proposal_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON proposal_locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON proposal_locations
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_proposal_locations_updated_at
  BEFORE UPDATE ON proposal_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();