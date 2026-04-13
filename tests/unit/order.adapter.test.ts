/**
 * Order adapter unit tests
 * @module tests/unit/order.adapter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/db/client", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/infrastructure/db/client")>();
  return {
    ...mod,
    db: null as any,
  };
});

import { OrderRepository } from "@/infrastructure/db/order.adapter";
import { createOrderPayload, createCookiePiece } from "@/tests/helpers/factories";
import { mockOrders } from "@/infrastructure/db/client";

describe("OrderRepository", () => {
  let repo: OrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new OrderRepository();
  });

  describe("create", () => {
    it("should throw when wilayaCode is missing", async () => {
      const payload = createOrderPayload({
        wilayaCode: undefined as any,
        wilayaName: "Alger",
        communeName: "Alger Centre",
      });

      await expect(repo.create(payload)).rejects.toThrow(
        "wilaya fields must be resolved server-side before calling orderRepository.create()"
      );
    });

    it("should throw when wilayaName is missing", async () => {
      const payload = createOrderPayload({
        wilayaCode: "16",
        wilayaName: undefined as any,
        communeName: "Alger Centre",
      });

      await expect(repo.create(payload)).rejects.toThrow(
        "wilaya fields must be resolved server-side before calling orderRepository.create()"
      );
    });

    it("should throw when communeName is missing", async () => {
      const payload = createOrderPayload({
        wilayaCode: "16",
        wilayaName: "Alger",
        communeName: undefined as any,
      });

      await expect(repo.create(payload)).rejects.toThrow(
        "wilaya fields must be resolved server-side before calling orderRepository.create()"
      );
    });

    it("should return an order when all wilaya fields are present (mock mode)", async () => {
      const payload = createOrderPayload({
        items: [{ product: createCookiePiece({ price: 150 }), quantity: 3 }],
        deliveryFee: 400,
        wilayaCode: "16",
        wilayaName: "Alger",
        communeName: "Alger Centre",
      });

      const order = await repo.create(payload);

      expect(order.fullName).toBe(payload.customer.fullName);
      expect(order.phone).toBe(payload.customer.phone);
      expect(order.address).toBe(payload.customer.address);
      expect(order.deliveryZoneId).toBe(payload.deliveryZoneId);
      expect(order.deliveryType).toBe(payload.deliveryType);
      expect(order.deliveryFee).toBe(payload.deliveryFee);
      expect(order.wilayaCode).toBe("16");
      expect(order.wilayaName).toBe("Alger");
      expect(order.communeName).toBe("Alger Centre");
      expect(order.status).toBe("pending");
      expect(order.totalAmount).toBe(150 * 3 + 400);
      expect(order.items).toHaveLength(1);
    });
  });

  describe("getById", () => {
    it("should return an order from mock data when found", async () => {
      const order = await repo.getById("order-1");
      expect(order).not.toBeNull();
      expect(order?.id).toBe("order-1");
      expect(order?.items).toHaveLength(2);
    });

    it("should return null when order not found", async () => {
      const order = await repo.getById("non-existent-order");
      expect(order).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all mock orders", async () => {
      const orders = await repo.getAll();
      expect(orders).toHaveLength(mockOrders.length);
    });

    it("should respect limit parameter", async () => {
      const orders = await repo.getAll(2);
      expect(orders).toHaveLength(2);
    });
  });

  describe("getAllWithFilters", () => {
    it("should return mock orders regardless of filters", async () => {
      const orders = await repo.getAllWithFilters({ wilayaCode: "16", status: "pending" });
      expect(orders).toHaveLength(mockOrders.length);
    });
  });

  describe("getTopWilayas", () => {
    it("should return empty array in mock mode", async () => {
      const stats = await repo.getTopWilayas(5);
      expect(stats).toEqual([]);
    });
  });

  describe("delete", () => {
    it("should resolve without error in mock mode", async () => {
      await expect(repo.delete("order-1")).resolves.toBeUndefined();
    });
  });
});
