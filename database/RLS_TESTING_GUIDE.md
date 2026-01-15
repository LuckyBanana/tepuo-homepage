# Row Level Security (RLS) Testing Guide

This guide explains how to verify that Row Level Security policies are correctly configured for the Te Puo website database.

## Overview

The RLS configuration ensures that:
- ✅ Anonymous users can **read** data (for public website display)
- ❌ Anonymous users **cannot** modify data (insert, update, delete)

## Prerequisites

Before testing, ensure:
1. All tables are created (collections, jewelry, sales_points)
2. RLS policies are configured (run `05_configure_rls_policies.sql`)
3. You have access to your Supabase project dashboard
4. You have both the **service_role** key and **anon** key from your project settings

## Testing Methods

### Method 1: Using Supabase SQL Editor (Recommended)

The Supabase SQL Editor runs queries with **service_role** privileges by default, so you need to test RLS using the API or by switching roles.

#### Step 1: Verify RLS is Enabled

Run the verification script in the SQL Editor:

```sql
-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public'
ORDER BY tablename;
```

**Expected Result:** All three tables should show `rls_enabled = true`

#### Step 2: Verify Policies Exist

```sql
-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename IN ('collections', 'jewelry', 'sales_points')
  AND schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result:** Three policies, one per table:
- Policy name: "Allow anonymous read access"
- Command: SELECT
- Using expression: true

### Method 2: Using Supabase API (Tests Anonymous Access)

This method tests actual anonymous user access using the anon key.

#### Step 1: Test Anonymous Read Access (Should Succeed)

Use curl or your browser's developer console to test:

```bash
# Replace with your Supabase URL and anon key
SUPABASE_URL="https://your-project.supabase.co"
ANON_KEY="your-anon-key"

# Test reading collections (should work)
curl "$SUPABASE_URL/rest/v1/collections?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Test reading jewelry (should work)
curl "$SUPABASE_URL/rest/v1/jewelry?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Test reading sales_points (should work)
curl "$SUPABASE_URL/rest/v1/sales_points?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Expected Result:** All three requests should return `200 OK` with data (or empty array if no data exists)

#### Step 2: Test Anonymous Write Access (Should Fail)

```bash
# Test INSERT (should fail with 403 or 401)
curl -X POST "$SUPABASE_URL/rest/v1/collections" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Collection", "description": "This should fail"}'

# Test UPDATE (should fail with 403 or 401)
curl -X PATCH "$SUPABASE_URL/rest/v1/collections?id=eq.some-uuid" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Modified Name"}'

# Test DELETE (should fail with 403 or 401)
curl -X DELETE "$SUPABASE_URL/rest/v1/collections?id=eq.some-uuid" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Expected Result:** All three requests should fail with:
- HTTP Status: 403 Forbidden or 401 Unauthorized
- Error message indicating insufficient permissions or policy violation

### Method 3: Using JavaScript (Browser Console)

You can test RLS directly from your browser's developer console:

```javascript
// Replace with your Supabase URL and anon key
const SUPABASE_URL = 'https://your-project.supabase.co';
const ANON_KEY = 'your-anon-key';

// Test READ (should succeed)
async function testRead() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/collections?select=*`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  console.log('Read test:', response.status, await response.json());
}

// Test WRITE (should fail)
async function testWrite() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/collections`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Test Collection',
      description: 'This should fail'
    })
  });
  console.log('Write test:', response.status, await response.json());
}

// Run tests
testRead();  // Should succeed (200)
testWrite(); // Should fail (403 or 401)
```

## Test Checklist

Use this checklist to verify RLS is working correctly:

### Configuration Verification
- [ ] RLS is enabled on `collections` table
- [ ] RLS is enabled on `jewelry` table
- [ ] RLS is enabled on `sales_points` table
- [ ] "Allow anonymous read access" policy exists on `collections`
- [ ] "Allow anonymous read access" policy exists on `jewelry`
- [ ] "Allow anonymous read access" policy exists on `sales_points`

### Anonymous Read Access (Should Succeed)
- [ ] Can SELECT from `collections` table
- [ ] Can SELECT from `jewelry` table
- [ ] Can SELECT from `sales_points` table

### Anonymous Write Access (Should Fail)
- [ ] Cannot INSERT into `collections` table
- [ ] Cannot UPDATE `collections` table
- [ ] Cannot DELETE from `collections` table
- [ ] Cannot INSERT into `jewelry` table
- [ ] Cannot UPDATE `jewelry` table
- [ ] Cannot DELETE from `jewelry` table
- [ ] Cannot INSERT into `sales_points` table
- [ ] Cannot UPDATE `sales_points` table
- [ ] Cannot DELETE from `sales_points` table

## Troubleshooting

### Issue: RLS is not enabled

**Symptom:** `rowsecurity` shows `false` in pg_tables query

**Solution:** Run the RLS configuration script:
```sql
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelry ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_points ENABLE ROW LEVEL SECURITY;
```

### Issue: Policies don't exist

**Symptom:** No policies returned from pg_policies query

**Solution:** Run the policy creation script (`05_configure_rls_policies.sql`)

### Issue: Anonymous users can write data

**Symptom:** INSERT/UPDATE/DELETE operations succeed with anon key

**Solution:** 
1. Verify RLS is enabled on the table
2. Check that no permissive INSERT/UPDATE/DELETE policies exist
3. Ensure you're using the anon key, not the service_role key

### Issue: Anonymous users cannot read data

**Symptom:** SELECT operations fail with 403 or return empty results

**Solution:**
1. Verify the "Allow anonymous read access" policy exists
2. Check the policy's USING clause is set to `true`
3. Ensure the policy is for SELECT operations
4. Verify you're using the correct anon key

## Security Best Practices

1. **Never expose the service_role key** - Only use it server-side for admin operations
2. **Use the anon key in your frontend** - This key respects RLS policies
3. **Test RLS before deploying** - Always verify policies work as expected
4. **Monitor API usage** - Set up alerts for unusual write attempts
5. **Regular audits** - Periodically review and test your RLS policies

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase API Documentation](https://supabase.com/docs/guides/api)

## Requirements Satisfied

This RLS configuration satisfies:
- **Requirement 9.1** - Allow anonymous read access to jewelry, collections, and sales points tables
- **Requirement 9.2** - Prevent anonymous write, update, or delete operations
