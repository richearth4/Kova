import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const getAppUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return url.startsWith('http') ? url : `https://${url}`
}

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "KOVA | Collective Wealth. Redefined.",
  description: "KOVA is a secure, transparent co-operative financial platform. Manage savings, loans, and logistics with confidence.",
  keywords: "cooperative, savings, loans, fintech, Nigeria, KOVA",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "512x512", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon.svg", color: "#10B981" },
    ],
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right"
            richColors 
            closeButton
            theme="system"
            toastOptions={{
              className: 'rounded-2xl border-border bg-card text-foreground font-semibold text-xs',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
