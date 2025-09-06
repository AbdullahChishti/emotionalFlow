/**
 * Shared CORS utilities for Supabase Edge Functions
 * Allows all origins for better development and deployment flexibility
 */

export const getCorsHeaders = (req: Request) => {
  return {
    'Access-Control-Allow-Origin': '*',
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
