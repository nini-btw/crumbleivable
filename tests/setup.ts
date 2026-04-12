/**
 * Vitest test setup
 */

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Set up environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.DATABASE_URL = "postgres://test:test@localhost:54322/test";

// Mock Next.js headers/cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
}));
