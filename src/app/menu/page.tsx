'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByPhone, getProducts } from '@/app/actions/pos';
import { ShoppingBag, Star, Info, LogOut, ChevronRight, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const strainColors: Record<string, string> = { Indica: 'bg-purple-600', Sativa: 'bg-amber-500', Hybrid: 'bg-emerald-500' };

export default function MenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (typeof window !== 'undefined') {
        const phone = localStorage.getItem('user_phone');
        const session = localStorage.getItem('weed_delivery_session');
        if (session !== 'true' || !phone) {
          router.push('/');
          return;
        }
        const [userData, productsData] = await Promise.all([
          getUserByPhone(phone),
          getProducts()
        ]);
        setUser(userData);
        setProducts(productsData);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const logout = () => {
    localStorage.removeItem('weed_delivery_session');
    localStorage.removeItem('user_phone');
    router.push('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-zinc-500 font-medium animate-pulse">Establishing secure connection...</p>
    </div>
  );

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 pointer-events-none" />

      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse" />

      <header className="relative sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Pocket Hash</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Members Only</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Active Balance</span>
              <span className="text-emerald-400 font-black text-sm">{user?.points || 0} PTS</span>
            </div>
            <button onClick={logout} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all">
              <LogOut className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Rewards Program Preview */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Loyalty Status</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black italic uppercase leading-none">Your Next Reward<br />is Waiting.</h2>
                <p className="text-emerald-100/70 text-sm max-w-sm">Every dollar spent is a point earned. Unlock up to $200 in store credit.</p>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between font-black uppercase tracking-tighter italic">
                    <span className="text-xs text-emerald-200">Current Points</span>
                    <span className="text-2xl text-white">{user?.points || 0} <span className="text-xs opacity-50">/ 1000</span></span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((user?.points || 0) / 1000) * 100)}%` }} className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ p: 200, c: 20 }, { p: 500, c: 100 }, { p: 1000, c: 200 }].map((tier, i) => (
                      <div key={i} className={`flex flex-col items-center p-2 rounded-xl border ${user?.points >= tier.p ? 'bg-white/10 border-white/20' : 'bg-black/10 border-white/5 opacity-50'}`}>
                        <span className="text-[9px] font-black italic">${tier.c} CREDIT</span>
                        <span className="text-[10px] opacity-40">{tier.p} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <div className="mb-10 flex items-center justify-between sticky top-[80px] z-20 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${activeCategory === category ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-500 ring-offset-4 ring-offset-zinc-950' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white border border-zinc-800'}`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} key={product.id} className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-[24px] overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20">
              <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 text-zinc-600 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag size={80} />
                </div>
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${strainColors[product.strainType] || 'bg-zinc-700'}`}>{product.strainType}</div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black bg-zinc-950/80 text-white backdrop-blur-md border border-white/5 uppercase tracking-widest">THC: {product.thc}</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-zinc-500">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">{product.name}</h3>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 font-medium">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-600 uppercase">Premium Drop</span>
                    <span className="text-2xl font-black text-white italic tracking-tighter">${product.price}</span>
                  </div>
                  <button onClick={() => addToCart(product)} className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 hover:rotate-1 transition-all active:scale-90">Bag It</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && <div className="text-center py-20 bg-zinc-900/50 rounded-[32px] border-2 border-dashed border-zinc-800"><p className="text-zinc-500 font-bold uppercase tracking-widest italic">No matches found in the vault.</p></div>}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
          <button onClick={() => setIsCartOpen(true)} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-900/40 flex items-center justify-between px-6 transition-all hover:scale-[1.05] active:scale-[0.95]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black/20 rounded-lg flex items-center justify-center font-black italic">{cartItemCount}</div>
              <span className="text-xs font-black uppercase tracking-widest">View Bag</span>
            </div>
            <span className="font-black italic text-lg">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Modern Side Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" onClick={() => setIsCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950 z-[70] shadow-2xl flex flex-col border-l border-zinc-900">
              <div className="p-8 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Your Bag</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{cartItemCount} Items Selected</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all">< ChevronRight className="w-6 h-6 text-zinc-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale">
                    <ShoppingBag size={64} className="text-zinc-800" />
                    <p className="font-black italic uppercase tracking-widest">Bag is Empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-900 rounded-3xl group">
                      <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center font-black italic text-[8px] opacity-20 uppercase tracking-tighter">PH-{item.id}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black italic uppercase tracking-tighter truncate">{item.name}</h3>
                        <p className="text-emerald-400 font-black italic text-sm">${item.price}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-8 bg-zinc-900/30 border-t border-zinc-900 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Estimated Points Earned</span><span className="text-xs font-black text-emerald-400">+{Math.floor(cartTotal)} PTS</span></div>
                    <div className="flex justify-between items-center pt-4"><span className="text-sm font-black italic uppercase tracking-tighter">Total Amount</span><span className="text-3xl font-black italic text-white tracking-tighter">${cartTotal.toFixed(2)}</span></div>
                  </div>
                  <button onClick={() => { setCart([]); setIsCartOpen(false); alert('Order Sent to Dispatch!'); }} className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">Dispatch Order</button>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Dispatch will text confirmation & ETA</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
