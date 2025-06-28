import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/themes.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ColorThemeProvider } from "@/components/providers/ColorThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EmotionEconomy - Balanced Emotional Support",
  description: "A platform for reciprocal emotional support where empathy has value and emotional labor is fairly exchanged.",
  keywords: ["emotional support", "mental health", "empathy", "listening", "peer support"],
  authors: [{ name: "EmotionEconomy Team" }],
  openGraph: {
    title: "EmotionEconomy",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ColorThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ColorThemeProvider>
      </body>
    </html>
  );
}
