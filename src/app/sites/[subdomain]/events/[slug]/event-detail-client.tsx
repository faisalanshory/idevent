"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EventCard from "@/components/sites/event-card";
import EventGallery from "@/components/sites/event-gallery";
import {
  Calendar, Clock, MapPin, Ticket, CheckCircle2, ChevronDown,
  ChevronUp, Share2, ExternalLink, ArrowRight, Tag, Users
} from "lucide-react";

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
}
function formatTime(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr)) + " WIB";
}
function formatPrice(price: number) {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const Box = ({ val, label }: { val: number; label: string }) => (
    <div className="bg-slate-900 text-white rounded-xl px-4 py-3 min-w-[68px] text-center">
      <div className="text-2xl font-black tabular-nums">{String(val).padStart(2, "0")}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</div>
    </div>
  );

  return (
    <div className="flex gap-2 flex-wrap">
      <Box val={remaining.days} label="Hari" />
      <Box val={remaining.hours} label="Jam" />
      <Box val={remaining.minutes} label="Menit" />
      <Box val={remaining.seconds} label="Detik" />
    </div>
  );
}

function TicketSelector({ tickets, onSelect }: { tickets: any[]; onSelect: (selected: Record<string, number>, total: number) => void }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const update = (id: string, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      const updated = { ...prev, [id]: next };
      const total = tickets.reduce((acc, t) => acc + (updated[t.id] || 0) * t.price, 0);
      onSelect(updated, total);
      return updated;
    });
  };

  const getTicketStatus = (t: any) => {
    const now = new Date();
    if (t.status === "SOLD_OUT") return { label: "Habis Terjual", color: "red", available: false };
    if (new Date(t.saleStart) > now) return { label: "Segera Dijual", color: "amber", available: false };
    if (new Date(t.saleEnd) < now) return { label: "Penjualan Berakhir", color: "slate", available: false };
    return { label: "Tersedia", color: "emerald", available: true };
  };

  return (
    <div className="space-y-4">
      {tickets.map(t => {
        const status = getTicketStatus(t);
        const qty = quantities[t.id] || 0;
        const benefits: string[] = t.benefits ? JSON.parse(t.benefits) : [];
        return (
          <div key={t.id} className={`rounded-2xl border-2 p-5 transition-all ${qty > 0 ? "border-primary bg-primary/5" : "border-slate-200 bg-white"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-black text-slate-900">{t.name}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    status.color === "emerald" ? "bg-emerald-100 text-emerald-700"
                    : status.color === "amber" ? "bg-amber-100 text-amber-700"
                    : status.color === "red" ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-500"
                  }`}>{status.label}</span>
                </div>
                {t.description && <p className="text-xs text-slate-500 mb-2">{t.description}</p>}
                {benefits.length > 0 && (
                  <ul className="space-y-0.5">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xl font-black site-primary mt-3">{formatPrice(t.price)}</p>
              </div>
              {/* Quantity control */}
              {status.available && (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => update(t.id, -1, t.maxPurchase)}
                    className="h-8 w-8 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-primary hover:site-primary transition disabled:opacity-30"
                    disabled={qty === 0}>−</button>
                  <span className="w-6 text-center font-black tabular-nums">{qty}</span>
                  <button onClick={() => update(t.id, 1, t.maxPurchase)}
                    className="h-8 w-8 rounded-full site-bg-primary text-white flex items-center justify-center font-bold hover:opacity-90 transition disabled:opacity-30"
                    disabled={qty >= t.maxPurchase}>+</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FAQAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, i) => (
        <div key={i}>
          <button className="w-full text-left py-4 flex items-center justify-between gap-4" onClick={() => setOpen(open === i ? null : i)}>
            <span className="font-bold text-slate-800 text-sm">{item.question}</span>
            {open === i ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
          </button>
          {open === i && <div className="pb-4 text-sm text-slate-500 leading-relaxed">{item.answer}</div>}
        </div>
      ))}
    </div>
  );
}

interface Props {
  event: any;
  organizer: any;
  relatedEvents: any[];
}

export default function EventDetailClient({ event, organizer, relatedEvents }: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [showTickets, setShowTickets] = useState(false);

  const highlights: string[] = event.highlights ? JSON.parse(event.highlights) : [];
  const rundown: { time: string; title: string; description: string }[] = event.rundown ? JSON.parse(event.rundown) : [];
  const faq: { question: string; answer: string }[] = event.faq ? JSON.parse(event.faq) : [];
  const gallery: string[] = event.gallery ? JSON.parse(event.gallery) : [];
  const isUpcoming = new Date(event.startDate) > new Date();
  const minPrice = event.tickets.length ? Math.min(...event.tickets.map((t: any) => t.price)) : null;
  const hasSelection = Object.values(selected).some(q => q > 0);

  const buildCheckoutUrl = () => {
    const items = Object.entries(selected)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => `${id}:${q}`)
      .join(",");
    return `/checkout?items=${items}&event=${event.id}`;
  };

  return (
    <div className="pb-28 md:pb-0">
      {/* HERO */}
      <div className="relative h-[50vh] min-h-[340px] md:h-[60vh] overflow-hidden bg-slate-900">
        {event.coverImage && (
          <img src={event.coverImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">
          {event.category && (
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/80 text-white mb-3">
              {event.category.name}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight max-w-3xl">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(event.startDate)}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatTime(event.startDate)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.venue || event.location}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT — Info */}
          <div className="lg:col-span-2 space-y-10">

            {/* Countdown */}
            {isUpcoming && (
              <div className="bg-slate-50 rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Event dimulai dalam</p>
                <CountdownTimer targetDate={event.startDate} />
              </div>
            )}

            {/* About */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4">Tentang Event</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-4">Yang Akan Kamu Dapatkan</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <EventGallery images={gallery} title={event.title} />
            )}

            {/* Rundown */}
            {rundown.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-6">Rundown Acara</h2>
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
                  {rundown.map((r, i) => (
                    <div key={i} className="relative mb-6 last:mb-0">
                      <div className="absolute -left-5 top-0.5 h-4 w-4 rounded-full border-2 border-primary bg-white" />
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-black text-primary shrink-0 w-10">{r.time}</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{r.title}</p>
                          {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4">Lokasi</h2>
              <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
                <p className="font-bold text-slate-900">{event.venue || event.location}</p>
                {event.address && <p className="text-sm text-slate-500">{event.address}</p>}
                {event.mapsUrl && (
                  <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold site-primary hover:underline mt-1">
                    <ExternalLink className="h-4 w-4" /> Buka di Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* FAQ */}
            {faq.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Pertanyaan Umum (FAQ)</h2>
                <div className="bg-white border border-slate-100 rounded-2xl px-5">
                  <FAQAccordion items={faq} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Tickets + Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Price card */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-5">
                {minPrice !== null && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-0.5">Mulai dari</p>
                    <p className="text-3xl font-black site-primary">{formatPrice(minPrice)}</p>
                  </div>
                )}

                {/* Ticket selector toggle */}
                <button onClick={() => setShowTickets(!showTickets)}
                  className="w-full site-bg-primary text-white rounded-xl py-3.5 font-black text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Ticket className="h-4.5 w-4.5" />
                  {showTickets ? "Sembunyikan Tiket" : "Pilih Tiket"}
                </button>

                {showTickets && (
                  <div className="space-y-4">
                    <TicketSelector tickets={event.tickets} onSelect={(s, t) => { setSelected(s); setTotal(t); }} />
                    {hasSelection && (
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="font-black text-slate-900">{formatPrice(total)}</span>
                        </div>
                        <Link href={buildCheckoutUrl()}
                          className="block w-full text-center site-bg-primary text-white rounded-xl py-3.5 font-black text-sm hover:opacity-90 transition">
                          Lanjutkan ke Checkout →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Event summary info */}
                <div className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" />{formatDate(event.startDate)}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" />{formatTime(event.startDate)}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400 shrink-0" /><span className="line-clamp-1">{event.venue || event.location}</span></div>
                </div>
              </div>

              {/* Share */}
              <button onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition">
                <Share2 className="h-4 w-4" /> Bagikan Event
              </button>
            </div>
          </div>
        </div>

        {/* RELATED EVENTS */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-black text-slate-900 mb-6">Event Lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedEvents.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur border-t border-slate-100 flex items-center justify-between gap-4 md:hidden shadow-lg">
        <div>
          {minPrice !== null && <p className="font-black text-slate-900 text-base">{formatPrice(minPrice)}</p>}
          <p className="text-xs text-slate-500">per tiket</p>
        </div>
        <button onClick={() => setShowTickets(true)}
          className="flex-1 max-w-48 site-bg-primary text-white rounded-full py-3.5 font-black text-sm hover:opacity-90 transition">
          Beli Tiket
        </button>
      </div>
    </div>
  );
}
