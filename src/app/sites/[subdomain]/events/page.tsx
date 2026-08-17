import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EventCard from "@/components/sites/event-card";
import EventsFilters from "./events-filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const organizer = await db.organizer.findUnique({ where: { subdomain }, select: { name: true } });
  return { title: `Semua Event | ${organizer?.name ?? ""}` };
}

export default async function EventsPage({ params, searchParams }: Props) {
  const { subdomain } = await params;
  const { q, status, sort } = await searchParams;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const now = new Date();
  const statusFilter = status && status !== "ALL" ? [status] : ["PUBLISHED", "SOLD_OUT", "COMPLETED", "CANCELLED"];

  const events = await db.event.findMany({
    where: {
      organizerId: organizer.id,
      status: { in: statusFilter as any },
      ...(q ? { title: { contains: q } } : {}),
    },
    include: { tickets: { select: { price: true } } },
    orderBy: sort === "price" ? { title: "asc" }
      : sort === "past" ? { startDate: "desc" }
      : { startDate: "asc" },
  });

  const upcoming = events.filter(e => new Date(e.startDate) > now);
  const past = events.filter(e => new Date(e.startDate) <= now);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Temukan Pengalaman Seru</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Semua Event</h1>
      </div>

      {/* Filters */}
      <EventsFilters initialQ={q} initialStatus={status} />

      {events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-black text-slate-700 mb-2">Event Tidak Ditemukan</h3>
          <p className="text-slate-500 text-sm">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="space-y-12 mt-8">
          {upcoming.length > 0 && (
            <div>
              {!status && <h2 className="text-xl font-black text-slate-900 mb-5">Event Mendatang</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {upcoming.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
          {past.length > 0 && !status && (
            <div>
              <h2 className="text-xl font-black text-slate-500 mb-5">Event Selesai</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-70">
                {past.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
          {status && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
