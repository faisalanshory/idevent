import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, Home, Building, QrCode, Image } from "lucide-react";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch organizer access
  const organizer = await getOrganizerAccess(session.id);

  if (!organizer) {
    // If Superadmin logs in, they can view, but they should manage organizers from /admin.
    // Let's redirect Superadmin to /admin if they try to access /organizer without an organizer link.
    if (session.role === "SUPERADMIN") {
      redirect("/admin");
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <Building className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Access Denied</h1>
          <p className="text-muted-foreground text-sm leading-normal">
            You do not currently manage an Event Organizer workspace. Please contact the platform Superadmin to assign you to a tenant.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button>Return to Landing Page</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border/60 bg-card hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 px-6 border-b border-border/40 flex items-center gap-2">
          {organizer.logo ? (
            <img src={organizer.logo} alt={organizer.name} className="w-6 h-6 rounded-md object-cover" />
          ) : (
            <Building className="h-5 w-5 text-primary" />
          )}
          <span className="font-bold text-sm tracking-tight text-foreground truncate">{organizer.name}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/organizer">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Overview
            </div>
          </Link>
          <Link href="/organizer/events">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Events
            </div>
          </Link>
          <Link href="/organizer/articles">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Articles
            </div>
          </Link>
          <Link href="/organizer/verify">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              Verifikasi Tiket
            </div>
          </Link>
          <Link href="/organizer/banners">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <Image className="h-4 w-4 text-muted-foreground" />
              Banners
            </div>
          </Link>
          <Link href="/organizer/settings">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground transition-all">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </div>
          </Link>
        </nav>

        <div className="p-4 border-t border-border/40 space-y-2">
          <div className="px-3 py-1 text-xs text-muted-foreground font-semibold">
            Organizer Admin:
            <div className="text-foreground truncate text-sm mt-0.5">{session.name}</div>
          </div>
          {(() => {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const storefrontUrl = rootDomain.includes("vercel.app")
              ? `/sites/${organizer.subdomain}`
              : `http://${organizer.subdomain}.${rootDomain}`;
            return (
              <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4 mr-2" />
                  Visit Storefront
                </Button>
              </a>
            );
          })()}
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
            <Building className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm truncate max-w-[150px]">{organizer.name}</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground font-medium">
            Organizer Console
          </div>
          <div className="flex items-center gap-4">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-md border border-border"
              style={{ color: organizer.primaryColor, borderColor: `${organizer.primaryColor}20`, backgroundColor: `${organizer.primaryColor}08` }}
            >
              Workspace: {organizer.subdomain}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
