/*
  # Add Location Coordinates

  1. New Columns
    - Add longitude and latitude columns to locations table
    - Add indexes for geospatial queries
  
  2. Sample Data
    - Update existing locations with sample coordinates
*/

-- Add coordinates columns
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS longitude text,
ADD COLUMN IF NOT EXISTS latitude text;

-- Create indexes for coordinates
CREATE INDEX IF NOT EXISTS idx_locations_coordinates 
ON locations(longitude, latitude) 
WHERE longitude IS NOT NULL AND latitude IS NOT NULL;

-- Update sample data with coordinates
UPDATE locations SET
  longitude = CASE
    WHEN city = 'Austin' THEN '-97.7431'
    WHEN city = 'Denver' THEN '-104.9903'
    WHEN city = 'Seattle' THEN '-122.3321'
    WHEN city = 'Chicago' THEN '-87.6298'
    WHEN city = 'Boston' THEN '-71.0589'
    WHEN city = 'Atlanta' THEN '-84.3879'
    WHEN city = 'Phoenix' THEN '-112.0740'
    WHEN city = 'Portland' THEN '-122.6784'
    WHEN city = 'Miami' THEN '-80.1918'
    WHEN city = 'Nashville' THEN '-86.7816'
    ELSE NULL
  END,
  latitude = CASE
    WHEN city = 'Austin' THEN '30.2672'
    WHEN city = 'Denver' THEN '39.7392'
    WHEN city = 'Seattle' THEN '47.6062'
    WHEN city = 'Chicago' THEN '41.8781'
    WHEN city = 'Boston' THEN '42.3601'
    WHEN city = 'Atlanta' THEN '33.7490'
    WHEN city = 'Phoenix' THEN '33.4484'
    WHEN city = 'Portland' THEN '45.5155'
    WHEN city = 'Miami' THEN '25.7617'
    WHEN city = 'Nashville' THEN '36.1627'
    ELSE NULL
  END
WHERE longitude IS NULL;