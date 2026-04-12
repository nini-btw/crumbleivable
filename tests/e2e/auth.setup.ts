/**
 * Authentication setup for E2E tests
 * Logs in as admin and saves storage state
 */

import { test as setup, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@crumbleivable.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const authFile = "tests/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  // Navigate to login
  await page.goto("/admin/login");
  await page.waitForSelector('[name="email"]');
  
  // Fill login form
  await page.fill('[name="email"]', ADMIN_EMAIL);
  await page.fill('[name="password"]', ADMIN_PASSWORD);
  await page.click('[data-testid="login-button"]');
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL("/admin", { timeout: 10000 });
  await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  
  // Save auth state
  await page.context().storageState({ path: authFile });
});
