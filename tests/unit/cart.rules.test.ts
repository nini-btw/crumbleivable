/**
 * Cart business rules unit tests
 * @module tests/unit/cart
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
} from "@/domain/rules/cart.rules";
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

describe("Cart Rules", () => {
  describe("totalCookieCount", () => {
    it("should return 0 for empty array", () => {
      expect(totalCookieCount([])).toBe(0);
    });

    it("should return 1 for 1 cookie quantity 1", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 1 }];
      expect(totalCookieCount(items)).toBe(1);
    });

    it("should return 2 for 2 cookies quantity 1 each", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 1 },
        { product: createCookie("2"), quantity: 1 },
      ];
      expect(totalCookieCount(items)).toBe(2);
    });

    it("should return 3 for 1 cookie quantity 3", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 3 }];
      expect(totalCookieCount(items)).toBe(3);
    });

    it("should return 3 for 1 box quantity 1 (box always = 3)", () => {
      const items: CartItem[] = [{ product: createBox("1"), quantity: 1 }];
      expect(totalCookieCount(items)).toBe(3);
    });

    it("should return 4 for 1 box + 1 cookie", () => {
      const items: CartItem[] = [
        { product: createBox("1"), quantity: 1 },
        { product: createCookie("1"), quantity: 1 },
      ];
      expect(totalCookieCount(items)).toBe(4);
    });

    it("should return 6 for 2 boxes", () => {
      const items: CartItem[] = [{ product: createBox("1"), quantity: 2 }];
      expect(totalCookieCount(items)).toBe(6);
    });

    it("should return 8 for 2 boxes + 2 cookies", () => {
      const items: CartItem[] = [
        { product: createBox("1"), quantity: 2 },
        { product: createCookie("1"), quantity: 2 },
      ];
      expect(totalCookieCount(items)).toBe(8);
    });
  });

  describe("canCheckout", () => {
    it("should return false for 0 items", () => {
      expect(canCheckout([])).toBe(false);
    });

    it("should return false for 2 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 2 }];
      expect(canCheckout(items)).toBe(false);
    });

    it("should return true for exactly 3 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 3 }];
      expect(canCheckout(items)).toBe(true);
    });

    it("should return true for 1 box (box = 3)", () => {
      const items: CartItem[] = [{ product: createBox("1"), quantity: 1 }];
      expect(canCheckout(items)).toBe(true);
    });

    it("should return true for 4 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 4 }];
      expect(canCheckout(items)).toBe(true);
    });
  });

  describe("cookiesNeeded", () => {
    it("should return 3 for 0 items", () => {
      expect(cookiesNeeded([])).toBe(3);
    });

    it("should return 2 for 1 cookie", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 1 }];
      expect(cookiesNeeded(items)).toBe(2);
    });

    it("should return 1 for 2 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 2 }];
      expect(cookiesNeeded(items)).toBe(1);
    });

    it("should return 0 for 3 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 3 }];
      expect(cookiesNeeded(items)).toBe(0);
    });

    it("should return 0 for 4 cookies (never negative)", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 4 }];
      expect(cookiesNeeded(items)).toBe(0);
    });
  });

  describe("getCartProgress", () => {
    it("should return 0 for 0 items", () => {
      expect(getCartProgress([])).toBe(0);
    });

    it("should return 33 for 1 cookie", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 1 }];
      expect(getCartProgress(items)).toBe(33);
    });

    it("should return 66 for 2 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 2 }];
      expect(getCartProgress(items)).toBe(66);
    });

    it("should return 100 for 3 cookies", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 3 }];
      expect(getCartProgress(items)).toBe(100);
    });

    it("should return 100 for 4 cookies (capped, never over 100)", () => {
      const items: CartItem[] = [{ product: createCookie("1"), quantity: 4 }];
      expect(getCartProgress(items)).toBe(100);
    });
  });

  describe("calculateCartTotal", () => {
    it("should return 1000 for 1 item price 500 quantity 2", () => {
      const items: CartItem[] = [
        { product: createCookie("1", 500), quantity: 2 },
      ];
      expect(calculateCartTotal(items)).toBe(1000);
    });

    it("should return correct sum for 2 items different prices", () => {
      const items: CartItem[] = [
        { product: createCookie("1", 100), quantity: 2 },
        { product: createCookie("2", 150), quantity: 1 },
      ];
      expect(calculateCartTotal(items)).toBe(350);
    });
  });

  describe("getTotalItemCount", () => {
    it("should return 6 for 2 items quantity 3 each", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 3 },
        { product: createCookie("2"), quantity: 3 },
      ];
      expect(getTotalItemCount(items)).toBe(6);
    });
  });
});
