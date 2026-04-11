/**
 * Drizzle ORM database schema
 * @module infrastructure/db/schema
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Product type enum
 */
export const productTypeEnum = pgEnum("product_type", ["cookie", "box"]);

/**
 * Order status enum
 */
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
]);

/**
 * Products table
 */
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents/smallest currency unit
  isActive: boolean("is_active").default(true).notNull(),
  type: productTypeEnum("type").notNull(),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  // Cookie-specific fields
  flavour: varchar("flavour", { length: 255 }),
  allergens: jsonb("allergens").$type<string[]>().default([]),
  isNew: boolean("is_new").default(false),
  isSoldOut: boolean("is_sold_out").default(false),
  // Box-specific fields
  includedCookies: jsonb("included_cookies").$type<
    { cookiePieceId: string; quantity: number }[]
  >(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Orders table
 */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: text("address").notNull(),
  cookingNote: text("cooking_note"),
  giftNote: text("gift_note"),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Order items table
 */
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull(),
  productType: productTypeEnum("product_type").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productSlug: varchar("product_slug", { length: 255 }).notNull(),
  productImage: varchar("product_image", { length: 500 }),
  quantity: integer("quantity").notNull(),
  priceSnapshot: integer("price_snapshot").notNull(),
});

/**
 * Vote candidates table
 */
export const voteCandidates = pgTable("vote_candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  cookieName: varchar("cookie_name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  voteCount: integer("vote_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Weekly drops table
 */
export const weeklyDrops = pgTable("weekly_drops", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  revealedAt: timestamp("revealed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Admin users table
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Type definitions
 */
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type VoteCandidate = typeof voteCandidates.$inferSelect;
export type NewVoteCandidate = typeof voteCandidates.$inferInsert;
export type WeeklyDrop = typeof weeklyDrops.$inferSelect;
export type NewWeeklyDrop = typeof weeklyDrops.$inferInsert;
