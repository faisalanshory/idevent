"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, FileText, Settings, LogOut, Home, Building, QrCode, Image, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav({ 
  organizerName, 
  organizerLogo, 
  organizerSubdomain,
  adminName
}: { 
  organizerName: string, 
  organizerLogo: string | null,
  organizerSubdomain: string,
  adminName: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/organizer", icon: LayoutDashboard },
    { name: "Events", href: "/organizer/events", icon: Calendar },
    { name: "Articles", href: "/organizer/articles", icon: FileText },
    { name: "Verifikasi Tiket", href: "/organizer/verify", icon: QrCode },
    { name: "Banners", href: "/organizer/banners", icon: Image },
    { name: "Settings", href: "/organizer/settings", icon: Settings },
  ];

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const storefrontUrl = rootDomain.includes("vercel.app")
    ? `/sites/${organizerSubdomain}`
    : `http://${organizerSubdomain}.${rootDomain}`;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-muted-foreground hover:bg-accent rounded-md md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-64 max-w-[80vw] h-full bg-card border-r border-border/60 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <div className="flex items-center gap-2 overflow-hidden">
                {organizerLogo ? (
                  <img src={organizerLogo} alt={organizerName} className="w-6 h-6 rounded-md object-cover shrink-0" />
                ) : (
                  <Building className="h-5 w-5 text-primary shrink-0" />
                )}
                <span className="font-bold text-sm tracking-tight text-foreground truncate">{organizerName}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto py-4 px-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-border/40 space-y-2">
              <div className="px-3 py-1 text-xs text-muted-foreground font-semibold">
                Organizer Admin:
                <div className="text-foreground truncate text-sm mt-0.5">{adminName}</div>
              </div>
              <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4 mr-2" />
                  Visit Storefront
                </Button>
              </a>
              <form action="/api/auth/logout" method="POST" className="w-full">
                <Button variant="ghost" size="sm" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
