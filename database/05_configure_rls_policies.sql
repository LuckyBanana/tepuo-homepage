-- Configure Row Level Security (RLS) Policies
-- This file enables RLS and creates read-only policies for anonymous users
-- Requirements: 9.1, 9.2

-- ============================================================================
-- Enable Row Level Security on all tables
-- ============================================================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelry ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_points ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Create anonymous read-only policies
-- ============================================================================

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

-- ============================================================================
-- Verification Comments
-- ============================================================================

-- With RLS enabled and only SELECT policies defined:
-- ✓ Anonymous users CAN read (SELECT) from all tables
-- ✓ Anonymous users CANNOT insert (INSERT) into any table
-- ✓ Anonymous users CANNOT update (UPDATE) any table
-- ✓ Anonymous users CANNOT delete (DELETE) from any table
--
-- This ensures data security while allowing public read access for the website.
-- Only authenticated users with proper permissions can modify data.

COMMENT ON POLICY "Allow anonymous read access" ON collections IS 
  'Allows anonymous users to read collections for public website display';
COMMENT ON POLICY "Allow anonymous read access" ON jewelry IS 
  'Allows anonymous users to read jewelry items for public website display';
COMMENT ON POLICY "Allow anonymous read access" ON sales_points IS 
  'Allows anonymous users to read sales points for public map display';
