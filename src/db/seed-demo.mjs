import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:sqlite.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seedDemoData() {
    console.log('🔄 Injecting Demo Environment Data...');

    const demoUsers = [
        { phone: '6615551111', name: 'James "OG" Miller', points: 450, spend: 890 },
        { phone: '6615552222', name: 'Sarah Green', points: 210, spend: 340 },
        { phone: '5555555555', name: 'Master Admin', points: 1200, spend: 2500 }
    ];

    for (const u of demoUsers) {
        try {
            await client.execute({
                sql: 'INSERT INTO users (phone, name, points, total_spend) VALUES (?, ?, ?, ?) ON CONFLICT(phone) DO UPDATE SET points = excluded.points, total_spend = excluded.total_spend',
                args: [u.phone, u.name, u.points, u.spend]
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Inject some demo orders to make the charts/logs look active
    const demoOrders = [
        { phone: '6615551111', amount: 45, points: 45 },
        { phone: '6615552222', amount: 120, points: 120 },
        { phone: '6615551111', amount: 65, points: 65 }
    ];

    for (const o of demoOrders) {
        const user = await client.execute({
            sql: 'SELECT id FROM users WHERE phone = ?',
            args: [o.phone]
        });
        if (user.rows[0]) {
            await client.execute({
                sql: 'INSERT INTO orders (user_id, total_amount, points_earned, points_redeemed) VALUES (?, ?, ?, 0)',
                args: [user.rows[0].id, o.amount, o.points]
            });
        }
    }

    console.log('✅ Demo Environment Active.');
    process.exit(0);
}

seedDemoData();
