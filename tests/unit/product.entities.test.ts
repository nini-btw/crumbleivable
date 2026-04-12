/**
 * Product entity unit tests
 * @module tests/unit/product.entities
 */

import { describe, it, expect } from "vitest";
import { isCookiePiece, isCookieBox } from "@/domain/entities/product";
import { createCookiePiece, createCookieBox, createProduct } from "@/tests/helpers/factories";

describe("Product Entities", () => {
  describe("isCookiePiece", () => {
    it("should return true for a cookie piece", () => {
      const cookie = createCookiePiece();
      expect(isCookiePiece(cookie)).toBe(true);
    });

    it("should return false for a cookie box", () => {
      const box = createCookieBox();
      expect(isCookiePiece(box)).toBe(false);
    });

    it("should correctly narrow type to CookiePiece", () => {
      const product = createProduct("cookie");
      
      if (isCookiePiece(product)) {
        // TypeScript should recognize product as CookiePiece here
        expect(product.flavour).toBeDefined();
        expect(product.allergens).toBeDefined();
      }
    });

    it("should return true for cookie with all optional fields", () => {
      const cookie = createCookiePiece({
        isNew: true,
        isSoldOut: false,
        flavour: "Pistachio",
        allergens: ["nuts", "gluten"],
      });
      expect(isCookiePiece(cookie)).toBe(true);
    });

    it("should return false for box even with similar properties", () => {
      const box = createCookieBox({
        name: "Cookie Box",
      });
      expect(isCookiePiece(box)).toBe(false);
    });
  });

  describe("isCookieBox", () => {
    it("should return true for a cookie box", () => {
      const box = createCookieBox();
      expect(isCookieBox(box)).toBe(true);
    });

    it("should return false for a cookie piece", () => {
      const cookie = createCookiePiece();
      expect(isCookieBox(cookie)).toBe(false);
    });

    it("should correctly narrow type to CookieBox", () => {
      const product = createProduct("box");
      
      if (isCookieBox(product)) {
        // TypeScript should recognize product as CookieBox here
        expect(product.includedCookies).toBeDefined();
        expect(Array.isArray(product.includedCookies)).toBe(true);
      }
    });

    it("should return true for box with included cookies", () => {
      const box = createCookieBox({
        includedCookies: [
          { productId: "cookie-1", productName: "Cookie 1", quantity: 2 },
          { productId: "cookie-2", productName: "Cookie 2", quantity: 1 },
          { productId: "cookie-3", productName: "Cookie 3", quantity: 3 },
        ],
      });
      expect(isCookieBox(box)).toBe(true);
    });

    it("should return false for cookie even with similar name", () => {
      const cookie = createCookiePiece({
        name: "Box of Chocolates",
      });
      expect(isCookieBox(cookie)).toBe(false);
    });
  });

  describe("type guards work together", () => {
    it("should be mutually exclusive - a product cannot be both", () => {
      const cookie = createCookiePiece();
      const box = createCookieBox();

      expect(isCookiePiece(cookie) && isCookieBox(cookie)).toBe(false);
      expect(isCookiePiece(box) && isCookieBox(box)).toBe(false);
    });

    it("should cover all cases - every product is either cookie or box", () => {
      const cookie = createCookiePiece();
      const box = createCookieBox();

      expect(isCookiePiece(cookie) || isCookieBox(cookie)).toBe(true);
      expect(isCookiePiece(box) || isCookieBox(box)).toBe(true);
    });
  });
});
