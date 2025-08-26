// Archivo: app/layout.tsx

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/components/auth-provider";
import { VaultProvider } from "@/components/vault-provider";
import "./globals.css";

// La metadata no cambia
export const metadata: Metadata = {
  title: "Artist Management System",
  description: "Manage your artists and their social media accounts",
  generator: "v0.app",
  icons: [{ rel: "icon", url: "/placeholder-logo.svg" }],
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
    <html lang="en" className={GeistSans.className}>
      <body>
        <AuthProvider>
          <VaultProvider>{children}</VaultProvider>
        </AuthProvider>
      </body>
    </html>
  );
}