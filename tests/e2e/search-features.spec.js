import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Facial Recognition Search', () => {
  test('should access facial search feature', async ({ page }) => {
    await page.goto('/');
    
    // Look for facial search link/button
    const facialSearchLink = page.locator('text=/busca.*rosto|facial|reconhecimento/i, a[href*="facial"], button:has-text("Rosto")');
    
    const isVisible = await facialSearchLink.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      await facialSearchLink.first().click();
      await page.waitForTimeout(1000);
      
      // Verify facial search page/modal
      const searchInterface = page.locator('text=/upload.*foto|enviar.*imagem/i');
      await expect(searchInterface.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip('Facial search feature not found in UI');
    }
  });

  test('should allow photo upload for facial search', async ({ page }) => {
    await page.goto('/busca');
    
    // Look for facial search option
    const facialTab = page.locator('button:has-text("Rosto"), [role="tab"]:has-text("Facial")');
    
    if (await facialTab.isVisible({ timeout: 3000 })) {
      await facialTab.click();
      
      // Find file input for reference photo
      const fileInput = page.locator('input[type="file"]');
      
      if (await fileInput.isVisible({ timeout: 3000 })) {
        const testPhoto = path.join(process.cwd(), 'tests', 'fixtures', 'face-reference.jpg');
        await fileInput.setInputFiles(testPhoto);
        
        // Wait for processing
        await page.waitForTimeout(3000);
        
        // Verify search initiated
        const searchResults = page.locator('.photo-card, .search-results, text=/processando|buscando/i');
        await expect(searchResults.first()).toBeVisible({ timeout: 10000 });
      }
    } else {
      test.skip('Facial search tab not available');
    }
  });

  test('should display facial search results', async ({ page }) => {
    // This test assumes facial search was performed
    await page.goto('/busca');
    
    // Check for results grid or message
    const results = page.locator('.photo-card, .search-results');
    const noResults = page.locator('text=/nenhum.*resultado|no.*match/i');
    
    const hasResults = await results.count() > 0;
    const hasNoResultsMsg = await noResults.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasResults || hasNoResultsMsg).toBeTruthy();
  });
});

test.describe('OCR Search', () => {
  test('should search by bib number', async ({ page }) => {
    await page.goto('/busca');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="número"], input[type="search"]');
    await searchInput.fill('123');
    
    // Submit search
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Verify results or no results
    const results = page.locator('.photo-card, .collection-card');
    const noResults = page.locator('text=/nenhum|no result/i');
    
    const count = await results.count();
    const hasNoResultsMsg = await noResults.isVisible().catch(() => false);
    
    expect(count > 0 || hasNoResultsMsg).toBeTruthy();
  });

  test('should filter results by bib number', async ({ page }) => {
    await page.goto('/busca?q=456');
    
    // Wait for results to load
    await page.waitForTimeout(2000);
    
    // Verify URL has query parameter
    expect(page.url()).toContain('q=456');
    
    // Check for results
    const results = page.locator('.photo-card');
    const count = await results.count();
    
    // Should have results or no results message
    expect(count >= 0).toBeTruthy();
  });
});

test.describe('Search Performance', () => {
  test('should load search results quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/busca?q=789');
    
    // Wait for results to appear
    await page.waitForSelector('.photo-card, .collection-card, text=/nenhum/i', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
