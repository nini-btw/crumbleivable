/**
 * Cart service unit tests
 * @module tests/unit/cart
 */

import { describe, it, expect } from "vitest";
import { cartService } from "@/application/services/cart.service";
import type { CartItem } from "@/domain/entities/order";
import type { CookiePiece, CookieBox } from "@/domain/entities/product";

/**
 * Create mock cookie
 */
const createCookie = (id: string, price: number = 100): CookiePiece => ({
  id,
  name: `Cookie ${id}`,
  slug: `cookie-${id}`,
  description: "Test cookie",
  price,
  displayPrice: price / 100,
  isActive: true,
  type: "cookie",
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  flavour: "Chocolate",
  allergens: [],
});

/**
 * Create mock box
 */
const createBox = (id: string, price: number = 400): CookieBox => ({
  id,
  name: `Box ${id}`,
  slug: `box-${id}`,
  description: "Test box",
  price,
  displayPrice: price / 100,
  isActive: true,
  type: "box",
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  includedCookies: [],
});

describe("CartService", () => {
  describe("addItem", () => {
    it("should add new product and increase items length by 1", () => {
      const items: CartItem[] = [];
      const product = createCookie("1");
      
      const result = cartService.addItem(items, product, 1);
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].product.id).toBe("1");
      expect(result.items[0].quantity).toBe(1);
    });

    it("should increment quantity when same product added again", () => {
      const product = createCookie("1");
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.addItem(items, product, 1);
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].quantity).toBe(2);
    });

    it("should use default quantity of 1 when not passed", () => {
      const items: CartItem[] = [];
      const product = createCookie("1");
      
      const result = cartService.addItem(items, product);
      
      expect(result.items[0].quantity).toBe(1);
    });

    it("should return success true and correct message", () => {
      const items: CartItem[] = [];
      const product = createCookie("1");
      
      const result = cartService.addItem(items, product, 1);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain("Cookie 1");
      expect(result.message).toContain("added to cart");
    });
  });

  describe("removeItem", () => {
    it("should remove existing item and return success true", () => {
      const product = createCookie("1");
      const items: CartItem[] = [{ product, quantity: 2 }];
      
      const result = cartService.removeItem(items, "1");
      
      expect(result.success).toBe(true);
      expect(result.items.length).toBe(0);
    });

    it("should return success false for nonexistent id", () => {
      const product = createCookie("1");
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.removeItem(items, "nonexistent");
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Item not found in cart");
      expect(result.items.length).toBe(1);
    });
  });

  describe("updateQuantity", () => {
    it("should remove item when quantity is 0", () => {
      const product = createCookie("1");
      const items: CartItem[] = [{ product, quantity: 2 }];
      
      const result = cartService.updateQuantity(items, "1", 0);
      
      expect(result.items.length).toBe(0);
      expect(result.success).toBe(true);
    });

    it("should set quantity to 2", () => {
      const product = createCookie("1");
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.updateQuantity(items, "1", 2);
      
      expect(result.items[0].quantity).toBe(2);
      expect(result.success).toBe(true);
    });

    it("should return success false for nonexistent id", () => {
      const product = createCookie("1");
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.updateQuantity(items, "nonexistent", 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Item not found in cart");
    });
  });

  describe("clearCart", () => {
    it("should always return empty items array and success true", () => {
      const product = createCookie("1");
      const items: CartItem[] = [
        { product, quantity: 3 },
        { product: createCookie("2"), quantity: 2 },
      ];
      
      const result = cartService.clearCart();
      
      expect(result.success).toBe(true);
      expect(result.items.length).toBe(0);
      expect(result.message).toBe("Cart cleared");
    });
  });

  describe("getCartSummary", () => {
    it("should return object with all 6 fields", () => {
      const items: CartItem[] = [
        { product: createCookie("1", 100), quantity: 2 },
        { product: createCookie("2", 150), quantity: 1 },
      ];
      
      const summary = cartService.getCartSummary(items);
      
      expect(summary).toHaveProperty("itemCount");
      expect(summary).toHaveProperty("cookieCount");
      expect(summary).toHaveProperty("totalAmount");
      expect(summary).toHaveProperty("canCheckout");
      expect(summary).toHaveProperty("cookiesNeeded");
      expect(summary).toHaveProperty("progress");
    });

    it("with 1 box: canCheckout is true, cookieCount is 3", () => {
      const items: CartItem[] = [
        { product: createBox("1", 900), quantity: 1 },
      ];
      
      const summary = cartService.getCartSummary(items);
      
      expect(summary.canCheckout).toBe(true);
      expect(summary.cookieCount).toBe(3);
      expect(summary.cookiesNeeded).toBe(0);
    });
  });
});
