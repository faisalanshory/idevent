"use client";

import { useState } from "react";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-utils";
import { Ticket, Calendar, MapPin, ChevronRight, LogOut, Settings, User, Save, Loader2, CheckCircle2 } from "lucide-react";

function formatDate(s: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s));
}

export default function CustomerDashboard({ customer, tickets, subdomain }: { customer: any; tickets: any[]; subdomain: string }) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "settings">("upcoming");
  
  // Settings state
  const [phone, setPhone] = useState(customer.phone || "");
  const [notifEmailOrder, setNotifEmailOrder] = useState(customer.notifEmailOrder);
  const [notifEmailReminder, setNotifEmailReminder] = useState(customer.notifEmailReminder);
  const [notifWaOrder, setNotifWaOrder] = useState(customer.notifWaOrder);
  const [notifWaReminder, setNotifWaReminder] = useState(customer.notifWaReminder);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const upcomingTickets = tickets.filter(t => new Date(t.eventDate) > now);
  const pastTickets = tickets.filter(t => new Date(t.eventDate) <= now);
  const displayTickets = activeTab === "upcoming" ? upcomingTickets : pastTickets;

  const logout = async () => {
    await fetch("/api/auth/customer/logout", { method: "POST" });
    window.location.reload();
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/auth/customer/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, notifEmailOrder, notifEmailReminder, notifWaOrder, notifWaReminder }),
      });
      if (res.ok) setSaved(true);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full site-bg-primary text-white flex items-center justify-center font-black text-xl">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-red-50">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-8 overflow-x-auto hide-scrollbar">
        {(["upcoming", "past", "settings"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-24 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {tab === "upcoming" && <><Ticket className="h-4 w-4" /> Upcoming ({upcomingTickets.length})</>}
            {tab === "past" && <><Calendar className="h-4 w-4" /> Past ({pastTickets.length})</>}
            {tab === "settings" && <><Settings className="h-4 w-4" /> Pengaturan</>}
          </button>
        ))}
      </div>

      {activeTab === "settings" ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-8">
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-1">Profil & Kontak</h2>
            <p className="text-sm text-slate-500 mb-4">Informasi yang digunakan untuk pengiriman tiket.</p>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input type="text" value={customer.name} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
                <input type="email" value={customer.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nomor WhatsApp</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="081234567890" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-black text-slate-900 mb-1">Notifikasi</h2>
            <p className="text-sm text-slate-500 mb-5">Atur bagaimana kami menghubungi kamu.</p>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={notifEmailOrder} onChange={e => setNotifEmailOrder(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition">Email E-Ticket</p>
                  <p className="text-xs text-slate-500">Kirim tiket ke email setelah pembayaran berhasil</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={notifEmailReminder} onChange={e => setNotifEmailReminder(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition">Email Reminder</p>
                  <p className="text-xs text-slate-500">Ingatkan via email H-1 sebelum event</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={notifWaOrder} onChange={e => setNotifWaOrder(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition">WhatsApp Blast Tiket</p>
                  <p className="text-xs text-slate-500">Kirim link tiket via WA (nomor harus aktif)</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={notifWaReminder} onChange={e => setNotifWaReminder(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition">WhatsApp Reminder</p>
                  <p className="text-xs text-slate-500">Ingatkan via WA pada hari H acara</p>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3">
            {saved && <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Tersimpan</span>}
            <button onClick={saveSettings} disabled={saving} className="site-bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      ) : displayTickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-slate-300" />
          </div>
          <p className="font-bold text-slate-700">Tidak ada tiket</p>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "upcoming" ? "Kamu belum memiliki tiket untuk event mendatang." : "Belum ada riwayat event."}
          </p>
          <Link href={getSiteUrl(subdomain, "/events")} className="inline-flex items-center gap-1.5 mt-5 px-6 py-2.5 rounded-full text-sm font-bold site-primary site-border-primary border-2 hover:site-bg-primary hover:text-white transition">
            Cari Event Sekarang <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTickets.map((t, i) => (
            <div key={`${t.orderId}-${i}`} className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-lg line-clamp-1 mb-2">{t.eventTitle}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(t.eventDate)}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {t.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                    <span className="text-xs font-bold site-bg-primary text-white px-3 py-1 rounded-full">{t.ticketType}</span>
                    <span className="text-sm font-bold text-slate-600">{t.quantity} Tiket</span>
                  </div>
                </div>
                <Link href={getSiteUrl(subdomain, `/ticket/${t.orderId}`)}
                  className="flex flex-col items-center justify-center h-12 w-12 rounded-full site-bg-primary text-white hover:scale-105 transition-transform shrink-0 shadow-sm"
                  title="Lihat Tiket">
                  <Ticket className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
