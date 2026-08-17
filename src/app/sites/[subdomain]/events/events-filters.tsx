"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Semua", value: "ALL" },
  { label: "Upcoming", value: "PUBLISHED" },
  { label: "Sold Out", value: "SOLD_OUT" },
  { label: "Selesai", value: "COMPLETED" },
];

export default function EventsFilters({ initialQ, initialStatus }: { initialQ?: string; initialStatus?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ || "");
  const [isPending, startTransition] = useTransition();

  const apply = (nextQ: string, nextStatus?: string) => {
    const params = new URLSearchParams(searchParams);
    if (nextQ) params.set("q", nextQ); else params.delete("q");
    if (nextStatus && nextStatus !== "ALL") params.set("status", nextStatus); else params.delete("status");
    startTransition(() => router.push(`?${params.toString()}`));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && apply(q, initialStatus)}
          placeholder="Cari nama event..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        {q && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => { setQ(""); apply("", initialStatus); }}>
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>
      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => apply(q, opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              (initialStatus || "ALL") === opt.value
                ? "site-bg-primary text-white border-transparent shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:site-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
