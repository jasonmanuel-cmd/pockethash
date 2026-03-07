'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByPhone, completeSale, getProducts } from '@/app/actions/pos';
import { Search, ShoppingBag, User, Plus, Minus, X, Trash2, CheckCircle, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REWARD_TIERS = [
    { points: 200, credit: 20 },
    { points: 500, credit: 100 },
    { points: 1000, credit: 200 },
];

export default function POSPage() {
    const [phone, setPhone] = useState('');
    const [customer, setCustomer] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [selectedReward, setSelectedReward] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [step, setStep] = useState(1); // 1: Lookup, 2: Sale

    useEffect(() => {
        async function load() {
            const data = await getProducts();
            setProducts(data);
        }
        load();
    }, []);

    const handleLookup = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (phone.length < 10) return;
        const user = await getUserByPhone(phone);
        if (user) {
            setCustomer(user);
            setStep(2);
        } else {
            // Logic for new customer could go here, but let's assume we create one on checkout
            setCustomer({ phone, points: 0, name: 'New Customer' });
            setStep(2);
        }
    };

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id));

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = selectedReward ? selectedReward.credit : 0;
    const total = Math.max(0, subtotal - discount);

    const handleCompleteSale = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const result = await completeSale({
                phone: customer.phone,
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                pointsSpent: selectedReward ? selectedReward.points : 0,
                discountApplied: discount,
            });
            if (result.success) {
                alert('Sale Completed!');
                setCart([]);
                setCustomer(null);
                setPhone('');
                setSelectedReward(null);
                setStep(1);
            }
        } catch (err) {
            console.error(err);
            alert('Error completing sale');
        } finally {
            setIsProcessing(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Pocket POS</h1>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Store Backend v1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-emerald-400">Online</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Terminal ID: #0012</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8">
                {step === 1 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold">Terminal Login</h2>
                                <p className="text-zinc-400">Search customer by phone to start sale</p>
                            </div>
                            <form onSubmit={handleLookup} className="space-y-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="tel"
                                        placeholder="Enter phone number..."
                                        className="w-full h-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-zinc-600"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={phone.length < 10}
                                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl text-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                                >
                                    Access Terminal
                                </button>
                            </form>
                        </motion.div>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
                        {/* Products Side */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-zinc-900 transition-all">
                                    <User className="w-4 h-4" />
                                    Change Customer
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 no-scrollbar">
                                {filteredProducts.map((p) => (
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-emerald-600/50 hover:bg-zinc-900 transition-all group"
                                    >
                                        <div className="aspect-square bg-zinc-800/50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                                            {/* Strain type badge */}
                                            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.strainType === 'Indica' ? 'bg-purple-600' : p.strainType === 'Sativa' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                                {p.strainType}
                                            </div>
                                            <ShoppingBag className="w-8 h-8 text-zinc-700 group-hover:text-emerald-500/50 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{p.category}</p>
                                            <h3 className="font-bold text-sm truncate">{p.name}</h3>
                                            <p className="text-emerald-400 font-bold">${p.price}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Cart/Summary Side */}
                        <div className="col-span-12 lg:col-span-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative">
                            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{customer?.name}</h3>
                                        <p className="text-xs text-zinc-500">{customer?.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Balance</p>
                                    <p className="text-emerald-400 font-bold text-lg">{customer?.points || 0} PTS</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Cart</h4>
                                {cart.length === 0 ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-zinc-600 space-y-2">
                                        <ShoppingBag className="w-10 h-10" />
                                        <p className="text-sm font-medium italic">Empty Bag</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 bg-zinc-950/50 border border-zinc-800 p-3 rounded-2xl group">
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-semibold text-sm truncate">{item.name}</h5>
                                                    <p className="text-xs text-zinc-500 font-medium">${item.price} ea</p>
                                                </div>
                                                <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-zinc-800 rounded transition-colors"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-zinc-800 rounded transition-colors"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <div className="text-right min-w-[60px]">
                                                    <p className="font-bold text-sm text-emerald-400">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Rewards Slider/Tier Check */}
                                <div className="pt-6 border-t border-zinc-800 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gift className="w-4 h-4 text-emerald-400" />
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Rewards</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { points: 200, credit: 20 },
                                            { points: 500, credit: 100 },
                                            { points: 1000, credit: 200 }
                                        ].map((tier) => {
                                            const canAfford = (customer?.points || 0) >= tier.points;
                                            const isSelected = selectedReward?.points === tier.points;
                                            return (
                                                <button
                                                    key={tier.points}
                                                    disabled={!canAfford}
                                                    onClick={() => setSelectedReward(isSelected ? null : tier)}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${isSelected ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : canAfford ? 'bg-zinc-900 border-emerald-500/20 hover:border-emerald-500/50' : 'bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed'}`}
                                                >
                                                    <span className="text-[10px] font-bold text-zinc-500 mb-1">{tier.points} PTS</span>
                                                    <span className="text-sm font-black text-white">${tier.credit} OFF</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 space-y-4 mt-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-zinc-500">Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-emerald-400">
                                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Reward Applied</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-lg font-bold">Total Pay</span>
                                        <span className="text-3xl font-black text-emerald-400">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCompleteSale}
                                    disabled={cart.length === 0 || isProcessing}
                                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 group"
                                >
                                    {isProcessing ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Complete Order
                                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-1.5 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Earn</span>
                                    <span className="text-xs font-black text-emerald-400">+{Math.floor(total)} PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}
