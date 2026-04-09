/**
 * Drop repository adapter (MOCK VERSION)
 * @module infrastructure/db/drop-adapter
 */

import type { WeeklyDrop } from "@/domain/entities/drop";
import type { IDropRepository } from "@/domain/ports/repositories";
import { mockWeeklyDrop, mockCookies } from "./mock-data";

/**
 * Drop repository implementation using MOCK DATA
 */
export class DropRepository implements IDropRepository {
  private drops: WeeklyDrop[] = [mockWeeklyDrop];

  async getCurrent(): Promise<WeeklyDrop | null> {
    const active = this.drops.find(
      (d) => d.isActive && !d.revealedAt
    );
    
    if (active && active.productId) {
      const product = mockCookies.find((c) => c.id === active.productId);
      if (product) {
        active.product = product;
      }
    }
    
    return active || null;
  }

  async create(drop: Omit<WeeklyDrop, "id" | "createdAt">): Promise<WeeklyDrop> {
    const newDrop: WeeklyDrop = {
      ...drop,
      id: `drop-${Date.now()}`,
      createdAt: new Date(),
    };
    this.drops.push(newDrop);
    return newDrop;
  }

  async markRevealed(id: string): Promise<void> {
    const drop = this.drops.find((d) => d.id === id);
    if (drop) {
      drop.revealedAt = new Date();
    }
  }

  async cancel(id: string): Promise<void> {
    const drop = this.drops.find((d) => d.id === id);
    if (drop) {
      drop.isActive = false;
    }
  }

  async getAll(): Promise<WeeklyDrop[]> {
    return this.drops.sort((a, b) => 
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }
}

/**
 * Singleton instance
 */
export const dropRepository = new DropRepository();
