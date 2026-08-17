"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Tag, CheckCircle2, AlertCircle, Loader2, CreditCard, Smartphone, Wallet } from "lucide-react";
import { createOrder, validatePromoCode } from "./actions";

interface Props {
  event: { id: string; title: string; slug: string; coverImage?: string | null; startDate: string; location: string; venue?: string | null };
  selections: { ticket: { id: string; name: string; price: number }; quantity: number }[];
  subtotal: number;
  organizerId: string;
}

function formatPrice(p: number) {
  if (p === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}
function formatDate(s: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(s));
}

const PAYMENT_METHODS = [
  { id: "qris", name: "QRIS", category: "qris" as const, icon: "🔲" },
  { id: "bca_va", name: "BCA Virtual Account", category: "virtual_account" as const, icon: "🏦" },
  { id: "bni_va", name: "BNI Virtual Account", category: "virtual_account" as const, icon: "🏦" },
  { id: "bri_va", name: "BRI Virtual Account", category: "virtual_account" as const, icon: "🏦" },
  { id: "mandiri_va", name: "Mandiri Virtual Account", category: "virtual_account" as const, icon: "🏦" },
  { id: "gopay", name: "GoPay", category: "ewallet" as const, icon: "💚" },
  { id: "ovo", name: "OVO", category: "ewallet" as const, icon: "💜" },
  { id: "dana", name: "DANA", category: "ewallet" as const, icon: "💙" },
  { id: "shopeepay", name: "ShopeePay", category: "ewallet" as const, icon: "🧡" },
];

const CATEGORIES = [
  { id: "qris", label: "QRIS" },
  { id: "virtual_account", label: "Virtual Account" },
  { id: "ewallet", label: "E-Wallet" },
];

export default function CheckoutForm({ event, selections, subtotal, organizerId }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const discount = promoApplied
    ? promoApplied.type === "PERCENTAGE"
      ? Math.round(subtotal * promoApplied.discount / 100)
      : promoApplied.discount
    : 0;
  const total = Math.max(0, subtotal - discount);

  const handlePromo = async () => {
    setPromoError(""); setPromoLoading(true);
    const result = await validatePromoCode({ code: promoCode, organizerId, subtotal });
    if (result.success) {
      setPromoApplied({ code: promoCode, discount: result.discountValue!, type: result.discountType! });
    } else {
      setPromoError(result.error || "Kode promo tidak valid");
    }
    setPromoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !paymentMethod) return;
    setLoading(true); setError("");
    try {
      const result = await createOrder({
        organizerId,
        eventId: event.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        items: selections.map(s => ({ ticketTypeId: s.ticket.id, quantity: s.quantity, price: s.ticket.price })),
        promoCode: promoApplied?.code,
        paymentMethod,
        totalAmount: total,
      });
      if (result.success && result.orderId) {
        router.push(`/payment/${result.orderId}`);
      } else {
        setError(result.error || "Terjadi kesalahan. Coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT — Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-black text-slate-900 text-base">Informasi Pembeli</h2>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
              <p className="text-xs text-slate-400 mt-1">E-ticket akan dikirim ke email ini</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Nomor WhatsApp</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>
          </div>

          {/* Promo Code */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-black text-slate-900 text-base mb-4">Kode Promo</h2>
            {promoApplied ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-700 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Promo <strong>{promoApplied.code}</strong> berhasil digunakan!
                <button type="button" onClick={() => setPromoApplied(null)} className="ml-auto text-xs underline text-slate-500">Hapus</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode promo"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                <button type="button" onClick={handlePromo} disabled={!promoCode || promoLoading}
                  className="px-5 py-2.5 site-bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition">
                  {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gunakan"}
                </button>
              </div>
            )}
            {promoError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {promoError}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-black text-slate-900 text-base mb-5">Metode Pembayaran</h2>
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="mb-5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{cat.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PAYMENT_METHODS.filter(m => m.category === cat.id).map(m => (
                    <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-sm font-bold text-slate-700">{m.name}</span>
                      {paymentMethod === m.id && <CheckCircle2 className="h-4 w-4 site-primary ml-auto" />}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
        </div>

        {/* RIGHT — Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="font-black text-slate-900 text-base">Ringkasan Pesanan</h2>
            {/* Event */}
            <div className="flex gap-3">
              {event.coverImage && (
                <img src={event.coverImage} alt={event.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm line-clamp-2">{event.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDate(event.startDate)}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {event.venue || event.location}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
              {selections.map(s => (
                <div key={s.ticket.id} className="flex justify-between text-slate-600">
                  <span>{s.ticket.name} × {s.quantity}</span>
                  <span className="font-bold">{formatPrice(s.ticket.price * s.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Diskon</span>
                  <span>− {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-base border-t border-slate-200 pt-2 mt-1">
                <span>Total</span>
                <span className="site-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !name || !email}
              className="w-full site-bg-primary text-white py-4 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Memproses...</> : "Bayar Sekarang"}
            </button>
            <p className="text-xs text-center text-slate-400">Pembayaran diproses secara aman</p>
          </div>
        </div>
      </div>
    </form>
  );
}
