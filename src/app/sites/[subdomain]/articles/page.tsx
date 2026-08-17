import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import ArticlesFilters from "./articles-filters";
import { Calendar, ArrowRight, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const org = await db.organizer.findUnique({ where: { subdomain }, select: { name: true } });
  return { title: `Artikel | ${org?.name ?? ""}` };
}

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  const { subdomain } = await params;
  const { q, category } = await searchParams;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const articles = await db.article.findMany({
    where: {
      organizerId: organizer.id,
      status: "PUBLISHED",
      ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))] as string[];
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Tips, Info & Inspirasi</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Artikel</h1>
      </div>

      <ArticlesFilters initialQ={q} initialCategory={category} categories={categories} />

      {articles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📝</p>
          <h3 className="text-xl font-black text-slate-700 mb-2">Artikel Tidak Ditemukan</h3>
          <p className="text-slate-500 text-sm">Coba kata kunci yang berbeda.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {/* Featured (first article — large) */}
          {featured && !q && !category && (
            <Link href={`/articles/${featured.slug}`}>
              <div className="group grid md:grid-cols-2 gap-6 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300">
                <div className="relative h-64 md:h-auto overflow-hidden bg-slate-100">
                  {featured.coverImage ? (
                    <img src={featured.coverImage} alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : <div className="w-full h-full bg-primary/10" />}
                  {featured.category && (
                    <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/90 text-white">
                      {featured.category}
                    </span>
                  )}
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{featured.publishedAt ? formatDate(featured.publishedAt) : ""}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug group-hover:site-primary transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && <p className="text-slate-500 text-sm leading-relaxed">{featured.excerpt}</p>}
                  <span className="inline-flex items-center gap-1.5 text-sm font-black site-primary">
                    Baca Selengkapnya <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Rest grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(q || category ? articles : rest).map(article => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      {article.coverImage ? (
                        <img src={article.coverImage} alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : <div className="w-full h-full bg-primary/10" />}
                      {article.category && (
                        <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/90 text-white">
                          {article.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 space-y-2">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.publishedAt ? formatDate(article.publishedAt) : ""}
                      </div>
                      <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 group-hover:site-primary transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{article.excerpt}</p>
                      )}
                      <span className="text-xs font-black site-primary flex items-center gap-0.5 mt-auto pt-2">
                        Baca <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
