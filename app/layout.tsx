// Archivo: app/layout.tsx

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from 'next/script';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { VaultProvider } from "@/components/vault-provider";
import { IOSDetectionProvider } from "@/components/ios-detection-provider";
import NextNProgress from 'nextjs-toploader';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// La metadata no cambia
export const metadata: Metadata = {
  title: "Artist Management System",
  description: "Manage your artists and their social media accounts",
  generator: "v0.app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Artist Management'
  },
  formatDetection: {
    telephone: false
  }
};

// --- AQUÍ ESTÁ LA PARTE IMPORTANTE ---
// Esta es la exportación por defecto que Next.js estaba buscando.
// Es un componente de React funcional llamado RootLayout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Artist Management" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="webkit-touch-callout" content="no" />
        <meta name="webkit-user-select" content="none" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Immediate iOS detection and theme application
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              if (isIOS) {
                document.documentElement.classList.add('ios-safari', 'ios-device');
              }
              
              // Force dark mode styles immediately
              const theme = localStorage.getItem('theme') || 'system';
              const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const isDark = theme === 'dark' || (theme === 'system' && systemDark);
              
              if (isDark) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.backgroundColor = '#0a0a0a';
                document.documentElement.style.color = '#ffffff';
            })();
          `
        }} />
      </head>
      <body className={`${GeistSans.className} min-h-screen bg-background font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Detect iOS Safari and apply classes
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                
                if (isIOS && isSafari) {
                  document.documentElement.classList.add('ios-safari');
                }
                
                // Also detect dark mode
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
                
                // Listen for theme changes
                if (window.matchMedia) {
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                    if (e.matches) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  });
                }
              })();
            `
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}