/*
  # Add audit columns for user tracking
  
  1. Add created_by and last_updated_by columns to tables
  2. Create trigger function to manage these columns
  3. Add triggers to each table
*/

-- Add columns to all tables
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(user_id),
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES user_profiles(user_id);

ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(user_id),
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES user_profiles(user_id);

ALTER TABLE circuits
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(user_id),
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES user_profiles(user_id);

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES user_profiles(user_id);

-- Create trigger function for audit columns
CREATE OR REPLACE FUNCTION manage_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.last_updated_by = auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.last_updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for each table
DROP TRIGGER IF EXISTS companies_audit_trigger ON companies;
CREATE TRIGGER companies_audit_trigger
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION manage_audit_fields();

DROP TRIGGER IF EXISTS locations_audit_trigger ON locations;
CREATE TRIGGER locations_audit_trigger
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION manage_audit_fields();

DROP TRIGGER IF EXISTS circuits_audit_trigger ON circuits;
CREATE TRIGGER circuits_audit_trigger
  BEFORE INSERT OR UPDATE ON circuits
  FOR EACH ROW
  EXECUTE FUNCTION manage_audit_fields();

DROP TRIGGER IF EXISTS proposals_audit_trigger ON proposals;
CREATE TRIGGER proposals_audit_trigger
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION manage_audit_fields();

-- Update existing records to set created_by and last_updated_by
-- This uses the first admin user as a fallback
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get the first admin user
  SELECT user_id INTO admin_id
  FROM user_profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;

  -- Update existing records
  UPDATE companies
  SET created_by = admin_id, last_updated_by = admin_id
  WHERE created_by IS NULL;

  UPDATE locations
  SET created_by = admin_id, last_updated_by = admin_id
  WHERE created_by IS NULL;

  UPDATE circuits
  SET created_by = admin_id, last_updated_by = admin_id
  WHERE created_by IS NULL;

  UPDATE proposals
  SET last_updated_by = admin_id
  WHERE last_updated_by IS NULL;
END $$;