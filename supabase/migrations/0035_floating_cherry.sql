/*
  # Add devices count to locations

  1. New Columns
    - `num_devices` (integer) - Number of devices at the location
  
  2. Changes
    - Add default value of 0
    - Add check constraint to ensure non-negative values
*/

-- Add num_devices column
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS num_devices integer DEFAULT 0 CHECK (num_devices >= 0);

-- Update existing records
UPDATE locations
SET num_devices = FLOOR(RANDOM() * 500) + 50
WHERE num_devices = 0;