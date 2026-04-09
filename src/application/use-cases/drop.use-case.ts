/**
 * Weekly drop use cases
 * @module application/use-cases/drop
 */

import type { WeeklyDrop, TimeRemaining } from "@/domain/entities/drop";
import { getTimeRemaining } from "@/domain/entities/drop";
import type { IDropRepository } from "@/domain/ports/repositories";

/**
 * Get current drop use case
 */
export class GetCurrentDropUseCase {
  constructor(private dropRepo: IDropRepository) {}

  async execute(): Promise<WeeklyDrop | null> {
    return this.dropRepo.getCurrent();
  }
}

/**
 * Get drop with time remaining
 */
export interface DropWithCountdown extends WeeklyDrop {
  timeRemaining: TimeRemaining;
}

export class GetDropCountdownUseCase {
  constructor(private dropRepo: IDropRepository) {}

  async execute(): Promise<DropWithCountdown | null> {
    const drop = await this.dropRepo.getCurrent();
    if (!drop) return null;

    return {
      ...drop,
      timeRemaining: getTimeRemaining(new Date(drop.scheduledAt)),
    };
  }
}

/**
 * Schedule drop use case (admin)
 */
export class ScheduleDropUseCase {
  constructor(private dropRepo: IDropRepository) {}

  async execute(
    drop: Omit<WeeklyDrop, "id" | "createdAt">
  ): Promise<WeeklyDrop> {
    return this.dropRepo.create(drop);
  }
}

/**
 * Cancel drop use case (admin)
 */
export class CancelDropUseCase {
  constructor(private dropRepo: IDropRepository) {}

  async execute(id: string): Promise<void> {
    return this.dropRepo.cancel(id);
  }
}

/**
 * Mark drop as revealed (called when countdown reaches zero)
 */
export class RevealDropUseCase {
  constructor(private dropRepo: IDropRepository) {}

  async execute(id: string): Promise<void> {
    return this.dropRepo.markRevealed(id);
  }
}
