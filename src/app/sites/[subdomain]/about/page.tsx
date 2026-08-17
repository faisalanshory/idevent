import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-utils";
import EventCard from "@/components/sites/event-card";
import { Mail, Phone, MapPin, Music2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const org = await db.organizer.findUnique({ where: { subdomain }, select: { name: true, description: true } });
  return { title: `Tentang Kami | ${org?.name ?? ""}`, description: org?.description ?? "" };
}

export default async function AboutPage({ params }: Props) {
  const { subdomain } = await params;

  const organizer = await db.organizer.findUnique({
    where: { subdomain },
    include: { siteSetting: true },
  });
  if (!organizer) notFound();

  const upcomingEvents = await db.event.findMany({
    where: { organizerId: organizer.id, status: "PUBLISHED", startDate: { gt: new Date() } },
    include: { tickets: { select: { price: true } } },
    take: 4,
    orderBy: { startDate: "asc" },
  });

  const pastEvents = await db.event.findMany({
    where: { organizerId: organizer.id, status: "COMPLETED", startDate: { lt: new Date() } },
    take: 4,
    orderBy: { startDate: "desc" },
  });

  const social = organizer.siteSetting;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-slate-900">
        {organizer.heroImageUrl && (
          <img src={organizer.heroImageUrl} alt={organizer.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Mengenal Kami</p>
          <h1 className="text-3xl md:text-5xl font-black text-white">{organizer.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* About text */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest site-primary">Tentang Kami</p>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {organizer.aboutText || organizer.description || "Informasi organizer belum tersedia."}
            </p>
          </div>
          <div className="space-y-4">
            {/* Contact */}
            {(social?.contactEmail || social?.contactPhone || social?.contactAddress || organizer.email) && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                <h3 className="font-black text-slate-900">Kontak</h3>
                {(social?.contactEmail || organizer.email) && (
                  <a href={`mailto:${social?.contactEmail || organizer.email}`}
                    className="flex items-center gap-2.5 text-sm text-slate-600 hover:site-primary transition-colors">
                    <Mail className="h-4 w-4 text-slate-400" /> {social?.contactEmail || organizer.email}
                  </a>
                )}
                {(social?.contactPhone || organizer.phone) && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" /> {social?.contactPhone || organizer.phone}
                  </div>
                )}
                {social?.contactAddress && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" /> {social.contactAddress}
                  </div>
                )}
              </div>
            )}

            {/* Social media */}
            {(social?.socialInstagram || social?.socialYoutube || social?.socialTiktok) && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                <h3 className="font-black text-slate-900">Ikuti Kami</h3>
                <div className="flex flex-wrap gap-3">
                  {social?.socialInstagram && (
                    <a href={`https://instagram.com/${social.socialInstagram}`} target="_blank"
                      className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:underline">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> Instagram
                    </a>
                  )}
                  {social?.socialYoutube && (
                    <a href={`https://youtube.com/@${social.socialYoutube}`} target="_blank"
                      className="flex items-center gap-2 text-sm font-bold text-red-600 hover:underline">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> YouTube
                    </a>
                  )}
                  {social?.socialTiktok && (
                    <a href={`https://tiktok.com/@${social.socialTiktok}`} target="_blank"
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:underline">
                      <Music2 className="h-4 w-4" /> TikTok
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Segera Hadir</p>
                <h2 className="text-2xl font-black text-slate-900">Event Mendatang</h2>
              </div>
              <Link href={getSiteUrl(subdomain, "/events")} className="text-sm font-bold site-primary flex items-center gap-1 hover:gap-2 transition-all">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {upcomingEvents.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Sudah Berlalu</p>
              <h2 className="text-2xl font-black text-slate-500">Event Sebelumnya</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 opacity-60">
              {pastEvents.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
