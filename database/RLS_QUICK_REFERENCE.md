# RLS Quick Reference Card

## Current RLS Configuration

### Tables with RLS Enabled
- ✅ `collections`
- ✅ `jewelry`
- ✅ `sales_points`

### Active Policies

| Table | Policy Name | Operation | Who | Effect |
|-------|------------|-----------|-----|--------|
| collections | Allow anonymous read access | SELECT | Anonymous (anon key) | ✅ Allow |
| jewelry | Allow anonymous read access | SELECT | Anonymous (anon key) | ✅ Allow |
| sales_points | Allow anonymous read access | SELECT | Anonymous (anon key) | ✅ Allow |

### Permission Matrix

| Operation | Anonymous User | Authenticated User | Service Role |
|-----------|----------------|-------------------|--------------|
| SELECT (Read) | ✅ Allowed | ✅ Allowed* | ✅ Allowed |
| INSERT (Create) | ❌ Denied | ❌ Denied* | ✅ Allowed |
| UPDATE (Modify) | ❌ Denied | ❌ Denied* | ✅ Allowed |
| DELETE (Remove) | ❌ Denied | ❌ Denied* | ✅ Allowed |

*Note: Authenticated users currently have the same permissions as anonymous users. Add specific policies if you need authenticated users to have write access.

## Quick Test Commands

### Test Read Access (Should Work)
```bash
curl "https://YOUR_PROJECT.supabase.co/rest/v1/collections?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test Write Access (Should Fail)
```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/rest/v1/collections" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

## SQL Verification Queries

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('collections', 'jewelry', 'sales_points');
```

### List All Policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('collections', 'jewelry', 'sales_points');
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Can't read data | RLS enabled but no SELECT policy | Create SELECT policy with USING (true) |
| Can write data | RLS not enabled | Run ALTER TABLE ... ENABLE ROW LEVEL SECURITY |
| 403 errors | Using wrong API key | Use anon key for anonymous access |

## Files Reference

- **Setup Script**: `00_setup_all_tables.sql` (includes RLS)
- **RLS Only**: `05_configure_rls_policies.sql`
- **Verification**: `06_verify_rls_policies.sql`
- **Testing Guide**: `RLS_TESTING_GUIDE.md`

## Requirements

- ✅ **Requirement 9.1**: Anonymous read access enabled
- ✅ **Requirement 9.2**: Anonymous write/update/delete prevented
