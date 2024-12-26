/*
  # Add Test Data

  1. New Data
    - 10 locations with varied criticality levels
    - 2 active circuits per location (20 total)
    - 1-3 proposed circuits per location (20-30 total)
    
  2. Data Distribution
    - Locations spread across different cities and states
    - Mix of circuit types (MPLS, DIA, Broadband)
    - Varied bandwidth and costs
*/

-- Get first company ID for test data
DO $$
DECLARE
  company_id uuid;
BEGIN
  SELECT id INTO company_id FROM companies LIMIT 1;
  
  -- Insert 10 test locations
  INSERT INTO locations (name, address, city, state, zip_code, country, criticality, company_id)
  VALUES
    ('Data Center Alpha', '123 Tech Park Drive', 'Austin', 'TX', '78701', 'USA', 'High', company_id),
    ('Regional Office Beta', '456 Business Ave', 'Denver', 'CO', '80202', 'USA', 'Medium', company_id),
    ('Branch Office Gamma', '789 Commerce St', 'Seattle', 'WA', '98101', 'USA', 'Low', company_id),
    ('Operations Center Delta', '321 Enterprise Way', 'Chicago', 'IL', '60601', 'USA', 'High', company_id),
    ('Sales Office Epsilon', '654 Market Square', 'Boston', 'MA', '02108', 'USA', 'Medium', company_id),
    ('Support Center Zeta', '987 Service Road', 'Atlanta', 'GA', '30301', 'USA', 'Medium', company_id),
    ('Distribution Hub Eta', '147 Logistics Parkway', 'Phoenix', 'AZ', '85001', 'USA', 'High', company_id),
    ('Research Lab Theta', '258 Innovation Blvd', 'Portland', 'OR', '97201', 'USA', 'Low', company_id),
    ('Call Center Iota', '369 Contact Drive', 'Miami', 'FL', '33101', 'USA', 'Medium', company_id),
    ('Backup Site Kappa', '741 Redundancy Lane', 'Nashville', 'TN', '37201', 'USA', 'High', company_id);

  -- Insert 2 active circuits per location
  INSERT INTO circuits (
    carrier, type, purpose, status, bandwidth, monthlycost,
    static_ips, upload_bandwidth, contract_start_date, contract_term,
    contract_end_date, billing, usage_charges, installation_cost,
    location_id, notes
  )
  SELECT
    CASE (RANDOM() * 3)::INT
      WHEN 0 THEN 'AT&T'
      WHEN 1 THEN 'Verizon'
      WHEN 2 THEN 'CenturyLink'
      ELSE 'Spectrum'
    END as carrier,
    CASE (RANDOM() * 2)::INT
      WHEN 0 THEN 'MPLS'
      WHEN 1 THEN 'DIA'
      ELSE 'Broadband'
    END as type,
    CASE MOD(ROW_NUMBER() OVER (), 2)
      WHEN 0 THEN 'Primary'
      ELSE 'Secondary'
    END as purpose,
    'Active' as status,
    ((RANDOM() * 900 + 100)::INT || ' Mbps') as bandwidth,
    (RANDOM() * 2000 + 500)::NUMERIC(10,2) as monthlycost,
    (RANDOM() * 8 + 1)::INT as static_ips,
    ((RANDOM() * 400 + 100)::INT || ' Mbps') as upload_bandwidth,
    CURRENT_DATE - (RANDOM() * 365)::INT as contract_start_date,
    12 * (RANDOM() * 2 + 1)::INT as contract_term,
    CURRENT_DATE + (RANDOM() * 365)::INT as contract_end_date,
    'Monthly' as billing,
    RANDOM() > 0.7 as usage_charges,
    (RANDOM() * 1000)::NUMERIC(10,2) as installation_cost,
    id as location_id,
    'Active circuit configuration' as notes
  FROM locations;

  -- Insert 1-3 proposed circuits per location
  INSERT INTO circuits (
    carrier, type, purpose, status, bandwidth, monthlycost,
    static_ips, upload_bandwidth, contract_start_date, contract_term,
    contract_end_date, billing, usage_charges, installation_cost,
    location_id, notes
  )
  SELECT
    CASE (RANDOM() * 3)::INT
      WHEN 0 THEN 'Lumen'
      WHEN 1 THEN 'Cox'
      WHEN 2 THEN 'Comcast'
      ELSE 'Charter'
    END as carrier,
    CASE (RANDOM() * 2)::INT
      WHEN 0 THEN 'MPLS'
      WHEN 1 THEN 'DIA'
      ELSE 'Broadband'
    END as type,
    CASE (RANDOM() * 2)::INT
      WHEN 0 THEN 'Primary'
      WHEN 1 THEN 'Secondary'
      ELSE 'Backup'
    END as purpose,
    'Quoted' as status,
    ((RANDOM() * 900 + 100)::INT || ' Mbps') as bandwidth,
    (RANDOM() * 2000 + 500)::NUMERIC(10,2) as monthlycost,
    (RANDOM() * 8 + 1)::INT as static_ips,
    ((RANDOM() * 400 + 100)::INT || ' Mbps') as upload_bandwidth,
    CURRENT_DATE + (RANDOM() * 30)::INT as contract_start_date,
    12 * (RANDOM() * 2 + 1)::INT as contract_term,
    CURRENT_DATE + (RANDOM() * 365 + 365)::INT as contract_end_date,
    'Monthly' as billing,
    RANDOM() > 0.7 as usage_charges,
    (RANDOM() * 1000)::NUMERIC(10,2) as installation_cost,
    id as location_id,
    'Proposed circuit quote' as notes
  FROM locations
  CROSS JOIN generate_series(1, (RANDOM() * 2 + 1)::INT);
END $$;