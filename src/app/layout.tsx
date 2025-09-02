import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ColorThemeProvider } from '@/components/providers/ColorThemeProvider'

// Setup the Inter font
const inter = Inter({ subsets: ['latin'] })

// Define metadata for the application
export const metadata: Metadata = {
  title: 'Heard - Your Mental Wellness Companion',
  description: 'A safe space to find peace, support, and personal growth.',
}

// Define the root layout for the application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Apply the Inter font className to the body */}
      <body className={inter.className}>
        <ColorThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ColorThemeProvider>
      </body>
    </html>
  )
}
