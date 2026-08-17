import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import { Menu, Search, Ticket, X, Music2, ChevronRight, ArrowRight } from "lucide-react";
import { getSiteUrl } from "@/lib/site-utils";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LanguageSwitcher } from "@/lib/i18n/language-switcher";

function hexToHslNumbers(hex: string): string {
  try {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.substring(0,2),16)/255;
    const g = parseInt(hex.substring(2,4),16)/255;
    const b = parseInt(hex.substring(4,6),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0;
    const l = (max+min)/2;
    if (max!==min) {
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h/=6;
    }
    return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
  } catch { return "221.2 83.2% 53.3%"; }
}

export default async function SubdomainLayout(props: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const params = await props.params;
  const subdomain = params.subdomain;

  const organizer = await db.organizer.findUnique({
    where: { subdomain },
    include: { siteSetting: true },
  });

  if (!organizer) notFound();

  const primaryHsl = hexToHslNumbers(organizer.primaryColor);
  const secondaryHsl = hexToHslNumbers(organizer.secondaryColor);
  const customer = await getCustomerSession();
  const { dict, lang } = await getDictionary();

  const social = organizer.siteSetting;
  const nav = [
    { label: dict.events, href: "/events" },
    { label: "Promo", href: "/#promo" },
    { label: dict.articles, href: "/articles" },
    { label: "About", href: "/about" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 antialiased font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${primaryHsl};
          --secondary: ${secondaryHsl};
          --ring: ${primaryHsl};
        }
        .site-primary { color: hsl(${primaryHsl}); }
        .site-bg-primary { background-color: hsl(${primaryHsl}); }
        .site-border-primary { border-color: hsl(${primaryHsl}); }
        .site-hover-primary:hover { background-color: hsl(${primaryHsl}); color: white; }
      `}} />

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={getSiteUrl(subdomain, "/")} className="flex items-center gap-2.5 shrink-0">
              {organizer.logo ? (
                <img src={organizer.logo} alt={organizer.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg site-bg-primary text-white flex items-center justify-center text-xs font-black">
                  {organizer.name.slice(0,2).toUpperCase()}
                </div>
              )}
              <span className="font-black text-base text-slate-900 leading-tight hidden sm:block">
                {organizer.name}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {nav.map(n => (
                <Link key={n.href} href={getSiteUrl(subdomain, n.href)}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLang={lang as "en" | "id"} />
              
              <Link href={getSiteUrl(subdomain, "/search")}
                className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                <Search className="h-4.5 w-4.5" />
              </Link>
              <Link href={getSiteUrl(subdomain, "/my-tickets")}
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-full border-2 site-border-primary site-primary hover:site-bg-primary hover:text-white transition-all">
                <Ticket className="h-3.5 w-3.5" />
                {dict.myTickets}
              </Link>
              {customer ? (
                <button onClick={() => {
                  fetch("/api/auth/customer/logout", { method: "POST" }).then(() => window.location.reload());
                }} className="hidden md:block text-xs font-semibold text-slate-500 hover:text-red-500 ml-1 cursor-pointer">
                  {dict.logout}
                </button>
              ) : (
                <Link href={getSiteUrl(subdomain, "/my-tickets")}
                  className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 ml-1">
                  {dict.login}
                </Link>
              )}
              {/* Mobile menu button */}
              <label htmlFor="mobile-menu-toggle"
                className="md:hidden h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer">
                <Menu className="h-5 w-5" />
              </label>
            </div>
          </div>
        </div>

        {/* Mobile Drawer (CSS-only using checkbox hack) */}
        <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
        <div className="peer-checked:block hidden fixed inset-0 z-50 bg-black/40">
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900">{organizer.name}</span>
              <label htmlFor="mobile-menu-toggle" className="cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </label>
            </div>
            <nav className="flex flex-col gap-4 mb-8">
              {nav.map(n => (
                <Link key={n.href} href={getSiteUrl(subdomain, n.href)} className="text-lg font-bold text-slate-900 flex items-center justify-between">
                  {n.label} <ArrowRight className="h-5 w-5 text-slate-400" />
                </Link>
              ))}
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <Link href={getSiteUrl(subdomain, "/my-tickets")} className="text-lg font-bold site-primary flex items-center gap-2">
                <Ticket className="h-5 w-5" /> {dict.myTickets}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== PAGE CONTENT ===== */}
      <main className="flex-1">
        {props.children}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-white pt-14 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                {organizer.logo ? (
                  <img src={organizer.logo} alt={organizer.name} className="h-9 w-9 rounded-lg object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-lg site-bg-primary text-white flex items-center justify-center text-xs font-black">
                    {organizer.name.slice(0,2).toUpperCase()}
                  </div>
                )}
                <span className="font-black text-white">{organizer.name}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {organizer.description || "Platform tiket event resmi."}
              </p>
              {/* Social */}
              <div className="flex gap-3 pt-1">
                {social?.socialInstagram && (
                  <a href={`https://instagram.com/${social.socialInstagram}`} target="_blank"
                    className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {social?.socialYoutube && (
                  <a href={`https://youtube.com/@${social.socialYoutube}`} target="_blank"
                    className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {social?.socialTiktok && (
                  <a href={`https://tiktok.com/@${social.socialTiktok}`} target="_blank"
                    className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-600 transition-colors">
                    <Music2 className="h-4 w-4" />
                  </a>
                )}
                {social?.socialFacebook && (
                  <a href={`https://facebook.com/${social.socialFacebook}`} target="_blank"
                    className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Navigasi</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {nav.map(n => <li key={n.href}><Link href={getSiteUrl(subdomain, n.href)} className="hover:text-white transition-colors">{n.label}</Link></li>)}
                <li><Link href={getSiteUrl(subdomain, "/search")} className="hover:text-white transition-colors">Cari Event</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Tiket</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href={getSiteUrl(subdomain, "/my-tickets")} className="hover:text-white transition-colors">Tiket Saya</Link></li>
                <li><Link href={getSiteUrl(subdomain, "/my-tickets")} className="hover:text-white transition-colors">Riwayat Pesanan</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Bantuan</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><span className="cursor-pointer hover:text-white transition-colors">FAQ</span></li>
                {social?.contactEmail && <li><a href={`mailto:${social.contactEmail}`} className="hover:text-white transition-colors">Hubungi Kami</a></li>}
                <li><span className="cursor-pointer hover:text-white transition-colors">Syarat & Ketentuan</span></li>
                <li><span className="cursor-pointer hover:text-white transition-colors">Kebijakan Privasi</span></li>
                <li><span className="cursor-pointer hover:text-white transition-colors">Kebijakan Refund</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {organizer.name}. Hak Cipta Dilindungi.</p>
            <p>Powered by <span className="text-primary font-bold">IDEvent Platform</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
