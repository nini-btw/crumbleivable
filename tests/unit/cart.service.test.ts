/**
 * Cart service unit tests
 * @module tests/unit/cart.service
 */

import { describe, it, expect, beforeEach } from "vitest";
import { cartService, CartOperationResult } from "@/application/services/cart.service";
import { createCookiePiece, createCookieBox, createCartItem } from "@/tests/helpers/factories";
import type { CartItem } from "@/domain/entities/order";

describe("CartService", () => {
  describe("addItem", () => {
    it("should add new product and increase items length by 1", () => {
      const items: CartItem[] = [];
      const product = createCookiePiece();
      
      const result = cartService.addItem(items, product, 1);
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].product.id).toBe(product.id);
      expect(result.items[0].quantity).toBe(1);
    });

    it("should increment quantity when same product added again", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.addItem(items, product, 1);
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].quantity).toBe(2);
    });

    it("should use default quantity of 1 when not passed", () => {
      const items: CartItem[] = [];
      const product = createCookiePiece();
      
      const result = cartService.addItem(items, product);
      
      expect(result.items[0].quantity).toBe(1);
    });

    it("should return success true and correct message", () => {
      const items: CartItem[] = [];
      const product = createCookiePiece({ name: "Choco Chip" });
      
      const result = cartService.addItem(items, product, 1);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain("Choco Chip");
      expect(result.message).toContain("added to cart");
    });

    it("should add different products as separate items", () => {
      const product1 = createCookiePiece();
      const product2 = createCookiePiece();
      const items: CartItem[] = [{ product: product1, quantity: 1 }];
      
      const result = cartService.addItem(items, product2, 1);
      
      expect(result.items.length).toBe(2);
    });

    it("should add specified quantity", () => {
      const items: CartItem[] = [];
      const product = createCookiePiece();
      
      const result = cartService.addItem(items, product, 5);
      
      expect(result.items[0].quantity).toBe(5);
    });
  });

  describe("removeItem", () => {
    it("should remove existing item and return success true", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 2 }];
      
      const result = cartService.removeItem(items, product.id);
      
      expect(result.success).toBe(true);
      expect(result.items.length).toBe(0);
    });

    it("should return success false for nonexistent id", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.removeItem(items, "nonexistent");
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Item not found in cart");
      expect(result.items.length).toBe(1);
    });

    it("should return message with product name when removed", () => {
      const product = createCookiePiece({ name: "Test Cookie" });
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.removeItem(items, product.id);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain("Test Cookie");
      expect(result.message).toContain("removed from cart");
    });
  });

  describe("updateQuantity", () => {
    it("should remove item when quantity is 0", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 2 }];
      
      const result = cartService.updateQuantity(items, product.id, 0);
      
      expect(result.items.length).toBe(0);
      expect(result.success).toBe(true);
    });

    it("should set quantity to specified value", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.updateQuantity(items, product.id, 5);
      
      expect(result.items[0].quantity).toBe(5);
      expect(result.success).toBe(true);
    });

    it("should return success false for nonexistent id", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 1 }];
      
      const result = cartService.updateQuantity(items, "nonexistent", 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Item not found in cart");
    });

    it("should remove item when quantity is less than 1", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [{ product, quantity: 2 }];
      
      const result = cartService.updateQuantity(items, product.id, -1);
      
      expect(result.items.length).toBe(0);
    });
  });

  describe("clearCart", () => {
    it("should always return empty items array and success true", () => {
      const product = createCookiePiece();
      const items: CartItem[] = [
        { product, quantity: 3 },
        { product: createCookiePiece(), quantity: 2 },
      ];
      
      const result = cartService.clearCart();
      
      expect(result.success).toBe(true);
      expect(result.items.length).toBe(0);
      expect(result.message).toBe("Cart cleared");
    });

    it("should work even with empty cart", () => {
      const result = cartService.clearCart();
      
      expect(result.success).toBe(true);
      expect(result.items.length).toBe(0);
    });
  });

  describe("getCartSummary", () => {
    it("should return object with all 6 fields", () => {
      const items: CartItem[] = [
        createCartItem({ product: createCookiePiece({ price: 100 }), quantity: 2 }),
        createCartItem({ product: createCookiePiece({ price: 150 }), quantity: 1 }),
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
        createCartItem({ product: createCookieBox({ price: 900 }), quantity: 1 }),
      ];
      
      const summary = cartService.getCartSummary(items);
      
      expect(summary.canCheckout).toBe(true);
      expect(summary.cookieCount).toBe(3);
      expect(summary.cookiesNeeded).toBe(0);
      expect(summary.progress).toBe(100);
    });

    it("should calculate correct totals for mixed items", () => {
      const items: CartItem[] = [
        createCartItem({ product: createCookiePiece({ price: 100 }), quantity: 2 }), // 200, 2 cookies
        createCartItem({ product: createCookieBox({ price: 400 }), quantity: 1 }),   // 400, 3 cookies
      ];
      
      const summary = cartService.getCartSummary(items);
      
      expect(summary.itemCount).toBe(3);     // 2 + 1
      expect(summary.cookieCount).toBe(5);   // 2 + 3
      expect(summary.totalAmount).toBe(600); // 200 + 400
      expect(summary.canCheckout).toBe(true);
      expect(summary.cookiesNeeded).toBe(0);
    });

    it("should correctly report when checkout is not allowed", () => {
      const items: CartItem[] = [
        createCartItem({ product: createCookiePiece({ price: 100 }), quantity: 2 }), // Only 2 cookies
      ];
      
      const summary = cartService.getCartSummary(items);
      
      expect(summary.canCheckout).toBe(false);
      expect(summary.cookiesNeeded).toBe(1);
      expect(summary.progress).toBeCloseTo(66.67, 1);
    });

    it("should handle empty cart", () => {
      const summary = cartService.getCartSummary([]);
      
      expect(summary.itemCount).toBe(0);
      expect(summary.cookieCount).toBe(0);
      expect(summary.totalAmount).toBe(0);
      expect(summary.canCheckout).toBe(false);
      expect(summary.cookiesNeeded).toBe(3);
      expect(summary.progress).toBe(0);
    });
  });
});
