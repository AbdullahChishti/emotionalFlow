import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    // Basic CSP to reduce XSS risk; tuned to avoid breaking Next.js
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      // Next.js dev requires 'unsafe-eval'; allow inline scripts for compatibility
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Allow inline styles for Tailwind and emotion runtime, plus Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Connect to Supabase and OpenAI endpoints for Edge Functions
      "connect-src 'self' https://*.supabase.co https://api.openai.com",
      // Allow images from self, data/blob URIs, and Google-hosted images
      "img-src 'self' data: blob: https://lh3.googleusercontent.com",
      // Fonts from self, data URIs, and Google Fonts
      "font-src 'self' data: https://fonts.gstatic.com",
      // Media streams (if voice in future)
      "media-src 'self' blob:",
      // Object/embed disabled
      "object-src 'none'",
      // Disallow mixed content
      "upgrade-insecure-requests"
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ]
  }
};

export default nextConfig;
