/*
  # Add Location Details

  1. New Columns
    - site_description (text): Description of the site
    - critical_processes (text): Critical on-site business processes
    - active_users (integer): Number of active users at the location

  2. Changes
    - Add new columns to locations table
    - Add default values for existing records
*/

-- Add new columns to locations table
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS site_description text,
ADD COLUMN IF NOT EXISTS critical_processes text,
ADD COLUMN IF NOT EXISTS active_users integer DEFAULT 0;