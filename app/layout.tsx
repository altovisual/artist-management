// Archivo: app/layout.tsx

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from 'next/script';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { VaultProvider } from "@/components/vault-provider";
import NextNProgress from 'nextjs-toploader';
import "./globals.css";

// La metadata no cambia
export const metadata: Metadata = {
  title: "Artist Management System",
  description: "Manage your artists and their social media accounts",
  generator: "v0.app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <body>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" strategy="beforeInteractive" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextNProgress color="#e1348f" />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}