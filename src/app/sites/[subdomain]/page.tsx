import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import HeroCarousel from "@/components/sites/hero-carousel";
import EventCard from "@/components/sites/event-card";
import {
  Calendar, MapPin, ArrowRight, Tag, Clock, Percent,
  Music2, ChevronRight,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));
}

export default async function StorefrontHomepage(props: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await props.params;

  const organizer = await db.organizer.findUnique({
    where: { subdomain },
    include: {
      siteSetting: true,
      banners: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      promoCodes: { where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 2 },
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
      },
      events: {
        where: { status: { in: ["PUBLISHED", "SOLD_OUT"] } },
        include: { tickets: { select: { price: true } } },
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!organizer) notFound();

  const { dict } = await getDictionary();

  const featuredEvents = organizer.events.filter(e => e.isFeatured);
  const upcomingEvents = organizer.events.filter(e => new Date(e.startDate) > new Date());
  const social = organizer.siteSetting;

  return (
    <>
      {/* ===== A. HERO BANNER CAROUSEL ===== */}
      {organizer.banners.length > 0 ? (
        <HeroCarousel slides={organizer.banners} />
      ) : (
        <HeroCarousel slides={[{
          id: "default-1",
          title: organizer.name,
          subtitle: organizer.siteSetting?.description || "Selamat datang di situs tiket resmi kami. Temukan event menarik di sini.",
          imageUrl: organizer.logo || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80",
          ctaLabel: dict.viewAll,
          ctaUrl: "/events",
          isActive: true,
          sortOrder: 0
        }] as any} />
      )}

      {/* ===== B. FEATURED EVENTS ===== */}
      {featuredEvents.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Pilihan Redaksi</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">Event Pilihan</h2>
            </div>
            <Link href="/events" className="hidden sm:flex items-center gap-1 text-sm font-bold site-primary hover:gap-2 transition-all">
              {dict.viewAll} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredEvents.slice(0, 6).map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-6 flex sm:hidden justify-center">
            <Link href="/events" className="text-sm font-bold site-primary flex items-center gap-1">
              {dict.viewAll} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ===== C. UPCOMING EVENTS ===== */}
      {upcomingEvents.length > 0 && (
        <section className="py-14 bg-slate-50">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Jangan Sampai Ketinggalan</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">{dict.upcomingEvents}</h2>
              </div>
              <Link href="/events" className="hidden sm:flex items-center gap-1 text-sm font-bold site-primary hover:gap-2 transition-all">
                {dict.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-2 md:pb-0 scroll-smooth snap-x scrollbar-hide">
              {upcomingEvents.slice(0, 8).map(event => (
                <div key={event.id} className="min-w-[260px] md:min-w-0 snap-start">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== D. PROMO SECTION ===== */}
      {organizer.promoCodes.length > 0 && (
        <section id="promo" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Penawaran Terbatas</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Promo Spesial</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {organizer.promoCodes.map(promo => (
              <div key={promo.id} className="relative overflow-hidden rounded-2xl p-6 text-white site-bg-primary shadow-lg">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="relative space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 rounded-full p-1.5"><Percent className="h-4 w-4" /></div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                      {promo.discountType === "PERCENTAGE" ? "Diskon Persentase" : "Diskon Flat"}
                    </span>
                  </div>
                  <p className="text-xl font-black">
                    {promo.discountType === "PERCENTAGE"
                      ? `Hemat ${promo.discountValue}%`
                      : `Hemat ${formatPrice(promo.discountValue)}`}
                  </p>
                  <p className="text-sm opacity-80">Dapatkan harga spesial sebelum promo berakhir.</p>
                  <div className="pt-3 flex items-center justify-between">
                    <div className="bg-white/20 rounded-lg px-4 py-2 font-black text-base tracking-widest">
                      {promo.code}
                    </div>
                    {promo.validUntil && (
                      <div className="text-xs opacity-70 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Berlaku s/d {formatDate(promo.validUntil)}
                      </div>
                    )}
                  </div>
                  <Link href="/events"
                    className="mt-2 inline-flex items-center gap-1.5 bg-white text-primary font-black text-sm px-5 py-2 rounded-full hover:gap-2.5 transition-all shadow-md">
                    Beli Sekarang <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== E. ARTICLE SECTION ===== */}
      {organizer.articles.length > 0 && (
        <section className="py-14 bg-slate-50">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Informasi & Inspirasi</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">{dict.latestArticles}</h2>
              </div>
              <Link href="/articles" className="hidden sm:flex items-center gap-1 text-sm font-bold site-primary hover:gap-2 transition-all">
                {dict.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizer.articles.map(article => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      {article.coverImage ? (
                        <img src={article.coverImage} alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-primary/10" />
                      )}
                      {article.category && (
                        <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/90 text-white">
                          {article.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-slate-500 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between pt-auto mt-auto text-xs text-slate-400">
                        <span>{article.publishedAt ? formatDate(article.publishedAt) : ""}</span>
                        <span className="site-primary font-bold flex items-center gap-0.5">
                          Baca <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex sm:hidden justify-center">
              <Link href="/articles" className="text-sm font-bold site-primary flex items-center gap-1">
                {dict.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== F. ABOUT ORGANIZER ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white grid md:grid-cols-2">
          {/* Text side */}
          <div className="p-10 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              {organizer.logo ? (
                <img src={organizer.logo} alt={organizer.name} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-xl site-bg-primary flex items-center justify-center font-black text-lg">
                  {organizer.name.slice(0,2).toUpperCase()}
                </div>
              )}
              <span className="font-black text-xl">{organizer.name}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              {organizer.aboutText || organizer.description || "Platform tiket event terpercaya."}
            </p>
            <Link href="/about"
              className="inline-flex items-center gap-2 w-fit bg-white text-slate-900 font-black text-sm px-6 py-3 rounded-full hover:scale-105 transition-transform">
              Tentang Kami <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Image side */}
          {organizer.heroImageUrl ? (
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img src={organizer.heroImageUrl} alt="About" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/60" />
            </div>
          ) : (
            <div className="h-64 md:h-auto bg-primary/20" />
          )}
        </div>
      </section>

      {/* ===== G. SOCIAL MEDIA ===== */}
      {(social?.socialInstagram || social?.socialYoutube || social?.socialTiktok || social?.socialFacebook) && (
        <section className="py-12 bg-slate-50">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest site-primary mb-2">Ikuti Kami</p>
            <h2 className="text-2xl font-black text-slate-900 mb-8">Tetap Terhubung</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {social?.socialInstagram && (
                <a href={`https://instagram.com/${social.socialInstagram}`} target="_blank"
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:border-pink-400 hover:text-pink-600 hover:shadow-md transition-all">
                  <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> @{social.socialInstagram}
                </a>
              )}
              {social?.socialYoutube && (
                <a href={`https://youtube.com/@${social.socialYoutube}`} target="_blank"
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:border-red-400 hover:text-red-600 hover:shadow-md transition-all">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> YouTube
                </a>
              )}
              {social?.socialTiktok && (
                <a href={`https://tiktok.com/@${social.socialTiktok}`} target="_blank"
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:border-slate-500 hover:text-slate-900 hover:shadow-md transition-all">
                  <Music2 className="h-5 w-5" /> TikTok
                </a>
              )}
              {social?.socialFacebook && (
                <a href={`https://facebook.com/${social.socialFacebook}`} target="_blank"
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> Facebook
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
