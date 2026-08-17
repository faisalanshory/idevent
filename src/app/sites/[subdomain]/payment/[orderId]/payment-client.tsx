"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, Loader2, Copy, ExternalLink } from "lucide-react";

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

interface OrderData {
  id: string;
  paymentStatus: string;
  totalAmount: number;
  customer: { name: string; email: string };
  event: { title: string; coverImage?: string | null };
  payment: {
    paymentMethod: string | null;
    amount: number;
    expiredAt?: string;
    rawResponse: string | null;
  } | null;
  items: { name: string; quantity: number; price: number }[];
}

function CountdownTimer({ expiredAt }: { expiredAt?: string }) {
  const [remaining, setRemaining] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!expiredAt) return;
    const tick = () => {
      const diff = new Date(expiredAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining({ minutes: 0, seconds: 0 }); return; }
      setRemaining({ minutes: Math.floor(diff / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiredAt]);

  return (
    <span className="tabular-nums font-black text-amber-600">
      {String(remaining.minutes).padStart(2,"0")}:{String(remaining.seconds).padStart(2,"0")}
    </span>
  );
}

// Simulate payment confirmation (MOCK mode: button to trigger success)
async function simulatePayment(orderId: string): Promise<boolean> {
  const res = await fetch(`/api/webhooks/mock?orderId=${orderId}`, { method: "POST" });
  return res.ok;
}

export default function PaymentStatusClient({ order }: { order: OrderData }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.paymentStatus);
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawData = order.payment?.rawResponse ? JSON.parse(order.payment.rawResponse) : null;
  const vaNumber = rawData?.vaNumber || null;
  const qrString = rawData?.qrString || null;

  // Poll payment status every 5 seconds
  useEffect(() => {
    if (status === "PAID" || status === "FAILED" || status === "EXPIRED") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-status?orderId=${order.id}`);
        const data = await res.json();
        if (data.status && data.status !== status) {
          setStatus(data.status);
          if (data.status === "PAID") {
            setTimeout(() => router.push(`/order-success/${order.id}`), 2000);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [status, order.id, router]);

  const handleSimulate = async () => {
    setSimulating(true);
    await simulatePayment(order.id);
    setTimeout(async () => {
      const res = await fetch(`/api/payment-status?orderId=${order.id}`);
      const data = await res.json();
      if (data.status === "PAID") {
        setStatus("PAID");
        setTimeout(() => router.push(`/order-success/${order.id}`), 2000);
      }
      setSimulating(false);
    }, 1500);
  };

  const copyVA = () => {
    if (vaNumber) { navigator.clipboard.writeText(vaNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (status === "PAID") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Pembayaran Berhasil!</h2>
          <p className="text-slate-500">Mengarahkan ke halaman tiket...</p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="site-bg-primary text-white p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Menunggu Pembayaran</p>
          <p className="text-2xl font-black">{formatPrice(order.totalAmount)}</p>
          {order.payment?.expiredAt && (
            <p className="text-sm mt-2 opacity-80">
              Bayar dalam <CountdownTimer expiredAt={order.payment.expiredAt} />
            </p>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Order info */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">No. Pesanan</span><span className="font-black">{order.id}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Event</span><span className="font-bold text-right max-w-40 line-clamp-1">{order.event.title}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pembeli</span><span className="font-bold">{order.customer.name}</span></div>
          </div>

          {/* Payment instruction */}
          {vaNumber && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nomor Virtual Account</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-black text-xl tracking-widest text-slate-900">{vaNumber}</p>
                <button onClick={copyVA} className="text-xs font-bold site-primary flex items-center gap-1 hover:opacity-70 transition">
                  <Copy className="h-3.5 w-3.5" /> {copied ? "Tersalin!" : "Salin"}
                </button>
              </div>
            </div>
          )}

          {qrString && (
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Scan QRIS</p>
              <div className="bg-white p-3 rounded-lg inline-block">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrString)}&size=200x200`}
                  alt="QR Code" className="h-40 w-40" />
              </div>
            </div>
          )}

          {/* MOCK: Simulate Payment Button */}
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Mode Development (MOCK)
            </p>
            <p className="text-xs text-amber-600 mb-3">Klik tombol di bawah untuk mensimulasikan pembayaran berhasil.</p>
            <button onClick={handleSimulate} disabled={simulating}
              className="w-full bg-amber-500 text-white rounded-xl py-2.5 font-black text-sm hover:bg-amber-600 transition flex items-center justify-center gap-2">
              {simulating ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : "✓ Simulasikan Pembayaran Berhasil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
