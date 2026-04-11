/**
 * Orders API Integration Tests
 * @module tests/integration/api/orders
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { seedOrder, cleanOrders, closeConnection } from "@/tests/helpers/seed";
import { getAdminCookie } from "@/tests/helpers/auth";
import { validOrderPayload } from "@/tests/helpers/fixtures";

// Mock Telegram
vi.mock("@/infrastructure/telegram/service", () => ({
  sendOrderToTelegram: vi.fn().mockResolvedValue(true),
}));

const API_URL = "http://localhost:3000/api";

describe("Orders API", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAdminCookie();
  });

  afterAll(async () => {
    await closeConnection();
  });

  beforeEach(async () => {
    await cleanOrders();
  });

  afterEach(async () => {
    await cleanOrders();
  });

  describe("POST /api/orders", () => {
    it("should return 201 with order id for valid 3-cookie payload", async () => {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validOrderPayload),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
    });

    it("should return 400 error for 2 cookies", async () => {
      const payload = {
        ...validOrderPayload,
        items: [
          { product: validOrderPayload.items[0].product, quantity: 2 },
        ],
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Minimum 3 cookies required for checkout");
    });

    it("should return 400 error for missing fullName", async () => {
      const payload = {
        ...validOrderPayload,
        customer: { ...validOrderPayload.customer, fullName: "" },
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Missing customer information");
    });

    it("should return 400 error for missing phone", async () => {
      const payload = {
        ...validOrderPayload,
        customer: { ...validOrderPayload.customer, phone: "" },
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should return 400 error for missing address", async () => {
      const payload = {
        ...validOrderPayload,
        customer: { ...validOrderPayload.customer, address: "" },
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("GET /api/orders", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/orders`);
      expect(response.status).toBe(401);
    });

    it("should return 200 with data array with admin cookie", async () => {
      // Seed an order first
      await seedOrder();

      const response = await fetch(`${API_URL}/orders`, {
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("GET /api/orders/[id]", () => {
    it("should return 200 for valid seeded order id", async () => {
      const order = await seedOrder();

      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(order.id);
    });

    it("should return 404 for fake uuid", async () => {
      const response = await fetch(`${API_URL}/orders/00000000-0000-0000-0000-000000000000`, {
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("PUT /api/orders/[id]", () => {
    it("should return 401 without auth", async () => {
      const order = await seedOrder();
      
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth and valid status", async () => {
      const order = await seedOrder();
      
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({ status: "confirmed" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should return 400 for invalid status", async () => {
      const order = await seedOrder();
      
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({ status: "invalidstatus" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid status");
    });

    it("should return 400 for missing status field", async () => {
      const order = await seedOrder();
      
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Missing status field");
    });
  });

  describe("DELETE /api/orders/[id]", () => {
    it("should return 401 without auth", async () => {
      const order = await seedOrder();
      
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth", async () => {
      const order = await seedOrder({ status: "cancelled" });
      
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "DELETE",
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
