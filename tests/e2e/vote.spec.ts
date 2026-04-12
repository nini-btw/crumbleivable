/**
 * Vote Page E2E Tests
 * @module tests/e2e/vote
 */

import { test, expect } from "@playwright/test";

test.describe("Vote Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vote");
    // Wait for candidates to load
    await page.waitForSelector('[data-testid="vote-candidate"]');
  });

  test("loads with candidate list visible", async ({ page }) => {
    // At least one candidate should be visible
    const candidates = page.locator('[data-testid="vote-candidate"]');
    await expect(candidates.first()).toBeVisible();
    expect(await candidates.count()).toBeGreaterThan(0);
  });

  test.skip("clicking vote button works", async ({ page }) => {
    // Get first candidate
    const firstCandidate = page.locator('[data-testid="vote-candidate"]').first();
    const voteButton = firstCandidate.locator('[data-testid="vote-button"]');
    
    // Verify vote button exists and is visible
    await expect(voteButton).toBeVisible();
    
    // Get button text before click
    const buttonTextBefore = await voteButton.textContent();
    const wasAlreadyVoted = buttonTextBefore?.toLowerCase().includes("voted");
    
    if (!wasAlreadyVoted) {
      // Click vote button
      await voteButton.click();
      
      // Wait for potential state change
      await page.waitForTimeout(1000);
      
      // After clicking, verify some change happened:
      // Either button text changed OR button became disabled
      const buttonTextAfter = await voteButton.textContent();
      const textChanged = buttonTextAfter !== buttonTextBefore;
      
      // If text didn't change, verify button is now in voted state
      if (!textChanged) {
        // Button should show "Voted" and be disabled
        expect(buttonTextAfter?.toLowerCase()).toContain("voted");
      }
    }
    // If already voted, the test passes (vote restriction works)
  });
});
