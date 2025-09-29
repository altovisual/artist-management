"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import AIContractChat from "@/components/ai/AIContractChat";

const navItems = [
  { href: "/management/participants", label: "Participants" },
  { href: "/management/works", label: "Works" },
  { href: "/management/templates", label: "Templates" },
  { href: "/management/contracts", label: "Contracts" },
  { href: "/management/signatures", label: "Signatures" },
];

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <DashboardLayout>
      {/* Native iPhone Layout with proper spacing */}
      <div className="min-h-screen bg-background" data-page="management">
        {/* Navigation Tabs - iPhone Style */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <nav className="flex space-x-1 overflow-x-auto">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith(link.href)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content with Native Spacing */}
        <main className="px-4 py-6 space-y-6 max-w-full">
          {children}
        </main>
      </div>
      <AIContractChat />
    </DashboardLayout>
  );
}
