/**
 * Database client configuration (MOCK VERSION)
 * @module infrastructure/db/client
 * 
 * NOTE: This is a mock implementation for UI development.
 * To enable real database, update to use actual postgres connection.
 */

// Mock db export for compatibility
export const db = {
  select: () => ({
    from: () => Promise.resolve([]),
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([]),
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => Promise.resolve(),
    }),
  }),
  delete: () => ({
    where: () => Promise.resolve(),
  }),
};

// Export schema for compatibility
export const schema = {};

// Re-export mock data for convenience
export { mockProducts, mockOrders, mockVoteCandidates, mockWeeklyDrop } from "./mock-data";
