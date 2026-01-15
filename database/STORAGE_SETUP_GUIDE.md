# Supabase Storage Setup Guide - Jewelry Images

This guide provides comprehensive instructions for setting up and testing the Supabase Storage bucket for jewelry images.

## Overview

The `jewelry-images` storage bucket is configured to:
- ✅ Allow public read access (anyone can view images)
- ✅ Allow authenticated users to upload, update, and delete images
- ✅ Accept only image files (JPEG, PNG, WebP)
- ✅ Enforce a maximum file size of 5MB per image

## Quick Setup

### Method 1: Using SQL Script (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/07_setup_storage_bucket.sql`
4. Click **Run** to execute the script
5. Verify success by running `database/08_verify_storage_setup.sql`

### Method 2: Using Supabase Dashboard

1. Navigate to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Configure the bucket:
   - **Name:** `jewelry-images`
   - **Public bucket:** ✅ Enabled
   - **File size limit:** `5242880` (5MB in bytes)
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`
4. Click **Create bucket**
5. Configure policies manually (see Policy Configuration section below)

## Bucket Configuration Details

### Bucket Settings

| Setting | Value | Description |
|---------|-------|-------------|
| **Bucket ID** | `jewelry-images` | Unique identifier for the bucket |
| **Bucket Name** | `jewelry-images` | Display name |
| **Public Access** | `true` | Allows anonymous read access |
| **File Size Limit** | `5242880` bytes (5MB) | Maximum file size per upload |
| **Allowed MIME Types** | `image/jpeg`, `image/png`, `image/webp` | Accepted file formats |

### Storage Policies

The bucket has four storage policies configured:

#### 1. Public Read Access
- **Policy Name:** "Public read access for jewelry images"
- **Operation:** SELECT (read)
- **Access:** Anonymous users (no authentication required)
- **Purpose:** Allows website visitors to view jewelry images

#### 2. Authenticated Upload
- **Policy Name:** "Authenticated users can upload jewelry images"
- **Operation:** INSERT (upload)
- **Access:** Authenticated users only
- **Purpose:** Allows admin users to upload new jewelry images

#### 3. Authenticated Update
- **Policy Name:** "Authenticated users can update jewelry images"
- **Operation:** UPDATE (modify)
- **Access:** Authenticated users only
- **Purpose:** Allows admin users to replace existing images

#### 4. Authenticated Delete
- **Policy Name:** "Authenticated users can delete jewelry images"
- **Operation:** DELETE (remove)
- **Access:** Authenticated users only
- **Purpose:** Allows admin users to remove jewelry images

## Policy Configuration (Manual Setup)

If you created the bucket via the dashboard, you need to configure policies manually:

### Step 1: Enable RLS on storage.objects

```sql
-- RLS should already be enabled, but verify:
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Read Policy

```sql
CREATE POLICY "Public read access for jewelry images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'jewelry-images');
```

### Step 3: Create Upload Policy

```sql
CREATE POLICY "Authenticated users can upload jewelry images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'jewelry-images' 
  AND auth.role() = 'authenticated'
);
```

### Step 4: Create Update Policy

```sql
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
```

### Step 5: Create Delete Policy

```sql
CREATE POLICY "Authenticated users can delete jewelry images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'jewelry-images' 
  AND auth.role() = 'authenticated'
);
```

## Verification

### Automated Verification

Run the verification script to check all settings:

```sql
-- Execute in Supabase SQL Editor
-- Copy and paste contents of database/08_verify_storage_setup.sql
```

Expected output:
- ✅ All checks should show "PASS"
- ✅ Bucket configuration should match requirements
- ✅ All 4 policies should be listed

### Manual Verification Checklist

- [ ] Bucket `jewelry-images` exists
- [ ] Bucket is set to public
- [ ] File size limit is 5MB (5242880 bytes)
- [ ] Allowed MIME types include JPEG, PNG, and WebP
- [ ] Public read policy exists (SELECT)
- [ ] Authenticated upload policy exists (INSERT)
- [ ] Authenticated update policy exists (UPDATE)
- [ ] Authenticated delete policy exists (DELETE)

## Testing

### Test 1: Upload Images (Dashboard)

1. Navigate to **Storage > jewelry-images** in Supabase dashboard
2. Click **Upload file**
3. Test uploads:
   - ✅ Upload a JPEG image (< 5MB) → Should succeed
   - ✅ Upload a PNG image (< 5MB) → Should succeed
   - ✅ Upload a WebP image (< 5MB) → Should succeed
   - ❌ Upload a PDF file → Should fail (wrong type)
   - ❌ Upload a 6MB image → Should fail (too large)

### Test 2: Public Access

1. Upload a test image via the dashboard
2. Get the public URL (format below)
3. Open the URL in an incognito/private browser window
4. ✅ Image should load without authentication

**Public URL Format:**
```
https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/{filename}
```

Example:
```
https://xyzcompany.supabase.co/storage/v1/object/public/jewelry-images/collier-terre.jpg
```

### Test 3: Upload via JavaScript (Authenticated)

```javascript
// Using Supabase JavaScript client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Upload a file
const file = document.querySelector('input[type="file"]').files[0];
const { data, error } = await supabase.storage
  .from('jewelry-images')
  .upload(`jewelry-${Date.now()}.jpg`, file);

if (error) {
  console.error('Upload failed:', error);
} else {
  console.log('Upload successful:', data);
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('jewelry-images')
    .getPublicUrl(data.path);
  
  console.log('Public URL:', urlData.publicUrl);
}
```

### Test 4: Anonymous Upload (Should Fail)

```javascript
// Try to upload without authentication
// This should fail because only authenticated users can upload

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('jewelry-images')
  .upload('test.jpg', file);

// Expected: error with message about insufficient permissions
console.log('Error (expected):', error);
```

### Test 5: Integration with Jewelry Table

```sql
-- Add a jewelry item with an image URL
INSERT INTO jewelry (name, description, image_url, collection_id)
VALUES (
  'Collier Terre',
  'Beautiful earth-toned necklace made with dorodango technique',
  'https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/collier-terre.jpg',
  '{collection-uuid}'
);

-- Verify the jewelry item was created
SELECT id, name, image_url FROM jewelry WHERE name = 'Collier Terre';
```

## Usage Examples

### Uploading Images

#### Via Supabase Dashboard
1. Go to **Storage > jewelry-images**
2. Click **Upload file**
3. Select image(s) to upload
4. Images are immediately available via public URL

#### Via JavaScript (Admin Interface)
```javascript
async function uploadJewelryImage(file) {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('jewelry-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('jewelry-images')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}
```

### Getting Image URLs

#### Get Public URL for a File
```javascript
const { data } = supabase.storage
  .from('jewelry-images')
  .getPublicUrl('collier-terre.jpg');

console.log(data.publicUrl);
// https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/collier-terre.jpg
```

#### List All Files in Bucket
```javascript
const { data, error } = await supabase.storage
  .from('jewelry-images')
  .list();

console.log('Files:', data);
```

### Image Transformations

Supabase Storage supports on-the-fly image transformations:

```javascript
// Get a resized version of the image
const { data } = supabase.storage
  .from('jewelry-images')
  .getPublicUrl('collier-terre.jpg', {
    transform: {
      width: 400,
      height: 400,
      resize: 'cover',
      quality: 80
    }
  });

console.log(data.publicUrl);
// URL will include transformation parameters
```

**Transformation Options:**
- `width`: Target width in pixels
- `height`: Target height in pixels
- `resize`: `cover`, `contain`, `fill`
- `quality`: 1-100 (JPEG/WebP quality)
- `format`: `origin`, `webp`, `avif`

### Deleting Images

```javascript
// Delete a file (requires authentication)
const { error } = await supabase.storage
  .from('jewelry-images')
  .remove(['old-image.jpg']);

if (error) {
  console.error('Delete failed:', error);
} else {
  console.log('Image deleted successfully');
}
```

## Best Practices

### File Naming Conventions

Use descriptive, URL-safe filenames:
- ✅ Good: `collier-terre-001.jpg`, `bracelet-ocean-blue.webp`
- ❌ Bad: `IMG_1234.jpg`, `photo (1).png`, `bijou #1.jpg`

**Recommended format:**
```
{jewelry-type}-{collection}-{variant}.{extension}
```

Examples:
- `collier-terre-gold.jpg`
- `bracelet-ocean-silver.webp`
- `boucles-oreilles-sable-001.png`

### Image Optimization

Before uploading, optimize images to reduce file size:

1. **Resize images** to appropriate dimensions:
   - Thumbnail: 200x200px
   - Display: 800x800px
   - Full size: 1200x1200px

2. **Compress images**:
   - JPEG: 80-85% quality
   - PNG: Use tools like TinyPNG
   - WebP: 80% quality (best format)

3. **Use WebP format** when possible:
   - Better compression than JPEG/PNG
   - Supported by all modern browsers
   - Fallback to JPEG for older browsers

### Security Considerations

1. **Never expose service_role key** in client-side code
   - Use anon key for public operations
   - Use service_role key only in server-side code

2. **Validate file types** before upload:
   ```javascript
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
   if (!allowedTypes.includes(file.type)) {
     throw new Error('Invalid file type');
   }
   ```

3. **Validate file size** before upload:
   ```javascript
   const maxSize = 5 * 1024 * 1024; // 5MB
   if (file.size > maxSize) {
     throw new Error('File too large');
   }
   ```

4. **Sanitize filenames**:
   ```javascript
   function sanitizeFilename(filename) {
     return filename
       .toLowerCase()
       .replace(/[^a-z0-9.-]/g, '-')
       .replace(/-+/g, '-');
   }
   ```

### Performance Optimization

1. **Use image transformations** for thumbnails:
   - Don't load full-size images for thumbnails
   - Use Supabase's built-in transformation API

2. **Implement lazy loading**:
   ```html
   <img src="..." loading="lazy" alt="...">
   ```

3. **Cache images** appropriately:
   - Set cache headers when uploading
   - Use CDN if available

4. **Use responsive images**:
   ```html
   <img 
     srcset="
       image-400.jpg 400w,
       image-800.jpg 800w,
       image-1200.jpg 1200w
     "
     sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
     src="image-800.jpg"
     alt="Jewelry description"
   >
   ```

## Troubleshooting

### Issue: Bucket not found

**Symptoms:** Error message "Bucket not found" when trying to upload

**Solutions:**
1. Verify bucket exists: Run `SELECT * FROM storage.buckets WHERE id = 'jewelry-images';`
2. Create bucket: Run `database/07_setup_storage_bucket.sql`
3. Check bucket name spelling (case-sensitive)

### Issue: Images not publicly accessible

**Symptoms:** 403 Forbidden error when accessing image URL

**Solutions:**
1. Verify bucket is public: `SELECT public FROM storage.buckets WHERE id = 'jewelry-images';`
2. Check read policy exists: Run verification script
3. Verify URL format is correct
4. Clear browser cache and try again

### Issue: Cannot upload images

**Symptoms:** Upload fails with permission error

**Solutions:**
1. Verify you are authenticated
2. Check upload policy exists for authenticated users
3. Verify file type is allowed (JPEG, PNG, or WebP)
4. Verify file size is under 5MB
5. Check browser console for detailed error messages

### Issue: File type rejected

**Symptoms:** Error message about invalid file type

**Solutions:**
1. Verify file is JPEG, PNG, or WebP format
2. Check file extension matches actual file type
3. Convert file to supported format
4. Verify MIME type is correct

### Issue: File too large

**Symptoms:** Error message about file size limit

**Solutions:**
1. Compress image before uploading
2. Resize image to smaller dimensions
3. Convert to WebP format (better compression)
4. Use online tools like TinyPNG or Squoosh

### Issue: Policies not working

**Symptoms:** Unexpected permission errors

**Solutions:**
1. Verify RLS is enabled on storage.objects table
2. Check policy syntax is correct
3. Verify bucket_id matches in policies
4. Test with service_role key to isolate RLS issues
5. Check Supabase logs for detailed error messages

## Requirements Validation

This storage setup satisfies the following requirements:

### Requirement 3.1: Store jewelry items with properties ✅
- Images are stored in Supabase Storage
- Image URLs are stored in the jewelry table
- Public access allows website to display images

### Task 2.3 Acceptance Criteria ✅
- ✅ `jewelry-images` storage bucket created
- ✅ Public access enabled on the bucket
- ✅ Allowed MIME types configured (image/jpeg, image/png, image/webp)
- ✅ Maximum file size set to 5MB (5242880 bytes)

## Next Steps

After completing this storage setup:

1. **Upload test images** to verify configuration
2. **Test public access** by opening image URLs in browser
3. **Add image URLs to jewelry table** for testing
4. **Proceed to task 3.1** - Implement Supabase client module
5. **Test image display** in the jewelry page (task 7)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices)

## Support

If you encounter issues not covered in this guide:

1. Check Supabase project logs
2. Review Supabase Storage documentation
3. Check browser console for error messages
4. Verify all SQL scripts ran successfully
5. Contact Supabase support if needed
