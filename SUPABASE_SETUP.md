# Supabase Setup Guide for heard

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `mindwell`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
   - **Service role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## 3. Update Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=heard

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_CHAT=false
NEXT_PUBLIC_ENABLE_CRISIS_DETECTION=true
NEXT_PUBLIC_ENABLE_ANONYMOUS_MODE=true
```

## 4. Create Database Tables

Go to Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  empathy_credits INTEGER DEFAULT 10,
  total_credits_earned INTEGER DEFAULT 10,
  total_credits_spent INTEGER DEFAULT 0,
  emotional_capacity TEXT CHECK (emotional_capacity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  preferred_mode TEXT CHECK (preferred_mode IN ('therapist', 'friend', 'both')) DEFAULT 'both',
  is_anonymous BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listening_sessions table
CREATE TABLE listening_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listener_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('therapist', 'friend')) DEFAULT 'friend',
  duration_minutes INTEGER DEFAULT 0,
  credits_transferred INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  listener_rating INTEGER CHECK (listener_rating >= 1 AND listener_rating <= 5),
  speaker_rating INTEGER CHECK (speaker_rating >= 1 AND speaker_rating <= 5),
  listener_feedback TEXT,
  speaker_feedback TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create mood_entries table
CREATE TABLE mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  emotional_capacity TEXT CHECK (emotional_capacity IN ('low', 'medium', 'high')),
  seeking_support BOOLEAN DEFAULT false,
  willing_to_listen BOOLEAN DEFAULT true,
  notes TEXT
);

-- Create emotional_labor_logs table
CREATE TABLE emotional_labor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES listening_sessions(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('gave_support', 'received_support')),
  credits_amount INTEGER,
  emotional_impact INTEGER CHECK (emotional_impact >= 1 AND emotional_impact <= 10),
  burnout_risk_score INTEGER DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_labor_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Mood entries: Users can only see their own
CREATE POLICY "Users can view own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Listening sessions: Users can see sessions they're part of
CREATE POLICY "Users can view their sessions" ON listening_sessions
  FOR SELECT USING (auth.uid() = listener_id OR auth.uid() = speaker_id);

CREATE POLICY "Users can insert sessions they're part of" ON listening_sessions
  FOR INSERT WITH CHECK (auth.uid() = listener_id OR auth.uid() = speaker_id);

CREATE POLICY "Users can update their sessions" ON listening_sessions
  FOR UPDATE USING (auth.uid() = listener_id OR auth.uid() = speaker_id);

-- Emotional labor logs: Users can only see their own
CREATE POLICY "Users can view own labor logs" ON emotional_labor_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own labor logs" ON emotional_labor_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listening_sessions_updated_at BEFORE UPDATE ON listening_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Configure Authentication

1. Go to Authentication → Settings
2. Enable the providers you want:
   - **Email**: Already enabled
   - **Google**: Add your OAuth credentials
3. Set Site URL to: `http://localhost:3000`
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

## 6. Test the Setup

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Get Started" or "Sign In"
4. Try creating an account
5. Check your Supabase dashboard to see if the user and profile were created

## 7. Optional: Enable Realtime

For real-time features (live chat, matching), enable Realtime:

1. Go to Database → Replication
2. Enable replication for tables you want real-time updates on:
   - `listening_sessions`
   - `mood_entries`

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your environment variables
2. **"Row Level Security"**: Make sure RLS policies are set up correctly
3. **"Email not confirmed"**: Check your email for verification link
4. **Google OAuth not working**: Verify OAuth credentials and redirect URLs

### Useful SQL Queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View all users
SELECT * FROM auth.users;

-- View all profiles
SELECT * FROM profiles;

-- Reset a user's credits (for testing)
UPDATE profiles SET empathy_credits = 100 WHERE id = 'user-id-here';
```

## Next Steps

Once Supabase is set up:
1. Test user registration and login
2. Complete the onboarding flow
3. Test mood tracking
4. Implement real-time matching
5. Add session management

Your heard app should now have a fully functional authentication system! 🎉
