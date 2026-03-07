'use server';

import { db } from '@/db';
import { users, orders, orderItems, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function getUserByPhone(phone: string) {
    const normalized = phone.replace(/\D/g, '');
    const user = await db.query.users.findFirst({
        where: eq(users.phone, normalized),
    });
    return user;
}

export async function createOrUpdateUser(phone: string, name?: string) {
    const normalized = phone.replace(/\D/g, '');
    const existing = await getUserByPhone(normalized);

    if (existing) {
        if (name) {
            await db.update(users).set({ name }).where(eq(users.id, existing.id));
        }
        return existing;
    }

    const [newUser] = await db.insert(users).values({
        phone: normalized,
        name: name || 'Valued Customer',
    }).returning();

    return newUser;
}

export async function completeSale(data: {
    phone: string;
    items: { productId: number; quantity: number; price: number }[];
    pointsSpent: number;
    discountApplied: number;
}) {
    const normalized = data.phone.replace(/\D/g, '');
    let user = await getUserByPhone(normalized);

    if (!user) {
        user = await createOrUpdateUser(normalized);
    }

    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - data.discountApplied);
    const pointsEarned = Math.floor(total);

    const [order] = await db.insert(orders).values({
        userId: user.id,
        totalAmount: total,
        pointsEarned: pointsEarned,
        pointsRedeemed: data.pointsSpent,
        status: 'completed',
    }).returning();

    for (const item of data.items) {
        await db.insert(orderItems).values({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.price,
        });
    }

    // Update user points and spend
    await db.update(users).set({
        points: sql`${users.points} + ${pointsEarned} - ${data.pointsSpent}`,
        totalSpend: sql`${users.totalSpend} + ${total}`,
    }).where(eq(users.id, user.id));

    return { success: true, orderId: order.id };
}

export async function getProducts() {
    return await db.query.products.findMany({
        where: eq(products.isActive, true),
    });
}

export async function getDashboardStats() {
    const allOrders = await db.query.orders.findMany();
    const allUsers = await db.query.users.findMany();

    const totalSales = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPoints = allUsers.reduce((sum, u) => sum + u.points, 0);

    return {
        totalSales,
        customerCount: allUsers.length,
        activePoints: totalPoints,
        orderCount: allOrders.length
    };
}

export async function getRecentOrders() {
    return await db.query.orders.findMany({
        with: {
            user: true
        },
        limit: 10,
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
}
