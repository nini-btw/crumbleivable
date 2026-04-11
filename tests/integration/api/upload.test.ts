/**
 * Upload API Integration Tests
 * @module tests/integration/api/upload
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import { getAdminCookie } from "@/tests/helpers/auth";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

// Mock fs
vi.mock("fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

const API_URL = "http://localhost:3000/api";

describe("Upload API", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAdminCookie();
  });

  it("should return 400 when no file in FormData", async () => {
    const formData = new FormData();
    // No file added

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: formData,
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("No file provided");
  });

  it("should return 400 for non-image file", async () => {
    const formData = new FormData();
    const textFile = new File(["test content"], "test.txt", { type: "text/plain" });
    formData.append("file", textFile);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: formData,
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("File must be an image");
  });

  it("should return 400 for image file over 5MB", async () => {
    const formData = new FormData();
    // Create a mock file larger than 5MB
    const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
    const imageFile = new File([largeContent], "large.jpg", { type: "image/jpeg" });
    formData.append("file", imageFile);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: formData,
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("File size must be less than 5MB");
  });

  it("should return 401 without auth", async () => {
    const formData = new FormData();
    const imageFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    formData.append("file", imageFile);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(401);
  });
});
