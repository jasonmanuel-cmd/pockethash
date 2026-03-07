'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats, getOpenOrders, getRecentOrders, updateOrderWorkflow } from '@/app/actions/pos';
import {
    FULFILLMENT_LABELS,
    ORDER_STATUS_LABELS,
    getNextWorkflowStatus,
    getWorkflowSequence,
} from '@/lib/order-workflow';
import {
    Activity,
    Award,
    BarChart3,
    Clock3,
    HelpCircle,
    PackageCheck,
    RefreshCw,
    ShieldCheck,
    ShoppingCart,
    Truck,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];
type OpenOrder = Awaited<ReturnType<typeof getOpenOrders>>[number];
type StatCard = {
    label: string;
    val: string | number;
    icon: LucideIcon;
    color: string;
};
type Notice = {
    type: 'success' | 'error';
    text: string;
};

function getStatusClasses(status: OpenOrder['status'] | RecentOrder['status']) {
    switch (status) {
        case 'new':
            return 'border-sky-500/20 bg-sky-500/10 text-sky-300';
        case 'confirmed':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
        case 'preparing':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
        case 'ready':
            return 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-200';
        case 'out_for_delivery':
            return 'border-orange-500/20 bg-orange-500/10 text-orange-200';
        case 'completed':
        default:
            return 'border-zinc-700 bg-zinc-800/60 text-zinc-200';
    }
}

function formatOrderTime(value: OpenOrder['createdAt'] | RecentOrder['createdAt']) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Just now';
    }

    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [orders, setOrders] = useState<RecentOrder[]>([]);
    const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savingOrderId, setSavingOrderId] = useState<number | null>(null);
    const [assignmentDrafts, setAssignmentDrafts] = useState<Record<number, string>>({});
    const [windowDrafts, setWindowDrafts] = useState<Record<number, string>>({});
    const [notice, setNotice] = useState<Notice | null>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    const hydrateDrafts = (queue: OpenOrder[]) => {
        const nextAssignments: Record<number, string> = {};
        const nextWindows: Record<number, string> = {};

        queue.forEach((order) => {
            nextAssignments[order.id] = order.assignedTo ?? '';
            nextWindows[order.id] = order.fulfillmentWindow ?? '';
        });

        setAssignmentDrafts(nextAssignments);
        setWindowDrafts(nextWindows);
    };

    const loadDashboard = async (manual = false) => {
        if (manual) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError('');

        try {
            const [nextStats, nextOrders, nextOpenOrders] = await Promise.all([
                getDashboardStats(),
                getRecentOrders(),
                getOpenOrders(),
            ]);

            setStats(nextStats);
            setOrders(nextOrders);
            setOpenOrders(nextOpenOrders);
            hydrateDrafts(nextOpenOrders);
        } catch (loadError) {
            console.error(loadError);
            setError('Unable to reach the live metrics feed right now.');
        } finally {
            if (manual) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadDashboard();
        // The initial dashboard boot should run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleWorkflowSave = async (order: OpenOrder, status = order.status) => {
        setSavingOrderId(order.id);
        setNotice(null);
        setError('');

        try {
            await updateOrderWorkflow({
                orderId: order.id,
                status,
                assignedTo: assignmentDrafts[order.id] ?? '',
                fulfillmentWindow: windowDrafts[order.id] ?? '',
            });

            setNotice({
                type: 'success',
                text: `Order #${order.id} updated to ${ORDER_STATUS_LABELS[status]}.`,
            });
            await loadDashboard(true);
        } catch (updateError) {
            console.error(updateError);
            setError(updateError instanceof Error ? updateError.message : 'Unable to update that order.');
        } finally {
            setSavingOrderId(null);
        }
    };

    const statsSnapshot = stats ?? {
        totalSales: 0,
        customerCount: 0,
        activePoints: 0,
        orderCount: 0,
        openOrderCount: 0,
        deliveryCount: 0,
        pickupCount: 0,
        inStoreCount: 0,
    };

    const statCards: StatCard[] = [
        { label: 'Total Revenue', val: `$${statsSnapshot.totalSales.toFixed(2)}`, icon: BarChart3, color: 'text-emerald-500' },
        { label: 'Active Members', val: statsSnapshot.customerCount, icon: Users, color: 'text-blue-500' },
        { label: 'Live Queue', val: statsSnapshot.openOrderCount, icon: Clock3, color: 'text-amber-300' },
        { label: 'Total Tickets', val: statsSnapshot.orderCount, icon: ShoppingCart, color: 'text-fuchsia-300' },
    ];

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800 hidden xl:flex flex-col z-50">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter">PH-Vault</h1>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Operations Suite</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600/10 text-emerald-500 rounded-xl border border-emerald-600/20 font-bold text-sm">
                            <Truck className="w-4 h-4" /> Dispatch Board
                        </button>
                        <button onClick={() => router.push('/admin/pos')} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all font-bold text-sm">
                            <ShoppingCart className="w-4 h-4" /> POS Terminal
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all font-bold text-sm opacity-50 cursor-not-allowed">
                            <PackageCheck className="w-4 h-4" /> Inventory
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8">
                    <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold">Demo Mode</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Use this board to show owners how delivery, pickup, and in-store orders can be staged and assigned live.</p>
                    </div>
                </div>
            </aside>

            <main className="xl:ml-72 p-6 md:p-12 max-w-[1440px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Dispatch and Store Control</h2>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Live fulfillment queue, assignment, and recent activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/admin/pos')} className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            Open Terminal <Zap className="w-4 h-4 fill-black" />
                        </button>
                        <button onClick={() => loadDashboard(true)} className="px-5 py-3 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2 disabled:opacity-50" disabled={refreshing}>
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {(error || notice) && (
                    <div className={`mb-8 rounded-2xl border px-4 py-3 text-sm font-medium ${
                        error
                            ? 'border-red-500/30 bg-red-500/10 text-red-200'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    }`}>
                        {error || notice?.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} key={card.label} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 bg-zinc-800 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{card.label}</p>
                            <div className="text-2xl font-black italic uppercase tracking-tighter">{card.val}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {[
                        { label: 'Delivery Orders', value: statsSnapshot.deliveryCount, icon: Truck },
                        { label: 'Pickup Orders', value: statsSnapshot.pickupCount, icon: PackageCheck },
                        { label: 'In-Store Orders', value: statsSnapshot.inStoreCount, icon: Award },
                    ].map((item) => (
                        <div key={item.label} className="rounded-3xl border border-zinc-800 bg-zinc-900/70 px-5 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-emerald-400">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</p>
                                <p className="text-2xl font-black italic tracking-tight">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                                        <Truck className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Operations Queue</h3>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Assign drivers, prep pickups, clear in-store tickets</p>
                                    </div>
                                </div>
                            </div>

                            {openOrders.length === 0 ? (
                                <div className="rounded-[32px] border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-500">
                                    No active orders are waiting in the queue.
                                </div>
                            ) : (
                                <div className="grid gap-5">
                                    {openOrders.map((order) => {
                                        const workflow = getWorkflowSequence(order.fulfillmentType);
                                        const nextStatus = getNextWorkflowStatus(order.status, order.fulfillmentType);
                                        const isSaving = savingOrderId === order.id;

                                        return (
                                            <div key={order.id} className="rounded-[32px] border border-zinc-800 bg-zinc-900/85 p-6 shadow-2xl shadow-black/20">
                                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                                    <div className="space-y-4 flex-1">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="text-lg font-black italic uppercase tracking-tight text-white">#DRO-{order.id}</span>
                                                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                                                {FULFILLMENT_LABELS[order.fulfillmentType]}
                                                            </span>
                                                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusClasses(order.status)}`}>
                                                                {ORDER_STATUS_LABELS[order.status]}
                                                            </span>
                                                        </div>

                                                        <div className="grid gap-3 md:grid-cols-3">
                                                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer</p>
                                                                <p className="mt-1 font-bold text-white">{order.user?.name ?? 'Guest Member'}</p>
                                                                <p className="text-xs text-zinc-500 uppercase">{order.user?.phone ?? 'No phone on file'}</p>
                                                            </div>
                                                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Order Total</p>
                                                                <p className="mt-1 font-black italic text-emerald-400 text-xl">${order.totalAmount.toFixed(2)}</p>
                                                                <p className="text-xs text-zinc-500 uppercase">{formatOrderTime(order.createdAt)}</p>
                                                            </div>
                                                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer Note</p>
                                                                <p className="mt-1 text-sm text-zinc-300">{order.customerNote ?? 'No note attached.'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-3 md:grid-cols-2">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                                    {order.fulfillmentType === 'delivery' ? 'Driver / Route' : order.fulfillmentType === 'pickup' ? 'Pickup Lead' : 'Counter / Staff'}
                                                                </label>
                                                                <input
                                                                    value={assignmentDrafts[order.id] ?? ''}
                                                                    onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [order.id]: event.target.value }))}
                                                                    placeholder={order.fulfillmentType === 'delivery' ? 'North Route' : order.fulfillmentType === 'pickup' ? 'Pickup Shelf A' : 'Counter 1'}
                                                                    className="mt-2 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition-all focus:border-emerald-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Timing Window</label>
                                                                <input
                                                                    value={windowDrafts[order.id] ?? ''}
                                                                    onChange={(event) => setWindowDrafts((current) => ({ ...current, [order.id]: event.target.value }))}
                                                                    placeholder="ASAP, 5:30 PM, ready now"
                                                                    className="mt-2 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition-all focus:border-emerald-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Status Flow</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {workflow.map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleWorkflowSave(order, status)}
                                                                        disabled={isSaving}
                                                                        className={`rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                                                                            order.status === status
                                                                                ? getStatusClasses(status)
                                                                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {ORDER_STATUS_LABELS[status]}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-full xl:max-w-[220px] flex xl:flex-col gap-3">
                                                        <button
                                                            onClick={() => handleWorkflowSave(order)}
                                                            disabled={isSaving}
                                                            className="flex-1 rounded-2xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:border-zinc-700 transition-all disabled:opacity-50"
                                                        >
                                                            Save Assignment
                                                        </button>
                                                        <button
                                                            onClick={() => handleWorkflowSave(order, nextStatus)}
                                                            disabled={isSaving || nextStatus === order.status}
                                                            className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all disabled:bg-zinc-800 disabled:text-zinc-500"
                                                        >
                                                            {isSaving ? 'Saving...' : `Advance to ${ORDER_STATUS_LABELS[nextStatus]}`}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Recent Order Log</h3>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-950/20">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Reference</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Member</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Mode</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Total</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-zinc-600 uppercase italic">#DRO-{order.id}</span>
                                                        <span className="text-[10px] text-zinc-500 uppercase font-bold">{formatOrderTime(order.createdAt)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{order.user?.name ?? 'Guest Member'}</span>
                                                        <span className="text-[10px] text-zinc-500 uppercase font-bold">{order.user?.phone ?? 'No phone on file'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
                                                        {FULFILLMENT_LABELS[order.fulfillmentType]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-black italic text-emerald-400">${order.totalAmount.toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusClasses(order.status)}`}>
                                                        {ORDER_STATUS_LABELS[order.status]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest italic opacity-50">Log is currently clear.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 px-2">Operational Story</h3>

                        {[
                            { title: 'Delivery Ready', desc: 'Assign a route, move from new to out-for-delivery, and clear the order when the run is done.', icon: Truck },
                            { title: 'Pickup Ready', desc: 'Confirm, prep, mark ready, and hand off curbside or at the counter without losing member history.', icon: PackageCheck },
                            { title: 'Retail Ready', desc: 'In-store sales can still land in the same customer and loyalty system as online orders.', icon: Award },
                        ].map((point) => (
                            <div key={point.title} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:shadow-2xl hover:shadow-emerald-900/10 transition-all">
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
                            <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">What owners see</h4>
                            <p className="text-xs text-emerald-100 font-medium mb-6 leading-relaxed">A private stack that can run dispatch, pickup, and in-store sales without forcing the merchant into a marketplace look and feel.</p>
                            <button onClick={() => router.push('/')} className="w-full py-4 bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all">Back to Sales Page</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
