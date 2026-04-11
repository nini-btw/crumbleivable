/**
 * Feature flags unit tests
 * @module tests/unit/features
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isFeatureEnabled, features } from "@/domain/config/features";

describe("isFeatureEnabled", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env after each test
    process.env = originalEnv;
  });

  describe("when env is undefined", () => {
    it("should return true for weeklyDrop", () => {
      delete process.env.NEXT_PUBLIC_FEATURE_WEEKLY_DROP;
      expect(isFeatureEnabled("weeklyDrop")).toBe(true);
    });

    it("should return true for vote", () => {
      delete process.env.NEXT_PUBLIC_FEATURE_VOTE;
      expect(isFeatureEnabled("vote")).toBe(true);
    });

    it("should return true for customBuilder", () => {
      delete process.env.NEXT_PUBLIC_FEATURE_CUSTOM_BUILDER;
      expect(isFeatureEnabled("customBuilder")).toBe(true);
    });

    it("should return true for analytics", () => {
      delete process.env.NEXT_PUBLIC_FEATURE_ANALYTICS;
      expect(isFeatureEnabled("analytics")).toBe(true);
    });
  });

  describe("when env is set to 'false'", () => {
    it("should return false for weeklyDrop", () => {
      process.env.NEXT_PUBLIC_FEATURE_WEEKLY_DROP = "false";
      expect(isFeatureEnabled("weeklyDrop")).toBe(false);
    });

    it("should return false for vote", () => {
      process.env.NEXT_PUBLIC_FEATURE_VOTE = "false";
      expect(isFeatureEnabled("vote")).toBe(false);
    });

    it("should return false for customBuilder", () => {
      process.env.NEXT_PUBLIC_FEATURE_CUSTOM_BUILDER = "false";
      expect(isFeatureEnabled("customBuilder")).toBe(false);
    });

    it("should return false for analytics", () => {
      process.env.NEXT_PUBLIC_FEATURE_ANALYTICS = "false";
      expect(isFeatureEnabled("analytics")).toBe(false);
    });
  });

  describe("when env is set to 'true'", () => {
    it("should return true for weeklyDrop", () => {
      process.env.NEXT_PUBLIC_FEATURE_WEEKLY_DROP = "true";
      expect(isFeatureEnabled("weeklyDrop")).toBe(true);
    });

    it("should return true for vote", () => {
      process.env.NEXT_PUBLIC_FEATURE_VOTE = "true";
      expect(isFeatureEnabled("vote")).toBe(true);
    });

    it("should return true for customBuilder", () => {
      process.env.NEXT_PUBLIC_FEATURE_CUSTOM_BUILDER = "true";
      expect(isFeatureEnabled("customBuilder")).toBe(true);
    });

    it("should return true for analytics", () => {
      process.env.NEXT_PUBLIC_FEATURE_ANALYTICS = "true";
      expect(isFeatureEnabled("analytics")).toBe(true);
    });
  });

  describe("when env is set to anything else like '0'", () => {
    it("should return true for weeklyDrop (only 'false' disables)", () => {
      process.env.NEXT_PUBLIC_FEATURE_WEEKLY_DROP = "0";
      expect(isFeatureEnabled("weeklyDrop")).toBe(true);
    });

    it("should return true for vote", () => {
      process.env.NEXT_PUBLIC_FEATURE_VOTE = "0";
      expect(isFeatureEnabled("vote")).toBe(true);
    });

    it("should return true for customBuilder", () => {
      process.env.NEXT_PUBLIC_FEATURE_CUSTOM_BUILDER = "0";
      expect(isFeatureEnabled("customBuilder")).toBe(true);
    });

    it("should return true for analytics", () => {
      process.env.NEXT_PUBLIC_FEATURE_ANALYTICS = "0";
      expect(isFeatureEnabled("analytics")).toBe(true);
    });

    it("should return true for random string values", () => {
      process.env.NEXT_PUBLIC_FEATURE_WEEKLY_DROP = "random";
      expect(isFeatureEnabled("weeklyDrop")).toBe(true);
    });
  });
});

describe("features object", () => {
  it("should have all 4 flag names defined", () => {
    expect(features).toHaveProperty("weeklyDrop");
    expect(features).toHaveProperty("vote");
    expect(features).toHaveProperty("customBuilder");
    expect(features).toHaveProperty("analytics");
  });
});
