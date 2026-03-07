import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    phone: text('phone').notNull().unique(),
    name: text('name'),
    points: integer('points').notNull().default(0),
    totalSpend: real('total_spend').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    category: text('category').notNull(),
    strainType: text('strain_type'), // Indica, Sativa, Hybrid
    thc: text('thc'),
    description: text('description'),
    price: real('price').notNull(),
    imageUrl: text('image_url'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const orders = sqliteTable('orders', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id),
    totalAmount: real('total_amount').notNull(),
    pointsEarned: integer('points_earned').notNull(),
    pointsRedeemed: integer('points_redeemed').notNull().default(0),
    status: text('status').notNull().default('completed'), // completed, pending, cancelled
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const orderItems = sqliteTable('order_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id').references(() => orders.id),
    productId: integer('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    priceAtTime: real('price_at_time').notNull(),
});
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));
