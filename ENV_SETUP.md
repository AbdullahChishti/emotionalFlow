# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Optional Variables

```bash
# Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Feature Flags
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

## Getting Your Credentials

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key
