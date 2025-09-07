# MindWell Authentication Setup Guide

This guide provides comprehensive instructions for setting up the production-ready authentication system for MindWell using Next.js 14 (App Router), TypeScript, and Supabase Auth.

## 🚀 Features

- ✅ **Cookie-based session persistence** (no localStorage)
- ✅ **Server-side authentication guards**
- ✅ **Middleware protection** for all routes
- ✅ **OAuth support** (Google, etc.)
- ✅ **Password reset functionality**
- ✅ **Email confirmation flow**
- ✅ **Server actions** for auth operations
- ✅ **TypeScript support**
- ✅ **Tailwind CSS styling**

## 📁 File Structure

```
src/
├── app/
│   ├── (auth)/                    # Protected routes layout
│   ├── (public)/                  # Public routes layout
│   │   ├── login/                 # Login page
│   │   └── signup/                # Signup page
│   ├── auth/
│   │   └── callback/              # OAuth callback handler
│   ├── forgot-password/           # Password reset request
│   ├── reset-password/            # Password reset completion
│   ├── logout/                    # Server-side logout
│   └── settings/                  # User settings (protected)
├── components/
│   ├── providers/
│   │   └── AuthProvider.tsx       # Client-side auth context
│   └── screens/
│       ├── LoginScreen.tsx        # Login form component
│       ├── SignupScreen.tsx       # Signup form component
│       ├── ForgotPasswordScreen.tsx # Password reset request
│       ├── ResetPasswordScreen.tsx   # Password reset form
│       └── SettingsScreen.tsx     # Settings page
├── lib/
│   ├── supabase.ts                # Supabase client configuration
│   └── actions.ts                 # Server actions for auth
└── middleware.ts                  # Route protection middleware
```

## 🔧 Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed:

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: OAuth Configuration
# Configure these in your Supabase dashboard
```

**Getting Supabase Keys:**

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings → API
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Supabase Configuration

#### Enable Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure the following:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
```

#### Email Templates (Optional)

1. Go to Authentication → Email Templates
2. Customize the email templates for:
   - Email confirmation
   - Password reset
   - Magic link (if used)

### 4. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  empathy_credits INTEGER DEFAULT 10,
  total_credits_earned INTEGER DEFAULT 10,
  total_credits_spent INTEGER DEFAULT 0,
  emotional_capacity TEXT DEFAULT 'medium',
  preferred_mode TEXT DEFAULT 'both',
  is_anonymous BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. OAuth Setup (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. In Supabase dashboard:
   - Go to Authentication → Providers
   - Enable Google
   - Add your Google Client ID and Client Secret

## 🔐 Authentication Flow

### Public Routes
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset completion
- `/auth/callback` - OAuth callback handler

### Protected Routes
- `/dashboard` - Main dashboard
- `/settings` - User settings
- All routes under `(auth)` layout

### Middleware Behavior

The middleware automatically:

1. **Redirects unauthenticated users** from protected routes to `/login?redirect=<original-path>`
2. **Redirects authenticated users** from auth routes to `/dashboard`
3. **Handles OAuth callbacks** properly
4. **Preserves redirect URLs** for post-login navigation

## 🛠️ Usage Examples

### Server Actions

```typescript
// In your components, use server actions
'use client'

import { signIn, signUp } from '@/lib/actions'

function LoginForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await signIn(formData)
    if (result.error) {
      // Handle error
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Client-side Auth

```typescript
'use client'

import { useAuth } from '@/components/providers/AuthProvider'

function MyComponent() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <h1>Welcome, {profile?.display_name}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Server-side Auth Check

```typescript
// In server components
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

## 🔍 Testing

### Manual Testing Checklist

1. **Sign Up Flow:**
   - Visit `/signup`
   - Create account
   - Check email for confirmation
   - Confirm email
   - Should redirect to dashboard

2. **Login Flow:**
   - Visit `/login`
   - Sign in with credentials
   - Should redirect to dashboard
   - Check middleware redirects work

3. **Password Reset:**
   - Visit `/forgot-password`
   - Request reset
   - Check email for reset link
   - Use reset link to change password
   - Should redirect to login

4. **Middleware Protection:**
   - Try accessing `/dashboard` without auth → should redirect to login
   - Try accessing `/login` when authenticated → should redirect to dashboard
   - Test redirect parameter preservation

5. **OAuth Flow:**
   - Click OAuth provider button
   - Complete OAuth flow
   - Should redirect back to dashboard

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **"No session found" errors:**
   - Check that cookies are being set properly
   - Verify middleware is running
   - Check Supabase configuration

2. **OAuth callback issues:**
   - Verify redirect URLs in Supabase and OAuth provider
   - Check that `/auth/callback` route exists
   - Ensure middleware allows the callback route

3. **Session persistence issues:**
   - Verify `@supabase/ssr` is installed
   - Check cookie configuration
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

4. **Email not sending:**
   - Check Supabase email settings
   - Verify SMTP configuration if custom
   - Check spam folder

### Debug Mode

Enable debug logging by checking the console for messages starting with:
- `🛡️ CRITICAL AUTH LOG` - Middleware logs
- `🚀 CRITICAL AUTH LOG` - Client-side auth logs
- `🎯 CRITICAL AUTH LOG` - Auth state changes

## 🚀 Production Deployment

### Environment Variables for Production

```bash
# Production URLs
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Secure cookie settings (handled automatically in production)
NODE_ENV=production
```

### Supabase Production Setup

1. Update Site URL in Supabase Auth settings:
   ```
   https://your-domain.com
   ```

2. Update Redirect URLs:
   ```
   https://your-domain.com/auth/callback
   ```

3. Enable Row Level Security in production

### Deployment Checklist

- ✅ Environment variables configured
- ✅ Supabase URLs updated
- ✅ OAuth redirect URLs updated
- ✅ Database migrations run
- ✅ Email templates configured
- ✅ SSL certificate configured
- ✅ Cookie settings verified

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware Guide](https://nextjs.org/docs/advanced-features/middleware)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 🤝 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Check Supabase dashboard for auth configuration
4. Review the middleware logs
5. Test with Supabase's example applications

---

**Note:** This authentication system provides production-ready security with cookie-based sessions, server-side validation, and comprehensive error handling. Always keep your Supabase keys secure and never commit them to version control.

