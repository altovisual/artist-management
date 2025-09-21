"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import AIContractChat from "@/components/ai/AIContractChat";

const navLinks = [
  { href: "/management/participants", label: "Participants" },
  { href: "/management/works", label: "Works" },
  { href: "/management/templates", label: "Templates" },
  { href: "/management/contracts", label: "Contracts" },
  { href: "/management/contracts/signed", label: "Signed Contracts" },
  { href: "/management/signatures", label: "Signatures" },
];

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-64 p-4 border-b md:border-r md:border-b-0">
          <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname.startsWith(link.href)
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <AIContractChat />
    </DashboardLayout>
  );
}
