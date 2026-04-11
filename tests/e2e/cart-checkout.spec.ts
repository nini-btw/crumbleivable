/**
 * Cart and Checkout E2E Tests
 * @module tests/e2e/cart-checkout
 */

import { test, expect } from "@playwright/test";

test.describe("Cart Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop");
  });

  test("checkout button disabled with 1 cookie, shows cookies needed", async ({ page }) => {
    // Add 1 cookie to cart
    await page.click('[data-testid="add-to-cart-button"]:first-of-type');
    
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
    // Add 2 cookies
    await page.click('[data-testid="add-to-cart-button"]:first-of-type');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(2)');
    
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
    // Add 3 cookies
    await page.click('[data-testid="add-to-cart-button"]:first-of-type');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(2)');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(3)');
    
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
    await page.click('[data-testid="add-to-cart-button"]:first-of-type');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(2)');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(3)');
    
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
    await page.click('[data-testid="add-to-cart-button"]:first-of-type');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(2)');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(3)');
    
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
    
    // Phone field should show validation error
    const phoneInput = page.locator('[name="phone"]');
    await expect(phoneInput).toHaveAttribute("required", "");
  });

  test("cart persists after page reload", async ({ page }) => {
    // Add items to cart
    await page.click('[data-testid="add-to-cart-button"]:first-of-type');
    await page.click('[data-testid="add-to-cart-button"]:nth-of-type(2)');
    
    // Get cart count before reload
    const cartCountBefore = await page.locator('[data-testid="cart-count"]').textContent();
    expect(cartCountBefore).toBe("2");
    
    // Reload page
    await page.reload();
    
    // Cart count should still be 2 (Redux persisted state)
    const cartCountAfter = await page.locator('[data-testid="cart-count"]').textContent();
    expect(cartCountAfter).toBe("2");
  });
});
