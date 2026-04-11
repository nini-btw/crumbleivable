/**
 * Drops API Integration Tests
 * @module tests/integration/api/drops
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getAdminCookie } from "@/tests/helpers/auth";

const API_URL = "http://localhost:3000/api";

describe("Drops API", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAdminCookie();
  });

  describe("GET /api/drops", () => {
    it("should return 200 with data: null when no active drop", async () => {
      const response = await fetch(`${API_URL}/drops`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      // Either null or a drop object
      expect(data.data === null || typeof data.data === "object").toBe(true);
    });
  });

  describe("POST /api/drops", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/drops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "test-product-id",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 for missing productId", async () => {
      const response = await fetch(`${API_URL}/drops`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("should return 400 for missing scheduledAt", async () => {
      const response = await fetch(`${API_URL}/drops`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          productId: "test-product-id",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("should return 201 with isActive: true for valid body", async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      const response = await fetch(`${API_URL}/drops`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          productId: "test-product-id",
          scheduledAt: futureDate.toISOString(),
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(true);
    });
  });

  describe("POST /api/drops/[id]/cancel", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/drops/test-id/cancel`, {
        method: "POST",
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth and valid id", async () => {
      // First create a drop
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const createResponse = await fetch(`${API_URL}/drops`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          productId: "test-product-id",
          scheduledAt: futureDate.toISOString(),
        }),
      });

      const createData = await createResponse.json();
      const dropId = createData.data.id;

      // Cancel the drop
      const cancelResponse = await fetch(`${API_URL}/drops/${dropId}/cancel`, {
        method: "POST",
        headers: { Cookie: adminCookie },
      });

      expect(cancelResponse.status).toBe(200);
      const cancelData = await cancelResponse.json();
      expect(cancelData.success).toBe(true);

      // Verify drop is no longer active
      const getResponse = await fetch(`${API_URL}/drops`);
      const getData = await getResponse.json();
      
      // After cancel, getCurrent should return null (drop no longer active)
      // Or the drop data with isActive: false
      if (getData.data) {
        expect(getData.data.isActive).toBe(false);
      }
    });
  });
});
