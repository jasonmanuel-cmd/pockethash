'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats, getRecentOrders } from '@/app/actions/pos';
import {
    TrendingUp, Users, Award, ShoppingCart,
    ArrowRight, Activity, Calendar, Zap,
    BarChart3, Settings, ShieldCheck, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            const [s, o] = await Promise.all([
                getDashboardStats(),
                getRecentOrders()
            ]);
            setStats(s);
            setOrders(o);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Sidebar - Desktop Only */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800 hidden xl:flex flex-col z-50">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter">PH-Vault</h1>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Management Suit</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600/10 text-emerald-500 rounded-xl border border-emerald-600/20 font-bold text-sm">
                            <TrendingUp className="w-4 h-4" /> Overview
                        </button>
                        <button onClick={() => router.push('/admin/pos')} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all font-bold text-sm">
                            <ShoppingCart className="w-4 h-4" /> POS Terminal
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all font-bold text-sm opacity-50 cursor-not-allowed">
                            <Users className="w-4 h-4" /> Inventory
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all font-bold text-sm opacity-50 cursor-not-allowed">
                            <Settings className="w-4 h-4" /> Shop Setup
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8">
                    <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold">Demo Mode</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">This is a fully functional business terminal. All sales recorded here update the live database & customer points.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="xl:ml-72 p-6 md:p-12 max-w-[1400px]">
                {/* Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Business Intelligence</h2>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Real-time Performance Metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/admin/pos')} className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            Open Terminal <Zap className="w-4 h-4 fill-black" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Revenue', val: `$${stats?.totalSales.toFixed(2)}`, icon: BarChart3, color: 'text-emerald-500' },
                        { label: 'Active Members', val: stats?.customerCount, icon: Users, color: 'text-blue-500' },
                        { label: 'Points in Circulation', val: stats?.activePoints, icon: Award, color: 'text-yellow-500' },
                        { label: 'Total Drops', val: stats?.orderCount, icon: ShoppingCart, color: 'text-purple-500' }
                    ].map((s, i) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 bg-zinc-800 rounded-2xl ${s.color} group-hover:scale-110 transition-transform`}>
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">+12% vs LW</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                            <div className="text-2xl font-black italic uppercase tracking-tighter">{s.val}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Recent Activity */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Recent Dispatch Log</h3>
                            </div>
                            <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-all">
                                View Full Report <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-950/20">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Reference</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Member</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Total</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {orders.map((o, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-zinc-600 uppercase italic">#DRO-{o.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{o.user?.phone}</span>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Verified Line</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black italic text-emerald-400">${o.totalAmount.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Sent</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest italic opacity-50">Log is currently clear.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Why Choose PH-Vault */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 px-2">Selling Points</h3>

                        {[
                            { title: 'Automated Loyalty', desc: 'No more physical punch cards. Zero-friction points keep customers coming back.', icon: Award },
                            { title: 'Data Retention', desc: 'Own your customer data. Every purchase builds a profile you control.', icon: ShieldCheck },
                            { title: 'Instant POS', desc: 'Lightning fast checkout for delivery drivers or shop staff.', icon: Zap },
                        ].map((point, i) => (
                            <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:shadow-2xl hover:shadow-emerald-900/10 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl text-emerald-500">
                                        <point.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm italic uppercase tracking-tighter mb-1">{point.title}</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{point.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16" />
                            <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">Ready to scale?</h4>
                            <p className="text-xs text-emerald-100 font-medium mb-6 leading-relaxed">The system is modular. Add inventory tracking, SMS alerts, or multiple locations with one click.</p>
                            <button className="w-full py-4 bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all">Contact Developer</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
