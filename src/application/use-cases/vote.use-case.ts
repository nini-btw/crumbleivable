/**
 * Vote use cases
 * @module application/use-cases/vote
 */

import type { VoteCandidate } from "@/domain/entities/vote";
import type { IVoteRepository } from "@/domain/ports/repositories";

/**
 * Get all active vote candidates
 */
export class GetVoteCandidatesUseCase {
  constructor(private voteRepo: IVoteRepository) {}

  async execute(): Promise<VoteCandidate[]> {
    return this.voteRepo.getAllActive();
  }
}

/**
 * Cast vote use case
 */
export interface CastVoteResult {
  success: boolean;
  error?: string;
}

export class CastVoteUseCase {
  constructor(private voteRepo: IVoteRepository) {}

  async execute(candidateId: string): Promise<CastVoteResult> {
    try {
      await this.voteRepo.vote(candidateId);
      return { success: true };
    } catch (error) {
      console.error("Vote failed:", error);
      return { success: false, error: "Failed to cast vote" };
    }
  }
}

/**
 * Create vote candidate (admin)
 */
export class CreateVoteCandidateUseCase {
  constructor(private voteRepo: IVoteRepository) {}

  async execute(
    candidate: Omit<VoteCandidate, "id" | "voteCount" | "createdAt">
  ): Promise<VoteCandidate> {
    return this.voteRepo.create(candidate);
  }
}

/**
 * Delete vote candidate (admin)
 */
export class DeleteVoteCandidateUseCase {
  constructor(private voteRepo: IVoteRepository) {}

  async execute(id: string): Promise<void> {
    return this.voteRepo.delete(id);
  }
}

/**
 * Reset all votes (admin)
 */
export class ResetVotesUseCase {
  constructor(private voteRepo: IVoteRepository) {}

  async execute(): Promise<void> {
    return this.voteRepo.resetAll();
  }
}

/**
 * Toggle candidate active status (admin)
 */
export class ToggleCandidateActiveUseCase {
  constructor(private voteRepo: IVoteRepository) {}

  async execute(id: string): Promise<void> {
    return this.voteRepo.toggleActive(id);
  }
}
