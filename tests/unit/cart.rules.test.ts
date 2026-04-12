/**
 * Cart business rules unit tests
 * @module tests/unit/cart.rules
 */

import { describe, it, expect } from "vitest";
import {
  MIN_COOKIES,
  BOX_COOKIE_EQUIVALENT,
  totalCookieCount,
  canCheckout,
  cookiesNeeded,
  calculateCartTotal,
  getCartProgress,
  getTotalItemCount,
  groupCartItems,
  findCartItem,
  hasProductInCart,
} from "@/domain/rules/cart.rules";
import { createCookiePiece, createCookieBox, createCartItems, createCartItem } from "@/tests/helpers/factories";

describe("Cart Rules", () => {
  describe("constants", () => {
    it("should have MIN_COOKIES equal to 3", () => {
      expect(MIN_COOKIES).toBe(3);
    });

    it("should have BOX_COOKIE_EQUIVALENT equal to 3", () => {
      expect(BOX_COOKIE_EQUIVALENT).toBe(3);
    });
  });

  describe("totalCookieCount", () => {
    it("should return 0 for empty array", () => {
      expect(totalCookieCount([])).toBe(0);
    });

    it("should return 1 for 1 cookie quantity 1", () => {
      const items = createCartItems([{ type: "cookie", quantity: 1 }]);
      expect(totalCookieCount(items)).toBe(1);
    });

    it("should return 2 for 2 cookies quantity 1 each", () => {
      const items = createCartItems([
        { type: "cookie", quantity: 1 },
        { type: "cookie", quantity: 1 },
      ]);
      expect(totalCookieCount(items)).toBe(2);
    });

    it("should return 3 for 1 cookie quantity 3", () => {
      const items = createCartItems([{ type: "cookie", quantity: 3 }]);
      expect(totalCookieCount(items)).toBe(3);
    });

    it("should return 3 for 1 box quantity 1 (box always = 3)", () => {
      const items = createCartItems([{ type: "box", quantity: 1 }]);
      expect(totalCookieCount(items)).toBe(3);
    });

    it("should return 4 for 1 box + 1 cookie", () => {
      const items = createCartItems([
        { type: "box", quantity: 1 },
        { type: "cookie", quantity: 1 },
      ]);
      expect(totalCookieCount(items)).toBe(4);
    });

    it("should return 6 for 2 boxes", () => {
      const items = createCartItems([{ type: "box", quantity: 2 }]);
      expect(totalCookieCount(items)).toBe(6);
    });

    it("should return 8 for 2 boxes + 2 cookies", () => {
      const items = createCartItems([
        { type: "box", quantity: 2 },
        { type: "cookie", quantity: 2 },
      ]);
      expect(totalCookieCount(items)).toBe(8);
    });

    it("should handle mixed quantities correctly", () => {
      const items = createCartItems([
        { type: "cookie", quantity: 5 }, // 5 cookies
        { type: "box", quantity: 2 },    // 6 cookie equivalents
      ]);
      expect(totalCookieCount(items)).toBe(11);
    });
  });

  describe("canCheckout", () => {
    it("should return false for 0 items", () => {
      expect(canCheckout([])).toBe(false);
    });

    it("should return false for 2 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 2 }]);
      expect(canCheckout(items)).toBe(false);
    });

    it("should return true for exactly 3 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 3 }]);
      expect(canCheckout(items)).toBe(true);
    });

    it("should return true for 1 box (box = 3)", () => {
      const items = createCartItems([{ type: "box", quantity: 1 }]);
      expect(canCheckout(items)).toBe(true);
    });

    it("should return true for 4 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 4 }]);
      expect(canCheckout(items)).toBe(true);
    });

    it("should return true for 2 boxes (6 cookie equivalents)", () => {
      const items = createCartItems([{ type: "box", quantity: 2 }]);
      expect(canCheckout(items)).toBe(true);
    });
  });

  describe("cookiesNeeded", () => {
    it("should return 3 for 0 items", () => {
      expect(cookiesNeeded([])).toBe(3);
    });

    it("should return 2 for 1 cookie", () => {
      const items = createCartItems([{ type: "cookie", quantity: 1 }]);
      expect(cookiesNeeded(items)).toBe(2);
    });

    it("should return 1 for 2 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 2 }]);
      expect(cookiesNeeded(items)).toBe(1);
    });

    it("should return 0 for 3 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 3 }]);
      expect(cookiesNeeded(items)).toBe(0);
    });

    it("should return 0 for 4 cookies (never negative)", () => {
      const items = createCartItems([{ type: "cookie", quantity: 4 }]);
      expect(cookiesNeeded(items)).toBe(0);
    });

    it("should return 0 for 1 box", () => {
      const items = createCartItems([{ type: "box", quantity: 1 }]);
      expect(cookiesNeeded(items)).toBe(0);
    });
  });

  describe("getCartProgress", () => {
    it("should return 0 for 0 items", () => {
      expect(getCartProgress([])).toBe(0);
    });

    it("should return ~33 for 1 cookie", () => {
      const items = createCartItems([{ type: "cookie", quantity: 1 }]);
      expect(getCartProgress(items)).toBeCloseTo(33.33, 1);
    });

    it("should return ~66 for 2 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 2 }]);
      expect(getCartProgress(items)).toBeCloseTo(66.67, 1);
    });

    it("should return 100 for 3 cookies", () => {
      const items = createCartItems([{ type: "cookie", quantity: 3 }]);
      expect(getCartProgress(items)).toBe(100);
    });

    it("should return 100 for 4 cookies (capped, never over 100)", () => {
      const items = createCartItems([{ type: "cookie", quantity: 4 }]);
      expect(getCartProgress(items)).toBe(100);
    });

    it("should return 100 for 1 box", () => {
      const items = createCartItems([{ type: "box", quantity: 1 }]);
      expect(getCartProgress(items)).toBe(100);
    });
  });

  describe("calculateCartTotal", () => {
    it("should return 0 for empty cart", () => {
      expect(calculateCartTotal([])).toBe(0);
    });

    it("should return 1000 for 1 item price 500 quantity 2", () => {
      const items = createCartItems([{ type: "cookie", quantity: 2, price: 500 }]);
      expect(calculateCartTotal(items)).toBe(1000);
    });

    it("should return correct sum for 2 items different prices", () => {
      const items = [
        createCartItem({ product: createCookiePiece({ price: 100 }), quantity: 2 }),
        createCartItem({ product: createCookiePiece({ price: 150 }), quantity: 1 }),
      ];
      expect(calculateCartTotal(items)).toBe(350); // (100 * 2) + (150 * 1) = 350
    });

    it("should calculate correctly with boxes", () => {
      const items = [
        createCartItem({ product: createCookieBox({ price: 400 }), quantity: 1 }),
        createCartItem({ product: createCookiePiece({ price: 150 }), quantity: 2 }),
      ];
      expect(calculateCartTotal(items)).toBe(700); // 400 + (150 * 2) = 700
    });
  });

  describe("getTotalItemCount", () => {
    it("should return 0 for empty cart", () => {
      expect(getTotalItemCount([])).toBe(0);
    });

    it("should return 6 for 2 items quantity 3 each", () => {
      const items = createCartItems([
        { type: "cookie", quantity: 3 },
        { type: "cookie", quantity: 3 },
      ]);
      expect(getTotalItemCount(items)).toBe(6);
    });

    it("should sum all quantities", () => {
      const items = createCartItems([
        { type: "cookie", quantity: 1 },
        { type: "box", quantity: 2 },
        { type: "cookie", quantity: 3 },
      ]);
      expect(getTotalItemCount(items)).toBe(6); // 1 + 2 + 3 = 6
    });
  });

  describe("groupCartItems", () => {
    it("should return empty arrays for empty cart", () => {
      const result = groupCartItems([]);
      expect(result.cookies).toHaveLength(0);
      expect(result.boxes).toHaveLength(0);
    });

    it("should group cookies correctly", () => {
      const items = createCartItems([
        { type: "cookie", quantity: 1 },
        { type: "cookie", quantity: 2 },
      ]);
      const result = groupCartItems(items);
      expect(result.cookies).toHaveLength(2);
      expect(result.boxes).toHaveLength(0);
    });

    it("should group boxes correctly", () => {
      const items = createCartItems([
        { type: "box", quantity: 1 },
        { type: "box", quantity: 1 },
      ]);
      const result = groupCartItems(items);
      expect(result.cookies).toHaveLength(0);
      expect(result.boxes).toHaveLength(2);
    });

    it("should group mixed items correctly", () => {
      const items = createCartItems([
        { type: "cookie", quantity: 1 },
        { type: "box", quantity: 1 },
        { type: "cookie", quantity: 1 },
      ]);
      const result = groupCartItems(items);
      expect(result.cookies).toHaveLength(2);
      expect(result.boxes).toHaveLength(1);
    });
  });

  describe("findCartItem", () => {
    it("should return undefined for empty cart", () => {
      expect(findCartItem([], "any-id")).toBeUndefined();
    });

    it("should find item by product id", () => {
      const cookie = createCookiePiece();
      const items = [createCartItem({ product: cookie, quantity: 2 })];
      const result = findCartItem(items, cookie.id);
      expect(result).toBeDefined();
      expect(result?.product.id).toBe(cookie.id);
    });

    it("should return undefined for non-existent id", () => {
      const items = createCartItems([{ type: "cookie", quantity: 1 }]);
      expect(findCartItem(items, "non-existent")).toBeUndefined();
    });

    it("should find correct item among multiple", () => {
      const cookie1 = createCookiePiece();
      const cookie2 = createCookiePiece();
      const items = [
        createCartItem({ product: cookie1, quantity: 1 }),
        createCartItem({ product: cookie2, quantity: 2 }),
      ];
      const result = findCartItem(items, cookie2.id);
      expect(result?.product.id).toBe(cookie2.id);
      expect(result?.quantity).toBe(2);
    });
  });

  describe("hasProductInCart", () => {
    it("should return false for empty cart", () => {
      expect(hasProductInCart([], "any-id")).toBe(false);
    });

    it("should return true when product is in cart", () => {
      const cookie = createCookiePiece();
      const items = [createCartItem({ product: cookie })];
      expect(hasProductInCart(items, cookie.id)).toBe(true);
    });

    it("should return false when product is not in cart", () => {
      const items = createCartItems([{ type: "cookie", quantity: 1 }]);
      expect(hasProductInCart(items, "non-existent")).toBe(false);
    });
  });
});
