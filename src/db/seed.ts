import { db } from './index';
import { products } from './schema';

const initialProducts = [
    { name: 'Gelato 33', category: 'Flower', strainType: 'Hybrid', thc: '24%', description: 'Sweet, creamy flavor with balanced euphoric effects.', price: 45 },
    { name: 'OG Kush', category: 'Flower', strainType: 'Indica', thc: '22%', description: 'Classic earthy pine aroma with heavy relaxation.', price: 40 },
    { name: 'Sour Diesel', category: 'Flower', strainType: 'Sativa', thc: '26%', description: 'Energetic, dreamy cerebral effects with pungent diesel notes.', price: 42 },
    { name: 'Purple Punch', category: 'Flower', strainType: 'Indica', thc: '20%', description: 'Grape candy flavor with sedating body high.', price: 38 },
    { name: 'Jack Herer', category: 'Flower', strainType: 'Sativa', thc: '23%', description: 'Clear-headed, creative bliss with spicy pine scent.', price: 44 },
    { name: 'Wedding Cake', category: 'Flower', strainType: 'Hybrid', thc: '25%', description: 'Rich vanilla flavor with calming, happy effects.', price: 48 },
    { name: 'Live Resin Badder', category: 'Wax', strainType: 'Hybrid', thc: '78%', description: 'Whipped, creamy texture with full-spectrum terpenes.', price: 55 },
    { name: 'Shatter', category: 'Wax', strainType: 'Indica', thc: '82%', description: 'Glass-like consistency, pure and potent.', price: 50 },
    { name: 'Diamonds & Sauce', category: 'Wax', strainType: 'Sativa', thc: '89%', description: 'THCA crystals swimming in terpene-rich sauce.', price: 65 },
    { name: 'Crumble', category: 'Wax', strainType: 'Hybrid', thc: '75%', description: 'Dry, crumbly texture perfect for sprinkling.', price: 48 },
    { name: 'Blue Dream Cart', category: 'Pens', strainType: 'Hybrid', thc: '85%', description: 'Berry-flavored, balanced high in a 1g cart.', price: 35 },
    { name: 'Granddaddy Purple', category: 'Pens', strainType: 'Indica', thc: '88%', description: 'Grape and berry flavors for deep relaxation.', price: 38 },
    { name: 'Pineapple Express', category: 'Pens', strainType: 'Sativa', thc: '87%', description: 'Tropical, uplifting and long-lasting.', price: 36 },
    { name: 'Disposable Live Rosin', category: 'Pens', strainType: 'Hybrid', thc: '82%', description: 'Solventless, full-spectrum experience. Ready to use.', price: 45 },
    { name: 'Sour Watermelon Gummies', category: 'Edibles', strainType: 'Hybrid', thc: '100mg', description: '10 pieces, 10mg each. Tart and sweet.', price: 20 },
    { name: 'Chocolate Chip Cookies', category: 'Edibles', strainType: 'Indica', thc: '50mg', description: 'Single cookie, 50mg. Fresh baked taste.', price: 12 },
    { name: 'Mango THC Syrup', category: 'Edibles', strainType: 'Hybrid', thc: '200mg', description: 'Add to drinks. 200mg total, 10mg per serving.', price: 28 },
    { name: 'Caramel Chews', category: 'Edibles', strainType: 'Sativa', thc: '80mg', description: '8 pieces, 10mg each. Buttery and rich.', price: 18 },
];

export async function seed() {
    await db.insert(products).values(initialProducts).onConflictDoNothing();
    console.log('Database seeded.');
}
