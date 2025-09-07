import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { ColorThemeProvider } from '@/components/providers/ColorThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

// Setup the fonts
const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})

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
      {/* Apply the fonts to the body */}
      <body className={`${inter.className} ${poppins.variable}`}>
        <GlobalErrorBoundary>
          <AuthProvider>
            <ColorThemeProvider>
              {children}
            </ColorThemeProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}