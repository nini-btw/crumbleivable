/**
 * Vote use case unit tests
 * @module tests/unit/vote.use-case
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetVoteCandidatesUseCase,
  CastVoteUseCase,
  CreateVoteCandidateUseCase,
  DeleteVoteCandidateUseCase,
  ResetVotesUseCase,
  ToggleCandidateActiveUseCase,
} from "@/application/use-cases/vote.use-case";
import { createMockVoteRepository } from "@/tests/helpers/mock-repositories";
import { createVoteCandidate } from "@/tests/helpers/factories";
import type { IVoteRepository } from "@/domain/ports/repositories";

describe("CastVoteUseCase", () => {
  let mockVoteRepo: IVoteRepository;
  let useCase: CastVoteUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteRepo = createMockVoteRepository();
    useCase = new CastVoteUseCase(mockVoteRepo);
  });

  it("should call voteRepo.vote with candidate id and return success", async () => {
    vi.mocked(mockVoteRepo.vote).mockResolvedValue(undefined);

    const result = await useCase.execute("candidate-123");

    expect(mockVoteRepo.vote).toHaveBeenCalledWith("candidate-123");
    expect(result.success).toBe(true);
  });

  it("should return error when voteRepo.vote throws", async () => {
    vi.mocked(mockVoteRepo.vote).mockRejectedValue(new Error("Vote failed"));

    const result = await useCase.execute("candidate-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to cast vote");
  });

  it("should return error when candidate not found", async () => {
    vi.mocked(mockVoteRepo.vote).mockRejectedValue(new Error("Candidate not found"));

    const result = await useCase.execute("non-existent");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to cast vote");
  });
});

describe("GetVoteCandidatesUseCase", () => {
  let mockVoteRepo: IVoteRepository;
  let useCase: GetVoteCandidatesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteRepo = createMockVoteRepository();
    useCase = new GetVoteCandidatesUseCase(mockVoteRepo);
  });

  it("should call voteRepo.getAllActive and return its result", async () => {
    const mockCandidates = [
      createVoteCandidate({ voteCount: 10 }),
      createVoteCandidate({ voteCount: 5 }),
    ];
    vi.mocked(mockVoteRepo.getAllActive).mockResolvedValue(mockCandidates);

    const result = await useCase.execute();

    expect(mockVoteRepo.getAllActive).toHaveBeenCalled();
    expect(result).toEqual(mockCandidates);
  });

  it("should return empty array when no candidates", async () => {
    vi.mocked(mockVoteRepo.getAllActive).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });
});

describe("CreateVoteCandidateUseCase", () => {
  let mockVoteRepo: IVoteRepository;
  let useCase: CreateVoteCandidateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteRepo = createMockVoteRepository();
    useCase = new CreateVoteCandidateUseCase(mockVoteRepo);
  });

  it("should create candidate with provided data", async () => {
    const mockCandidate = createVoteCandidate();
    vi.mocked(mockVoteRepo.create).mockResolvedValue(mockCandidate);

    const input = {
      cookieName: "Test Cookie",
      description: "Test description",
      imageUrl: "/test.png",
      isActive: true,
    };

    const result = await useCase.execute(input);

    expect(mockVoteRepo.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockCandidate);
  });

  it("should always create with voteCount: 0 (repo sets this)", async () => {
    const mockCandidate = createVoteCandidate({ voteCount: 0 });
    vi.mocked(mockVoteRepo.create).mockResolvedValue(mockCandidate);

    const input = {
      cookieName: "Test Cookie",
      description: "Test description",
      imageUrl: "/test.png",
      isActive: true,
    };

    const result = await useCase.execute(input);
    expect(result.voteCount).toBe(0);
  });
});

describe("DeleteVoteCandidateUseCase", () => {
  let mockVoteRepo: IVoteRepository;
  let useCase: DeleteVoteCandidateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteRepo = createMockVoteRepository();
    useCase = new DeleteVoteCandidateUseCase(mockVoteRepo);
  });

  it("should call voteRepo.delete with correct id", async () => {
    vi.mocked(mockVoteRepo.delete).mockResolvedValue(undefined);

    await useCase.execute("vote-123");

    expect(mockVoteRepo.delete).toHaveBeenCalledWith("vote-123");
  });
});

describe("ResetVotesUseCase", () => {
  let mockVoteRepo: IVoteRepository;
  let useCase: ResetVotesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteRepo = createMockVoteRepository();
    useCase = new ResetVotesUseCase(mockVoteRepo);
  });

  it("should call voteRepo.resetAll once", async () => {
    vi.mocked(mockVoteRepo.resetAll).mockResolvedValue(undefined);

    await useCase.execute();

    expect(mockVoteRepo.resetAll).toHaveBeenCalledTimes(1);
  });
});

describe("ToggleCandidateActiveUseCase", () => {
  let mockVoteRepo: IVoteRepository;
  let useCase: ToggleCandidateActiveUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteRepo = createMockVoteRepository();
    useCase = new ToggleCandidateActiveUseCase(mockVoteRepo);
  });

  it("should call voteRepo.toggleActive with correct id", async () => {
    vi.mocked(mockVoteRepo.toggleActive).mockResolvedValue(undefined);

    await useCase.execute("vote-123");

    expect(mockVoteRepo.toggleActive).toHaveBeenCalledWith("vote-123");
  });
});
