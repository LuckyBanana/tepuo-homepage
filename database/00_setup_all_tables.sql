-- Te Puo Website - Complete Database Setup
-- This script creates all required tables for the Te Puo jewelry website
-- Execute this script in your Supabase SQL Editor
-- Requirements: 3.1, 3.2, 5.1, 9.1, 9.2

-- ============================================================================
-- 1. CREATE COLLECTIONS TABLE
-- ============================================================================
-- This table stores jewelry collections with their basic information

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on created_at for sorting
CREATE INDEX idx_collections_created_at ON collections(created_at);

-- Add comment for documentation
COMMENT ON TABLE collections IS 'Stores jewelry collections with name and description';
COMMENT ON COLUMN collections.id IS 'Unique identifier for the collection';
COMMENT ON COLUMN collections.name IS 'Name of the collection (e.g., "Collection Terre", "Collection Océan")';
COMMENT ON COLUMN collections.description IS 'Description of the collection';
COMMENT ON COLUMN collections.created_at IS 'Timestamp when the collection was created';


-- ============================================================================
-- 2. CREATE JEWELRY TABLE
-- ============================================================================
-- This table stores individual jewelry items with their properties
-- Note: Must be created AFTER collections table due to foreign key reference

CREATE TABLE jewelry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_jewelry_collection_id ON jewelry(collection_id);
CREATE INDEX idx_jewelry_created_at ON jewelry(created_at);

-- Add comment for documentation
COMMENT ON TABLE jewelry IS 'Stores individual jewelry items with their properties';
COMMENT ON COLUMN jewelry.id IS 'Unique identifier for the jewelry item';
COMMENT ON COLUMN jewelry.name IS 'Name of the jewelry item';
COMMENT ON COLUMN jewelry.description IS 'Description of the jewelry item';
COMMENT ON COLUMN jewelry.image_url IS 'URL of the jewelry image stored in Supabase Storage';
COMMENT ON COLUMN jewelry.collection_id IS 'Reference to the collection this jewelry belongs to (nullable)';
COMMENT ON COLUMN jewelry.created_at IS 'Timestamp when the jewelry item was created';


-- ============================================================================
-- 3. CREATE SALES_POINTS TABLE
-- ============================================================================
-- This table stores physical sales locations with geographic coordinates

CREATE TABLE sales_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_sales_points_coordinates ON sales_points(latitude, longitude);
CREATE INDEX idx_sales_points_created_at ON sales_points(created_at);

-- Add constraints to ensure valid coordinates
ALTER TABLE sales_points ADD CONSTRAINT check_latitude 
  CHECK (latitude >= -90 AND latitude <= 90);
ALTER TABLE sales_points ADD CONSTRAINT check_longitude 
  CHECK (longitude >= -180 AND longitude <= 180);

-- Add comment for documentation
COMMENT ON TABLE sales_points IS 'Stores physical sales locations with geographic coordinates';
COMMENT ON COLUMN sales_points.id IS 'Unique identifier for the sales point';
COMMENT ON COLUMN sales_points.name IS 'Name of the sales point/boutique';
COMMENT ON COLUMN sales_points.latitude IS 'GPS latitude coordinate (-90 to 90)';
COMMENT ON COLUMN sales_points.longitude IS 'GPS longitude coordinate (-180 to 180)';
COMMENT ON COLUMN sales_points.address IS 'Full address of the sales point (optional)';
COMMENT ON COLUMN sales_points.created_at IS 'Timestamp when the sales point was created';


-- ============================================================================
-- 4. CONFIGURE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS and create read-only policies for anonymous users
-- Requirements: 9.1, 9.2

-- Enable Row Level Security on all tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelry ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_points ENABLE ROW LEVEL SECURITY;

-- Create anonymous read-only policies
-- Policy for collections table: Allow anonymous SELECT access
CREATE POLICY "Allow anonymous read access" ON collections
  FOR SELECT
  USING (true);

-- Policy for jewelry table: Allow anonymous SELECT access
CREATE POLICY "Allow anonymous read access" ON jewelry
  FOR SELECT
  USING (true);

-- Policy for sales_points table: Allow anonymous SELECT access
CREATE POLICY "Allow anonymous read access" ON sales_points
  FOR SELECT
  USING (true);

-- Add policy comments for documentation
COMMENT ON POLICY "Allow anonymous read access" ON collections IS 
  'Allows anonymous users to read collections for public website display';
COMMENT ON POLICY "Allow anonymous read access" ON jewelry IS 
  'Allows anonymous users to read jewelry items for public website display';
COMMENT ON POLICY "Allow anonymous read access" ON sales_points IS 
  'Allows anonymous users to read sales points for public map display';


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the tables were created successfully

-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('collections', 'jewelry', 'sales_points')
ORDER BY table_name;

-- Check that RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public'
ORDER BY tablename;

-- Check that policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Check collections table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'collections'
ORDER BY ordinal_position;

-- Check jewelry table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jewelry'
ORDER BY ordinal_position;

-- Check sales_points table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sales_points'
ORDER BY ordinal_position;
