"use client";

import { useState } from "react";
import { Ticket, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function CustomerLogin({ organizerId }: { organizerId: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, organizerId }),
      });
      const data = await res.json();
      
      if (data.success) {
        window.location.reload();
      } else {
        setError(data.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-16 w-16 site-bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Masuk / Login</h1>
          <p className="text-slate-500 text-sm mt-2">Masuk untuk melihat tiket dan mengatur profil.</p>
        </div>
        
        {/* Demo Accounts info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-800">
          <strong className="block mb-1">Demo Account:</strong>
          Gunakan email <b>budi@demo.com</b> atau <b>sari@demo.com</b> (untuk Jakarta Event)<br />
          Password: <b>demo1234</b>
        </div>

        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>
          <button type="submit" disabled={!email || !password || loading}
            className="w-full site-bg-primary text-white py-3.5 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Masuk..." : "Masuk"}
          </button>
          {error && <p className="text-sm text-red-500 text-center flex items-center justify-center gap-1"><AlertCircle className="h-4 w-4" />{error}</p>}
        </form>
      </div>
    </div>
  );
}
