# SYSTEM_DATABASE_DESIGN

## 1. Introduction
The **ISP Circuit Assessment Application** is designed to manage data about companies, their locations, and network circuits. This document details the overall system architecture and the database design. It also provides guidelines on how to maintain cohesion between the application logic and the data model.

---

## 2. System Architecture Overview

### 2.1 High-Level Components
1. **Front-End (UI Layer)**  
   - Built using a modern JS framework (e.g., React/Next.js).  
   - Utilizes Tailwind CSS for styling and a design system that supports both light and dark modes.
   - Communicates with the back-end via RESTful or GraphQL APIs.

2. **Back-End (API Layer)**  
   - Node.js or similar server technology.  
   - Implements authentication/authorization (e.g., with Clerk or similar service).  
   - Handles business logic, data validation, and role-based access (Admin vs. Viewer).

3. **Database**  
   - A PostgreSQL or equivalent relational database system.  
   - Schemas, tables, and relationships defined to store and retrieve data efficiently.  
   - Enforces referential integrity via foreign keys.

### 2.2 Data Flow
1. **User Request** → **Front-End** (React/Next.js)  
2. **API Call** → **Back-End** (Node + Express/GraphQL)  
3. **Database Query** (PostgreSQL)  
4. **Response Returned** → **Front-End** Renders/Updates UI

This layered approach ensures **separation of concerns**, making the system easier to scale horizontally (adding more API or front-end servers) or vertically (increasing database resources).

---

## 3. Database Schema

### 3.1 Schema Overview
The application contains three primary tables:

1. **companies**  
2. **locations**  
3. **circuits**

Below is a simplified entity-relationship diagram (ERD) representing these relationships:

```
  +-------------------+                +-------------------+
  |     companies     |                |     locations     |
  +-------------------+                +-------------------+
  | id (PK)           |                | id (PK)           |
  | name              |                | name              |
  | address           |                | address           |
  | city              |                | city              |
  | state             |                | state             |
  | zip_code          |                | zip_code          |
  | phone             |                | country           |
  | email             |                | criticality       |
  | website           |                | created_at        |
  | created_at        |                | updated_at        |
  | updated_at        |                | company_id (FK)   |
  +---------+---------+                +--------+----------+
            |                                   ^
            | (1-to-many)                       |
            +--------------> company_id <-------+

                           +-------------------+
                           |     circuits     |
                           +-------------------+
                           | id (PK)           |
                           | carrier           |
                           | type              |
                           | purpose           |
                           | status            |
                           | bandwidth         |
                           | monthlycost       |
                           | static_ips        |
                           | upload_bandwidth  |
                           | contract_start_date|
                           | contract_term     |
                           | contract_end_date |
                           | billing           |
                           | usage_charges     |
                           | installation_cost |
                           | notes             |
                           | location_id (FK)  |
                           +--------+----------+
                                    ^
                                    |
                  (1-to-many)       |
        location_id <---------------+
```

---

## 4. Table Definitions & Columns

### 4.1 `companies`
Stores information about the company itself.

| **Column Name** | **Data Type**                | **Description**                        |
|-----------------|-------------------------------|----------------------------------------|
| `id`            | UUID (PK)                    | Unique company identifier              |
| `name`          | character varying(255)       | Company name                           |
| `address`       | text                         | Street address                         |
| `city`          | character varying(100)       | City name                              |
| `state`         | character varying(50)        | State name                             |
| `zip_code`      | character varying(20)        | ZIP/Postal code                        |
| `phone`         | character varying(20)        | Contact phone number                   |
| `email`         | character varying(255)       | Contact email address                  |
| `website`       | character varying(255)       | Company website URL                    |
| `created_at`    | timestamp with time zone     | Record creation timestamp              |
| `updated_at`    | timestamp with time zone     | Record update timestamp                |

**Constraints & Considerations**  
- `id` is the primary key (PK).  
- `created_at` and `updated_at` are typically auto-managed (e.g., by triggers or application logic).  
- Indexes can be created on fields commonly used for searching (e.g., `name`, `city`).

---

### 4.2 `locations`
Stores details about each location belonging to a company.

| **Column Name**  | **Data Type**               | **Description**                               |
|------------------|-----------------------------|-----------------------------------------------|
| `id`             | UUID (PK)                   | Unique location identifier                    |
| `name`           | character varying(255)      | Location name                                 |
| `address`        | text                        | Street address                                |
| `city`           | character varying(100)      | City name                                     |
| `state`          | character varying(50)       | State name                                    |
| `zip_code`       | character varying(20)       | ZIP/Postal code                               |
| `country`        | character varying(100)      | Country name                                  |
| `criticality`    | character varying(10)       | Criticality level (e.g., "High", "Low")       |
| `created_at`     | timestamp with time zone    | Record creation timestamp                     |
| `updated_at`     | timestamp with time zone    | Record update timestamp                       |
| `company_id`     | UUID (FK → companies.id)    | Foreign key referencing the company's `id`    |

**Constraints & Considerations**  
- **Foreign key** constraint on `company_id` ensures each location belongs to a valid company.  
- **One-to-many** relationship: one company can have multiple locations.  
- Potential indexes for `city`, `state`, `criticality` if search/filter speed is critical.  

---

### 4.3 `circuits`
Contains circuit information for a given location.

| **Column Name**         | **Data Type**             | **Description**                                  |
|-------------------------|---------------------------|--------------------------------------------------|
| `id`                    | UUID (PK)                 | Unique circuit identifier                        |
| `carrier`               | text                      | Carrier or ISP name                              |
| `type`                  | text                      | Circuit type (e.g., "MPLS", "DIA", "Broadband")  |
| `purpose`               | text                      | "Primary", "Secondary", "Backup", etc.           |
| `status`                | text                      | "Active", "Inactive", "Quoted", etc.             |
| `bandwidth`             | text                      | Advertised bandwidth (e.g., "100 Mbps")          |
| `monthlycost`           | numeric                   | Monthly recurring cost                           |
| `static_ips`            | integer                   | Number of static IPs provided                    |
| `upload_bandwidth`      | character varying(255)    | Upload speed detail                              |
| `contract_start_date`   | date                      | Contract start date                              |
| `contract_term`         | integer                   | Contract term length (months)                    |
| `contract_end_date`     | date                      | Contract end date                                |
| `billing`               | character varying(10)     | Billing frequency/method (e.g., "Monthly")       |
| `usage_charges`         | boolean                   | True if usage-based charges apply                |
| `installation_cost`     | numeric(10,2)             | One-time installation fee                        |
| `notes`                 | text                      | Any additional remarks                           |
| `location_id`           | UUID (FK → locations.id)  | Foreign key referencing the location's `id`      |

**Constraints & Considerations**  
- **Foreign key** on `location_id` enforces a valid location.  
- **One-to-many** relationship: one location can have multiple circuits.  
- Numeric fields (`monthlycost`, `installation_cost`) need validation (e.g., must be ≥ 0).  

---

## 5. Data Integrity & Transactions

1. **Foreign Key Constraints**  
   - `companies.id` → `locations.company_id`  
   - `locations.id` → `circuits.location_id`  
   Ensures no orphaned records (locations without a valid company or circuits without a valid location).

2. **Transaction Management**  
   - When creating or updating records that span multiple tables (e.g., adding a company and its locations in a single workflow), wrap operations in **database transactions** to prevent partial updates.

3. **Auditing**  
   - `created_at` and `updated_at` are standard.  
   - Additional audit logs (e.g., a separate `audit_log` table or event-based logging) may be used for more detailed tracking of user actions.

---

## 6. Indexing & Query Patterns

1. **Primary Keys**  
   - All tables have a PK of type **UUID** for scalable and unique identification.

2. **Indexes**  
   - Consider indexing frequently searched columns:  
     - `companies.name`, `companies.city`  
     - `locations.name`, `locations.city`, `locations.criticality`  
     - Possibly `circuits.carrier`, `circuits.type`, `circuits.status`  
   - PostgreSQL can handle text pattern matching (e.g., partial indexing or trigram indexes) for faster search operations.

3. **Joins & Common Queries**  
   - **Join** `locations` → `companies` to show location details along with company info.  
   - **Join** `circuits` → `locations` to fetch circuit details alongside location data.  
   - Summaries (e.g., total monthly cost of circuits, distribution of circuit statuses) can be pre-aggregated or computed via well-optimized queries.

---

## 7. Scalability & Performance

1. **Horizontal Scaling**  
   - Application servers (API layer) can be scaled horizontally (multiple nodes behind a load balancer).  
   - Use a connection pool manager (e.g., pg-pool) to manage database connections.

2. **Vertical Scaling**  
   - The PostgreSQL database can be scaled up with more CPU, RAM, and storage to handle larger data volumes.

3. **Caching**  
   - Implement **query caching** strategies (e.g., Redis) for read-intensive endpoints.  
   - Cache expensive queries or dashboard summaries to reduce database load.

4. **Sharding or Read Replicas** (Future)  
   - For massive read loads, **read replicas** can offload queries from the primary.  
   - **Sharding** may be considered if dataset grows beyond single-database capacity.

---

## 8. Application & Database Cohesion

- **Use Migrations**: Tools like Prisma, Knex, or Flyway manage schema changes in a version-controlled manner.  
- **Model Definitions**: Keep TypeScript or ORM models in sync with the database schema.  
- **Validation & Enforcement**: Business logic in the API layer should match the constraints defined at the database level (e.g., mandatory fields, foreign key references).

---

## 9. Additional Considerations

- **Role & Permissions Table**: If the app needs more complex roles, a separate table for user roles/permissions might be added.  
- **Advanced Reporting**: For large-scale analytics, consider a separate data warehouse or OLAP solution.  
- **Multi-Tenancy**: Additional fields or separate schemas might be required to handle multi-organization data isolation.

---

## 10. Summary & Next Steps
This **System & Database Design** provides a robust foundation for the **ISP Circuit Assessment Application**. Going forward:

1. **Maintain** these designs in version control (e.g., Git).  
2. **Document** any schema changes via migrations.  
3. **Optimize** queries as the data volume grows (indexes, caching, read replicas).  
4. **Refine** the architecture if additional features (e.g., advanced reporting, multi-tenancy) are introduced.

```