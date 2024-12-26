# FUNCTIONAL_REQUIREMENTS

## 1. Overview
The **ISP Circuit Assessment Application** enables users to manage companies, their locations, and any associated circuits. Two user roles exist:

1. **Admin**: Can perform **all** CRUD (Create, Read, Update, Delete) operations on companies, locations, and circuits.  
2. **Viewer**: Can **view** all records but **cannot** modify data.

Below are the essential functional requirements, accompanied by representative UI screenshots illustrating one possible implementation.

---

## 2. User Authentication & Roles

1. **Basic Sign In**  
   - Users sign in with simple credentials (e.g., email/password).
   - After authentication, the user is assigned a role:
     - **Admin** or **Viewer**.

2. **Permissions**  
   - **Admin**:  
     - Create, edit, and delete records in all tables (companies, locations, circuits).
   - **Viewer**:  
     - **Read-only** access.

*(No advanced user management or multi-organization features are included.)*

---

## 3. Company Management

### 3.1 Company Data Model
Each company record corresponds to a row in the **`companies`** table with the following fields:
- `id` (UUID): Primary key
- `name` (character varying(255)): Company name
- `address` (text): Street address
- `city` (character varying(100)): City name
- `state` (character varying(50)): State name
- `zip_code` (character varying(20)): ZIP/Postal code
- `phone` (character varying(20)): Contact phone number
- `email` (character varying(255)): Contact email address
- `website` (character varying(255)): Company website URL
- `created_at` (timestamp with time zone): Record creation timestamp
- `updated_at` (timestamp with time zone): Record update timestamp

### 3.2 Functional Requirements

- **Create Company (Admin Only)**  
  - Provide mandatory fields (`name`, `address`, `city`, etc.).  
  - Auto-generate `id`, `created_at`, and `updated_at`.
  
- **View Companies (Admin & Viewer)**  
  - List all companies, filter by city/state, or search by name.  
  - Display details such as address, phone, email, etc.
  
- **Update Company (Admin Only)**  
  - Change any field (e.g., `address`, `phone`, `website`).  
  - Update `updated_at` automatically.
  
- **Delete Company (Admin Only)**  
  - If company has related locations or circuits, handle logic accordingly (e.g., confirm dependencies).  
  - Log or record the deletion in an audit trail.

#### Representative UI (Settings Page)
Below is a sample **Settings** screen showing how an Admin might edit their company's information:

*(See **Settings Screenshot** in the attached images.)*

- The form includes fields for **Company Name**, **Address**, **City**, **State**, **Zip Code**, **Phone**, **Email**, and **Website**.  
- An **Update** button allows Admins to save changes.

---

## 4. Location Management

### 4.1 Location Data Model
Each location record is in the **`locations`** table:
- `id` (UUID): Primary key
- `name` (character varying(255)): Location name
- `address` (text): Street address
- `city` (character varying(100)): City name
- `state` (character varying(50)): State name
- `zip_code` (character varying(20)): ZIP/Postal code
- `country` (character varying(100)): Country name
- `criticality` (character varying(10)): “High”, “Low”, “Medium”, etc.
- `created_at` (timestamp with time zone): Creation timestamp
- `updated_at` (timestamp with time zone): Update timestamp
- `company_id` (UUID): Foreign key referencing `companies.id`

### 4.2 Functional Requirements

- **Create Location (Admin Only)**  
  - Link the location to a valid `company_id`.  
  - Set required fields (`name`, `address`, `city`, etc.).  
  - Auto-generate `id`, `created_at`, and `updated_at`.
  
- **View Locations (Admin & Viewer)**  
  - Display all locations in a list/table view.  
  - Filter by city/state, criticality, or related company.  
  - Search by location name.

- **Update Location (Admin Only)**  
  - Edit fields (e.g., `name`, `city`, `criticality`).  
  - Update `updated_at` on save.  
  - Validate `company_id` if changed.

- **Delete Location (Admin Only)**  
  - Check for dependent circuits before removal.  
  - Confirm or cascade the delete if business rules allow.

#### Representative UI (Locations Page)
Below is a sample **Locations** screen:

*(See **Locations Screenshot** in the attached images.)*

- **List view** displays each location’s name, address, city, state, ZIP code, country, and criticality.  
- Sorting and filtering are available (e.g., by city, criticality).  
- **Create Location** button invokes a modal or a form to add a new location.

---

## 5. Circuit Management

### 5.1 Circuit Data Model
Each circuit record belongs to the **`circuits`** table:
- `id` (UUID): Primary key
- `carrier` (text): Carrier or ISP name
- `type` (text): Circuit type (e.g., “MPLS”, “DIA”, “Broadband”)
- `purpose` (text): “Primary”, “Secondary”, “Backup”, etc.
- `status` (text): “Active”, “Inactive”, “Quoted”, etc.
- `bandwidth` (text): Advertised bandwidth (e.g., “100 Mbps”)
- `monthlycost` (numeric): Monthly recurring cost
- `static_ips` (integer): Number of static IP addresses
- `upload_bandwidth` (character varying(255)): Upload speed detail
- `contract_start_date` (date): Contract start
- `contract_term` (integer): Term length in months
- `contract_end_date` (date): Contract end
- `billing` (character varying(10)): Billing frequency (e.g., “Monthly”)
- `usage_charges` (boolean): Whether usage-based charges apply
- `installation_cost` (numeric(10,2)): Installation fee
- `notes` (text): Additional remarks
- `location_id` (UUID): Foreign key referencing `locations.id`

### 5.2 Functional Requirements

- **Create Circuit (Admin Only)**  
  - Must reference a valid `location_id`.  
  - Set carrier, type, status, monthly cost, etc.  
  - Auto-generate `id`, track `created_at` and `updated_at`.

- **View Circuits (Admin & Viewer)**  
  - List circuits with sorting and filtering by carrier, type, status, cost, etc.  
  - Search by carrier name or other attributes.

- **Update Circuit (Admin Only)**  
  - Modify fields like status, monthly cost, contract details.  
  - Validate date fields (e.g., `contract_end_date` ≥ `contract_start_date`).
  - Update `updated_at`.

- **Delete Circuit (Admin Only)**  
  - Verify business rules (e.g., if the circuit is still in use).  
  - Log or audit the deletion event.

#### Representative UI (Circuits Page & Circuit Form)
1. **Circuits Page**:  
   - Displays a **table** of circuits with columns for Carrier, Type, Purpose, Status, Bandwidth, Monthly Cost, and Location.  
   - Sorting and searching features in the header.  
   - **Create Circuit** button to add new entries.

2. **Create/Update Circuit** Form:  
   - Fields for all attributes (Carrier, Purpose, Bandwidth, Monthly Cost, Contract Term, etc.).  
   - **Save** button to commit changes, **Cancel** to discard.

*(See **Circuits Screenshots** in the attached images.)*

---

## 6. Data Management

### 6.1 Data Operations
- **Validation**  
  - Ensure numeric fields (e.g., `monthlycost`) cannot be invalid (e.g., negative cost).  
  - Check foreign keys (`company_id`, `location_id`) reference existing records.
  
- **Search & Filtering**  
  - Provide text-based search for key fields (e.g., location name, carrier).  
  - Allow column-based filtering (city/state for locations, status/type for circuits).

- **Data Integrity**  
  - Support concurrent access.  
  - Apply **transaction management** for multi-step operations.  
  - Keep **audit logs** for create, update, delete actions.

### 6.2 Data Security
- Enforce **role-based access** at the application layer (Admin vs. Viewer).  
- Keep **audit trails** in logs or via `created_at`/`updated_at`.  
- Use **encryption** in transit (HTTPS) and at rest if required.

---

## 7. Reporting & Analytics

### 7.1 Dashboard (Admin & Viewer)
- Display **key metrics** at a glance:
  - **Total Circuits**, **Active Circuits**, **Inactive Circuits**, and **Total Monthly Cost**.
- Optional charts or percentages (e.g., the proportion of active vs. inactive circuits).

#### Representative UI (Dashboard)
Below is a sample **Dashboard** screen:

*(See **Dashboard Screenshot** in the attached images.)*

- **Cards** show summary numbers (e.g., total circuits = 19, active circuits = 10, inactive = 3).  
- Cost metrics (e.g., $0 total monthly cost in this example).

### 7.2 Other Reports (Optional)
- **Company Summaries**: Number of locations, total circuits, etc.  
- **Location Summaries**: Criticality distribution, city/state breakdown.  
- **Circuit Summaries**: Cost roll-ups, active vs. inactive, contract expiration alerts.

---

## 8. Performance Requirements

### 8.1 Response Times
- **API Responses**: ~500ms or faster for typical queries.  
- **Page Loads**: Under 2 seconds on average.  
- **Search**: Return filtered results in ~300ms.

### 8.2 Scalability
- Handle ~1,000 concurrent users (Admin or Viewer).  
- **Thousands** of companies, **tens of thousands** of locations, and **hundreds of thousands** of circuits.  
- Data storage up to **1TB**.

---

## 9. Final Notes & Screens
1. **CRUD operations** must respect Admin vs. Viewer permissions.  
2. **Data integrity** is paramount; ensure references (company ↔ location ↔ circuit) remain valid.  
3. **UI Screenshots** attached are representative and can be adapted as needed:
   - **Dashboard**: Summaries of total circuits, active/inactive counts, monthly costs.
   - **Circuits**: Table of circuits with filtering, searching, sorting, plus “Create Circuit” form.
   - **Locations**: Table of locations with filtering, searching, sorting, plus “Create Location” form.
   - **Settings**: Form to edit the current company’s details.

These images serve as **visual references** for developers (both human and AI) to understand the layout and workflow when implementing the functional requirements.
