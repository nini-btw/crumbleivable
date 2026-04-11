/**
 * Votes API Integration Tests
 * @module tests/integration/api/votes
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { seedVoteCandidate, cleanVoteCandidates, closeConnection } from "@/tests/helpers/seed";
import { getAdminCookie } from "@/tests/helpers/auth";
import { validVoteCandidatePayload } from "@/tests/helpers/fixtures";

// Mock Telegram
vi.mock("@/infrastructure/telegram/service", () => ({
  sendOrderToTelegram: vi.fn().mockResolvedValue(true),
}));

const API_URL = "http://localhost:3000/api";

describe("Votes API", () => {
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await getAdminCookie();
  });

  afterAll(async () => {
    await closeConnection();
  });

  beforeEach(async () => {
    await cleanVoteCandidates();
  });

  afterEach(async () => {
    await cleanVoteCandidates();
  });

  describe("GET /api/votes", () => {
    it("should return 200 with only active candidates sorted by voteCount desc", async () => {
      // Seed candidates with different vote counts
      await seedVoteCandidate({ cookieName: "Candidate A", voteCount: 10, isActive: true });
      await seedVoteCandidate({ cookieName: "Candidate B", voteCount: 20, isActive: true });
      await seedVoteCandidate({ cookieName: "Candidate C", voteCount: 5, isActive: false });

      const response = await fetch(`${API_URL}/votes`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // Only active candidates should be returned
      data.data.forEach((candidate: any) => {
        expect(candidate.isActive).toBe(true);
      });
      
      // Should be sorted by voteCount desc
      if (data.data.length >= 2) {
        expect(data.data[0].voteCount).toBeGreaterThanOrEqual(data.data[1].voteCount);
      }
    });
  });

  describe("POST /api/votes", () => {
    it("should return 400 for missing candidateId", async () => {
      const response = await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Missing candidateId");
    });

    it("should return 500 with Candidate not found for nonexistent candidateId", async () => {
      const response = await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: "00000000-0000-0000-0000-000000000000" }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain("Candidate not found");
    });

    it("should return 200 with success true for valid candidateId", async () => {
      const candidate = await seedVoteCandidate();

      const response = await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should increment voteCount by 2 when voting twice (no one-per-user enforcement)", async () => {
      const candidate = await seedVoteCandidate({ voteCount: 5 });

      // Vote twice
      await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      // Verify vote count increased by 2
      const response = await fetch(`${API_URL}/votes`);
      const data = await response.json();
      const updatedCandidate = data.data.find((c: any) => c.id === candidate.id);
      expect(updatedCandidate.voteCount).toBe(7);
    });
  });

  describe("PUT /api/votes", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/votes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validVoteCandidatePayload),
      });

      expect(response.status).toBe(401);
    });

    it("should return 201 with voteCount 0 for valid body", async () => {
      const response = await fetch(`${API_URL}/votes`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify(validVoteCandidatePayload),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.voteCount).toBe(0);
    });

    it("should return 400 for missing cookieName", async () => {
      const payload = { ...validVoteCandidatePayload };
      delete (payload as any).cookieName;

      const response = await fetch(`${API_URL}/votes`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing imageUrl", async () => {
      const payload = { ...validVoteCandidatePayload };
      delete (payload as any).imageUrl;

      const response = await fetch(`${API_URL}/votes`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/votes/[id]", () => {
    it("should return 401 without auth", async () => {
      const candidate = await seedVoteCandidate();

      const response = await fetch(`${API_URL}/votes/${candidate.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth and valid id", async () => {
      const candidate = await seedVoteCandidate();

      const response = await fetch(`${API_URL}/votes/${candidate.id}`, {
        method: "DELETE",
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/votes/reset", () => {
    it("should return 401 without auth", async () => {
      const response = await fetch(`${API_URL}/votes/reset`, {
        method: "POST",
      });

      expect(response.status).toBe(401);
    });

    it("should return 200 with auth and all candidates have voteCount 0", async () => {
      // Seed candidates with votes
      await seedVoteCandidate({ cookieName: "Candidate A", voteCount: 10 });
      await seedVoteCandidate({ cookieName: "Candidate B", voteCount: 20 });

      // Reset votes
      const response = await fetch(`${API_URL}/votes/reset`, {
        method: "POST",
        headers: { Cookie: adminCookie },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify all candidates have 0 votes
      const listResponse = await fetch(`${API_URL}/votes`);
      const listData = await listResponse.json();
      
      listData.data.forEach((candidate: any) => {
        expect(candidate.voteCount).toBe(0);
      });
    });
  });
});
