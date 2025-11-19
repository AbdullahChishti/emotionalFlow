# Test Super User Setup

## Quick Test Login

**Email:** `test@mindwell.com`  
**Password:** `TestUser123!`

## How to Create the Test User

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://fpahhfzmkjsienzzeyks.supabase.co
2. Navigate to **Authentication** > **Users**
3. Click **Add User** > **Create new user**
4. Enter:
   - Email: `test@mindwell.com`
   - Password: `TestUser123!`
   - Auto Confirm User: ✅ **YES** (important!)
5. Click **Create user**
6. Copy the user's UUID from the users table
7. Go to **SQL Editor** and run the SQL from `create-test-user.sql` (replace the UUID)

### Option 2: Using Supabase CLI

```bash
# Create the user via Supabase CLI
supabase auth create test@mindwell.com --password TestUser123!

# Then run the SQL script
supabase db execute -f create-test-user.sql
```

### Option 3: Quick Manual Setup

Just sign up normally at `/signup` with:
- Email: `test@mindwell.com`
- Password: `TestUser123!`
- Name: `Test User`

## Test User Features

The test user will have:
- ✅ 100 credits to start
- ✅ Sample mood entry
- ✅ Sample assessment result
- ✅ Full access to all features

## Using the Test User

1. Go to http://localhost:3000/login
2. Enter:
   - Email: `test@mindwell.com`
   - Password: `TestUser123!`
3. Click **Sign In**
4. You'll be redirected to the dashboard

## Resetting the Test User

If you need to reset the test user's data:

```sql
-- Delete all test user data
DELETE FROM mood_entries WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@mindwell.com');
DELETE FROM assessment_results WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@mindwell.com');
DELETE FROM profiles WHERE email = 'test@mindwell.com';
-- Then delete from auth.users in the Supabase Dashboard
```

## Alternative: Use Your Own Account

You can also just sign up with your own email for testing. The app supports:
- Email/password authentication
- Profile creation
- All features available immediately
