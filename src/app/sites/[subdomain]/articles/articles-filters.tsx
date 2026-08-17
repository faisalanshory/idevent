"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function ArticlesFilters({
  initialQ, initialCategory, categories,
}: { initialQ?: string; initialCategory?: string; categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ || "");
  const [, startTransition] = useTransition();

  const apply = (nextQ: string, nextCat?: string) => {
    const params = new URLSearchParams(searchParams);
    if (nextQ) params.set("q", nextQ); else params.delete("q");
    if (nextCat) params.set("category", nextCat); else params.delete("category");
    startTransition(() => router.push(`?${params.toString()}`));
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && apply(q, initialCategory)}
          placeholder="Cari artikel..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
        {q && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => { setQ(""); apply("", initialCategory); }}>
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => apply(q, "")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${!initialCategory ? "site-bg-primary text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-primary"}`}>
            Semua
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => apply(q, cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${initialCategory === cat ? "site-bg-primary text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-primary"}`}>
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
