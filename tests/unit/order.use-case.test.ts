/**
 * Order use case unit tests
 * @module tests/unit/order.use-case
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CreateOrderUseCase,
  GetRecentOrdersUseCase,
  UpdateOrderStatusUseCase,
} from "@/application/use-cases/order.use-case";
import { createMockOrderRepository, createMockNotificationService } from "@/tests/helpers/mock-repositories";
import { createOrder, createOrderPayload, createCookiePiece } from "@/tests/helpers/factories";
import type { IOrderRepository, INotificationService } from "@/domain/ports/repositories";
import type { Order } from "@/domain/entities/order";

describe("CreateOrderUseCase", () => {
  let mockOrderRepo: IOrderRepository;
  let mockNotificationService: INotificationService;
  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderRepo = createMockOrderRepository();
    mockNotificationService = createMockNotificationService();
    useCase = new CreateOrderUseCase(mockOrderRepo, mockNotificationService);
  });

  it("should return error for 2 cookies without calling orderRepo.create", async () => {
    const payload = createOrderPayload({
      items: [
        { product: createCookiePiece(), quantity: 2 }, // Only 2 cookies
      ],
    });

    const result = await useCase.execute(payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Minimum 3 cookies required for checkout");
    expect(mockOrderRepo.create).not.toHaveBeenCalled();
  });

  it("should call orderRepo.create and notificationService for 3 cookies", async () => {
    const mockOrder = createOrder();
    vi.mocked(mockOrderRepo.create).mockResolvedValue(mockOrder);

    const payload = createOrderPayload({
      items: [
        { product: createCookiePiece(), quantity: 3 },
      ],
    });

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
    expect(result.order).toEqual(mockOrder);
    expect(mockOrderRepo.create).toHaveBeenCalledTimes(1);
    expect(mockOrderRepo.create).toHaveBeenCalledWith(payload);
    expect(mockNotificationService.sendOrderNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendOrderNotification).toHaveBeenCalledWith(mockOrder);
  });

  it("should return success even when notification throws", async () => {
    const mockOrder = createOrder();
    vi.mocked(mockOrderRepo.create).mockResolvedValue(mockOrder);
    vi.mocked(mockNotificationService.sendOrderNotification).mockRejectedValue(new Error("Notification failed"));

    const payload = createOrderPayload({
      items: [{ product: createCookiePiece(), quantity: 3 }],
    });

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
    expect(result.order).toEqual(mockOrder);
    expect(mockOrderRepo.create).toHaveBeenCalledTimes(1);
  });

  it("should return error when orderRepo.create throws", async () => {
    vi.mocked(mockOrderRepo.create).mockRejectedValue(new Error("DB error"));

    const payload = createOrderPayload({
      items: [{ product: createCookiePiece(), quantity: 3 }],
    });

    const result = await useCase.execute(payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create order. Please try again.");
  });

  it("should accept order with 1 box (counts as 3 cookies)", async () => {
    const { createCookieBox } = await import("@/tests/helpers/factories");
    const mockOrder = createOrder();
    vi.mocked(mockOrderRepo.create).mockResolvedValue(mockOrder);

    const payload = createOrderPayload({
      items: [{ product: createCookieBox(), quantity: 1 }],
    });

    const result = await useCase.execute(payload);

    expect(result.success).toBe(true);
  });
});

describe("GetRecentOrdersUseCase", () => {
  let mockOrderRepo: IOrderRepository;
  let useCase: GetRecentOrdersUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderRepo = createMockOrderRepository();
    useCase = new GetRecentOrdersUseCase(mockOrderRepo);
  });

  it("should call orderRepo.getRecent with correct count", async () => {
    const mockOrders = [createOrder(), createOrder()];
    vi.mocked(mockOrderRepo.getRecent).mockResolvedValue(mockOrders);

    const result = await useCase.execute(5);

    expect(mockOrderRepo.getRecent).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockOrders);
  });

  it("should return empty array when no orders", async () => {
    vi.mocked(mockOrderRepo.getRecent).mockResolvedValue([]);

    const result = await useCase.execute(10);

    expect(result).toHaveLength(0);
  });
});

describe("UpdateOrderStatusUseCase", () => {
  let mockOrderRepo: IOrderRepository;
  let useCase: UpdateOrderStatusUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderRepo = createMockOrderRepository();
    useCase = new UpdateOrderStatusUseCase(mockOrderRepo);
  });

  it("should call orderRepo.updateStatus and return success", async () => {
    vi.mocked(mockOrderRepo.updateStatus).mockResolvedValue(undefined);

    const result = await useCase.execute("order-1", "confirmed");

    expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith("order-1", "confirmed");
    expect(result.success).toBe(true);
  });

  it("should support all valid status values", async () => {
    const statuses: Order["status"][] = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
    
    for (const status of statuses) {
      vi.clearAllMocks();
      const result = await useCase.execute("order-1", status);
      
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith("order-1", status);
      expect(result.success).toBe(true);
    }
  });

  it("should return error when updateStatus throws", async () => {
    vi.mocked(mockOrderRepo.updateStatus).mockRejectedValue(new Error("DB error"));

    const result = await useCase.execute("order-1", "confirmed");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update order status");
  });
});
