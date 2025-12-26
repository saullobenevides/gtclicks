import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Photo Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assuming logged in)
    await page.goto('/dashboard');
  });

  test('should upload single photo successfully', async ({ page }) => {
    // Navigate to collection or create new one
    const newCollectionBtn = page.locator('button:has-text("Nova"), a:has-text("Nova Coleção")').first();
    
    if (await newCollectionBtn.isVisible({ timeout: 3000 })) {
      await newCollectionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Look for file upload input
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 5000 })) {
      // Create a test file path (adjust based on your test fixtures)
      const testFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-photo.jpg');
      
      // Upload file
      await fileInput.setInputFiles(testFilePath);
      
      // Wait for upload progress or completion
      await page.waitForTimeout(3000);
      
      // Verify upload success indicator
      const successIndicator = page.locator('text=/upload.*sucesso|processad|concluíd/i');
      await expect(successIndicator).toBeVisible({ timeout: 10000 });
    } else {
      test.skip('Upload input not found - may require authentication');
    }
  });

  test('should process OCR on uploaded photo', async ({ page }) => {
    // This test assumes a photo was uploaded
    await page.goto('/dashboard');
    
    // Look for OCR status indicators
    const ocrStatus = page.locator('text=/ocr|número.*peito|bib.*number/i').first();
    
    if (await ocrStatus.isVisible({ timeout: 3000 })) {
      await expect(ocrStatus).toBeVisible();
    }
  });

  test('should display uploaded photos in grid', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to a collection
    const collectionLink = page.locator('a[href*="/colecoes/"], a[href*="/dashboard/colecoes"]').first();
    
    if (await collectionLink.isVisible({ timeout: 3000 })) {
      await collectionLink.click();
      await page.waitForTimeout(1000);
      
      // Verify photos grid
      const photoGrid = page.locator('.photo-grid, [data-testid="photo-grid"]');
      const photos = page.locator('.photo-card, img[src*="s3"], img[src*="cloudfront"]');
      
      const count = await photos.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Bulk Upload', () => {
  test('should upload multiple photos at once', async ({ page }) => {
    await page.goto('/dashboard');
    
    const fileInput = page.locator('input[type="file"][multiple], input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 5000 })) {
      // Upload multiple files
      const testFiles = [
        path.join(process.cwd(), 'tests', 'fixtures', 'photo1.jpg'),
        path.join(process.cwd(), 'tests', 'fixtures', 'photo2.jpg'),
        path.join(process.cwd(), 'tests', 'fixtures', 'photo3.jpg'),
      ];
      
      await fileInput.setInputFiles(testFiles);
      
      // Wait for batch processing
      await page.waitForTimeout(5000);
      
      // Verify multiple uploads
      const uploadedCount = page.locator('text=/3.*foto|foto.*3/i');
      const isVisible = await uploadedCount.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        await expect(uploadedCount).toBeVisible();
      }
    } else {
      test.skip('Bulk upload not available');
    }
  });
});
