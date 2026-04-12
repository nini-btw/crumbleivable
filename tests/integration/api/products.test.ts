/**
 * Products API Integration Tests
 * @module tests/integration/api/products
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the modules before importing the route
vi.mock("@/infrastructure/db/product.adapter", () => ({
  productRepository: {
    getAllActivePaginated: vi.fn(),
    getActiveCount: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/infrastructure/auth/supabase-auth", () => ({
  getAdminSession: vi.fn(),
}));

// Now import the modules
import { GET, POST } from "@/app/api/products/route";
import { productRepository } from "@/infrastructure/db/product.adapter";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";
import { createCookiePiece } from "@/tests/helpers/factories";

describe("Products API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("should return 200 with paginated products", async () => {
      const mockProducts = [
        createCookiePiece({ id: "prod-1", name: "Product 1" }),
        createCookiePiece({ id: "prod-2", name: "Product 2" }),
      ];
      vi.mocked(productRepository.getAllActivePaginated).mockResolvedValue(mockProducts);
      vi.mocked(productRepository.getActiveCount).mockResolvedValue(2);

      const request = new Request("http://localhost:3000/api/products?page=1&limit=20");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        totalCount: 2,
        totalPages: 1,
      });
    });

    it("should handle pagination parameters", async () => {
      vi.mocked(productRepository.getAllActivePaginated).mockResolvedValue([]);
      vi.mocked(productRepository.getActiveCount).mockResolvedValue(0);

      const request = new Request("http://localhost:3000/api/products?page=2&limit=10");
      await GET(request);

      expect(productRepository.getAllActivePaginated).toHaveBeenCalledWith(10, 10);
    });

    it("should return 500 when repository throws", async () => {
      vi.mocked(productRepository.getAllActivePaginated).mockRejectedValue(new Error("DB error"));

      const request = new Request("http://localhost:3000/api/products");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch products");
    });
  });

  describe("POST /api/products", () => {
    it("should return 401 without admin auth", async () => {
      vi.mocked(getAdminSession).mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for missing required fields", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });

      const request = new Request("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Product" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Missing required field");
    });

    it("should return 201 with valid data and auth", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });
      const mockProduct = createCookiePiece({ id: "new-prod", name: "New Product" });
      vi.mocked(productRepository.create).mockResolvedValue(mockProduct);

      const request = new Request("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Product",
          slug: "new-product",
          description: "A new product",
          price: 150,
          type: "cookie",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockProduct.id);
      expect(data.data.name).toBe(mockProduct.name);
    });

    it("should return 409 for duplicate slug", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });
      const error = new Error("unique constraint violation") as Error & { code?: string };
      error.code = "23505";
      vi.mocked(productRepository.create).mockRejectedValue(error);

      const request = new Request("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate Product",
          slug: "existing-slug",
          description: "A product",
          price: 150,
          type: "cookie",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain("already exists");
    });
  });
});
