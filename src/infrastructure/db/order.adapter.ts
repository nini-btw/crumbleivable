/**
 * Order repository adapter (MOCK VERSION)
 * @module infrastructure/db/order-adapter
 */

import type {
  Order,
  CreateOrderPayload,
} from "@/domain/entities/order";
import type { IOrderRepository } from "@/domain/ports/repositories";
import { calculateCartTotal } from "@/domain/rules/cart.rules";
import { mockOrders } from "./mock-data";

/**
 * Order repository implementation using MOCK DATA
 */
export class OrderRepository implements IOrderRepository {
  private orders = [...mockOrders];

  async create(payload: CreateOrderPayload): Promise<Order> {
    const totalAmount = calculateCartTotal(payload.items);

    const order: Order = {
      id: `order-${Date.now()}`,
      fullName: payload.customer.fullName,
      phone: payload.customer.phone,
      address: payload.customer.address,
      cookingNote: payload.notes.cookingNote,
      giftNote: payload.notes.giftNote,
      items: payload.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        orderId: `order-${Date.now()}`,
        productId: item.product.id,
        productType: item.product.type,
        productName: item.product.name,
        quantity: item.quantity,
        priceSnapshot: item.product.price,
      })),
      status: "pending",
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.unshift(order);
    return order;
  }

  async getById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) || null;
  }

  async getAll(limit?: number): Promise<Order[]> {
    return this.orders.slice(0, limit);
  }

  async updateStatus(id: string, status: Order["status"]): Promise<void> {
    const order = await this.getById(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
    }
  }

  async getRecent(count: number): Promise<Order[]> {
    return this.orders.slice(0, count);
  }
}

/**
 * Singleton instance
 */
export const orderRepository = new OrderRepository();
