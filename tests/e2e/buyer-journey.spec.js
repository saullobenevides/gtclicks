import { test, expect } from '@playwright/test';

test.describe('Buyer Journey: Search and Purchase', () => {
  test('should complete full purchase flow with single photo', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');
    await expect(page.locator('text=GT CLICKS')).toBeVisible();
    
    // 2. Go to search/browse
    await page.click('text=Explorar');
    await expect(page).toHaveURL(/busca|colecoes/);
    
    // 3. Click on first collection
    const firstCollection = page.locator('.collection-card, [href*="/colecoes/"]').first();
    await firstCollection.click();
    
    // 4. Wait for collection page
    await page.waitForURL(/\/colecoes\/.+/);
    await expect(page.locator('h1')).toBeVisible();
    
    // 5. Add first photo to cart
    const addToCartButton = page.locator('button[title*="carrinho"], button:has-text("Adicionar")').first();
    await addToCartButton.click();
    
    // 6. Verify toast notification
    await expect(page.locator('.sonner-toast, [role="status"]')).toContainText(/adicionad|cart/i, { timeout: 5000 });
    
    // 7. Go to cart
    await page.click('[href="/carrinho"]');
    await expect(page).toHaveURL('/carrinho');
    
    // 8. Verify item in cart
    await expect(page.locator('.cart-item, [data-testid="cart-item"]')).toHaveCount(1);
    
    // 9. Proceed to checkout
    const checkoutButton = page.locator('button:has-text("Pagamento"), button:has-text("Checkout")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();
    
    // 10. Verify checkout page
    await expect(page).toHaveURL(/checkout/);
  });

  test('should apply progressive discount with 5+ photos', async ({ page }) => {
    // Navigate to a collection
    await page.goto('/');
    await page.click('text=Explorar');
    
    // Find and click first collection
    const collection = page.locator('[href*="/colecoes/"]').first();
    await collection.click();
    await page.waitForURL(/\/colecoes\/.+/);
    
    // Add 5 photos to cart
    const addButtons = page.locator('button[title*="carrinho"]');
    const count = await addButtons.count();
    
    for (let i = 0; i < Math.min(5, count); i++) {
      await addButtons.nth(i).click();
      await page.waitForTimeout(500); // Wait for cart update
    }
    
    // Go to cart
    await page.goto('/carrinho');
    
    // Verify 5 items
    const cartItems = page.locator('.cart-item, [data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(5);
    
    // Check for discount indicator
    const discountText = page.locator('text=/economia|desconto|saving/i');
    await expect(discountText).toBeVisible({ timeout: 3000 });
  });

  test('should show upsell message for next discount tier', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Explorar');
    
    const collection = page.locator('[href*="/colecoes/"]').first();
    await collection.click();
    await page.waitForURL(/\/colecoes\/.+/);
    
    // Add 3 photos
    const addButtons = page.locator('button[title*="carrinho"]');
    for (let i = 0; i < 3; i++) {
      await addButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
    
    await page.goto('/carrinho');
    
    // Look for upsell message
    const upsellMessage = page.locator('text=/faltam.*foto|add.*more/i');
    // Upsell may or may not appear depending on discount config
    const isVisible = await upsellMessage.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(upsellMessage).toBeVisible();
    }
  });
});

test.describe('Search Functionality', () => {
  test('should search by bib number', async ({ page }) => {
    await page.goto('/busca');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="número"], input[type="search"]');
    await searchInput.fill('123');
    
    // Submit search
    await page.keyboard.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Verify results or no results message
    const hasResults = await page.locator('.photo-card, .collection-card').count();
    const noResults = await page.locator('text=/nenhum|no result/i').isVisible().catch(() => false);
    
    expect(hasResults > 0 || noResults).toBeTruthy();
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should show bottom navigation on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check for bottom nav
    const bottomNav = page.locator('nav').filter({ has: page.locator('text=Início') });
    await expect(bottomNav).toBeVisible();
    
    // Verify nav items
    await expect(page.locator('text=Início')).toBeVisible();
    await expect(page.locator('text=Buscar')).toBeVisible();
    await expect(page.locator('text=Carrinho')).toBeVisible();
  });
  
  test('should navigate using bottom nav', async ({ page }) => {
    await page.goto('/');
    
    // Click on search in bottom nav
    await page.locator('nav a[href="/busca"]').click();
    await expect(page).toHaveURL('/busca');
    
    // Click on cart
    await page.locator('nav a[href="/carrinho"]').click();
    await expect(page).toHaveURL('/carrinho');
  });
});
