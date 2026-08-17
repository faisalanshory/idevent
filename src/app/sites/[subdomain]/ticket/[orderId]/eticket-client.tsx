"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, MapPin, Download, CalendarPlus } from "lucide-react";

declare const QRCode: any;

function formatDate(s: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(s));
}
function formatTime(s: string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(s)) + " WIB";
}

interface TicketItem {
  id: string;
  ticketCode: string;
  status: string;
}

interface Props {
  order: {
    id: string;
    customer: { name: string; email: string };
    event: { title: string; coverImage?: string | null; startDate: string; endDate: string; venue?: string | null; location: string; address?: string | null };
    organizer: { name: string; logo?: string | null; primaryColor: string };
    items: { ticketTypeName: string; quantity: number; price: number; tickets: TicketItem[] }[];
  };
}

function QRCodeBlock({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Use QR Server API as a reliable cross-env alternative
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(value)}&size=200x200&margin=10`}
        alt={`QR ${value}`}
        className="h-44 w-44 rounded-xl border-4 border-white shadow-lg"
      />
      <p className="text-xs font-mono font-bold text-slate-500 tracking-widest">{value}</p>
    </div>
  );
}

export default function ETicketClient({ order }: Props) {
  const allTickets = order.items.flatMap(item => item.tickets.map(t => ({ ...t, typeName: item.ticketTypeName })));

  const addToCalendar = () => {
    const start = new Date(order.event.startDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(order.event.endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(order.event.title)}&dates=${start}/${end}&location=${encodeURIComponent(order.event.venue || order.event.location)}&details=${encodeURIComponent(`Order: ${order.id}`)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header actions */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={addToCalendar}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
          <CalendarPlus className="h-4 w-4" /> Add to Calendar
        </button>
      </div>

      {/* Individual tickets */}
      {allTickets.map((ticket, idx) => (
        <div key={ticket.id} className="mb-5 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-2 print:border-slate-200">
          {/* Ticket Header */}
          <div className="site-bg-primary text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {order.organizer.logo ? (
                <img src={order.organizer.logo} alt={order.organizer.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                  {order.organizer.name.slice(0,2).toUpperCase()}
                </div>
              )}
              <span className="font-black text-sm">{order.organizer.name}</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ticket.status === "VALID" ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"}`}>
              {ticket.status === "VALID" ? "✓ Valid" : ticket.status}
            </span>
          </div>

          {/* Event cover */}
          {order.event.coverImage && (
            <img src={order.event.coverImage} alt={order.event.title} className="w-full h-32 object-cover" />
          )}

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Event</p>
              <h2 className="font-black text-slate-900 text-lg leading-tight">{order.event.title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Tanggal</p>
                <p className="text-sm font-bold text-slate-800">{formatDate(order.event.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Waktu</p>
                <p className="text-sm font-bold text-slate-800">{formatTime(order.event.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Venue</p>
                <p className="text-sm font-bold text-slate-800">{order.event.venue || order.event.location}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Jenis Tiket</p>
                <p className="text-sm font-bold text-slate-800">{ticket.typeName}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Nama Pemegang Tiket</p>
              <p className="text-sm font-bold text-slate-900">{order.customer.name}</p>
            </div>

            {/* Dashed separator */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-slate-100 -ml-9" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200" />
              <div className="h-4 w-4 rounded-full bg-slate-100 -mr-9" />
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-2">
              <QRCodeBlock value={ticket.ticketCode} />
            </div>
            <p className="text-center text-xs text-slate-400">
              Tiket #{idx + 1} dari {allTickets.length} • Tunjukkan QR ini di pintu masuk
            </p>
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-slate-400 mt-4">No. Pesanan: {order.id}</p>
    </div>
  );
}
