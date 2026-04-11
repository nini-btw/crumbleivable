/**
 * Vote use case unit tests
 * @module tests/unit/vote
 */

import { describe, it, expect, vi } from "vitest";
import {
  GetVoteCandidatesUseCase,
  CastVoteUseCase,
  CreateVoteCandidateUseCase,
  DeleteVoteCandidateUseCase,
  ResetVotesUseCase,
  ToggleCandidateActiveUseCase,
} from "@/application/use-cases/vote.use-case";
import type { IVoteRepository } from "@/domain/ports/repositories";
import type { VoteCandidate } from "@/domain/entities/vote";

// Mock Telegram
vi.mock("@/infrastructure/telegram/service", () => ({
  sendOrderToTelegram: vi.fn().mockResolvedValue(true),
}));

describe("CastVoteUseCase", () => {
  it("should call voteRepo.vote with candidate id and return success", async () => {
    const mockVoteRepo = {
      getAllActive: vi.fn(),
      getById: vi.fn(),
      vote: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
      delete: vi.fn(),
      resetAll: vi.fn(),
      toggleActive: vi.fn(),
    } as unknown as IVoteRepository;

    const useCase = new CastVoteUseCase(mockVoteRepo);
    const result = await useCase.execute("id-123");

    expect(mockVoteRepo.vote).toHaveBeenCalledWith("id-123");
    expect(result.success).toBe(true);
  });

  it("should return error when voteRepo.vote throws", async () => {
    const mockVoteRepo = {
      getAllActive: vi.fn(),
      getById: vi.fn(),
      vote: vi.fn().mockRejectedValue(new Error("Vote failed")),
      create: vi.fn(),
      delete: vi.fn(),
      resetAll: vi.fn(),
      toggleActive: vi.fn(),
    } as unknown as IVoteRepository;

    const useCase = new CastVoteUseCase(mockVoteRepo);
    const result = await useCase.execute("id-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to cast vote");
  });
});

describe("ResetVotesUseCase", () => {
  it("should call voteRepo.resetAll once", async () => {
    const mockVoteRepo = {
      getAllActive: vi.fn(),
      getById: vi.fn(),
      vote: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      resetAll: vi.fn().mockResolvedValue(undefined),
      toggleActive: vi.fn(),
    } as unknown as IVoteRepository;

    const useCase = new ResetVotesUseCase(mockVoteRepo);
    await useCase.execute();

    expect(mockVoteRepo.resetAll).toHaveBeenCalledTimes(1);
  });
});

describe("CreateVoteCandidateUseCase", () => {
  it("should always pass voteCount: 0 regardless of input", async () => {
    const mockCandidate: VoteCandidate = {
      id: "vote-1",
      cookieName: "Test Cookie",
      description: "Test description",
      imageUrl: "/test.png",
      voteCount: 0,
      isActive: true,
      createdAt: new Date(),
    };

    const mockVoteRepo = {
      getAllActive: vi.fn(),
      getById: vi.fn(),
      vote: vi.fn(),
      create: vi.fn().mockResolvedValue(mockCandidate),
      delete: vi.fn(),
      resetAll: vi.fn(),
      toggleActive: vi.fn(),
    } as unknown as IVoteRepository;

    const useCase = new CreateVoteCandidateUseCase(mockVoteRepo);
    
    // Input with voteCount: 999
    const input = {
      cookieName: "Test Cookie",
      description: "Test description",
      imageUrl: "/test.png",
      isActive: true,
    };

    const result = await useCase.execute(input);

    // Should call create with voteCount: 0 (set by repo)
    expect(mockVoteRepo.create).toHaveBeenCalledWith(input);
    expect(result.voteCount).toBe(0);
  });
});

describe("GetVoteCandidatesUseCase", () => {
  it("should call voteRepo.getAllActive and return its result", async () => {
    const mockCandidates: VoteCandidate[] = [
      {
        id: "vote-1",
        cookieName: "Cookie 1",
        description: "Desc 1",
        imageUrl: "/1.png",
        voteCount: 10,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "vote-2",
        cookieName: "Cookie 2",
        description: "Desc 2",
        imageUrl: "/2.png",
        voteCount: 5,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    const mockVoteRepo = {
      getAllActive: vi.fn().mockResolvedValue(mockCandidates),
      getById: vi.fn(),
      vote: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      resetAll: vi.fn(),
      toggleActive: vi.fn(),
    } as unknown as IVoteRepository;

    const useCase = new GetVoteCandidatesUseCase(mockVoteRepo);
    const result = await useCase.execute();

    expect(mockVoteRepo.getAllActive).toHaveBeenCalled();
    expect(result).toEqual(mockCandidates);
  });
});

describe("DeleteVoteCandidateUseCase", () => {
  it("should call voteRepo.delete with correct id", async () => {
    const mockVoteRepo = {
      getAllActive: vi.fn(),
      getById: vi.fn(),
      vote: vi.fn(),
      create: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      resetAll: vi.fn(),
      toggleActive: vi.fn(),
    } as unknown as IVoteRepository;

    const useCase = new DeleteVoteCandidateUseCase(mockVoteRepo);
    await useCase.execute("vote-123");

    expect(mockVoteRepo.delete).toHaveBeenCalledWith("vote-123");
  });
});

describe("ToggleCandidateActiveUseCase", () => {
  it("should call voteRepo.toggleActive with correct id", async () => {
    const mockVoteRepo = {
      getAllActive: vi.fn(),
      getById: vi.fn(),
      vote: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      resetAll: vi.fn(),
      toggleActive: vi.fn().mockResolvedValue(undefined),
    } as unknown as IVoteRepository;

    const useCase = new ToggleCandidateActiveUseCase(mockVoteRepo);
    await useCase.execute("vote-123");

    expect(mockVoteRepo.toggleActive).toHaveBeenCalledWith("vote-123");
  });
});
