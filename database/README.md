# Te Puo Website - Database Setup

This directory contains SQL scripts to set up the Supabase database for the Te Puo jewelry website.

## Database Schema Overview

The database consists of three main tables:

1. **collections** - Stores jewelry collections (e.g., "Collection Terre", "Collection Océan")
2. **jewelry** - Stores individual jewelry items with references to their collections
3. **sales_points** - Stores physical boutique locations with GPS coordinates

## Setup Instructions

### Option 1: Quick Setup (Recommended)

Execute the complete setup script in your Supabase SQL Editor:

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `00_setup_all_tables.sql`
4. Click "Run" to execute the script
5. Verify the tables were created by running the verification queries at the end of the script

This script will:
- Create all three tables (collections, jewelry, sales_points)
- Enable Row Level Security (RLS) on all tables
- Create anonymous read-only policies
- Set up indexes and constraints

### Option 2: Individual Table Setup

If you prefer to create tables one at a time, execute the scripts in this order:

1. `01_create_collections_table.sql` - Create collections table first
2. `02_create_jewelry_table.sql` - Create jewelry table (depends on collections)
3. `03_create_sales_points_table.sql` - Create sales_points table
4. `05_configure_rls_policies.sql` - Configure Row Level Security policies

**Important:** The jewelry table has a foreign key reference to collections, so collections must be created first.

## Table Details

### Collections Table

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique identifier (UUID, auto-generated)
- `name` - Collection name (required)
- `description` - Collection description (optional)
- `created_at` - Creation timestamp (auto-generated)

### Jewelry Table

```sql
CREATE TABLE jewelry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique identifier (UUID, auto-generated)
- `name` - Jewelry item name (required)
- `description` - Jewelry item description (optional)
- `image_url` - URL to the jewelry image in Supabase Storage (required)
- `collection_id` - Reference to the parent collection (optional, nullable)
- `created_at` - Creation timestamp (auto-generated)

**Foreign Key:**
- `collection_id` references `collections(id)` with `ON DELETE SET NULL`
  - If a collection is deleted, jewelry items remain but their collection_id is set to NULL

### Sales Points Table

```sql
CREATE TABLE sales_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique identifier (UUID, auto-generated)
- `name` - Sales point/boutique name (required)
- `latitude` - GPS latitude coordinate (required, -90 to 90)
- `longitude` - GPS longitude coordinate (required, -180 to 180)
- `address` - Full address (optional)
- `created_at` - Creation timestamp (auto-generated)

**Constraints:**
- `latitude` must be between -90 and 90
- `longitude` must be between -180 and 180

## Indexes

The following indexes are created for performance optimization:

**Collections:**
- `idx_collections_created_at` - Index on created_at for sorting

**Jewelry:**
- `idx_jewelry_collection_id` - Index on collection_id for efficient joins
- `idx_jewelry_created_at` - Index on created_at for sorting

**Sales Points:**
- `idx_sales_points_coordinates` - Composite index on (latitude, longitude) for map queries
- `idx_sales_points_created_at` - Index on created_at for sorting

## Supabase Storage Setup

In addition to database tables, the jewelry images are stored in Supabase Storage.

### Storage Bucket: jewelry-images

**Configuration:**
- **Bucket ID:** `jewelry-images`
- **Public Access:** Enabled (allows anonymous read)
- **File Size Limit:** 5MB (5242880 bytes)
- **Allowed MIME Types:** image/jpeg, image/png, image/webp

**Setup Instructions:**

1. Execute the storage setup script:
   ```sql
   -- Copy and paste contents of database/07_setup_storage_bucket.sql
   ```

2. Verify the configuration:
   ```sql
   -- Copy and paste contents of database/08_verify_storage_setup.sql
   ```

3. For detailed instructions, see: `STORAGE_SETUP_GUIDE.md`

**Public URL Format:**
```
https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/{filename}
```

**Storage Policies:**
- ✅ Anonymous users can READ images (public website)
- ❌ Anonymous users cannot UPLOAD/UPDATE/DELETE images
- ✅ Authenticated users can UPLOAD/UPDATE/DELETE images (admin)

**Usage in jewelry table:**
```sql
INSERT INTO jewelry (name, description, image_url, collection_id)
VALUES (
  'Collier Terre',
  'Beautiful necklace',
  'https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/collier-terre.jpg',
  '{collection-uuid}'
);
```

## Next Steps

After creating the tables, configuring RLS, and setting up storage:

1. **Verify all setup** - Run verification scripts
   - `06_verify_rls_policies.sql` - Verify RLS configuration
   - `08_verify_storage_setup.sql` - Verify storage configuration

2. **Upload test images** - Add sample jewelry images
   - Navigate to Storage > jewelry-images in Supabase dashboard
   - Upload sample JPEG, PNG, or WebP images (max 5MB each)
   - Copy public URLs for use in jewelry table

3. **Add test data** - Populate tables with sample data
   - Add sample collections
   - Add sample jewelry items with image URLs from storage
   - Add sample sales points with real GPS coordinates
   - See `04_sample_data.sql` for examples

4. **Test integration** - Verify everything works together
   - Test that jewelry images load via public URLs
   - Test that collections and jewelry are properly linked
   - Test that sales points display correctly on map

## Row Level Security (RLS)

Row Level Security is configured to allow anonymous read-only access while preventing unauthorized modifications.

### RLS Configuration

All three tables have RLS enabled with the following policies:

**Policy Name:** "Allow anonymous read access"
- **Operation:** SELECT only
- **Access:** Anonymous users (using anon key)
- **Effect:** Allows reading all rows

### Security Guarantees

With RLS enabled:
- ✅ Anonymous users **CAN** read (SELECT) from all tables
- ❌ Anonymous users **CANNOT** insert (INSERT) into any table
- ❌ Anonymous users **CANNOT** update (UPDATE) any table
- ❌ Anonymous users **CANNOT** delete (DELETE) from any table

This ensures that the public website can display data while preventing unauthorized modifications.

### Verifying RLS Configuration

To verify RLS is properly configured, run the verification script:

```bash
# Execute in Supabase SQL Editor
database/06_verify_rls_policies.sql
```

Or run these queries manually:

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public';

-- Check policies
SELECT tablename, policyname, cmd as command
FROM pg_policies
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public';
```

Expected results:
- All tables should show `rls_enabled = true`
- Each table should have one policy for SELECT operations

## Verification

To verify the tables were created correctly, run these queries in the SQL Editor:

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('collections', 'jewelry', 'sales_points')
ORDER BY table_name;

-- Count rows in each table (should be 0 initially)
SELECT 'collections' as table_name, COUNT(*) as row_count FROM collections
UNION ALL
SELECT 'jewelry', COUNT(*) FROM jewelry
UNION ALL
SELECT 'sales_points', COUNT(*) FROM sales_points;
```

## Troubleshooting

**Error: "relation already exists"**
- The table already exists in your database
- Either drop the existing table first or skip this script

**Error: "foreign key constraint"**
- Make sure to create the collections table before the jewelry table
- The jewelry table references collections(id)

**Error: "function uuid_generate_v4() does not exist"**
- Enable the uuid-ossp extension in Supabase:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

## Requirements Mapping

These database tables, RLS configuration, and storage setup satisfy the following requirements:

- **Requirement 3.1** - Store jewelry items with properties (including images in Supabase Storage)
- **Requirement 3.2** - Store collections with properties
- **Requirement 5.1** - Store sales points with geographic coordinates
- **Requirement 9.1** - Allow anonymous read access to all tables and storage
- **Requirement 9.2** - Prevent anonymous write, update, or delete operations

## File Reference

### Setup Scripts
- `00_setup_all_tables.sql` - Complete database setup (tables + RLS)
- `01_create_collections_table.sql` - Collections table only
- `02_create_jewelry_table.sql` - Jewelry table only
- `03_create_sales_points_table.sql` - Sales points table only
- `05_configure_rls_policies.sql` - RLS policies only
- `07_setup_storage_bucket.sql` - Storage bucket setup

### Verification Scripts
- `06_verify_rls_policies.sql` - Verify RLS configuration
- `08_verify_storage_setup.sql` - Verify storage configuration

### Documentation
- `README.md` - This file (overview and quick start)
- `RLS_TESTING_GUIDE.md` - Comprehensive RLS testing guide
- `RLS_QUICK_REFERENCE.md` - Quick reference for RLS
- `STORAGE_SETUP_GUIDE.md` - Comprehensive storage setup guide
- `TASK_2.2_SUMMARY.md` - RLS implementation summary
- `TASK_2.3_SUMMARY.md` - Storage implementation summary

### Sample Data
- `04_sample_data.sql` - Sample data for testing
