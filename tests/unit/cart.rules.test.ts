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
  isActive: true,
  type: "box",
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  includedCookies: [],
});

describe("Cart Rules", () => {
  describe("totalCookieCount", () => {
    it("should count cookies correctly", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 2 },
        { product: createCookie("2"), quantity: 1 },
      ];
      expect(totalCookieCount(items)).toBe(3);
    });

    it("should count boxes as 3 cookies each", () => {
      const items: CartItem[] = [
        { product: createBox("1"), quantity: 1 },
      ];
      expect(totalCookieCount(items)).toBe(3);
    });

    it("should handle mixed cart correctly", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 1 },
        { product: createBox("1"), quantity: 1 },
      ];
      expect(totalCookieCount(items)).toBe(4);
    });

    it("should return 0 for empty cart", () => {
      expect(totalCookieCount([])).toBe(0);
    });
  });

  describe("canCheckout", () => {
    it("should allow checkout with 3+ cookies", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 3 },
      ];
      expect(canCheckout(items)).toBe(true);
    });

    it("should allow checkout with one box", () => {
      const items: CartItem[] = [
        { product: createBox("1"), quantity: 1 },
      ];
      expect(canCheckout(items)).toBe(true);
    });

    it("should deny checkout with less than 3 cookies", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 2 },
      ];
      expect(canCheckout(items)).toBe(false);
    });
  });

  describe("cookiesNeeded", () => {
    it("should return 0 when minimum is met", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 3 },
      ];
      expect(cookiesNeeded(items)).toBe(0);
    });

    it("should return correct amount needed", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 1 },
      ];
      expect(cookiesNeeded(items)).toBe(2);
    });
  });

  describe("calculateCartTotal", () => {
    it("should calculate total correctly", () => {
      const items: CartItem[] = [
        { product: createCookie("1", 100), quantity: 2 },
        { product: createCookie("2", 150), quantity: 1 },
      ];
      expect(calculateCartTotal(items)).toBe(350);
    });

    it("should return 0 for empty cart", () => {
      expect(calculateCartTotal([])).toBe(0);
    });
  });

  describe("getCartProgress", () => {
    it("should return 0 for empty cart", () => {
      expect(getCartProgress([])).toBe(0);
    });

    it("should return 33% for 1 cookie", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 1 },
      ];
      expect(getCartProgress(items)).toBe(33);
    });

    it("should return 100% for 3+ cookies", () => {
      const items: CartItem[] = [
        { product: createCookie("1"), quantity: 5 },
      ];
      expect(getCartProgress(items)).toBe(100);
    });
  });
});
