/**
 * Admin Panel E2E Tests
 * @module tests/e2e/admin
 * 
 * Note: These tests use saved authentication state from auth.setup.ts
 * The setup project logs in as admin before these tests run.
 */

import { test, expect } from "@playwright/test";

// Tests that require authentication

test.describe("Admin Panel - Authenticated", () => {
  test("redirects to admin dashboard after login", async ({ page }) => {
    // Already logged in via storage state, just navigate to admin
    await page.goto("/admin");
    
    // Should be on admin dashboard
    await expect(page).toHaveURL("/admin", { timeout: 10000 });
    await page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test("can access products page", async ({ page }) => {
    // Navigate to products
    await page.goto("/admin/products");
    
    // Products page should load
    await expect(page).toHaveURL("/admin/products", { timeout: 10000 });
    await page.waitForSelector('[data-testid="products-page"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="products-page"]')).toBeVisible();
  });

  test("add new product appears in shop", async ({ page }) => {
    // Navigate to products
    await page.goto("/admin/products");
    await page.waitForSelector('[data-testid="products-page"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="products-page"]')).toBeVisible();
    
    // Click add product
    await page.click('[data-testid="add-product-button"]');
    
    // Wait for modal to open and form to be visible
    await page.waitForSelector('[name="name"]', { timeout: 10000 });
    
    // Fill product form with unique name
    const uniqueId = Date.now();
    const productName = `Test Product ${uniqueId}`;
    const uniqueSlug = `test-product-${uniqueId}`;
    await page.fill('[name="name"]', productName);
    await page.fill('[name="slug"]', uniqueSlug);
    await page.fill('textarea[name="description"]', "A test product description");
    await page.fill('[name="price"]', "150");
    // Type defaults to "cookie" which is fine for testing
    
    // Save product
    await page.click('[data-testid="save-product-button"]');
    
    // Wait for modal to close
    await page.waitForTimeout(1000);
    
    // Go to shop page
    await page.goto("/shop");
    await page.waitForSelector('[data-testid="product-card"]');
    
    // New product should be visible (use text contains for partial match)
    await expect(page.locator(`h3:has-text("Test Product ${uniqueId}")`)).toBeVisible();
  });

  test("toggle product inactive removes from shop", async ({ page }) => {
    // Navigate to products
    await page.goto("/admin/products");
    await page.waitForSelector('[data-testid="products-page"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="products-page"]')).toBeVisible();
    
    // Wait for products table to load
    await page.waitForSelector('[data-testid="product-name"]', { timeout: 10000 });
    
    // Use a specific seeded product that we know exists
    // Find "The Classics Box" which is a box product from seed data
    const productRow = page.locator('tr:has-text("The Classics Box")');
    const count = await productRow.count();
    
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Click edit button
    await productRow.locator('button[title="Edit"]').click();
    
    // Wait for edit modal to open
    await page.waitForSelector('[name="name"]', { timeout: 10000 });
    
    // Check current status
    const activeToggle = page.locator('form [data-testid="product-toggle"]');
    const isChecked = await activeToggle.isChecked();
    
    if (isChecked) {
      // Uncheck to deactivate
      await activeToggle.click();
      
      // Save the changes
      await page.click('[data-testid="save-product-button"]');
      
      // Wait for modal to close
      await page.waitForTimeout(1000);
      
      // Go to shop page
      await page.goto("/shop");
      await page.waitForSelector('[data-testid="product-card"]');
      
      // Product should no longer be visible (use more specific text match)
      await expect(page.locator('text=The Classics Box')).toHaveCount(0);
    } else {
      // Product already inactive, close modal and skip
      await page.keyboard.press('Escape');
      test.skip();
    }
  });
});

// Tests that don't require authentication (login flow)

test.describe("Admin Panel - Login Flow", () => {
  // Use a fresh page without storage state for these tests
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    
    // Should redirect to login
    await expect(page).toHaveURL("/admin/login");
    
    // Login form should be visible
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test("shows error on wrong password and stays on login", async ({ page }) => {
    const ADMIN_EMAIL = "admin@crumbleivable.com";
    
    await page.goto("/admin/login");
    
    // Wait for form to be ready
    await page.waitForSelector('[name="email"]');
    
    // Fill login form with wrong credentials
    await page.fill('[name="email"]', ADMIN_EMAIL);
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Invalid");
    
    // Should stay on login page
    await expect(page).toHaveURL("/admin/login");
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    const ADMIN_EMAIL = "admin@crumbleivable.com";
    const ADMIN_PASSWORD = "admin123";
    
    await page.goto("/admin/login");
    
    // Wait for form to be ready
    await page.waitForSelector('[name="email"]');
    
    // Fill login form with correct credentials
    await page.fill('[name="email"]', ADMIN_EMAIL);
    await page.fill('[name="password"]', ADMIN_PASSWORD);
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL("/admin", { timeout: 10000 });
    
    // Dashboard should be visible
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });
});
