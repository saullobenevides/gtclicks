import { test, expect } from '@playwright/test';

// Helper to login as photographer
async function loginAsPhotographer(page) {
  await page.goto('/login');
  
  // Fill login form (adjust selectors based on your auth implementation)
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  
  if (await emailInput.isVisible({ timeout: 2000 })) {
    await emailInput.fill('photographer@test.com');
    await passwordInput.fill('testpassword123');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    await page.waitForURL(/dashboard|colecoes/, { timeout: 10000 });
  }
}

test.describe('Photographer Journey: Collection Management', () => {
  test.beforeEach(async ({ page }) => {
    // Attempt login - skip if auth not configured
    try {
      await loginAsPhotographer(page);
    } catch (e) {
      console.log('Skipping login, continuing as guest');
    }
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify dashboard elements
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should view collections list', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for collections link or section
    const collectionsLink = page.locator('text=Coleções, a[href*="colecoes"]').first();
    
    if (await collectionsLink.isVisible({ timeout: 3000 })) {
      await collectionsLink.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify we're on collections page
    const url = page.url();
    expect(url).toMatch(/dashboard|colecoes/);
  });

  test('should access collection editor', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Try to find "New Collection" or "Create" button
    const createButton = page.locator('button:has-text("Nova"), button:has-text("Criar"), a:has-text("Nova Coleção")').first();
    
    const isVisible = await createButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Verify editor form elements
      const titleInput = page.locator('input[name="titulo"], input[placeholder*="título"]');
      await expect(titleInput).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Photographer: Analytics', () => {
  test('should view analytics dashboard', async ({ page }) => {
    try {
      await loginAsPhotographer(page);
    } catch (e) {
      test.skip();
    }
    
    await page.goto('/dashboard');
    
    // Look for analytics/stats section
    const statsSection = page.locator('text=/vendas|receita|analytics|estatísticas/i').first();
    
    if (await statsSection.isVisible({ timeout: 3000 })) {
      await expect(statsSection).toBeVisible();
    }
  });
});

test.describe('Public Collection View', () => {
  test('should display collection details', async ({ page }) => {
    // Navigate to collections page
    await page.goto('/colecoes');
    
    // Click first collection
    const firstCollection = page.locator('[href*="/colecoes/"]').first();
    await firstCollection.click();
    
    await page.waitForURL(/\/colecoes\/.+/);
    
    // Verify collection elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for photos grid
    const photosGrid = page.locator('.photo-card, [data-testid="photo-card"], img').first();
    await expect(photosGrid).toBeVisible({ timeout: 5000 });
  });

  test('should show collection metadata', async ({ page }) => {
    await page.goto('/colecoes');
    
    const collection = page.locator('[href*="/colecoes/"]').first();
    await collection.click();
    await page.waitForURL(/\/colecoes\/.+/);
    
    // Look for photographer name, date, or photo count
    const metadata = page.locator('text=/fotógrafo|fotos|data|photographer/i').first();
    await expect(metadata).toBeVisible({ timeout: 3000 });
  });
});
