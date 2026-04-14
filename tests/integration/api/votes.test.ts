/**
 * Votes API Integration Tests
 * @module tests/integration/api/votes
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the modules before importing the route
vi.mock("@/infrastructure/db/vote.adapter", () => ({
  voteRepository: {
    getAllActive: vi.fn(),
    hasVoted: vi.fn(),
    vote: vi.fn(),
  },
}));

// Now import the modules
import { GET, POST } from "@/app/api/votes/route";
import { voteRepository } from "@/infrastructure/db/vote.adapter";
import { createVoteCandidate } from "@/tests/helpers/factories";

describe("Votes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/votes", () => {
    it("should return 200 with active candidates", async () => {
      const mockCandidates = [
        createVoteCandidate({ id: "candidate-1", cookieName: "Candidate 1", voteCount: 5 }),
        createVoteCandidate({ id: "candidate-2", cookieName: "Candidate 2", voteCount: 3 }),
      ];
      vi.mocked(voteRepository.getAllActive).mockResolvedValue(mockCandidates);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].voteCount).toBe(5);
    });

    it("should return empty array when no active candidates", async () => {
      vi.mocked(voteRepository.getAllActive).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it("should return 500 when repository throws", async () => {
      vi.mocked(voteRepository.getAllActive).mockRejectedValue(new Error("DB error"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch vote candidates");
    });
  });

  describe("POST /api/votes", () => {
    it("should return 400 for missing candidateId", async () => {
      const request = new NextRequest("http://localhost:3000/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Missing candidateId");
    });

    it("should return 409 for duplicate vote", async () => {
      vi.mocked(voteRepository.hasVoted).mockResolvedValue(true);

      const request = new NextRequest("http://localhost:3000/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: "candidate-1" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain("already voted");
    });

    it("should return 200 with successful vote", async () => {
      vi.mocked(voteRepository.hasVoted).mockResolvedValue(false);
      vi.mocked(voteRepository.vote).mockResolvedValue();

      const request = new NextRequest("http://localhost:3000/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: "candidate-1" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("Vote cast");
    });
  });
});
