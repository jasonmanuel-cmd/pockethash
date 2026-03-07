'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByPhone } from '@/app/actions/pos';
import {
  ArrowRight,
  Award,
  Building2,
  CreditCard,
  Database,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Terminal,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

type StoryCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const leafSpecs = [
  { left: '3%', top: '10%', size: 84, delay: 0, duration: 16 },
  { left: '10%', top: '58%', size: 58, delay: 2, duration: 13 },
  { left: '22%', top: '22%', size: 74, delay: 4, duration: 17 },
  { left: '34%', top: '72%', size: 68, delay: 1, duration: 15 },
  { left: '46%', top: '14%', size: 92, delay: 5, duration: 18 },
  { left: '58%', top: '64%', size: 64, delay: 3, duration: 14 },
  { left: '70%', top: '18%', size: 78, delay: 2, duration: 16 },
  { left: '84%', top: '52%', size: 88, delay: 6, duration: 19 },
  { left: '92%', top: '16%', size: 56, delay: 1, duration: 12 },
];

const operatingModes: StoryCard[] = [
  {
    title: 'Delivery Dispatch',
    description: 'Drivers or dispatchers can run orders through one loyalty-aware terminal and keep repeat customers in one private CRM.',
    icon: Truck,
  },
  {
    title: 'Pickup Workflow',
    description: 'Use the same branded menu for pre-orders, fast pickup confirmation, and point tracking without a second system.',
    icon: Store,
  },
  {
    title: 'In-Store POS',
    description: 'Counter staff can use the admin terminal for walk-ins, redemptions, and customer history on the spot.',
    icon: Building2,
  },
];

const ownershipCards: StoryCard[] = [
  {
    title: 'Their Codebase',
    description: 'This can be delivered as a private codebase under the shop owner’s control instead of rented shared SaaS.',
    icon: LockKeyhole,
  },
  {
    title: 'Their Database',
    description: 'Customer numbers, loyalty balances, and order history can live under their own database and hosting accounts.',
    icon: Database,
  },
  {
    title: 'Their Brand',
    description: 'Colors, logos, flows, and terminology can all be tailored to the exact operation they want customers to experience.',
    icon: ShieldCheck,
  },
];

const paymentCards: StoryCard[] = [
  {
    title: 'Cash Today, Card Expansion Tomorrow',
    description: 'The system already works for loyalty and order capture. Card payment modules can be layered in as the payment stack evolves.',
    icon: Zap,
  },
  {
    title: 'Stripe-Backed Modules',
    description: 'Stripe can be connected for compliant card flows, pickup deposits, accessories, or other approved payment rails where the business model allows it.',
    icon: CreditCard,
  },
  {
    title: 'Private Control Layer',
    description: 'Nothing about the architecture forces a locked platform. Payment logic can stay modular so the merchant decides how they want to operate.',
    icon: Terminal,
  },
];

const showcaseCards: StoryCard[] = [
  {
    title: 'Owner Dashboard',
    description: 'Live revenue, active member count, circulating points, and recent orders give a shop a clear operating picture fast.',
    icon: Terminal,
  },
  {
    title: 'Reward Shield',
    description: 'Reward tiers are validated on the server so discounts cannot be spoofed from the browser.',
    icon: Award,
  },
  {
    title: 'Member Vault',
    description: 'Customers get a premium branded menu instead of a generic order form, which makes the whole operation feel higher end.',
    icon: ShoppingBag,
  },
];

function FloatingLeaf({ left, top, size, delay, duration }: { left: string; top: string; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute text-emerald-400/15"
      style={{ left, top, width: size, height: size }}
      initial={{ opacity: 0.12, rotate: -12 }}
      animate={{
        y: [0, -18, 10, -8, 0],
        x: [0, 10, -12, 8, 0],
        rotate: [-12, 10, -4, 12, -12],
        opacity: [0.08, 0.16, 0.1, 0.14, 0.08],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 120 120" fill="currentColor" className="h-full w-full drop-shadow-[0_0_24px_rgba(16,185,129,0.2)]">
        <ellipse cx="60" cy="28" rx="9" ry="24" />
        <ellipse cx="44" cy="40" rx="9" ry="24" transform="rotate(-35 44 40)" />
        <ellipse cx="76" cy="40" rx="9" ry="24" transform="rotate(35 76 40)" />
        <ellipse cx="34" cy="58" rx="8" ry="22" transform="rotate(-58 34 58)" />
        <ellipse cx="86" cy="58" rx="8" ry="22" transform="rotate(58 86 58)" />
        <ellipse cx="27" cy="78" rx="7" ry="17" transform="rotate(-78 27 78)" />
        <ellipse cx="93" cy="78" rx="7" ry="17" transform="rotate(78 93 78)" />
        <rect x="57" y="58" width="6" height="40" rx="3" />
      </svg>
    </motion.div>
  );
}

export default function Home() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const normalizePhone = (value: string) => value.replace(/\D/g, '');

  const formatPhone = (value: string) => {
    const digits = normalizePhone(value);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = normalizePhone(event.target.value);
    if (digits.length <= 10) {
      setPhone(formatPhone(digits));
    }
    setError('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const user = await getUserByPhone(normalized);
      if (user) {
        localStorage.setItem('weed_delivery_session', 'true');
        localStorage.setItem('user_phone', normalized);
        router.push('/menu');
        return;
      }

      setError('Number not in the vault. Contact dispatch.');
    } catch (lookupError) {
      console.error(lookupError);
      setError('Secure lookup is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040706] text-white selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.14),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(180deg,_rgba(4,7,6,0.95)_0%,_rgba(6,10,9,0.98)_48%,_rgba(3,5,4,1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:140px_140px] opacity-20" />
        <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-32 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-[30%] top-[58%] h-64 w-64 rounded-full bg-emerald-300/5 blur-3xl" />
        {leafSpecs.map((leaf) => (
          <FloatingLeaf key={`${leaf.left}-${leaf.top}`} {...leaf} />
        ))}
      </div>

      <div className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.12)]">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400/80">Private Commerce OS</p>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">Pocket Hash</h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="group inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-zinc-300 backdrop-blur-xl transition-all hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
          >
            <Terminal className="h-4 w-4 text-emerald-400" />
            Merchant Dashboard
          </button>
        </nav>

        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:pt-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">Delivery. Pickup. In-Store. One System.</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-4xl text-5xl font-black uppercase tracking-[-0.06em] text-white sm:text-6xl xl:text-7xl"
            >
              The 2026 private storefront and loyalty engine for modern cannabis operators.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300"
            >
              Pocket Hash is not a generic menu template. It is a branded commerce system a shop can use for deliveries,
              pickups, or counter sales, with a private member experience, a real POS dashboard, loyalty tracking, and
              owner-controlled deployment. The code, the data, and the customer relationships can stay with the merchant.
            </motion.p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                'Run driver dispatch and same-day orders',
                'Turn the same flow into pickup or retail checkout',
                'Deliver under the shop’s own brand and access',
              ].map((line) => (
                <div key={line} className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold leading-6 text-zinc-200 backdrop-blur-xl">
                  {line}
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-white/5 p-6 backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">Owner Story</p>
                <p className="mt-3 text-sm leading-7 text-zinc-100">
                  Send this page to a shop owner and they can immediately see the pitch: use one branded system for
                  customer orders, loyalty, staff checkout, and private reporting without handing their business over to
                  a shared marketplace.
                </p>
              </div>
              <div className="rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-300/15 via-white/5 to-white/0 p-6 backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">Payment Architecture</p>
                <p className="mt-3 text-sm leading-7 text-zinc-100">
                  Cash-first operations can use the system immediately, and Stripe-backed payment modules can be added
                  for compliant card flows, deposits, accessories, or other approved checkout paths.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-[2rem] border border-white/10 bg-zinc-950/75 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Live Demo Portal</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">Experience the member side</h3>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
                Ready
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Verified Member Line</label>
                <input
                  type="tel"
                  placeholder="(661) 555-1111"
                  className="h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-5 text-xl font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/40"
                  value={phone}
                  onChange={handlePhoneChange}
                />
              </div>
              {error && (
                <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black uppercase tracking-[0.28em] text-black transition-all hover:scale-[1.01] hover:bg-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
              >
                {loading ? 'Checking Access' : 'Enter the Vault'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-8 grid gap-3 border-t border-white/10 pt-8 sm:grid-cols-2">
              <button
                onClick={() => setPhone('(661) 555-1111')}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-emerald-400/30 hover:bg-white/10"
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.26em] text-zinc-500">Demo Member</span>
                <span className="mt-2 block text-sm font-bold text-zinc-100">James &quot;OG&quot; Miller</span>
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-left transition-all hover:border-emerald-400/40 hover:bg-emerald-500/15"
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.26em] text-emerald-300">Owner View</span>
                <span className="mt-2 block text-sm font-bold text-white">Open merchant dashboard</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { label: 'Delivery', value: 'Live' },
                { label: 'Pickup', value: 'Ready' },
                { label: 'Retail', value: 'Ready' },
              ].map((tile) => (
                <div key={tile.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{tile.label}</p>
                  <p className="mt-2 text-lg font-black uppercase tracking-tight text-white">{tile.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">How They Can Use It</p>
              <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">Built for the way shops actually operate</h3>
            </div>
            <p className="hidden max-w-xl text-sm leading-7 text-zinc-400 lg:block">
              This same system can be presented as a delivery engine, a pickup workflow, or an in-store loyalty POS,
              depending on how the merchant runs their business.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {operatingModes.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <card.icon className="h-7 w-7" />
                </div>
                <h4 className="mt-6 text-2xl font-black uppercase tracking-tight text-white">{card.title}</h4>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.25rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 via-black/40 to-black/30 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">Ownership and Access</p>
            <h3 className="mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Their system. Their credentials. Their customer book.
            </h3>
            <p className="mt-5 text-base leading-8 text-zinc-100">
              The strongest part of this pitch is simple: this can be handed over as the merchant’s own private software.
              They are not forced into a shared account. The codebase, the deployment, the database, and the keys can all
              be put directly under the owner’s control, which means access stays with them.
            </p>
            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Client-Facing Language</p>
              <p className="mt-3 text-sm leading-7 text-zinc-200">
                “This is your private branded commerce system. Your customers order through your experience, your staff run
                it through your dashboard, and your data stays in your hands.”
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {ownershipCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-emerald-300">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white">{card.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{card.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-[2.5rem] border border-amber-300/15 bg-gradient-to-r from-amber-300/10 via-white/5 to-emerald-400/10 p-8 backdrop-blur-2xl md:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-200">Payments and Expansion</p>
                <h3 className="mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                  Designed to grow into premium payments, not boxed out of them.
                </h3>
                <p className="mt-5 text-sm leading-8 text-zinc-200">
                  If the operator wants to add credit card support, this system can be extended with Stripe-backed modules
                  where the exact product mix, compliance path, and jurisdiction allow it. That can include deposits,
                  accessories, approved non-cannabis flows, or other payment layers the merchant wants to support.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {paymentCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-200">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-lg font-black uppercase tracking-tight text-white">{card.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{card.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">System Effect</p>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              The wow factor comes from making the operator look bigger, sharper, and more private.
            </h3>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {showcaseCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <card.icon className="h-7 w-7" />
                </div>
                <h4 className="mt-6 text-2xl font-black uppercase tracking-tight text-white">{card.title}</h4>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 border-t border-white/10 px-6 py-12 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Pocket Hash 2026</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              A private branded delivery, pickup, and retail commerce system with loyalty, POS controls, and owner-held access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {['Private Code', 'Owner Access', 'Loyalty Engine', 'Stripe-Ready Expansion'].map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300">
                {label}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
