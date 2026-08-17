import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import EventCard from "@/components/sites/event-card";
import { Calendar, User, ArrowLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) return {};
  const article = await db.article.findUnique({ where: { organizerId_slug: { organizerId: organizer.id, slug } } });
  if (!article) return {};
  return {
    title: `${article.title} | ${organizer.name}`,
    description: article.excerpt || article.content.slice(0, 160),
    openGraph: { title: article.title, images: article.coverImage ? [{ url: article.coverImage }] : [] },
  };
}

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export default async function ArticleDetailPage({ params }: Props) {
  const { subdomain, slug } = await params;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const article = await db.article.findUnique({
    where: { organizerId_slug: { organizerId: organizer.id, slug } },
  });
  if (!article || article.status !== "PUBLISHED") notFound();

  // Related articles
  const related = await db.article.findMany({
    where: { organizerId: organizer.id, status: "PUBLISHED", id: { not: article.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  // Related events
  const events = await db.event.findMany({
    where: { organizerId: organizer.id, status: "PUBLISHED" },
    include: { tickets: { select: { price: true } } },
    take: 3,
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Back */}
          <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Semua Artikel
          </Link>

          {/* Category */}
          {article.category && (
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/10 site-primary mb-4">
              {article.category}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-5">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
            {article.author && (
              <div className="flex items-center gap-1.5"><User className="h-4 w-4" />{article.author}</div>
            )}
            {article.publishedAt && (
              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(article.publishedAt)}</div>
            )}
          </div>

          {/* Cover image */}
          {article.coverImage && (
            <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
              <img src={article.coverImage} alt={article.title} className="w-full h-72 object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700">
            {article.content}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Related Events */}
          {events.length > 0 && (
            <div>
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                Event Terkini
              </h3>
              <div className="space-y-3">
                {events.map(e => (
                  <EventCard key={e.id} event={{
                    ...e,
                    startDate: e.startDate,
                    tickets: e.tickets,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div>
              <h3 className="font-black text-slate-900 mb-4">Artikel Lainnya</h3>
              <div className="space-y-3">
                {related.map(a => (
                  <Link key={a.id} href={`/articles/${a.slug}`}>
                    <div className="group flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      {a.coverImage && (
                        <img src={a.coverImage} alt={a.title}
                          className="h-14 w-14 rounded-lg object-cover shrink-0 group-hover:opacity-90 transition" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:site-primary transition-colors">
                          {a.title}
                        </p>
                        {a.publishedAt && (
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.publishedAt)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/articles" className="text-sm font-bold site-primary flex items-center gap-1 mt-4 hover:gap-2 transition-all">
                Lihat Semua Artikel <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
