/**
 * Orders API Integration Tests
 * @module tests/integration/api/orders
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the modules before importing the route
vi.mock("@/infrastructure/db/order.adapter", () => ({
  orderRepository: {
    create: vi.fn(),
    getAll: vi.fn(),
  },
}));

vi.mock("@/infrastructure/auth/supabase-auth", () => ({
  getAdminSession: vi.fn(),
}));

// Now import the modules
import { GET, POST } from "@/app/api/orders/route";
import { orderRepository } from "@/infrastructure/db/order.adapter";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";
import { createOrder, createCookiePiece } from "@/tests/helpers/factories";

describe("Orders API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/orders", () => {
    it("should return 401 without admin auth", async () => {
      vi.mocked(getAdminSession).mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/orders");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 200 with orders for admin", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });
      const mockOrders = [createOrder({ id: "order-1" })];
      vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

      const request = new Request("http://localhost:3000/api/orders");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it("should pass limit to repository", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });
      vi.mocked(orderRepository.getAll).mockResolvedValue([]);

      const request = new Request("http://localhost:3000/api/orders?limit=50");
      await GET(request);

      expect(orderRepository.getAll).toHaveBeenCalledWith(50);
    });
  });

  describe("POST /api/orders", () => {
    it("should return 400 for empty cart (minimum not met)", async () => {
      const request = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { fullName: "Test", phone: "123", address: "Addr" },
          items: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Minimum");
    });

    it("should return 400 for missing customer info", async () => {
      const request = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ product: createCookiePiece({ price: 150 }), quantity: 3 }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("customer");
    });

    it("should return 201 with valid order data", async () => {
      const mockOrder = createOrder({ id: "order-1" });
      vi.mocked(orderRepository.create).mockResolvedValue(mockOrder);

      const request = new Request("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { fullName: "Test Customer", phone: "123456", address: "123 Street" },
          items: [{ product: createCookiePiece({ price: 150 }), quantity: 3 }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockOrder.id);
      expect(data.data.totalAmount).toBe(mockOrder.totalAmount);
      expect(data.data.status).toBe(mockOrder.status);
    });
  });
});
