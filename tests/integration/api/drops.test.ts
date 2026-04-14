/**
 * Drops API Integration Tests
 * @module tests/integration/api/drops
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the modules before importing the route
vi.mock("@/infrastructure/db/drop.adapter", () => ({
  dropRepository: {
    getCurrent: vi.fn(),
    markRevealed: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

// Now import the modules
import { GET, POST } from "@/app/api/drops/route";
import { dropRepository } from "@/infrastructure/db/drop.adapter";
import { createWeeklyDrop } from "@/tests/helpers/factories";

describe("Drops API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/drops", () => {
    it("should return 200 with current drop info", async () => {
      const mockDrop = createWeeklyDrop({
        id: "drop-1",
        revealedAt: new Date("2025-01-15T09:00:00Z"),
      });
      vi.mocked(dropRepository.getCurrent).mockResolvedValue(mockDrop);

      const request = new NextRequest("http://localhost:3000/api/drops");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it("should return 200 with unrevealed drop (public view)", async () => {
      const mockDrop = createWeeklyDrop({
        id: "drop-1",
        revealedAt: undefined,
      });
      vi.mocked(dropRepository.getCurrent).mockResolvedValue(mockDrop);

      const request = new NextRequest("http://localhost:3000/api/drops");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it("should return 500 when repository throws", async () => {
      vi.mocked(dropRepository.getCurrent).mockRejectedValue(new Error("DB error"));

      const request = new NextRequest("http://localhost:3000/api/drops");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch drop");
    });
  });

  describe("POST /api/drops", () => {
    it("should return 401 without admin auth", async () => {
      // getAdminSession will return null since we didn't mock it to return a value
      const request = new NextRequest("http://localhost:3000/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod-1", scheduledAt: "2025-01-20T10:00:00Z" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
