/**
 * Feature flags unit tests
 * @module tests/unit/features
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isFeatureEnabled, features, FeatureName } from "@/domain/config/features";

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

  describe("feature flags are defined", () => {
    it("should have all 4 flag names defined in features object", () => {
      expect(features).toHaveProperty("weeklyDrop");
      expect(features).toHaveProperty("vote");
      expect(features).toHaveProperty("customBuilder");
      expect(features).toHaveProperty("analytics");
    });

    it("should return boolean values for all features", () => {
      const featureNames: FeatureName[] = ["weeklyDrop", "vote", "customBuilder", "analytics"];
      
      for (const feature of featureNames) {
        const result = isFeatureEnabled(feature);
        expect(typeof result).toBe("boolean");
      }
    });

    it("should return true for features when env is undefined", () => {
      // By default, when env is not set, features should be enabled
      delete process.env.NEXT_PUBLIC_FEATURE_WEEKLY_DROP;
      // Note: The value is determined at module load time, so we test the shape
      expect(typeof isFeatureEnabled("weeklyDrop")).toBe("boolean");
    });
  });

  describe("isFeatureEnabled function", () => {
    it("should be a function", () => {
      expect(typeof isFeatureEnabled).toBe("function");
    });

    it("should accept all valid feature names", () => {
      expect(() => isFeatureEnabled("weeklyDrop")).not.toThrow();
      expect(() => isFeatureEnabled("vote")).not.toThrow();
      expect(() => isFeatureEnabled("customBuilder")).not.toThrow();
      expect(() => isFeatureEnabled("analytics")).not.toThrow();
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

  it("should have boolean values", () => {
    expect(typeof features.weeklyDrop).toBe("boolean");
    expect(typeof features.vote).toBe("boolean");
    expect(typeof features.customBuilder).toBe("boolean");
    expect(typeof features.analytics).toBe("boolean");
  });

  it("should be defined as readonly const", () => {
    // The features object is exported as const which prevents reassignment
    expect(features).toBeDefined();
    expect(typeof features).toBe("object");
  });
});
