/**
 * Shared CORS utilities for Supabase Edge Functions
 * Restricts origins using env var ALLOWED_ORIGINS (comma-separated) or SITE_URL fallback.
 */

const parseAllowedOrigins = (): string[] => {
  const fromEnv = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
  if (fromEnv.length > 0) return fromEnv
  const siteUrl = Deno.env.get('SITE_URL') || Deno.env.get('APP_URL') || 'http://localhost:3000'
  return [siteUrl]
}

const ALLOWED_ORIGINS = parseAllowedOrigins()

export const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  }
}

export const handleCorsPreflight = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }
  return null
}
