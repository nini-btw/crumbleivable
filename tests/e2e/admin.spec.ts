/**
 * Admin Panel E2E Tests
 * @module tests/e2e/admin
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    
    // Should redirect to login
    await expect(page).toHaveURL("/admin/login");
    
    // Login form should be visible
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test("shows error on wrong password and stays on login", async ({ page }) => {
    await page.goto("/admin/login");
    
    // Fill login form with wrong credentials
    await page.fill('[name="email"]', process.env.ADMIN_EMAIL || "admin@example.com");
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Invalid");
    
    // Should stay on login page
    await expect(page).toHaveURL("/admin/login");
  });

  test("redirects to admin dashboard after successful login", async ({ page }) => {
    await page.goto("/admin/login");
    
    // Fill login form with correct credentials
    await page.fill('[name="email"]', process.env.ADMIN_EMAIL || "admin@example.com");
    await page.fill('[name="password"]', process.env.ADMIN_PASSWORD || "correctpassword");
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL("/admin");
    
    // Dashboard should be visible
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test("can access products page after login", async ({ page }) => {
    // Login first
    await page.goto("/admin/login");
    await page.fill('[name="email"]', process.env.ADMIN_EMAIL || "admin@example.com");
    await page.fill('[name="password"]', process.env.ADMIN_PASSWORD || "correctpassword");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/admin");
    
    // Navigate to products
    await page.click('[data-testid="nav-products"]');
    await expect(page).toHaveURL("/admin/products");
    
    // Products page should load
    await expect(page.locator('[data-testid="products-page"]')).toBeVisible();
  });

  test("add new product appears in shop", async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill('[name="email"]', process.env.ADMIN_EMAIL || "admin@example.com");
    await page.fill('[name="password"]', process.env.ADMIN_PASSWORD || "correctpassword");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/admin");
    
    // Go to products page
    await page.click('[data-testid="nav-products"]');
    await expect(page).toHaveURL("/admin/products");
    
    // Click add product
    await page.click('[data-testid="add-product-button"]');
    
    // Fill product form
    const uniqueSlug = `test-product-${Date.now()}`;
    await page.fill('[name="name"]', "Test Product");
    await page.fill('[name="slug"]', uniqueSlug);
    await page.fill('[name="description"]', "A test product description");
    await page.fill('[name="price"]', "150");
    await page.selectOption('[name="type"]', "cookie");
    
    // Save product
    await page.click('[data-testid="save-product-button"]');
    
    // Go to shop page
    await page.goto("/shop");
    
    // New product should be visible
    await expect(page.locator(`text=Test Product`)).toBeVisible();
  });

  test("toggle product inactive removes from shop", async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill('[name="email"]', process.env.ADMIN_EMAIL || "admin@example.com");
    await page.fill('[name="password"]', process.env.ADMIN_PASSWORD || "correctpassword");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/admin");
    
    // Go to products page
    await page.click('[data-testid="nav-products"]');
    
    // Find the product toggle and click it to deactivate
    const productToggle = page.locator('[data-testid="product-toggle"]').first();
    await productToggle.click();
    
    // Get product name
    const productName = await page.locator('[data-testid="product-name"]').first().textContent();
    
    // Go to shop page
    await page.goto("/shop");
    
    // Product should no longer be visible
    await expect(page.locator(`text=${productName}`)).toHaveCount(0);
  });
});
