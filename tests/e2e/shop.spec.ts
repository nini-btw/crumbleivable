/**
 * Shop E2E Tests
 * @module tests/e2e/shop
 */

import { test, expect } from "@playwright/test";

test.describe("Shop Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop");
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
  });

  test("loads with at least one product card visible", async ({ page }) => {
    // At least one product card should be visible
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test("inactive product does not appear on shop page", async ({ page }) => {
    // This test assumes an inactive product exists in the database
    // The inactive product should not be visible
    const inactiveProductName = "Inactive Test Product";
    const inactiveProduct = page.locator(`text=${inactiveProductName}`);
    
    // Inactive product should not be present
    await expect(inactiveProduct).toHaveCount(0);
  });

  test("clicking product card navigates to product detail page", async ({ page }) => {
    // Click first product card
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // URL should change to /shop/[slug]
    await expect(page).toHaveURL(/\/shop\/[\w-]+/);
    
    // Product detail should be visible
    await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
  });

  test("visiting nonexistent slug shows 404 page", async ({ page }) => {
    await page.goto("/shop/nonexistent-product-slug");
    
    // 404 page should be rendered
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
  });
});
