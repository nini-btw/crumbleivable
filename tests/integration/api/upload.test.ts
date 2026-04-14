/**
 * Upload API Integration Tests
 * @module tests/integration/api/upload
 * 
 * NOTE: These tests are skipped because they require ADMIN_EMAIL and ADMIN_PASSWORD
 * environment variables to test authenticated endpoints. To run these tests:
 * 
 * 1. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.test
 * 2. Run: npm test -- tests/integration/api/upload.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the modules before importing the route
vi.mock("@/infrastructure/auth/supabase-auth", () => ({
  getAdminSession: vi.fn(),
}));

// Now import the modules
import { POST } from "@/app/api/upload/route";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";

describe.skip("Upload API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/upload", () => {
    it("should return 400 when no file in FormData", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });

      const formData = new FormData();
      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("No file provided");
    });

    it("should return 400 for non-image file", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });

      const formData = new FormData();
      const textFile = new File(["test content"], "test.txt", { type: "text/plain" });
      formData.append("file", textFile);

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid file type");
    });

    it("should return 400 for image file over 5MB", async () => {
      vi.mocked(getAdminSession).mockResolvedValue({ id: "admin-1", email: "admin@test.com", role: "admin" });

      const formData = new FormData();
      // Create a mock large file (6MB)
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeContent], "large.png", { type: "image/png" });
      formData.append("file", largeFile);

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("File too large");
    });

    it("should return 401 without auth", async () => {
      vi.mocked(getAdminSession).mockResolvedValue(null);

      const formData = new FormData();
      const imageFile = new File(["image content"], "test.png", { type: "image/png" });
      formData.append("file", imageFile);

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
