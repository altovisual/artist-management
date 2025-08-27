'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Calendar, Users, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { LogoutButton } from "./logout-button"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/releases", label: "Releases", icon: Calendar },
  // Add other main navigation items here
];

const getPageTitle = (path: string) => {
  const item = menuItems.find(item => item.href === path);
  if (item) return item.label;
  // Handle specific routes not in menuItems, e.g., /artists/[id]
  if (path.startsWith("/artists/")) {
    // This is a simplified example. A real implementation might fetch the artist name.
    return "Artist Details";
  }
  if (path.startsWith("/dashboard/releases")) {
    return "Releases";
  }
  return "Dashboard"; // Default title
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            {/* You can add a logo here */}
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">User Name</p>
                    <p className="text-xs text-muted-foreground truncate">user@example.com</p>
                </div>
                <LogoutButton />
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-bold hidden sm:block">ArtMan</h1>
                    <span className="ml-4 text-xl font-semibold">{getPageTitle(pathname)}</span>
                </div>
                {/* Header content can go here, like breadcrumbs or other actions */}
            </header>
            <main className="p-4 md:p-6">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
