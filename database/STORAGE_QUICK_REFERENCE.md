# Supabase Storage Quick Reference

Quick reference card for the `jewelry-images` storage bucket configuration.

## Bucket Configuration

| Setting | Value |
|---------|-------|
| **Bucket ID** | `jewelry-images` |
| **Public Access** | ✅ Enabled |
| **File Size Limit** | 5MB (5242880 bytes) |
| **Allowed Types** | JPEG, PNG, WebP |

## Access Control Matrix

| User Type | Read | Upload | Update | Delete |
|-----------|------|--------|--------|--------|
| **Anonymous** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Authenticated** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

## Storage Policies

1. **Public read access for jewelry images** (SELECT)
   - Allows anonymous users to view images
   
2. **Authenticated users can upload jewelry images** (INSERT)
   - Allows authenticated users to upload new images
   
3. **Authenticated users can update jewelry images** (UPDATE)
   - Allows authenticated users to replace images
   
4. **Authenticated users can delete jewelry images** (DELETE)
   - Allows authenticated users to remove images

## Public URL Format

```
https://{project-ref}.supabase.co/storage/v1/object/public/jewelry-images/{filename}
```

**Example:**
```
https://xyzcompany.supabase.co/storage/v1/object/public/jewelry-images/collier-terre.jpg
```

## Quick Test Commands

### Check Bucket Exists
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'jewelry-images';
```

### Check Storage Policies
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%jewelry%';
```

### List Files in Bucket
```javascript
const { data, error } = await supabase.storage
  .from('jewelry-images')
  .list();
```

### Get Public URL
```javascript
const { data } = supabase.storage
  .from('jewelry-images')
  .getPublicUrl('filename.jpg');
```

## Upload Examples

### Via Dashboard
1. Go to **Storage > jewelry-images**
2. Click **Upload file**
3. Select image (JPEG/PNG/WebP, max 5MB)

### Via JavaScript
```javascript
const { data, error } = await supabase.storage
  .from('jewelry-images')
  .upload('filename.jpg', file);
```

### Via cURL (Authenticated)
```bash
curl -X POST \
  'https://{project-ref}.supabase.co/storage/v1/object/jewelry-images/filename.jpg' \
  -H 'Authorization: Bearer {access-token}' \
  -H 'Content-Type: image/jpeg' \
  --data-binary '@/path/to/image.jpg'
```

## File Restrictions

### Allowed MIME Types
- ✅ `image/jpeg` (.jpg, .jpeg)
- ✅ `image/png` (.png)
- ✅ `image/webp` (.webp)
- ❌ All other types rejected

### File Size
- ✅ Up to 5MB (5,242,880 bytes)
- ❌ Larger files rejected

## Common Issues

| Issue | Solution |
|-------|----------|
| **Bucket not found** | Run `07_setup_storage_bucket.sql` |
| **403 Forbidden** | Check bucket is public and read policy exists |
| **Upload fails** | Verify authentication and file type/size |
| **Wrong file type** | Convert to JPEG, PNG, or WebP |
| **File too large** | Compress image to under 5MB |

## Image Transformations

Add transformation parameters to public URL:

```javascript
const { data } = supabase.storage
  .from('jewelry-images')
  .getPublicUrl('filename.jpg', {
    transform: {
      width: 400,
      height: 400,
      resize: 'cover',
      quality: 80
    }
  });
```

**Parameters:**
- `width` - Target width in pixels
- `height` - Target height in pixels
- `resize` - `cover`, `contain`, `fill`
- `quality` - 1-100 (compression quality)
- `format` - `origin`, `webp`, `avif`

## Best Practices

### File Naming
✅ Use: `collier-terre-001.jpg`
❌ Avoid: `IMG_1234.jpg`, `photo (1).png`

### Optimization
- Resize to 800x800px for display
- Use WebP format for best compression
- Compress to 80-85% quality

### Security
- Never expose service_role key in client code
- Validate file type and size before upload
- Sanitize filenames

## Setup Files

- **Setup:** `database/07_setup_storage_bucket.sql`
- **Verify:** `database/08_verify_storage_setup.sql`
- **Guide:** `database/STORAGE_SETUP_GUIDE.md`
- **Summary:** `database/TASK_2.3_SUMMARY.md`

## Requirements

Satisfies **Requirement 3.1** - Store jewelry items with properties (images)

## Next Steps

1. Run setup script: `07_setup_storage_bucket.sql`
2. Verify configuration: `08_verify_storage_setup.sql`
3. Upload test images via dashboard
4. Test public URLs in browser
5. Add image URLs to jewelry table
