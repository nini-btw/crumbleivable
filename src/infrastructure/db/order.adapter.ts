/**
 * Order repository adapter
 * @module infrastructure/db/order-adapter
 */

import { eq, desc } from "drizzle-orm";
import type { Order, CreateOrderPayload } from "@/domain/entities/order";
import type { IOrderRepository } from "@/domain/ports/repositories";
import { calculateCartTotal } from "@/domain/rules/cart.rules";
import { db, mockOrders } from "./client";
import { orders, orderItems } from "./schema";

// Check if we're in mock mode
const isMockMode = !db;

/**
 * Order repository implementation using Drizzle ORM
 */
export class OrderRepository implements IOrderRepository {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const totalAmount = calculateCartTotal(payload.items);

    if (isMockMode) {
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
      return order;
    }

    // Create order
    const [orderResult] = await db
      .insert(orders)
      .values({
        fullName: payload.customer.fullName,
        phone: payload.customer.phone,
        address: payload.customer.address,
        cookingNote: payload.notes.cookingNote,
        giftNote: payload.notes.giftNote,
        status: "pending",
        totalAmount,
      })
      .returning();

    // Create order items
    const itemsToInsert = payload.items.map((item) => ({
      orderId: orderResult.id,
      productId: item.product.id,
      productType: item.product.type,
      productName: item.product.name,
      quantity: item.quantity,
      priceSnapshot: item.product.price,
    }));

    const itemResults = await db
      .insert(orderItems)
      .values(itemsToInsert)
      .returning();

    return this.mapToEntity(orderResult, itemResults);
  }

  async getById(id: string): Promise<Order | null> {
    if (isMockMode) {
      return mockOrders.find((o) => o.id === id) || null;
    }

    const [orderResult] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!orderResult) return null;

    const itemsResult = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return this.mapToEntity(orderResult, itemsResult);
  }

  async getAll(limit?: number): Promise<Order[]> {
    if (isMockMode) {
      return mockOrders.slice(0, limit);
    }

    const ordersResult = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit || 1000);

    const result: Order[] = [];
    for (const order of ordersResult) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      result.push(this.mapToEntity(order, items));
    }
    return result;
  }

  async updateStatus(id: string, status: Order["status"]): Promise<void> {
    if (isMockMode) return;

    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async getRecent(count: number): Promise<Order[]> {
    return this.getAll(count);
  }

  async delete(id: string): Promise<void> {
    if (isMockMode) return;

    // Delete order items first (cascade)
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    
    // Delete order
    await db.delete(orders).where(eq(orders.id, id));
  }

  /**
   * Map database records to domain entity
   */
  private mapToEntity(
    order: typeof orders.$inferSelect,
    items: (typeof orderItems.$inferSelect)[]
  ): Order {
    return {
      id: order.id,
      fullName: order.fullName,
      phone: order.phone,
      address: order.address,
      cookingNote: order.cookingNote || undefined,
      giftNote: order.giftNote || undefined,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      items: items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productType: item.productType,
        productName: item.productName,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
      })),
    };
  }
}

/**
 * Singleton instance
 */
export const orderRepository = new OrderRepository();
