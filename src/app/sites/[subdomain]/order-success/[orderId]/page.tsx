import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-utils";
import { CheckCircle2, Ticket, Download, Calendar, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string; orderId: string }>;
}

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}
function formatTime(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(d)) + " WIB";
}
function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default async function OrderSuccessPage({ params }: Props) {
  const { subdomain, orderId } = await params;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const order = await db.order.findFirst({
    where: { id: orderId, organizerId: organizer.id },
    include: {
      event: true,
      customer: true,
      orderItems: { include: { ticketType: true } },
      payment: true,
    },
  });

  if (!order || order.paymentStatus !== "PAID") notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Success card */}
      <div className="text-center mb-8">
        <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Pembayaran Berhasil!</h1>
        <p className="text-slate-500">Terima kasih. Pembelian tiket kamu berhasil dikonfirmasi.</p>
      </div>

      {/* Order summary card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        {order.event.coverImage && (
          <img src={order.event.coverImage} alt={order.event.title} className="w-full h-40 object-cover" />
        )}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Nomor Pesanan</p>
            <p className="font-black text-xl site-primary">{order.id}</p>
          </div>

          <div className="space-y-1.5 text-sm text-slate-600">
            <p className="font-black text-slate-900">{order.event.title}</p>
            <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" />{formatDate(order.event.startDate)}</div>
            <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" />{formatTime(order.event.startDate)}</div>
            <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{order.event.venue || order.event.location}</div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-1.5 text-sm">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex justify-between text-slate-600">
                <span>{item.ticketType.name} × {item.quantity}</span>
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-slate-900 text-base border-t border-slate-100 pt-2 mt-1">
              <span>Total</span>
              <span className="site-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Link href={getSiteUrl(subdomain, `/ticket/${order.id}`)}
          className="flex items-center justify-center gap-2 site-bg-primary text-white py-4 rounded-xl font-black hover:opacity-90 transition">
          <Ticket className="h-5 w-5" /> Lihat Tiket Saya
        </Link>
        <Link href={getSiteUrl(subdomain, "/my-tickets")}
          className="flex items-center justify-center gap-2 border-2 site-border-primary site-primary py-3.5 rounded-xl font-black hover:bg-primary/5 transition text-sm">
          Semua Tiket Saya
        </Link>
        <Link href={getSiteUrl(subdomain, "/")}
          className="text-center text-sm text-slate-500 hover:text-slate-700 py-2 transition">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
