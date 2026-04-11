/**
 * Products API Integration Tests
 * @module tests/integration/api/products
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { seedProduct, cleanProducts, closeConnection } from "@/tests/helpers/seed";
import { getAdminCookie } from "@/tests/helpers/auth";
import { validProductPayload } from "@/tests/helpers/fixtures";

const API_URL = "http://localhost:3000/api";

describe("Products API", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAdminCookie();
  });

  afterAll(async () => {
    await closeConnection();
  });

  beforeEach(async () => {
    await cleanProducts();
  });

  afterEach(async () => {
    await cleanProducts();
  });

  describe("GET /api/products", () => {
    it("should return 200 and only return products where isActive = true", async () => {
      await seedProduct({ isActive: true });
      await seedProduct({ isActive: false, slug: "inactive-test" });

      const response = await fetch(`${API_URL}/products`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // All returned products should be active
      data.data.forEach((product: any) => {
        expect(product.isActive).toBe(true);
      });
    });

    it("should not include inactive products in response", async () => {
      const inactiveProduct = await seedProduct({ 
        isActive: false, 
        slug: "inactive-test-unique" 
      });

      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      
      const found = data.data.find((p: any) => p.id === inactiveProduct.id);
      expect(found).toBeUndefined();
    });
  });

  describe("GET /api/products/cookies", () => {
    it("should return 200 and all items have type: cookie", async () => {
      const response = await fetch(`${API_URL}/products/cookies`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      data.data.forEach((product: any) => {
        expect(product.type).toBe("cookie");
      });
    });
  });

  describe("GET /api/products/[id]", () => {
    it("should return 200 for valid id", async () => {
      const product = await seedProduct();

      const response = await fetch(`${API_URL}/products/${product.id}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(product.id);
    });

    it("should return 404 for fake id", async () => {
      const response = await fetch(`${API_URL}/products/00000000-0000-0000-0000-000000000000`);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("POST /api/products", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validProductPayload),
      });

      expect(response.status).toBe(401);
    });

    it("should return 201 with auth and valid body", async () => {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify(validProductPayload),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.slug).toBe(validProductPayload.slug);
    });

    it("should return 400 for missing slug", async () => {
      const payload = { ...validProductPayload };
      delete (payload as any).slug;

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing name", async () => {
      const payload = { ...validProductPayload, name: "" };

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/products/[id]", () => {
    it("should return 401 without auth", async () => {
      const product = await seedProduct();

      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth and updated field reflected in response", async () => {
      const product = await seedProduct();

      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Updated Name");
    });
  });

  describe("DELETE /api/products/[id]", () => {
    it("should return 401 without auth", async () => {
      const product = await seedProduct();

      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth", async () => {
      const product = await seedProduct();

      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("GET /api/admin/products", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/admin/products`);
      expect(response.status).toBe(401);
    });

    it("should return 200 with auth and include inactive products", async () => {
      const activeProduct = await seedProduct({ isActive: true });
      const inactiveProduct = await seedProduct({ 
        isActive: false, 
        slug: "admin-inactive-test" 
      });

      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // Should include both active and inactive
      const foundActive = data.data.find((p: any) => p.id === activeProduct.id);
      const foundInactive = data.data.find((p: any) => p.id === inactiveProduct.id);
      
      expect(foundActive).toBeDefined();
      expect(foundInactive).toBeDefined();
    });
  });
});
