-- Verification Script for Row Level Security Policies
-- This script helps verify that RLS is properly configured
-- Requirements: 9.1, 9.2

-- ============================================================================
-- Check that RLS is enabled on all tables
-- ============================================================================

-- Query to check RLS status
-- Expected result: All three tables should show relrowsecurity = true
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- List all policies on our tables
-- ============================================================================

-- Query to list all policies
-- Expected result: Should show one SELECT policy per table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- Test anonymous read access (should succeed)
-- ============================================================================

-- These queries should work when executed with anonymous/public role
-- In Supabase, test these using the anon key via the API or SQL editor

-- Test reading collections
SELECT COUNT(*) as collections_count FROM collections;

-- Test reading jewelry
SELECT COUNT(*) as jewelry_count FROM jewelry;

-- Test reading sales_points
SELECT COUNT(*) as sales_points_count FROM sales_points;

-- ============================================================================
-- Test anonymous write access (should fail)
-- ============================================================================

-- The following operations should FAIL when executed as anonymous user
-- Uncomment to test (they will throw permission denied errors):

-- Test INSERT (should fail)
-- INSERT INTO collections (name, description) 
-- VALUES ('Test Collection', 'This should fail');

-- Test UPDATE (should fail)
-- UPDATE collections SET name = 'Modified' WHERE id = (SELECT id FROM collections LIMIT 1);

-- Test DELETE (should fail)
-- DELETE FROM collections WHERE id = (SELECT id FROM collections LIMIT 1);

-- ============================================================================
-- Expected Results Summary
-- ============================================================================

-- 1. RLS Status Query:
--    All tables should show rls_enabled = true
--
-- 2. Policies Query:
--    Should show 3 policies (one per table), all with:
--    - policyname: "Allow anonymous read access"
--    - command: SELECT
--    - using_expression: true
--
-- 3. Read Tests:
--    Should return counts successfully (even if 0)
--
-- 4. Write Tests:
--    Should fail with "permission denied" or "policy violation" errors
