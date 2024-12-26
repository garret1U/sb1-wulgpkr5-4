/*
  # Add Server Details to Locations

  1. New Columns
    - num_servers (integer): Number of servers at the location
    - hosted_applications (text): Critical hosted business applications

  2. Changes
    - Add new columns to locations table
    - Add default values for existing records
*/

-- Add new columns to locations table
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS num_servers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS hosted_applications text;