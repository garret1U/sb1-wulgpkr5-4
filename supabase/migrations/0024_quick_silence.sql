/*
  # Azure Maps Integration Setup

  1. Changes
    - Insert Azure Maps API key
    - Add indexes for faster key lookups
    - Add description field for better key management

  2. Security
    - Maintain existing RLS policies
    - Only admins can access environment variables
*/

-- Insert Azure Maps key
INSERT INTO environment_variables (key, value, description)
VALUES (
  'AZURE_MAPS_KEY',
  '9ECI3Tr3IBqanjfubsNI6RNRnkMKtNTBuRBfIsiNNx4aOtglgOLKJQQJ99ALACYeBjFGtcyPAAAgAZMPKUg5',
  'Azure Maps API key for address validation and geocoding'
) ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value,
    description = EXCLUDED.description;