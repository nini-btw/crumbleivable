/**
 * Typed mock repository implementations for testing
 * @module tests/helpers/mock-repositories
 */

import { vi } from "vitest";
import type {
  IProductRepository,
  IOrderRepository,
  IVoteRepository,
  IDropRepository,
  IStorageService,
  INotificationService,
} from "@/domain/ports/repositories";
import type { Product, CookiePiece, CookieBox } from "@/domain/entities/product";
import type { Order, CreateOrderPayload } from "@/domain/entities/order";
import type { VoteCandidate } from "@/domain/entities/vote";
import type { WeeklyDrop } from "@/domain/entities/drop";

/**
 * Create a mock product repository with all methods as vi.fn()
 */
export function createMockProductRepository(): IProductRepository {
  return {
    getAllActive: vi.fn<() => Promise<Product[]>>(() => Promise.resolve([])),
    getAllActivePaginated: vi.fn<(limit: number, offset: number) => Promise<Product[]>>(() => 
      Promise.resolve([])
    ),
    getActiveCount: vi.fn<() => Promise<number>>(() => Promise.resolve(0)),
    getBySlug: vi.fn<(slug: string) => Promise<Product | null>>(() => Promise.resolve(null)),
    getById: vi.fn<(id: string) => Promise<Product | null>>(() => Promise.resolve(null)),
    getAllCookies: vi.fn<() => Promise<CookiePiece[]>>(() => Promise.resolve([])),
    getAllBoxes: vi.fn<() => Promise<CookieBox[]>>(() => Promise.resolve([])),
    create: vi.fn<(product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product>>(() =>
      Promise.resolve({} as Product)
    ),
    update: vi.fn<(id: string, product: Partial<Product>) => Promise<Product>>(() =>
      Promise.resolve({} as Product)
    ),
    toggleActive: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
    delete: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
  };
}

/**
 * Create a mock order repository with all methods as vi.fn()
 */
export function createMockOrderRepository(): IOrderRepository {
  return {
    create: vi.fn<(payload: CreateOrderPayload) => Promise<Order>>(() =>
      Promise.resolve({} as Order)
    ),
    getById: vi.fn<(id: string) => Promise<Order | null>>(() => Promise.resolve(null)),
    getAll: vi.fn<(limit?: number) => Promise<Order[]>>(() => Promise.resolve([])),
    updateStatus: vi.fn<(id: string, status: Order["status"]) => Promise<void>>(() =>
      Promise.resolve()
    ),
    getRecent: vi.fn<(count: number) => Promise<Order[]>>(() => Promise.resolve([])),
    delete: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
  };
}

/**
 * Create a mock vote repository with all methods as vi.fn()
 */
export function createMockVoteRepository(): IVoteRepository {
  return {
    getAllActive: vi.fn<() => Promise<VoteCandidate[]>>(() => Promise.resolve([])),
    getById: vi.fn<(id: string) => Promise<VoteCandidate | null>>(() => Promise.resolve(null)),
    hasVoted: vi.fn<(candidateId: string, voterFingerprint: string) => Promise<boolean>>(() =>
      Promise.resolve(false)
    ),
    vote: vi.fn<(candidateId: string, voterFingerprint?: string) => Promise<void>>(() =>
      Promise.resolve()
    ),
    create: vi.fn<(candidate: Omit<VoteCandidate, "id" | "voteCount" | "createdAt">) => Promise<VoteCandidate>>(() =>
      Promise.resolve({} as VoteCandidate)
    ),
    delete: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
    resetAll: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    toggleActive: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
  };
}

/**
 * Create a mock drop repository with all methods as vi.fn()
 */
export function createMockDropRepository(): IDropRepository {
  return {
    getCurrent: vi.fn<() => Promise<WeeklyDrop | null>>(() => Promise.resolve(null)),
    create: vi.fn<(drop: Omit<WeeklyDrop, "id" | "createdAt">) => Promise<WeeklyDrop>>(() =>
      Promise.resolve({} as WeeklyDrop)
    ),
    markRevealed: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
    cancel: vi.fn<(id: string) => Promise<void>>(() => Promise.resolve()),
    getAll: vi.fn<() => Promise<WeeklyDrop[]>>(() => Promise.resolve([])),
  };
}

/**
 * Create a mock storage service with all methods as vi.fn()
 */
export function createMockStorageService(): IStorageService {
  return {
    upload: vi.fn<(file: File, path: string) => Promise<string>>(() =>
      Promise.resolve("https://example.com/uploaded-image.png")
    ),
    delete: vi.fn<(url: string) => Promise<void>>(() => Promise.resolve()),
    getPublicUrl: vi.fn<(path: string) => string>((path) => `https://example.com/${path}`),
  };
}

/**
 * Create a mock notification service with all methods as vi.fn()
 */
export function createMockNotificationService(): INotificationService {
  return {
    sendOrderNotification: vi.fn<(order: Order) => Promise<void>>(() => Promise.resolve()),
    testConnection: vi.fn<() => Promise<boolean>>(() => Promise.resolve(true)),
  };
}

/**
 * Reset all mocks on a repository
 */
export function resetMockRepository(repo: 
  | IProductRepository 
  | IOrderRepository 
  | IVoteRepository 
  | IDropRepository
  | IStorageService
  | INotificationService
): void {
  Object.values(repo).forEach((fn) => {
    if (typeof fn === "function" && "mockReset" in fn) {
      fn.mockReset();
    }
  });
}
