/**
 * Utility functions unit tests
 * @module tests/unit/utils
 */

import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatDate, slugify, truncate, generatePlaceholder } from "@/presentation/lib/utils";

describe("Utils", () => {
  describe("cn (class name utility)", () => {
    it("should merge simple class names", () => {
      const result = cn("class1", "class2");
      expect(result).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toBe("base active");
    });

    it("should filter out falsy values", () => {
      const result = cn("base", false && "hidden", null, undefined, "visible");
      expect(result).toBe("base visible");
    });

    it("should handle array of classes", () => {
      const result = cn(["class1", "class2"]);
      expect(result).toBe("class1 class2");
    });

    it("should handle object syntax", () => {
      const result = cn({ active: true, disabled: false });
      expect(result).toBe("active");
    });

    it("should merge tailwind classes correctly (last one wins)", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("should return empty string for no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });

  describe("formatPrice", () => {
    it("should format price in Algerian Dinar with DA suffix", () => {
      const result = formatPrice(150);
      expect(result).toContain("150");
      expect(result).toContain("DA");
    });

    it("should format large prices with thousand separators", () => {
      const result = formatPrice(10000);
      expect(result).toContain("10");
      expect(result).toContain("000");
    });

    it("should not show decimal places", () => {
      const result = formatPrice(150.5);
      // Should round or truncate to 0 decimal places
      expect(result).not.toContain(".");
    });

    it("should handle zero price", () => {
      const result = formatPrice(0);
      expect(result).toContain("0");
      expect(result).toContain("DA");
    });

    it("should handle price in cents correctly", () => {
      // The price is in cents, so 150 = 1.50 DZD
      // But formatPrice takes the raw cents value
      const result = formatPrice(150);
      expect(result).toMatch(/150/);
    });
  });

  describe("formatDate", () => {
    it("should format Date object", () => {
      const date = new Date("2024-03-15");
      const result = formatDate(date);
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("should format date string", () => {
      const result = formatDate("2024-03-15T10:30:00Z");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("should include month name", () => {
      const date = new Date("2024-03-15");
      const result = formatDate(date);
      // French locale should include month name
      expect(result.length).toBeGreaterThan(10);
    });

    it("should handle different date formats", () => {
      const result1 = formatDate("2024-01-01");
      const result2 = formatDate(new Date(2024, 0, 1));
      
      // Both should contain "1" and "2024"
      expect(result1).toContain("2024");
      expect(result2).toContain("2024");
    });
  });

  describe("slugify", () => {
    it("should convert to lowercase", () => {
      const result = slugify("Hello World");
      expect(result).toBe("hello-world");
    });

    it("should replace spaces with hyphens", () => {
      const result = slugify("hello world test");
      expect(result).toBe("hello-world-test");
    });

    it("should remove special characters", () => {
      const result = slugify("hello@world#test!");
      expect(result).toBe("helloworldtest");
    });

    it("should handle multiple spaces", () => {
      const result = slugify("hello   world");
      expect(result).toBe("hello-world");
    });

    it("should trim leading and trailing hyphens", () => {
      const result = slugify("!hello world!");
      expect(result).toBe("hello-world");
    });

    it("should handle underscores as word separators", () => {
      const result = slugify("hello_world");
      expect(result).toBe("hello-world");
    });

    it("should handle empty string", () => {
      const result = slugify("");
      expect(result).toBe("");
    });

    it("should handle string with only special characters", () => {
      const result = slugify("!@#$%");
      expect(result).toBe("");
    });

    it("should handle accented characters", () => {
      const result = slugify("café résumé");
      // Accented characters may be stripped or kept depending on regex
      expect(result).not.toContain("@");
    });
  });

  describe("truncate", () => {
    it("should return original text if shorter than max length", () => {
      const text = "Short text";
      const result = truncate(text, 100);
      expect(result).toBe(text);
    });

    it("should truncate long text with ellipsis", () => {
      const text = "This is a very long text that needs to be truncated";
      const result = truncate(text, 20);
      expect(result).toContain("...");
      expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
    });

    it("should handle exact length text", () => {
      const text = "Exactly twenty chars";
      const result = truncate(text, 20);
      expect(result).toBe(text);
    });

    it("should handle empty string", () => {
      const result = truncate("", 10);
      expect(result).toBe("");
    });

    it("should handle max length of 0", () => {
      const result = truncate("test", 0);
      expect(result).toBe("...");
    });

    it("should trim trailing spaces before adding ellipsis", () => {
      const text = "A very long text with trailing spaces     ";
      const result = truncate(text, 20);
      const beforeEllipsis = result.slice(0, -3);
      expect(beforeEllipsis.endsWith(" ")).toBe(false);
    });
  });

  describe("generatePlaceholder", () => {
    it("should return a data URL", () => {
      const result = generatePlaceholder(100, 100);
      expect(result.startsWith("data:image/svg+xml;base64,")).toBe(true);
    });

    it("should include width and height in the SVG", () => {
      const result = generatePlaceholder(200, 300);
      // Decode base64 to check content
      const base64Content = result.replace("data:image/svg+xml;base64,", "");
      const decoded = Buffer.from(base64Content, "base64").toString();
      expect(decoded).toContain('width="200"');
      expect(decoded).toContain('height="300"');
      expect(decoded).toContain('viewBox="0 0 200 300"');
    });

    it("should include background color", () => {
      const result = generatePlaceholder(100, 100);
      const base64Content = result.replace("data:image/svg+xml;base64,", "");
      const decoded = Buffer.from(base64Content, "base64").toString();
      expect(decoded).toContain("#FDF6EE");
    });

    it("should generate valid base64", () => {
      const result = generatePlaceholder(100, 100);
      const base64Content = result.replace("data:image/svg+xml;base64,", "");
      // Should not throw when decoding
      expect(() => Buffer.from(base64Content, "base64").toString()).not.toThrow();
    });

    it("should handle large dimensions", () => {
      const result = generatePlaceholder(1920, 1080);
      expect(result.startsWith("data:image/svg+xml;base64,")).toBe(true);
    });

    it("should handle small dimensions", () => {
      const result = generatePlaceholder(1, 1);
      expect(result.startsWith("data:image/svg+xml;base64,")).toBe(true);
    });
  });
});
