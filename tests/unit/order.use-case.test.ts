/**
 * Order use case unit tests
 * @module tests/unit/order
 */

import { describe, it, expect, vi } from "vitest";
import {
  CreateOrderUseCase,
  GetRecentOrdersUseCase,
  UpdateOrderStatusUseCase,
} from "@/application/use-cases/order.use-case";
import type { IOrderRepository, INotificationService } from "@/domain/ports/repositories";
import type { Order, CreateOrderPayload } from "@/domain/entities/order";
import type { CookiePiece } from "@/domain/entities/product";

// Mock Telegram
vi.mock("@/infrastructure/telegram/service", () => ({
  sendOrderToTelegram: vi.fn().mockResolvedValue(true),
}));

/**
 * Create mock cookie
 */
const createCookie = (id: string): CookiePiece => ({
  id,
  name: `Cookie ${id}`,
  slug: `cookie-${id}`,
  description: "Test cookie",
  price: 150,
  displayPrice: 1.50,
  isActive: true,
  type: "cookie",
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  flavour: "Chocolate",
  allergens: [],
});

describe("CreateOrderUseCase", () => {
  it("should return error for 2 cookies without calling orderRepo.create", async () => {
    const mockOrderRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn(),
      getRecent: vi.fn(),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const mockNotificationService = {
      sendOrderNotification: vi.fn(),
      testConnection: vi.fn(),
    } as unknown as INotificationService;

    const useCase = new CreateOrderUseCase(mockOrderRepo, mockNotificationService);

    const payload: CreateOrderPayload = {
      customer: { fullName: "Test", phone: "123", address: "Address" },
      notes: {},
      items: [
        { product: createCookie("1"), quantity: 2 },
      ],
    };

    const result = await useCase.execute(payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Minimum 3 cookies required for checkout");
    expect(mockOrderRepo.create).not.toHaveBeenCalled();
  });

  it("should call orderRepo.create and notificationService for 3 cookies", async () => {
    const mockOrder: Order = {
      id: "order-1",
      fullName: "Test",
      phone: "123",
      address: "Address",
      items: [],
      status: "pending",
      totalAmount: 450,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockOrderRepo = {
      create: vi.fn().mockResolvedValue(mockOrder),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn(),
      getRecent: vi.fn(),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const mockNotificationService = {
      sendOrderNotification: vi.fn().mockResolvedValue(undefined),
      testConnection: vi.fn(),
    } as unknown as INotificationService;

    const useCase = new CreateOrderUseCase(mockOrderRepo, mockNotificationService);

    const payload: CreateOrderPayload = {
      customer: { fullName: "Test", phone: "123", address: "Address" },
      notes: {},
      items: [
        { product: createCookie("1"), quantity: 3 },
      ],
    };

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
    expect(result.order).toEqual(mockOrder);
    expect(mockOrderRepo.create).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendOrderNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendOrderNotification).toHaveBeenCalledWith(mockOrder);
  });

  it("should return success even when notification throws", async () => {
    const mockOrder: Order = {
      id: "order-1",
      fullName: "Test",
      phone: "123",
      address: "Address",
      items: [],
      status: "pending",
      totalAmount: 450,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockOrderRepo = {
      create: vi.fn().mockResolvedValue(mockOrder),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn(),
      getRecent: vi.fn(),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const mockNotificationService = {
      sendOrderNotification: vi.fn().mockRejectedValue(new Error("Notification failed")),
      testConnection: vi.fn(),
    } as unknown as INotificationService;

    const useCase = new CreateOrderUseCase(mockOrderRepo, mockNotificationService);

    const payload: CreateOrderPayload = {
      customer: { fullName: "Test", phone: "123", address: "Address" },
      notes: {},
      items: [
        { product: createCookie("1"), quantity: 3 },
      ],
    };

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
    expect(result.order).toEqual(mockOrder);
  });

  it("should return error when orderRepo.create throws", async () => {
    const mockOrderRepo = {
      create: vi.fn().mockRejectedValue(new Error("DB error")),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn(),
      getRecent: vi.fn(),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const mockNotificationService = {
      sendOrderNotification: vi.fn(),
      testConnection: vi.fn(),
    } as unknown as INotificationService;

    const useCase = new CreateOrderUseCase(mockOrderRepo, mockNotificationService);

    const payload: CreateOrderPayload = {
      customer: { fullName: "Test", phone: "123", address: "Address" },
      notes: {},
      items: [
        { product: createCookie("1"), quantity: 3 },
      ],
    };

    const result = await useCase.execute(payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create order. Please try again.");
  });
});

describe("GetRecentOrdersUseCase", () => {
  it("should call orderRepo.getRecent with correct count", async () => {
    const mockOrders: Order[] = [
      {
        id: "order-1",
        fullName: "Test",
        phone: "123",
        address: "Address",
        items: [],
        status: "pending",
        totalAmount: 450,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockOrderRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn(),
      getRecent: vi.fn().mockResolvedValue(mockOrders),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const useCase = new GetRecentOrdersUseCase(mockOrderRepo);
    const result = await useCase.execute(5);

    expect(mockOrderRepo.getRecent).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockOrders);
  });
});

describe("UpdateOrderStatusUseCase", () => {
  it("should call orderRepo.updateStatus and return success", async () => {
    const mockOrderRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(undefined),
      getRecent: vi.fn(),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const useCase = new UpdateOrderStatusUseCase(mockOrderRepo);
    const result = await useCase.execute("order-1", "confirmed");

    expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith("order-1", "confirmed");
    expect(result.success).toBe(true);
  });

  it("should return error when updateStatus throws", async () => {
    const mockOrderRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      updateStatus: vi.fn().mockRejectedValue(new Error("DB error")),
      getRecent: vi.fn(),
      delete: vi.fn(),
    } as unknown as IOrderRepository;

    const useCase = new UpdateOrderStatusUseCase(mockOrderRepo);
    const result = await useCase.execute("order-1", "confirmed");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update order status");
  });
});
