/**
 * Cart and Checkout E2E Tests
 * @module tests/e2e/cart-checkout
 */

import { test, expect } from "@playwright/test";

test.describe("Cart Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop");
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
  });

  test("checkout button disabled with 1 cookie, shows cookies needed", async ({ page }) => {
    // Add 1 cookie to cart
    await page.locator('[data-testid="add-to-cart-button"]').first().click();
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Checkout button should be disabled
    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await expect(checkoutButton).toBeDisabled();
    
    // Should show cookies needed count
    const cookiesNeeded = page.locator('[data-testid="cookies-needed"]');
    await expect(cookiesNeeded).toContainText("2");
  });

  test("checkout button still disabled with 2 cookies", async ({ page }) => {
    // Add 2 cookies using nth() method
    const addButtons = page.locator('[data-testid="add-to-cart-button"]');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Checkout button should still be disabled
    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await expect(checkoutButton).toBeDisabled();
    
    // Should show 1 cookie needed
    const cookiesNeeded = page.locator('[data-testid="cookies-needed"]');
    await expect(cookiesNeeded).toContainText("1");
  });

  test("checkout button enabled after adding 3rd cookie", async ({ page }) => {
    // Add 3 cookies using nth() method
    const addButtons = page.locator('[data-testid="add-to-cart-button"]');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await addButtons.nth(2).click();
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Checkout button should be enabled
    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await expect(checkoutButton).toBeEnabled();
  });

  test("checkout immediately enabled after adding 1 box", async ({ page }) => {
    // Find and add a box (type="box")
    const boxAddButton = page.locator('[data-product-type="box"] [data-testid="add-to-cart-button"]').first();
    await boxAddButton.click();
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Checkout button should be enabled (box = 3 cookies)
    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await expect(checkoutButton).toBeEnabled();
  });

  test("place order success with valid form data", async ({ page }) => {
    // Add 3 cookies
    const addButtons = page.locator('[data-testid="add-to-cart-button"]');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await addButtons.nth(2).click();
    
    // Go to cart
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Fill checkout form
    await page.fill('[name="fullName"]', "Test Customer");
    await page.fill('[name="phone"]', "+213 555 123 456");
    await page.fill('[name="address"]', "123 Test Street, Oran");
    
    // Submit order
    await page.click('[data-testid="place-order-button"]');
    
    // Success state should appear
    const successMessage = page.locator('[data-testid="order-success"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText("Order placed successfully");
  });

  test("form validation blocks order when phone empty", async ({ page }) => {
    // Add 3 cookies
    const addButtons = page.locator('[data-testid="add-to-cart-button"]');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await addButtons.nth(2).click();
    
    // Go to cart
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Fill form but leave phone empty
    await page.fill('[name="fullName"]', "Test Customer");
    await page.fill('[name="phone"]', "");
    await page.fill('[name="address"]', "123 Test Street, Oran");
    
    // Try to submit
    await page.click('[data-testid="place-order-button"]');
    
    // Should still be on checkout page (validation prevents submission)
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    
    // Phone field should show validation error (check for invalid state)
    const phoneInput = page.locator('[name="phone"]');
    await expect(phoneInput).toHaveClass(/border-red-400/);
  });

  test.skip("cart persists after page reload (requires Redux persist)", async ({ page }) => {
    // Note: This test verifies cart behavior. Currently, Redux persist is not 
    // configured in this project, so the cart will reset on page reload.
    // This test documents the expected behavior once persistence is added.
    
    // Add items to cart
    const addButtons = page.locator('[data-testid="add-to-cart-button"]');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    
    // Get cart count before reload
    await page.waitForSelector('[data-testid="cart-count"]');
    const cartCountBefore = await page.locator('[data-testid="cart-count"]').textContent();
    expect(cartCountBefore).toBe("2");
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="product-card"]');
    
    // After reload, cart should be reset (until Redux persist is implemented)
    // For now, just verify the page loaded and cart is in initial state
    await expect(page.locator('h1')).toContainText("Shop");
    
    // Cart button should be visible (no count badge since cart is empty)
    await expect(page.locator('[data-testid="cart-button"]')).toBeVisible();
  });
});
