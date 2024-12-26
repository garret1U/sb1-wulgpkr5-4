/*
  # Fix Company Schema Migration

  1. Changes
    - Make new address fields NOT NULL
    - Add proper constraints
    - Ensure data migration
    - Drop old columns

  2. Security
    - Maintain existing RLS policies
*/

-- First, ensure all data is migrated
UPDATE companies
SET
  street_address = COALESCE(street_address, address, ''),
  address_city = COALESCE(address_city, city, ''),
  address_state = COALESCE(address_state, state, ''),
  address_zip = COALESCE(address_zip, zip_code, ''),
  address_country = COALESCE(address_country, 'United States')
WHERE
  street_address IS NULL OR
  address_city IS NULL OR
  address_state IS NULL OR
  address_zip IS NULL OR
  address_country IS NULL;

-- Make new columns NOT NULL
ALTER TABLE companies
  ALTER COLUMN street_address SET NOT NULL,
  ALTER COLUMN address_city SET NOT NULL,
  ALTER COLUMN address_state SET NOT NULL,
  ALTER COLUMN address_zip SET NOT NULL,
  ALTER COLUMN address_country SET NOT NULL;

-- Drop old columns
ALTER TABLE companies
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS zip_code;