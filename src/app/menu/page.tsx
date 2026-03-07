'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, getUserByPhone, placeCustomerOrder } from '@/app/actions/pos';
import { REWARD_TIERS } from '@/lib/loyalty';
import { FULFILLMENT_LABELS, ORDER_STATUS_LABELS, type FulfillmentType } from '@/lib/order-workflow';
import { ShoppingBag, Star, LogOut, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Product = Awaited<ReturnType<typeof getProducts>>[number];
type UserAccount = NonNullable<Awaited<ReturnType<typeof getUserByPhone>>>;
type CartItem = Product & { quantity: number };
type Notice = {
  type: 'success' | 'error';
  text: string;
};

const strainColors: Record<string, string> = {
  Indica: 'bg-purple-600',
  Sativa: 'bg-amber-500',
  Hybrid: 'bg-emerald-500',
};

export default function MenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [fulfillmentWindow, setFulfillmentWindow] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);

  const clearSession = () => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem('weed_delivery_session');
    localStorage.removeItem('user_phone');
  };

  useEffect(() => {
    async function load() {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const phone = localStorage.getItem('user_phone');
        const session = localStorage.getItem('weed_delivery_session');

        if (session !== 'true' || !phone) {
          clearSession();
          router.replace('/');
          return;
        }

        const [userData, productsData] = await Promise.all([
          getUserByPhone(phone),
          getProducts(),
        ]);

        if (!userData) {
          clearSession();
          router.replace('/');
          return;
        }

        setUser(userData);
        setProducts(productsData);
      } catch (error) {
        console.error(error);
        setNotice({ type: 'error', text: 'Unable to load the member menu right now.' });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const addToCart = (product: Product) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      if (existing) {
        return previous.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
      return [...previous, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((previous) => previous
      .map((item) => (
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ))
      .filter((item) => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const userPoints = user?.points ?? 0;
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter((product) => product.category === activeCategory);

  const getStrainColor = (strainType: Product['strainType']) => (
    strainType ? strainColors[strainType] ?? 'bg-zinc-700' : 'bg-zinc-700'
  );

  const logout = () => {
    clearSession();
    router.push('/');
  };

  const handleDispatchOrder = async () => {
    if (!user || cart.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const result = await placeCustomerOrder({
        phone: user.phone,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        fulfillmentType,
        fulfillmentWindow,
        customerNote,
      });

      setUser((current) => (
        current ? { ...current, points: result.updatedPoints } : current
      ));
      setCart([]);
      setIsCartOpen(false);
      setFulfillmentWindow('');
      setCustomerNote('');
      setNotice({
        type: 'success',
        text: `${FULFILLMENT_LABELS[result.fulfillmentType]} order #${result.orderId} submitted. Status: ${ORDER_STATUS_LABELS[result.status]}. ${result.pointsEarned} points added to this member account.`,
      });
    } catch (error) {
      console.error(error);
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to send this order to dispatch.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Establishing secure connection...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 pointer-events-none" />
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
              <span className="text-emerald-400 font-black text-sm">{userPoints} PTS</span>
            </div>
            <button onClick={logout} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all">
              <LogOut className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {notice && (
          <div className={`mb-8 rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}>
            {notice.text}
          </div>
        )}

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
                    <span className="text-2xl text-white">{userPoints} <span className="text-xs opacity-50">/ 1000</span></span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (userPoints / 1000) * 100)}%` }}
                      className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {REWARD_TIERS.map((tier) => (
                      <div
                        key={tier.points}
                        className={`flex flex-col items-center p-2 rounded-xl border ${
                          userPoints >= tier.points
                            ? 'bg-white/10 border-white/20'
                            : 'bg-black/10 border-white/5 opacity-50'
                        }`}
                      >
                        <span className="text-[9px] font-black italic">${tier.credit} CREDIT</span>
                        <span className="text-[10px] opacity-40">{tier.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-10 flex items-center justify-between sticky top-[80px] z-20 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                  activeCategory === category
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-500 ring-offset-4 ring-offset-zinc-950'
                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-[24px] overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20"
            >
              <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 text-zinc-600 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag size={80} />
                </div>
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${getStrainColor(product.strainType)}`}>
                  {product.strainType ?? 'Unknown'}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black bg-zinc-950/80 text-white backdrop-blur-md border border-white/5 uppercase tracking-widest">
                  THC: {product.thc}
                </div>
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
                  <button
                    onClick={() => addToCart(product)}
                    className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 hover:rotate-1 transition-all active:scale-90"
                  >
                    Bag It
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 rounded-[32px] border-2 border-dashed border-zinc-800">
            <p className="text-zinc-500 font-bold uppercase tracking-widest italic">No matches found in the vault.</p>
          </div>
        )}
      </div>

      {cartItemCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-900/40 flex items-center justify-between px-6 transition-all hover:scale-[1.05] active:scale-[0.95]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black/20 rounded-lg flex items-center justify-center font-black italic">{cartItemCount}</div>
              <span className="text-xs font-black uppercase tracking-widest">View Bag</span>
            </div>
            <span className="font-black italic text-lg">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950 z-[70] shadow-2xl flex flex-col border-l border-zinc-900"
            >
              <div className="p-8 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Your Bag</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{cartItemCount} Items Selected</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all">
                  <ChevronRight className="w-6 h-6 text-zinc-400" />
                </button>
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
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center bg-zinc-950 rounded-xl border border-zinc-800">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-zinc-800 rounded-l-xl transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-zinc-800 rounded-r-xl transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-8 bg-zinc-900/30 border-t border-zinc-900 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Fulfillment</p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {(['delivery', 'pickup'] as FulfillmentType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFulfillmentType(type)}
                            className={`rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
                              fulfillmentType === type
                                ? 'border-emerald-500 bg-emerald-500/15 text-white'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {FULFILLMENT_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Timing Window</label>
                      <input
                        value={fulfillmentWindow}
                        onChange={(event) => setFulfillmentWindow(event.target.value)}
                        placeholder={fulfillmentType === 'delivery' ? 'ASAP, 45 minutes, after 6 PM' : 'Ready by 5:30 PM'}
                        className="mt-2 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition-all focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Notes for Dispatch</label>
                      <textarea
                        value={customerNote}
                        onChange={(event) => setCustomerNote(event.target.value)}
                        placeholder={fulfillmentType === 'delivery' ? 'Gate code, apartment, landmark, call on arrival...' : 'Pickup car color, curbside note, first name...'}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Estimated Points Earned</span>
                      <span className="text-xs font-black text-emerald-400">+{Math.floor(cartTotal)} PTS</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-sm font-black italic uppercase tracking-tighter">Total Amount</span>
                      <span className="text-3xl font-black italic text-white tracking-tighter">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleDispatchOrder}
                    disabled={isSubmitting}
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      fulfillmentType === 'delivery' ? 'Send Delivery Order' : 'Submit Pickup Order'
                    )}
                  </button>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">
                    {fulfillmentType === 'delivery' ? 'Dispatch will text confirmation & ETA' : 'Pickup confirmation will be sent when the order is ready'}
                  </p>
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
