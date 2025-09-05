import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { ColorThemeProvider } from '@/components/providers/ColorThemeProvider'

// Setup the Inter font
const inter = Inter({ subsets: ['latin'] })

// Define metadata for the application
export const metadata: Metadata = {
  title: 'MindWell - Your Personal Therapy Companion',
  description: 'Connect with our AI-powered therapy bot for personalized support and guidance, anytime, anywhere.',
}

// Define the root layout for the application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </head>
      {/* Apply the Inter font className to the body */}
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <ColorThemeProvider>
            {children}
          </ColorThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}