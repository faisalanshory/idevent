import Link from "next/link";
import { Calendar, MapPin, Tag, ArrowRight } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string | null;
    startDate: Date;
    location: string;
    venue?: string | null;
    status: string;
    tickets?: { price: number }[];
  };
  className?: string;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));
}

function formatPrice(price: number) {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

function getStatusBadge(status: string) {
  const s = {
    PUBLISHED: { label: "Tersedia", cls: "bg-emerald-100 text-emerald-700" },
    SOLD_OUT:  { label: "Habis Terjual", cls: "bg-red-100 text-red-700" },
    COMPLETED: { label: "Selesai", cls: "bg-slate-100 text-slate-500" },
    CANCELLED: { label: "Dibatalkan", cls: "bg-rose-100 text-rose-700" },
    DRAFT:     { label: "Draft", cls: "bg-amber-100 text-amber-700" },
  } as Record<string, {label: string; cls: string}>;
  return s[status] || { label: status, cls: "bg-slate-100 text-slate-500" };
}

export default function EventCard({ event, className = "" }: EventCardProps) {
  const badge = getStatusBadge(event.status);
  const minPrice = event.tickets?.length
    ? Math.min(...event.tickets.map(t => t.price))
    : null;

  return (
    <Link href={`/events/${event.slug}`}>
      <div className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-primary/40" />
            </div>
          )}
          {/* Status badge */}
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2.5">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:site-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{event.venue || event.location}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            {minPrice !== null ? (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Tag className="h-3 w-3" />
                <span>Mulai <strong className="site-primary">{formatPrice(minPrice)}</strong></span>
              </div>
            ) : <span />}
            <span className="text-xs font-bold site-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              Lihat <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
