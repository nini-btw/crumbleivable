/**
 * Test fixtures for API requests
 * @module tests/helpers/fixtures
 */

import type { CreateOrderPayload } from "@/domain/entities/order";
import type { Product, CookiePiece } from "@/domain/entities/product";

/**
 * Valid order payload with 3 cookies (minimum for checkout)
 */
export const validOrderPayload: CreateOrderPayload = {
  customer: {
    fullName: "Test Customer",
    phone: "+213 555 123 456",
    address: "123 Test Street, Oran, Algeria",
  },
  notes: {
    cookingNote: "Please make them extra crispy",
    giftNote: "Happy Birthday!",
  },
  items: [
    {
      product: {
        id: "test-cookie-1",
        name: "Chocolate Chip",
        slug: "chocolate-chip",
        description: "Classic chocolate chip cookie",
        price: 150,
        displayPrice: 1.50,
        isActive: true,
        type: "cookie",
        images: ["/images/test-cookie.png"],
        createdAt: new Date(),
        updatedAt: new Date(),
        flavour: "Chocolate",
        allergens: ["gluten", "dairy"],
      } as CookiePiece,
      quantity: 2,
    },
    {
      product: {
        id: "test-cookie-2",
        name: "Double Chocolate",
        slug: "double-chocolate",
        description: "Rich double chocolate cookie",
        price: 170,
        displayPrice: 1.70,
        isActive: true,
        type: "cookie",
        images: ["/images/test-cookie.png"],
        createdAt: new Date(),
        updatedAt: new Date(),
        flavour: "Chocolate",
        allergens: ["gluten", "dairy"],
      } as CookiePiece,
      quantity: 1,
    },
  ],
};

/**
 * Valid product payload for POST /api/products
 */
export const validProductPayload: Omit<Product, "id" | "createdAt" | "updatedAt" | "displayPrice"> = {
  name: "Test Cookie",
  slug: "test-cookie",
  description: "A delicious test cookie",
  price: 150,
  isActive: true,
  type: "cookie",
  images: ["/images/test.png"],
  flavour: "Vanilla",
  allergens: ["gluten"],
  isNew: true,
  isSoldOut: false,
};

/**
 * Valid vote candidate payload for PUT /api/votes
 */
export const validVoteCandidatePayload = {
  cookieName: "Lemon Lavender",
  description: "Bright lemon zest with calming lavender notes",
  imageUrl: "/images/test-vote.png",
  isActive: true,
};
