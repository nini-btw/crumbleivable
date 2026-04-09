/**
 * Vote repository adapter (MOCK VERSION)
 * @module infrastructure/db/vote-adapter
 */

import type { VoteCandidate } from "@/domain/entities/vote";
import type { IVoteRepository } from "@/domain/ports/repositories";
import { mockVoteCandidates } from "./mock-data";

/**
 * Vote repository implementation using MOCK DATA
 */
export class VoteRepository implements IVoteRepository {
  private candidates = [...mockVoteCandidates];

  async getAllActive(): Promise<VoteCandidate[]> {
    return this.candidates
      .filter((c) => c.isActive)
      .sort((a, b) => b.voteCount - a.voteCount);
  }

  async getById(id: string): Promise<VoteCandidate | null> {
    return this.candidates.find((c) => c.id === id) || null;
  }

  async vote(candidateId: string): Promise<void> {
    const candidate = await this.getById(candidateId);
    if (!candidate) throw new Error("Candidate not found");
    
    candidate.voteCount += 1;
  }

  async create(
    candidate: Omit<VoteCandidate, "id" | "voteCount" | "createdAt">
  ): Promise<VoteCandidate> {
    const newCandidate: VoteCandidate = {
      ...candidate,
      id: `vote-${Date.now()}`,
      voteCount: 0,
      createdAt: new Date(),
    };
    this.candidates.push(newCandidate);
    return newCandidate;
  }

  async delete(id: string): Promise<void> {
    this.candidates = this.candidates.filter((c) => c.id !== id);
  }

  async resetAll(): Promise<void> {
    this.candidates.forEach((c) => {
      c.voteCount = 0;
    });
  }

  async toggleActive(id: string): Promise<void> {
    const candidate = await this.getById(id);
    if (candidate) {
      candidate.isActive = !candidate.isActive;
    }
  }
}

/**
 * Singleton instance
 */
export const voteRepository = new VoteRepository();
