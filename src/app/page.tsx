import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Ticket, Sparkles, LayoutDashboard } from "lucide-react";
import { getSession } from "@/lib/auth";

export const revalidate = 0; // Disable caching to always show live DB data

export default async function PlatformLandingPage() {
  const session = await getSession();

  // Fetch all published events with their organizers and ticket types
  const events = await db.event.findMany({
    where: { status: "PUBLISHED" },
    include: {
      organizer: true,
      category: true,
      tickets: {
        orderBy: { price: "asc" },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Fetch all organizers
  const organizers = await db.organizer.findMany({
    take: 6,
  });

  // Unique categories list for filters
  const categories = await db.category.findMany();

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FC] text-slate-900 font-sans">
      {/* Central Header (Loket style) */}
      <header className="border-b border-border bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-600 flex items-center gap-1.5">
            <Ticket className="h-6 w-6 rotate-12" />
            IDEvent
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-slate-500 hidden md:inline">
                  Hi, <strong className="text-slate-800">{session.name}</strong> ({session.role})
                </span>
                {session.role === "SUPERADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Superadmin
                    </Button>
                  </Link>
                )}
                {session.role === "ORGANIZER" && (
                  <Link href="/organizer">
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Organizer Panel
                    </Button>
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST" className="inline">
                  <Button variant="ghost" size="sm" type="submit" className="text-slate-500 hover:text-slate-950">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors mr-2">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Register Organizer
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Banner (Loket style) */}
      <section className="bg-blue-900 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-950/80 to-indigo-900/60" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/20 uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Event Ticketing Made Easy
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            Cari Event Seru di <span className="text-yellow-400">IDEvent</span> Sekarang!
          </h1>
          <p className="text-sm md:text-base text-blue-200/90 max-w-md mx-auto">
            Platform SaaS pembuat tiket event instan dengan subdomain kustom dan dynamic branding.
          </p>

          {/* Search bar widget */}
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-2 flex items-center border border-slate-200 text-slate-800">
            <Search className="h-5 w-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Cari event menarik..."
              className="w-full px-3 py-2 text-sm focus:outline-hidden"
              disabled
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 font-bold shrink-0 rounded-lg">
              Cari
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Category Filter Tags */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kategori Populer</h3>
          <div className="flex flex-wrap gap-2.5">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white border border-blue-600 cursor-pointer shadow-xs">
              Semua Event
            </span>
            {categories.map((cat) => (
              <span key={cat.id} className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                {cat.name}
              </span>
            ))}
          </div>
        </section>

        {/* Public Events Directory */}
        <section id="events" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Event Pilihan</h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">Temukan tiket event menarik dari partner resmi kami</p>
            </div>
            <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Lihat Semua &rarr;</span>
          </div>

          {events.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-slate-300 bg-white">
              <p className="text-slate-500 text-sm">Belum ada event publik yang diterbitkan.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const eventUrl = rootDomain.includes("vercel.app") 
                  ? `/sites/${event.organizer.subdomain}/events/${event.slug}`
                  : `http://${event.organizer.subdomain}.${rootDomain}/events/${event.slug}`;
                
                // Get lowest ticket price
                const lowestPrice = event.tickets.length > 0
                  ? Math.min(...event.tickets.map(t => t.price))
                  : null;

                return (
                  <Card key={event.id} className="flex flex-col overflow-hidden bg-white border border-slate-200/80 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                    {/* Event Banner */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-sm font-semibold">
                          No Banner Image
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                        {event.category.name}
                      </span>
                    </div>

                    <CardHeader className="flex-1 space-y-2 p-5 pb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {event.organizer.name}
                      </span>
                      <CardTitle className="text-base font-bold line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors min-h-[44px]">
                        {event.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="text-xs space-y-2 px-5 pb-4 border-b border-slate-100 text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 shrink-0 text-blue-600" />
                        {new Date(event.startDate).toLocaleDateString("id-ID", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 text-blue-600" />
                        <span className="line-clamp-1">{event.venue || event.location}</span>
                      </div>
                    </CardContent>

                    {/* Price & CTA (Loket Style) */}
                    <CardFooter className="p-5 flex items-center justify-between bg-slate-50/50">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Harga Mulai Dari</p>
                        <p className="text-sm font-black text-blue-600">
                          {lowestPrice !== null 
                            ? `Rp ${lowestPrice.toLocaleString("id-ID")}`
                            : "Free"
                          }
                        </p>
                      </div>
                      <a
                        href={eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg">
                          Beli Tiket
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Active Organizers Section */}
        <section className="space-y-6 pt-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Partner Penyelenggara</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Beli langsung dari halaman resmi tenant/organizer terkait</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizers.map((org) => {
              const url = `http://${org.subdomain}.${rootDomain}`;
              return (
                <Card key={org.id} className="border border-slate-200/80 hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 p-5 pb-3">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-base border border-blue-100">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-bold text-slate-900 leading-tight">{org.name}</CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-400">
                        {org.subdomain}.{rootDomain}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-500 line-clamp-2 min-h-[34px] px-5 pb-4">
                    {org.description || "No description provided."}
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Tenant Page
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Buka Web &rarr;
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10 mt-16 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-600">&copy; {new Date().getFullYear()} IDEvent SaaS Platform. All rights reserved.</p>
          <p className="opacity-75">Sistem Tiket Multi-Tenant dengan Isolasi Database & Subdomain Dinamis.</p>
        </div>
      </footer>
    </div>
  );
}

