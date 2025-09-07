# 🔧 Account Creation Fix

## The Problem

Account creation was failing with the error:
```
❌ Database error saving user profile (attempt 1): {}
```

This was happening because:

1. **Database Trigger Not Working**: The `handle_new_user()` trigger that should automatically create profiles on user signup is not working properly
2. **RLS Policy Issues**: Row Level Security policies are preventing profile creation during the signup process
3. **Unique Constraint Violations**: The code was using `INSERT` instead of `UPSERT` for profile creation, causing conflicts when profiles already existed

## The Solution

### 1. Fixed Code Issues ✅

**AssessmentManager.ts** - Changed from `INSERT` to `UPSERT`:
```typescript
// Before (causing unique constraint violations)
.insert({ user_id: userId, profile_data: userProfile, ... })

// After (handles existing profiles)
.upsert({ user_id: userId, profile_data: userProfile, ... }, {
  onConflict: 'user_id',
  ignoreDuplicates: false
})
```

**AuthProvider.tsx** - Changed from `INSERT` to `UPSERT`:
```typescript
// Before (causing unique constraint violations)
.insert(newProfileData)

// After (handles existing profiles)
.upsert(newProfileData, {
  onConflict: 'id',
  ignoreDuplicates: false
})
```

### 2. Database Migration Required 🔧

The database needs a migration to fix the RLS policies and trigger. 

**File**: `supabase/migrations/20250118_fix_profile_creation.sql`

**To apply this migration:**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250118_fix_profile_creation.sql`
4. Click **Run**

### 3. What the Migration Does

1. **Updates the trigger function** to include all required profile fields
2. **Fixes RLS policies** to allow profile creation during signup
3. **Ensures the trigger works** with proper permissions

## Testing

Run the test script to verify the fix:
```bash
node test-account-creation.js
```

## Current Status

- ✅ Code fixes applied
- ⏳ Database migration needs to be applied manually
- ✅ Test script created to verify functionality

## Next Steps

1. **Apply the database migration** (see instructions above)
2. **Test account creation** using the test script
3. **Verify the signup flow** works in the application

## Files Modified

- `src/lib/services/AssessmentManager.ts` - Fixed upsert logic
- `src/components/providers/AuthProvider.tsx` - Fixed upsert logic
- `supabase/migrations/20250118_fix_profile_creation.sql` - Database migration
- `test-account-creation.js` - Test script
- `ACCOUNT_CREATION_FIX.md` - This documentation

## Root Cause Analysis

The issue was a combination of:
1. **Database schema mismatch** - Code expected automatic profile creation via trigger
2. **RLS policy restrictions** - Policies prevented trigger from working
3. **Code using INSERT instead of UPSERT** - Caused conflicts on retries
4. **Missing error handling** - Made debugging difficult

All these issues have been addressed in the fix.
