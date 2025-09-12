'use client'

import * as React from "react"
import Link from "next/link"
import dynamic from 'next/dynamic'

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LayoutDashboard, Calendar, Music, Shield, User, LogOut, DollarSign, Menu, BarChart } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheme } from "next-themes"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false); // State for mobile sheet

  const supabase = createClient();
  const { theme } = useTheme();

  // Refs for desktop navigation links
  const navRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = React.useState({ left: 0, width: 0 });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user in layout:", error);
        return;
      }
      if (data.user) {
        setIsAdmin(data.user.app_metadata?.role === 'admin');
        setUserEmail(data.user.email || null);
      }
    };
    fetchUser();
  }, [supabase]);

  // Effect to update underline position and width
  React.useEffect(() => {
    if (isMounted) {
      const activeLink = navRefs.current.find(ref => ref?.href.endsWith(pathname));
      if (activeLink) {
        setUnderlineStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
        });
      } else {
        const firstLink = navRefs.current[0];
        if (firstLink) {
          setUnderlineStyle({ left: firstLink.offsetLeft, width: 0 });
        }
      }
    }
  }, [pathname, isMounted]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/finance", label: "Finance", icon: DollarSign },
    { href: "/dashboard/releases", label: "Releases", icon: Music },
  ];

  // Conditionally add the Management link
  if (isAdmin) {
    navLinks.push({ href: "/management/participants", label: "Management", icon: Shield });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card text-card-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <div className="flex flex-col items-start gap-2 px-4 pt-4 pb-2">
                                  <AnimatedLogo />
                    <span className="text-xs text-muted-foreground">Your Artist Management Solution</span>
                  </div>
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-2 text-lg transition-colors hover:text-foreground ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setIsSheetOpen(false)} // Close sheet on click
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                            <AnimatedLogo />
              
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium relative">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={el => { navRefs.current[index] = el; }} // Assign ref
                  className={`flex items-center gap-2 transition-colors hover:text-foreground ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              {/* Underline element - now inside nav */}
              <span
                className="absolute bottom-[-8px] h-[2px] bg-primary/40 transition-all duration-300 ease-out"
                style={underlineStyle}
              ></span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    {userEmail && <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/artists/my-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}