-- ============================================================================
-- Te Puo Website - Storage Setup Verification
-- ============================================================================
-- This script verifies that the jewelry-images storage bucket is properly
-- configured with the correct settings and policies.
-- ============================================================================

-- ============================================================================
-- Verification 1: Check bucket exists and has correct configuration
-- ============================================================================

SELECT 
  '=== BUCKET CONFIGURATION ===' as section;

SELECT 
  id as bucket_id,
  name as bucket_name,
  public as is_public,
  file_size_limit as max_size_bytes,
  ROUND(file_size_limit::numeric / 1024 / 1024, 2) as max_size_mb,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE id = 'jewelry-images';

-- Expected results:
-- ✅ bucket_id: jewelry-images
-- ✅ bucket_name: jewelry-images
-- ✅ is_public: true
-- ✅ max_size_bytes: 5242880
-- ✅ max_size_mb: 5.00
-- ✅ allowed_mime_types: {image/jpeg, image/png, image/webp}

-- ============================================================================
-- Verification 2: Check storage policies exist
-- ============================================================================

SELECT 
  '=== STORAGE POLICIES ===' as section;

SELECT 
  schemaname as schema,
  tablename as table,
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Upload'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as action
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%jewelry%'
ORDER BY 
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END;

-- Expected results: 4 policies
-- ✅ Public read access for jewelry images (SELECT / Read)
-- ✅ Authenticated users can upload jewelry images (INSERT / Upload)
-- ✅ Authenticated users can update jewelry images (UPDATE / Update)
-- ✅ Authenticated users can delete jewelry images (DELETE / Delete)

-- ============================================================================
-- Verification 3: Check policy details
-- ============================================================================

SELECT 
  '=== POLICY DETAILS ===' as section;

SELECT 
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%jewelry%'
ORDER BY policyname;

-- ============================================================================
-- Verification 4: Summary and checklist
-- ============================================================================

SELECT 
  '=== VERIFICATION SUMMARY ===' as section;

-- Check if bucket exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets WHERE id = 'jewelry-images'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Bucket "jewelry-images" exists' as check_description;

-- Check if bucket is public
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE id = 'jewelry-images' AND public = true
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Bucket is set to public' as check_description;

-- Check file size limit
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE id = 'jewelry-images' AND file_size_limit = 5242880
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'File size limit is 5MB (5242880 bytes)' as check_description;

-- Check allowed MIME types
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE id = 'jewelry-images' 
      AND 'image/jpeg' = ANY(allowed_mime_types)
      AND 'image/png' = ANY(allowed_mime_types)
      AND 'image/webp' = ANY(allowed_mime_types)
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Allowed MIME types include JPEG, PNG, and WebP' as check_description;

-- Check read policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%jewelry%'
      AND cmd = 'SELECT'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Public read policy exists' as check_description;

-- Check upload policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%jewelry%'
      AND cmd = 'INSERT'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Authenticated upload policy exists' as check_description;

-- Check update policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%jewelry%'
      AND cmd = 'UPDATE'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Authenticated update policy exists' as check_description;

-- Check delete policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%jewelry%'
      AND cmd = 'DELETE'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Authenticated delete policy exists' as check_description;

-- ============================================================================
-- Manual Testing Instructions
-- ============================================================================

SELECT 
  '=== MANUAL TESTING INSTRUCTIONS ===' as section;

-- Display testing instructions
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== MANUAL TESTING CHECKLIST ===';
  RAISE NOTICE '';
  RAISE NOTICE '1. Test Upload (via Supabase Dashboard):';
  RAISE NOTICE '   - Navigate to Storage > jewelry-images';
  RAISE NOTICE '   - Try uploading a JPEG image (< 5MB) - Should succeed';
  RAISE NOTICE '   - Try uploading a PNG image (< 5MB) - Should succeed';
  RAISE NOTICE '   - Try uploading a WebP image (< 5MB) - Should succeed';
  RAISE NOTICE '   - Try uploading a PDF file - Should fail (wrong type)';
  RAISE NOTICE '   - Try uploading a 6MB image - Should fail (too large)';
  RAISE NOTICE '';
  RAISE NOTICE '2. Test Public Access:';
  RAISE NOTICE '   - Upload a test image';
  RAISE NOTICE '   - Copy the public URL';
  RAISE NOTICE '   - Open URL in incognito/private browser window';
  RAISE NOTICE '   - Image should load without authentication';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test URL Format:';
  RAISE NOTICE '   - Public URL should be:';
  RAISE NOTICE '     https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/{filename}';
  RAISE NOTICE '';
  RAISE NOTICE '4. Test in jewelry table:';
  RAISE NOTICE '   - Add a test jewelry item with the image URL';
  RAISE NOTICE '   - Verify the image displays correctly in the frontend';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- Troubleshooting Guide
-- ============================================================================

SELECT 
  '=== TROUBLESHOOTING ===' as section;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== COMMON ISSUES AND SOLUTIONS ===';
  RAISE NOTICE '';
  RAISE NOTICE 'Issue: Bucket not found';
  RAISE NOTICE 'Solution: Run 07_setup_storage_bucket.sql to create the bucket';
  RAISE NOTICE '';
  RAISE NOTICE 'Issue: Images not publicly accessible';
  RAISE NOTICE 'Solution: Verify bucket.public = true and read policy exists';
  RAISE NOTICE '';
  RAISE NOTICE 'Issue: Cannot upload images';
  RAISE NOTICE 'Solution: Make sure you are authenticated and have proper permissions';
  RAISE NOTICE '';
  RAISE NOTICE 'Issue: File type rejected';
  RAISE NOTICE 'Solution: Only JPEG, PNG, and WebP are allowed. Convert your image.';
  RAISE NOTICE '';
  RAISE NOTICE 'Issue: File too large';
  RAISE NOTICE 'Solution: Compress image to under 5MB before uploading';
  RAISE NOTICE '';
END $$;
