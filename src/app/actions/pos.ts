'use server';

import { db } from '@/db';
import { users, orders, orderItems, products } from '@/db/schema';
import { getRewardTier } from '@/lib/loyalty';
import { and, eq, inArray, sql } from 'drizzle-orm';

type SaleItemInput = {
    productId: number;
    quantity: number;
    price?: number;
};

type SaleInput = {
    phone: string;
    items: SaleItemInput[];
    pointsSpent?: number;
    discountApplied?: number;
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

function validatePhone(phone: string) {
    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
        throw new Error('Enter a valid 10-digit phone number.');
    }
    return normalized;
}

function consolidateItems(items: SaleItemInput[]) {
    if (items.length === 0) {
        throw new Error('Add at least one item before checkout.');
    }

    const quantities = new Map<number, number>();

    for (const item of items) {
        if (!Number.isInteger(item.productId) || item.productId <= 0) {
            throw new Error('The cart contains an invalid product.');
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error('The cart contains an invalid quantity.');
        }

        quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    return quantities;
}

async function resolveSaleItems(items: SaleItemInput[]) {
    const quantities = consolidateItems(items);
    const productIds = Array.from(quantities.keys());

    const catalog = await db.query.products.findMany({
        where: and(inArray(products.id, productIds), eq(products.isActive, true)),
    });

    if (catalog.length !== productIds.length) {
        throw new Error('One or more items are no longer available.');
    }

    return productIds.map((productId) => {
        const product = catalog.find((entry) => entry.id === productId);
        if (!product) {
            throw new Error('One or more items are no longer available.');
        }

        const quantity = quantities.get(productId) ?? 0;
        return {
            productId,
            quantity,
            unitPrice: product.price,
            lineTotal: product.price * quantity,
        };
    });
}

async function processSale(data: SaleInput) {
    const normalizedPhone = validatePhone(data.phone);
    const pointsSpent = data.pointsSpent ?? 0;
    const discountApplied = data.discountApplied ?? 0;

    if (pointsSpent < 0 || discountApplied < 0) {
        throw new Error('Rewards cannot be negative.');
    }

    const rewardTier = getRewardTier(pointsSpent);
    if (pointsSpent === 0 && discountApplied !== 0) {
        throw new Error('Invalid loyalty discount selected.');
    }
    if (pointsSpent > 0 && (!rewardTier || rewardTier.credit !== discountApplied)) {
        throw new Error('The selected loyalty reward is invalid.');
    }

    const resolvedItems = await resolveSaleItems(data.items);
    const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = Math.max(0, subtotal - discountApplied);
    const pointsEarned = Math.floor(total);

    let user = await getUserByPhone(normalizedPhone);
    if (!user && pointsSpent > 0) {
        throw new Error('New customers cannot redeem points yet.');
    }

    if (!user) {
        user = await createOrUpdateUser(normalizedPhone);
    }

    if (pointsSpent > user.points) {
        throw new Error('Customer does not have enough points for that reward.');
    }

    const [order] = await db.transaction(async (tx) => {
        const insertedOrders = await tx.insert(orders).values({
            userId: user.id,
            totalAmount: total,
            pointsEarned,
            pointsRedeemed: pointsSpent,
            status: 'completed',
        }).returning();

        const createdOrder = insertedOrders[0];

        await tx.insert(orderItems).values(
            resolvedItems.map((item) => ({
                orderId: createdOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: item.unitPrice,
            })),
        );

        await tx.update(users).set({
            points: sql`${users.points} + ${pointsEarned} - ${pointsSpent}`,
            totalSpend: sql`${users.totalSpend} + ${total}`,
        }).where(eq(users.id, user.id));

        return insertedOrders;
    });

    const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });

    return {
        success: true,
        orderId: order.id,
        total,
        pointsEarned,
        updatedPoints: updatedUser?.points ?? user.points + pointsEarned - pointsSpent,
    };
}

export async function getUserByPhone(phone: string) {
    const normalized = normalizePhone(phone);
    const user = await db.query.users.findFirst({
        where: eq(users.phone, normalized),
    });
    return user;
}

export async function createOrUpdateUser(phone: string, name?: string) {
    const normalized = normalizePhone(phone);
    const existing = await getUserByPhone(normalized);

    if (existing) {
        if (name) {
            await db.update(users).set({ name }).where(eq(users.id, existing.id));
            return { ...existing, name };
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
    return processSale(data);
}

export async function placeCustomerOrder(data: {
    phone: string;
    items: { productId: number; quantity: number }[];
}) {
    return processSale({
        ...data,
        pointsSpent: 0,
        discountApplied: 0,
    });
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
