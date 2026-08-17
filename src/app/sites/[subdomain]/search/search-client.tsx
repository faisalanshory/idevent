"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Calendar, MapPin, Tag, FileText, ArrowRight } from "lucide-react";

function formatDate(s: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s));
}
function formatPrice(p: number) {
  if (p === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

interface SearchResult {
  events: {
    id: string; title: string; slug: string; coverImage?: string | null;
    startDate: string; location: string; venue?: string | null;
    minPrice?: number; status: string;
  }[];
  articles: {
    id: string; title: string; slug: string; coverImage?: string | null;
    excerpt?: string | null; publishedAt?: string | null; category?: string | null;
  }[];
}

export default function SearchPage({ initialQ, results }: { initialQ?: string; results?: SearchResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ || "");
  const [, startTransition] = useTransition();

  const apply = (query: string) => {
    if (!query.trim()) return;
    const params = new URLSearchParams(searchParams);
    params.set("q", query);
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const hasResults = results && (results.events.length > 0 || results.articles.length > 0);
  const isEmpty = results && !hasResults;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Cari Event & Artikel</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text" value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && apply(q)}
            placeholder="Cari event atau artikel..."
            className="w-full pl-12 pr-12 py-4 text-base border-2 border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition shadow-sm"
          />
          {q && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2" onClick={() => { setQ(""); router.push("?"); }}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          )}
        </div>
        <button onClick={() => apply(q)}
          className="mt-3 site-bg-primary text-white px-8 py-3 rounded-xl font-black text-sm hover:opacity-90 transition flex items-center gap-2">
          <Search className="h-4 w-4" /> Cari
        </button>
      </div>

      {isEmpty && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-black text-slate-700 mb-2">Tidak Ada Hasil</h3>
          <p className="text-slate-500 text-sm">Coba kata kunci yang berbeda.</p>
        </div>
      )}

      {hasResults && (
        <div className="space-y-10">
          {/* Events */}
          {results!.events.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                <Tag className="h-5 w-5 site-primary" /> Event ({results!.events.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results!.events.map(e => (
                  <a key={e.id} href={`/events/${e.slug}`}>
                    <div className="group flex gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                      {e.coverImage ? (
                        <img src={e.coverImage} alt={e.title} className="h-16 w-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-primary/10 shrink-0 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary/50" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm line-clamp-1 group-hover:site-primary transition-colors">{e.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(e.startDate)}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {e.venue || e.location}
                        </p>
                        {e.minPrice !== undefined && (
                          <p className="text-xs font-black site-primary mt-1">{formatPrice(e.minPrice)}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          {results!.articles.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                <FileText className="h-5 w-5 site-primary" /> Artikel ({results!.articles.length})
              </h2>
              <div className="space-y-4">
                {results!.articles.map(a => (
                  <a key={a.id} href={`/articles/${a.slug}`}>
                    <div className="group flex gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                      {a.coverImage ? (
                        <img src={a.coverImage} alt={a.title} className="h-16 w-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-amber-50 shrink-0 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-amber-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        {a.category && (
                          <span className="text-xs font-bold site-primary mb-1 block">{a.category}</span>
                        )}
                        <p className="font-black text-slate-900 text-sm line-clamp-1 group-hover:site-primary transition-colors">{a.title}</p>
                        {a.excerpt && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.excerpt}</p>}
                        {a.publishedAt && (
                          <p className="text-xs text-slate-400 mt-1">{formatDate(a.publishedAt)}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!results && (
        <div className="text-center text-slate-400 py-16">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Ketik kata kunci dan tekan Enter untuk mencari</p>
        </div>
      )}
    </div>
  );
}
