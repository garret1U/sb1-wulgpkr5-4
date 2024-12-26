/*
  # Update Company Address Fields

  1. Changes
    - Split address field into separate components
    - Add new columns for structured address data
    - Migrate existing address data
    - Add indexes for improved search performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add new address columns
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_zip text,
ADD COLUMN IF NOT EXISTS address_country text DEFAULT 'United States';

-- Migrate existing address data
UPDATE companies
SET
  street_address = address,
  address_city = city,
  address_state = state,
  address_zip = zip_code,
  address_country = 'United States'
WHERE street_address IS NULL;

-- Create indexes for address fields
CREATE INDEX IF NOT EXISTS idx_companies_street_address ON companies(street_address);
CREATE INDEX IF NOT EXISTS idx_companies_address_city ON companies(address_city);
CREATE INDEX IF NOT EXISTS idx_companies_address_state ON companies(address_state);
CREATE INDEX IF NOT EXISTS idx_companies_address_zip ON companies(address_zip);