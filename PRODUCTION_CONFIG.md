# Production Configuration Guide

## Environment Variables

Create a `.env.local` file with the following production values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_NAME=MindWell

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_CHAT=false
NEXT_PUBLIC_ENABLE_CRISIS_DETECTION=true
NEXT_PUBLIC_ENABLE_ANONYMOUS_MODE=true

# Production Settings
NEXT_PUBLIC_SKIP_AUTH=false
NODE_ENV=production

# Security
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-production-domain.com
```

## Pre-deployment Checklist

### 1. Database Setup
- [ ] Run all migrations: `supabase db push`
- [ ] Verify RLS policies are enabled
- [ ] Test database connections

### 2. Security
- [ ] Update CSP headers in `next.config.ts` for production domain
- [ ] Verify all environment variables are set
- [ ] Test authentication flows

### 3. Performance
- [ ] Run `npm run build` to check for build errors
- [ ] Test all routes and functionality
- [ ] Verify no console.log statements in production build

### 4. Content
- [ ] Update placeholder links in landing page
- [ ] Verify all images and assets are accessible
- [ ] Test responsive design on mobile devices

## Deployment Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

## Post-deployment Verification

1. Test all user flows (signup, login, assessments, chat)
2. Verify database connections and data persistence
3. Check error handling and loading states
4. Test on different devices and browsers
5. Monitor performance and error logs
