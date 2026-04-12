/**
 * Drop entity unit tests
 * @module tests/unit/drop.entities
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDropStatus, getTimeRemaining } from "@/domain/entities/drop";
import { createWeeklyDrop } from "@/tests/helpers/factories";
import { vi } from "vitest";

describe("Drop Entities", () => {
  describe("getDropStatus", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "ended" when revealedAt is set', () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      
      const drop = createWeeklyDrop({
        scheduledAt: new Date("2024-01-15T10:00:00Z"), // Already past
        revealedAt: new Date("2024-01-15T11:00:00Z"),
      });

      expect(getDropStatus(drop)).toBe("ended");
    });

    it('should return "live" when scheduled time has passed and not revealed', () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      
      const drop = createWeeklyDrop({
        scheduledAt: new Date("2024-01-15T10:00:00Z"), // 2 hours ago
        revealedAt: undefined,
      });

      expect(getDropStatus(drop)).toBe("live");
    });

    it('should return "upcoming" when scheduled time is in the future', () => {
      vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
      
      const drop = createWeeklyDrop({
        scheduledAt: new Date("2024-01-15T12:00:00Z"), // 2 hours from now
        revealedAt: undefined,
      });

      expect(getDropStatus(drop)).toBe("upcoming");
    });

    it('should return "ended" regardless of scheduled time when revealedAt is set', () => {
      vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
      
      const drop = createWeeklyDrop({
        scheduledAt: new Date("2024-01-15T12:00:00Z"), // Future
        revealedAt: new Date("2024-01-15T09:00:00Z"), // But already revealed
      });

      expect(getDropStatus(drop)).toBe("ended");
    });

    it('should return "live" exactly at scheduled time', () => {
      const scheduledTime = new Date("2024-01-15T12:00:00Z");
      vi.setSystemTime(scheduledTime);
      
      const drop = createWeeklyDrop({
        scheduledAt: scheduledTime,
        revealedAt: undefined,
      });

      expect(getDropStatus(drop)).toBe("live");
    });
  });

  describe("getTimeRemaining", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return all zeros when scheduled time has passed", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      const scheduledAt = new Date("2024-01-15T10:00:00Z"); // 2 hours ago

      const result = getTimeRemaining(scheduledAt);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.total).toBeLessThanOrEqual(0);
    });

    it("should calculate correct time for 1 day remaining", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      const scheduledAt = new Date("2024-01-16T12:00:00Z"); // Exactly 24 hours later

      const result = getTimeRemaining(scheduledAt);

      expect(result.days).toBe(1);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.total).toBe(24 * 60 * 60 * 1000);
    });

    it("should calculate correct time for mixed duration", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      // 1 day, 2 hours, 30 minutes, 45 seconds from now
      const scheduledAt = new Date("2024-01-16T14:30:45Z");

      const result = getTimeRemaining(scheduledAt);

      expect(result.days).toBe(1);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(45);
    });

    it("should handle very short remaining time (seconds only)", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      const scheduledAt = new Date("2024-01-15T12:00:45Z"); // 45 seconds later

      const result = getTimeRemaining(scheduledAt);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(45);
    });

    it("should handle exactly at time (all zeros)", () => {
      const now = new Date("2024-01-15T12:00:00Z");
      vi.setSystemTime(now);

      const result = getTimeRemaining(now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.total).toBe(0);
    });

    it("should never return negative values", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      const scheduledAt = new Date("2024-01-14T10:00:00Z"); // Way in the past

      const result = getTimeRemaining(scheduledAt);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.total).toBeLessThanOrEqual(0);
    });
  });
});
