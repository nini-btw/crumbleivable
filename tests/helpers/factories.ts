/**
 * Factory functions for test entities
 * @module tests/helpers/factories
 */

import type { CookiePiece, CookieBox, Product, Allergen } from "@/domain/entities/product";
import type { CartItem, Order, OrderItem, CustomerInfo, OrderNotes, CreateOrderPayload, OrderStatus } from "@/domain/entities/order";
import type { WeeklyDrop, DropStatus, TimeRemaining } from "@/domain/entities/drop";
import type { VoteCandidate, UserVote, VoteResult } from "@/domain/entities/vote";

// Counter for generating unique IDs
let idCounter = 0;

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = "test"): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Factory for creating a CookiePiece
 */
export function createCookiePiece(overrides?: Partial<CookiePiece>): CookiePiece {
  const id = generateId("cookie");
  return {
    id,
    name: `Test Cookie ${id}`,
    slug: `test-cookie-${id}`,
    description: "A delicious test cookie",
    price: 150,
    isActive: true,
    type: "cookie",
    images: ["/images/test-cookie.png"],
    createdAt: new Date(),
    updatedAt: new Date(),
    flavour: "Chocolate",
    allergens: ["gluten", "dairy"] as Allergen[],
    isNew: false,
    isSoldOut: false,
    ...overrides,
  };
}

/**
 * Factory for creating a CookieBox
 */
export function createCookieBox(overrides?: Partial<CookieBox>): CookieBox {
  const id = generateId("box");
  return {
    id,
    name: `Test Box ${id}`,
    slug: `test-box-${id}`,
    description: "A delicious test cookie box",
    price: 450,
    isActive: true,
    type: "box",
    images: ["/images/test-box.png"],
    createdAt: new Date(),
    updatedAt: new Date(),
    includedCookies: [
      { productId: generateId("cookie"), productName: "Test Cookie 1", quantity: 2 },
      { productId: generateId("cookie"), productName: "Test Cookie 2", quantity: 1 },
    ],
    ...overrides,
  };
}

/**
 * Factory for creating a Product (cookie or box)
 */
export function createProduct(type: "cookie" | "box" = "cookie", overrides?: Partial<Product>): Product {
  if (type === "cookie") {
    return createCookiePiece(overrides as Partial<CookiePiece>);
  }
  return createCookieBox(overrides as Partial<CookieBox>);
}

/**
 * Factory for creating a CartItem
 */
export function createCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    product: createCookiePiece(),
    quantity: 1,
    ...overrides,
  };
}

/**
 * Factory for creating CustomerInfo
 */
export function createCustomerInfo(overrides?: Partial<CustomerInfo>): CustomerInfo {
  return {
    fullName: "Test Customer",
    phone: "+213 555 123 456",
    address: "123 Test Street, Oran, Algeria",
    ...overrides,
  };
}

/**
 * Factory for creating OrderNotes
 */
export function createOrderNotes(overrides?: Partial<OrderNotes>): OrderNotes {
  return {
    cookingNote: "Please make them extra crispy",
    giftNote: "Happy Birthday!",
    ...overrides,
  };
}

/**
 * Factory for creating an OrderItem
 */
export function createOrderItem(overrides?: Partial<OrderItem>): OrderItem {
  const id = generateId("item");
  return {
    id,
    orderId: generateId("order"),
    productId: generateId("product"),
    productType: "cookie",
    productName: "Test Cookie",
    productSlug: "test-cookie",
    productImage: "/images/test-cookie.png",
    quantity: 1,
    priceSnapshot: 150,
    ...overrides,
  };
}

/**
 * Factory for creating an Order
 */
export function createOrder(overrides?: Partial<Order>): Order {
  const id = generateId("order");
  const now = new Date();
  return {
    id,
    fullName: "Test Customer",
    phone: "+213 555 123 456",
    address: "123 Test Street, Oran, Algeria",
    cookingNote: "Please make them extra crispy",
    giftNote: "Happy Birthday!",
    items: [createOrderItem({ orderId: id })],
    status: "pending" as OrderStatus,
    totalAmount: 450,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Factory for creating CreateOrderPayload
 */
export function createOrderPayload(overrides?: Partial<CreateOrderPayload>): CreateOrderPayload {
  return {
    customer: createCustomerInfo(),
    notes: createOrderNotes(),
    items: [
      createCartItem({ product: createCookiePiece(), quantity: 3 }),
    ],
    ...overrides,
  };
}

/**
 * Factory for creating a WeeklyDrop
 */
export function createWeeklyDrop(overrides?: Partial<WeeklyDrop>): WeeklyDrop {
  const id = generateId("drop");
  const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  return {
    id,
    productId: generateId("cookie"),
    product: createCookiePiece(),
    scheduledAt,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Factory for creating a VoteCandidate
 */
export function createVoteCandidate(overrides?: Partial<VoteCandidate>): VoteCandidate {
  const id = generateId("vote");
  return {
    id,
    cookieName: `Test Cookie ${id}`,
    description: "A delicious retired flavor",
    imageUrl: "/images/test-vote.png",
    voteCount: 0,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Factory for creating a UserVote
 */
export function createUserVote(overrides?: Partial<UserVote>): UserVote {
  return {
    candidateId: generateId("vote"),
    votedAt: new Date(),
    ...overrides,
  };
}

/**
 * Factory for creating a VoteResult
 */
export function createVoteResult(overrides?: Partial<VoteResult>): VoteResult {
  const id = generateId("vote");
  return {
    id,
    cookieName: `Test Cookie ${id}`,
    description: "A delicious retired flavor",
    imageUrl: "/images/test-vote.png",
    voteCount: 10,
    isActive: true,
    createdAt: new Date(),
    percentage: 25,
    userHasVoted: false,
    ...overrides,
  };
}

/**
 * Create multiple cart items with specified quantities
 */
export function createCartItems(config: Array<{ type: "cookie" | "box"; quantity: number; price?: number }>): CartItem[] {
  return config.map((item) => ({
    product: createProduct(item.type, item.price ? { price: item.price } : undefined),
    quantity: item.quantity,
  }));
}
