-- ============================================================================
-- Te Puo Website - Supabase Storage Setup
-- ============================================================================
-- Task: 2.3 Set up Supabase Storage for jewelry images
-- Requirements: 3.1
--
-- This script sets up the Supabase Storage bucket for jewelry images with:
-- - Public access enabled
-- - Allowed MIME types: image/jpeg, image/png, image/webp
-- - Maximum file size: 5MB
--
-- IMPORTANT: This script uses Supabase Storage policies which are configured
-- through the storage.buckets and storage.objects tables.
-- ============================================================================

-- ============================================================================
-- Step 1: Create the jewelry-images storage bucket
-- ============================================================================

-- Insert the bucket into the storage.buckets table
-- The bucket will be publicly accessible for read operations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'jewelry-images',                                    -- Bucket ID
  'jewelry-images',                                    -- Bucket name
  true,                                                -- Public access enabled
  5242880,                                             -- 5MB in bytes (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']      -- Allowed MIME types
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================================================
-- Step 2: Configure storage policies for the bucket
-- ============================================================================

-- Enable public read access to all files in the jewelry-images bucket
-- This allows anonymous users to view jewelry images on the website
CREATE POLICY "Public read access for jewelry images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'jewelry-images');

-- Allow authenticated users to upload images
-- This policy allows admin users to upload jewelry images
-- Note: For production, you may want to restrict this to specific roles
CREATE POLICY "Authenticated users can upload jewelry images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'jewelry-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update jewelry images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'jewelry-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'jewelry-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete jewelry images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'jewelry-images' 
  AND auth.role() = 'authenticated'
);

-- ============================================================================
-- Step 3: Verification Queries
-- ============================================================================

-- Verify the bucket was created with correct settings
SELECT 
  id,
  name,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 as file_size_limit_mb,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'jewelry-images';

-- Expected result:
-- id: jewelry-images
-- name: jewelry-images
-- public: true
-- file_size_limit: 5242880
-- file_size_limit_mb: 5
-- allowed_mime_types: {image/jpeg, image/png, image/webp}

-- Verify storage policies were created
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%jewelry%'
ORDER BY policyname;

-- Expected result: 4 policies
-- 1. Public read access for jewelry images (SELECT)
-- 2. Authenticated users can upload jewelry images (INSERT)
-- 3. Authenticated users can update jewelry images (UPDATE)
-- 4. Authenticated users can delete jewelry images (DELETE)

-- ============================================================================
-- Usage Examples
-- ============================================================================

-- After running this script, you can:
--
-- 1. Upload images via Supabase Dashboard:
--    - Go to Storage > jewelry-images
--    - Click "Upload file"
--    - Select image files (JPEG, PNG, or WebP, max 5MB each)
--
-- 2. Access images via public URL:
--    https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/{filename}
--
-- 3. Use in jewelry table:
--    INSERT INTO jewelry (name, description, image_url, collection_id)
--    VALUES (
--      'Collier Terre',
--      'Beautiful earth-toned necklace',
--      'https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/collier-terre.jpg',
--      '{collection-uuid}'
--    );
--
-- 4. Upload via JavaScript (authenticated):
--    const { data, error } = await supabase.storage
--      .from('jewelry-images')
--      .upload('collier-terre.jpg', file);
--
-- ============================================================================
-- Security Notes
-- ============================================================================
--
-- Public Access:
-- - ✅ Anyone can READ (view) images from this bucket
-- - ❌ Anonymous users CANNOT upload, update, or delete images
-- - ✅ Authenticated users CAN upload, update, and delete images
--
-- File Restrictions:
-- - Maximum file size: 5MB
-- - Allowed formats: JPEG, PNG, WebP only
-- - Other file types will be rejected automatically
--
-- Best Practices:
-- - Use descriptive filenames (e.g., 'collier-terre-001.jpg')
-- - Optimize images before upload to reduce file size
-- - Use WebP format for better compression and quality
-- - Consider implementing image transformations for thumbnails
--
-- ============================================================================
-- Troubleshooting
-- ============================================================================
--
-- Error: "duplicate key value violates unique constraint"
-- Solution: The bucket already exists. Use the ON CONFLICT clause (already included)
--
-- Error: "new row violates check constraint"
-- Solution: Check that file_size_limit and allowed_mime_types are valid
--
-- Error: "permission denied for table buckets"
-- Solution: Make sure you're using the service_role key or have proper permissions
--
-- Images not loading:
-- Solution: Verify the bucket is set to public=true and check the image URL format
--
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Storage bucket "jewelry-images" has been configured successfully!';
  RAISE NOTICE 'Public access: Enabled';
  RAISE NOTICE 'Max file size: 5MB';
  RAISE NOTICE 'Allowed types: JPEG, PNG, WebP';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Upload test images via Supabase Dashboard';
  RAISE NOTICE '2. Verify images are accessible via public URL';
  RAISE NOTICE '3. Add image URLs to jewelry table';
END $$;
