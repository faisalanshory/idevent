import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Building2, LayoutDashboard, Shield, LogOut, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Extra security guard in layout
  if (!session || session.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border/60 bg-card hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 px-6 border-b border-border/40 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg tracking-tight text-foreground">Superadmin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Overview
            </div>
          </Link>
          <Link href="/admin/organizers">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Organizers
            </div>
          </Link>
        </nav>

        <div className="p-4 border-t border-border/40 space-y-2">
          <div className="px-3 py-1 text-xs text-muted-foreground font-semibold">
            Logged in as:
            <div className="text-foreground truncate text-sm mt-0.5">{session.name}</div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-2" />
              Main Site
            </Button>
          </Link>
          <form action="/api/auth/logout" method="POST" className="w-full">
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">Superadmin</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground font-medium">
            SaaS Control Panel
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
