# Database Migration Instructions

## Overview
This migration converts the current JSONB blob approach to individual trend rows for better querying, filtering, and management.

## Prerequisites
- Access to Supabase dashboard
- Environment variables set up
- Backup of current data (already done via CSV export)

## Step 1: Create New Database Schema

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Schema Script**
   - Copy and paste the contents of `database-schema.sql`
   - Execute the script
   - Verify the new table `trends_individual` is created

## Step 2: Run Data Migration

1. **Set up environment variables**
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Run migration script**
   ```bash
   node migrate-trends-data.js
   ```

3. **Verify migration**
   - Check Supabase dashboard for new `trends_individual` table
   - Confirm all trends were migrated correctly

## Step 3: Update API

1. **Deploy updated API**
   - The `trends-with-storage.js` has been updated to write individual trends
   - New endpoint `trends-individual.js` for reading trends

2. **Test the new API**
   ```bash
   # Test individual trends endpoint
   curl "https://your-domain.vercel.app/api/trends-individual?limit=5"
   
   # Test with filters
   curl "https://your-domain.vercel.app/api/trends-individual?category=AI&limit=10"
   ```

## Step 4: Update Frontend (When Ready)

1. **Change API endpoint**
   - Update frontend to use `/api/trends-individual` instead of `/api/trends-with-storage`
   - Add query parameters for filtering and pagination

2. **Test frontend**
   - Verify trends display correctly
   - Test filtering and sorting

## Step 5: Cleanup (Optional)

1. **Backup old table**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE public.trends RENAME TO trends_old;
   ```

2. **Monitor for issues**
   - Run the workflow a few times to ensure new data is being written correctly
   - Verify no data loss occurred

## Benefits of New Structure

### ✅ Individual Trend Management
- Each trend is a separate row
- Easy to update, delete, or deactivate individual trends
- Better performance for large datasets

### ✅ Advanced Querying
- Filter by category, tags, date range
- Sort by any field
- Pagination support
- Full-text search capabilities

### ✅ Data Integrity
- Proper foreign key relationships (future)
- Better validation
- Audit trail with created_at/updated_at

### ✅ Scalability
- No more JSONB blob size limits
- Better indexing
- Easier to add new fields

## Rollback Plan

If issues occur:

1. **Revert API changes**
   - Restore original `trends-with-storage.js`
   - Remove `trends-individual.js`

2. **Restore old table**
   ```sql
   DROP TABLE IF EXISTS public.trends_individual;
   ALTER TABLE public.trends_old RENAME TO trends;
   ```

3. **Verify data integrity**
   - Check that all original data is intact
   - Test workflow functionality

## Testing Checklist

- [ ] New schema created successfully
- [ ] Migration completed without errors
- [ ] All trends migrated correctly
- [ ] New API endpoints working
- [ ] Individual trend insertion working
- [ ] Querying and filtering working
- [ ] Frontend displays data correctly
- [ ] No performance degradation
- [ ] Backup data is safe

## Support

If you encounter issues:
1. Check Supabase logs
2. Verify environment variables
3. Test API endpoints individually
4. Review migration script output
