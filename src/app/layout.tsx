import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/app/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { SponsorTicker } from '@/app/components/sponsor-ticker';
import { SITE_URL } from '@/lib/site';

// Self-hosted via next/font: no render-blocking Google Fonts <link>, no layout
// shift. Exposed as a CSS var so Tailwind's font-sans points at it.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'StartupDB',
  description: "Discover Malaysia's premier startups, VCs, and events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            {/* <SponsorTicker /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
