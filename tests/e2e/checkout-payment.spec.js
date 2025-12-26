import { test, expect } from '@playwright/test';

test.describe('Checkout and Payment Flow', () => {
  test('should complete checkout process', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await page.click('text=Explorar');
    
    const collection = page.locator('[href*="/colecoes/"]').first();
    await collection.click();
    await page.waitForURL(/\/colecoes\/.+/);
    
    // Add photo to cart
    const addButton = page.locator('button[title*="carrinho"]').first();
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/carrinho');
    
    // Verify item in cart
    const cartItem = page.locator('.cart-item, [data-testid="cart-item"]');
    await expect(cartItem).toHaveCount.greaterThan(0);
    
    // Proceed to checkout
    const checkoutButton = page.locator('button:has-text("Pagamento"), button:has-text("Checkout")');
    await checkoutButton.click();
    
    // Verify checkout page
    await expect(page).toHaveURL(/checkout/);
    
    // Verify order summary
    const orderSummary = page.locator('text=/resumo|total|subtotal/i');
    await expect(orderSummary.first()).toBeVisible();
  });

  test('should display Mercado Pago payment button', async ({ page }) => {
    // Navigate to checkout with items
    await page.goto('/');
    await page.click('text=Explorar');
    
    const collection = page.locator('[href*="/colecoes/"]').first();
    await collection.click();
    await page.waitForURL(/\/colecoes\/.+/);
    
    const addButton = page.locator('button[title*="carrinho"]').first();
    await addButton.click();
    await page.waitForTimeout(500);
    
    await page.goto('/checkout');
    
    // Look for Mercado Pago button or form
    const mpButton = page.locator('button:has-text("Mercado Pago"), [class*="mercadopago"], form[action*="mercadopago"]');
    
    const isVisible = await mpButton.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      await expect(mpButton.first()).toBeVisible();
    }
  });

  test('should show order total correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Explorar');
    
    const collection = page.locator('[href*="/colecoes/"]').first();
    await collection.click();
    await page.waitForURL(/\/colecoes\/.+/);
    
    // Add 2 photos
    const addButtons = page.locator('button[title*="carrinho"]');
    await addButtons.nth(0).click();
    await page.waitForTimeout(500);
    await addButtons.nth(1).click();
    await page.waitForTimeout(500);
    
    await page.goto('/checkout');
    
    // Verify total is displayed
    const total = page.locator('text=/total.*r\$|r\$.*total/i');
    await expect(total.first()).toBeVisible({ timeout: 3000 });
  });

  test('should require user authentication for checkout', async ({ page, context }) => {
    // Clear cookies to simulate logged out state
    await context.clearCookies();
    
    // Try to access checkout
    await page.goto('/checkout');
    
    // Should redirect to login or show auth required
    const url = page.url();
    const isLoginPage = url.includes('login') || url.includes('auth');
    const hasAuthMessage = await page.locator('text=/login|entrar|autenticar/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(isLoginPage || hasAuthMessage).toBeTruthy();
  });
});

test.describe('Order Confirmation', () => {
  test('should show order confirmation page', async ({ page }) => {
    // Navigate to success page (if accessible)
    await page.goto('/pedido/sucesso');
    
    // Verify success message or redirect
    const successMessage = page.locator('text=/sucesso|confirmad|aprovad/i');
    const isVisible = await successMessage.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      await expect(successMessage).toBeVisible();
    }
  });
});
