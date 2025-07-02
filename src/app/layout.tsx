import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "@/styles/themes.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ColorThemeProvider } from "@/components/providers/ColorThemeProvider";
import SketchbookBackground from '@/components/ui/SketchbookBackground'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "heard - Balanced Emotional Support",
  description: "A platform for reciprocal emotional support where empathy has value and emotional labor is fairly exchanged.",
  keywords: ["emotional support", "mental health", "empathy", "listening", "peer support"],
  authors: [{ name: "heard team" }],
  openGraph: {
    title: "heard",
    description: "Balanced emotional support through empathy credits",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-slate-700`}>
        <SketchbookBackground />
        <ColorThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ColorThemeProvider>
      </body>
    </html>
  );
}
