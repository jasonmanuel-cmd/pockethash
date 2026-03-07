'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByPhone } from '@/app/actions/pos';
import { ShieldCheck, ArrowRight, ShoppingBag, Award, Zap, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const normalizePhone = (p: string) => p.replace(/\D/g, '');

  const formatPhone = (p: string) => {
    const digits = normalizePhone(p);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = normalizePhone(input);
    if (digits.length <= 10) {
      setPhone(formatPhone(digits));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    const user = await getUserByPhone(normalized);
    if (user) {
      localStorage.setItem('weed_delivery_session', 'true');
      localStorage.setItem('user_phone', normalized);
      router.push('/menu');
    } else {
      setError('Number not in the vault. Contact dispatch.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Navbar Dropdown for Business Owners */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Pocket Hash <span className="text-zinc-600">v1.2</span></h1>
        </div>
        <button onClick={() => router.push('/admin')} className="flex items-center gap-2 group px-4 py-2 border border-emerald-500/20 bg-zinc-900/50 backdrop-blur-md rounded-xl hover:bg-zinc-800 transition-all">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Merchant Dashboard</span>
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/10 border border-emerald-600/20 rounded-full">
            <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Hybrid Delivery Platform</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">Unlock the <br /><span className="text-emerald-500">Private Vault.</span></h2>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">Enterprise-grade cannabis delivery with automated loyalty, real-time POS, and data-driven insights. Designed for the high-end distributor.</p>
        </motion.div>

        {/* Auth / Demo Login Portal */}
        <div className="mt-16 w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="text-left space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Verified Member Line</label>
                <input
                  type="tel"
                  placeholder="(661) 555-1111"
                  className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  value={phone}
                  onChange={handlePhoneChange}
                />
              </div>
              {error && <p className="text-red-400 text-xs font-bold bg-red-900/10 py-2 rounded-lg border border-red-900/30">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/40">
                Enter the Vault <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Links for Owners */}
            <div className="mt-10 pt-8 border-t border-zinc-800/50 flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Developer Demo Shortcuts</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setPhone('(661) 555-1111'); }} className="px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 rounded-xl transition-all text-left">
                  <span className="block text-[8px] font-black text-zinc-600 uppercase">Test Account</span>
                  <span className="block text-xs font-bold text-zinc-400">Sample Member</span>
                </button>
                <button onClick={() => router.push('/admin')} className="px-4 py-3 bg-emerald-950/20 border border-emerald-900/30 hover:border-emerald-500/50 rounded-xl transition-all text-left">
                  <span className="block text-[8px] font-black text-emerald-600 uppercase">Admin View</span>
                  <span className="block text-xs font-bold text-emerald-400">Launch Backend</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl text-left">
          {[
            { title: 'The POS Engine', desc: 'Secure, back-end terminal for recording sales and processing loyalty redemptions instantly.', icon: Terminal },
            { title: 'Reward Shield', desc: 'Advanced logic prevents point double-spending. Automatic credit calculation at checkout.', icon: Award },
            { title: 'Member Vault', desc: 'A premium, high-fidelity experience for your customers that drives return visits.', icon: ShoppingBag }
          ].map((f, i) => (
            <div key={i} className="space-y-4 group">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600/10 group-hover:border-emerald-600/30 transition-all">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter">{f.title}</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">© 2026 Pocket Hash Vault. Deployment Ready.</p>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-widest">Enterprise</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Compliant</span>
          <span className="text-[10px] font-black uppercase tracking-widest">21+ Required</span>
        </div>
      </footer>
    </main>
  );
}
