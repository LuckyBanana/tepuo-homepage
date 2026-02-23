-- Configure RLS Policies for Authenticated Admin Users
-- This file adds INSERT, UPDATE, DELETE policies for authenticated users
-- to enable admin CRUD operations via the web admin interface.

-- ============================================================================
-- Admin policies for collections table
-- ============================================================================

CREATE POLICY "Allow authenticated insert" ON collections
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON collections
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON collections
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Admin policies for jewelry table
-- ============================================================================

CREATE POLICY "Allow authenticated insert" ON jewelry
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON jewelry
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON jewelry
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Admin policies for sales_points table
-- ============================================================================

CREATE POLICY "Allow authenticated insert" ON sales_points
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON sales_points
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON sales_points
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Verification
-- ============================================================================

-- With these policies in place:
-- ✓ Anonymous users CAN still read (SELECT) from all tables (existing policy)
-- ✓ Authenticated users CAN insert, update, and delete in all tables
-- ✓ Anonymous users still CANNOT modify data
--
-- To create an admin user, use Supabase Dashboard > Authentication > Users > Add User
-- or use the Supabase Auth API.
