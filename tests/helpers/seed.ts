/**
 * Database seeding and cleanup helpers for tests
 * @module tests/helpers/seed
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, like } from "drizzle-orm";
import * as schema from "@/infrastructure/db/schema";
import type { CreateOrderPayload } from "@/domain/entities/order";

const connectionString = process.env.TEST_DATABASE_URL;

if (!connectionString) {
  throw new Error("TEST_DATABASE_URL environment variable is required for tests");
}

// Create connection for seeding
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

/**
 * Seed a test product
 */
export async function seedProduct(overrides?: Partial<typeof schema.products.$inferInsert>) {
  const productData = {
    name: `Test Product ${Date.now()}`,
    slug: `test-product-${Date.now()}`,
    description: "A test product",
    price: 150,
    isActive: true,
    type: "cookie" as const,
    images: ["/images/test.png"],
    flavour: "Chocolate",
    allergens: ["gluten"],
    ...overrides,
  };

  const [product] = await db.insert(schema.products).values(productData).returning();
  return product;
}

/**
 * Seed a test order with items
 */
export async function seedOrder(overrides?: Partial<CreateOrderPayload>) {
  const orderData = {
    fullName: "Test Customer",
    phone: "+213 555 123 456",
    address: "123 Test Street",
    status: "pending" as const,
    totalAmount: 450,
    ...overrides?.customer,
  };

  // Create order
  const [order] = await db.insert(schema.orders).values(orderData).returning();

  // Create order items
  const items = overrides?.items || [
    { productId: "test-1", productType: "cookie" as const, productName: "Cookie 1", productSlug: "cookie-1", quantity: 2, priceSnapshot: 150 },
    { productId: "test-2", productType: "cookie" as const, productName: "Cookie 2", productSlug: "cookie-2", quantity: 1, priceSnapshot: 150 },
  ];

  const orderItems = await db
    .insert(schema.orderItems)
    .values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productType: item.productType,
        productName: item.productName,
        productSlug: item.productSlug,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
      }))
    )
    .returning();

  return { ...order, items: orderItems };
}

/**
 * Seed a test vote candidate
 */
export async function seedVoteCandidate(overrides?: Partial<typeof schema.voteCandidates.$inferInsert>) {
  const candidateData = {
    cookieName: `Test Cookie ${Date.now()}`,
    description: "A test vote candidate",
    imageUrl: "/images/test.png",
    isActive: true,
    voteCount: 0,
    ...overrides,
  };

  const [candidate] = await db.insert(schema.voteCandidates).values(candidateData).returning();
  return candidate;
}

/**
 * Clean up test products
 */
export async function cleanProducts() {
  await db.delete(schema.products).where(like(schema.products.slug, "test-product-%"));
}

/**
 * Clean up test orders
 */
export async function cleanOrders() {
  // Order items are cascade deleted
  await db.delete(schema.orders).where(like(schema.orders.fullName, "Test Customer%"));
}

/**
 * Clean up test vote candidates
 */
export async function cleanVoteCandidates() {
  await db.delete(schema.voteCandidates).where(like(schema.voteCandidates.cookieName, "Test Cookie%"));
}

/**
 * Close database connection
 */
export async function closeConnection() {
  await client.end();
}
