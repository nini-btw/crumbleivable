/**
 * Vote Page E2E Tests
 * @module tests/e2e/vote
 */

import { test, expect } from "@playwright/test";

test.describe("Vote Page", () => {
  test("loads with candidate list visible", async ({ page }) => {
    await page.goto("/vote");
    
    // Wait for candidates to load
    await page.waitForSelector('[data-testid="vote-candidate"]');
    
    // At least one candidate should be visible
    const candidates = page.locator('[data-testid="vote-candidate"]');
    await expect(candidates.first()).toBeVisible();
    expect(await candidates.count()).toBeGreaterThan(0);
  });

  test("clicking vote increments voteCount visually", async ({ page }) => {
    await page.goto("/vote");
    
    // Wait for candidates to load
    await page.waitForSelector('[data-testid="vote-candidate"]');
    
    // Get first candidate's vote count
    const firstCandidate = page.locator('[data-testid="vote-candidate"]').first();
    const voteCountLocator = firstCandidate.locator('[data-testid="vote-count"]');
    
    // Get initial count
    const initialCountText = await voteCountLocator.textContent();
    const initialCount = parseInt(initialCountText || "0", 10);
    
    // Click vote button
    const voteButton = firstCandidate.locator('[data-testid="vote-button"]');
    await voteButton.click();
    
    // Vote count should increment
    await expect(voteCountLocator).toHaveText(String(initialCount + 1));
  });
});
