import { test, expect } from '@playwright/test';

test.describe('Header Navigation', () => {
  test('should display header on all pages', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verify logo
    await expect(page.locator('text=GT CLICKS, text=GTCLICKS')).toBeVisible();
  });

  test('should navigate using header links', async ({ page }) => {
    await page.goto('/');
    
    // Click Explorar
    await page.click('text=Explorar');
    await expect(page).toHaveURL(/busca|colecoes/);
    
    // Go back home
    await page.click('text=GT CLICKS, text=GTCLICKS');
    await expect(page).toHaveURL('/');
  });

  test('should show cart icon with badge', async ({ page }) => {
    await page.goto('/');
    
    // Find cart icon
    const cartIcon = page.locator('[href="/carrinho"], button:has(svg)').filter({ hasText: /carrinho/i }).or(
      page.locator('svg').filter({ hasText: /cart|shopping/i })
    ).first();
    
    await expect(cartIcon).toBeVisible();
  });
});

test.describe('Footer', () => {
  test('should display footer with links', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Verify footer sections
    await expect(page.locator('footer text=PLATAFORMA, footer text=Plataforma')).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    await page.goto('/');
    
    // Look for social icons (Instagram, YouTube, Twitter)
    const socialLinks = page.locator('footer a[href*="instagram"], footer a[href*="youtube"], footer a[href*="twitter"]');
    
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Header should show full navigation
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('header')).toBeVisible();
  });

  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Bottom nav should be visible
    const bottomNav = page.locator('nav').filter({ has: page.locator('text=Início') });
    await expect(bottomNav).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('home page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Verify main content is visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
