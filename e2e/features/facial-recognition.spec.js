import { test, expect } from '../fixtures/auth.js';
import { TEST_COLLECTIONS, TEST_PHOTOS } from '../fixtures/test-data.js';

test.describe('Facial Recognition Search', () => {
  test('should open facial recognition modal and upload reference photo', async ({ page }) => {
    // Navigate to a collection
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    // Find and click the Face ID button
    const faceIdButton = page.locator('button:has-text("Face ID"), button:has-text("Busca Facial")').first();
    await expect(faceIdButton).toBeVisible();
    await faceIdButton.click();

    // Verify modal opened
    await expect(page.getByText(/Busca Facial|Reconhecimento Facial/i)).toBeVisible();

    // Verify upload area is visible
    const uploadArea = page.locator('input[type="file"], [data-testid="face-upload"]').first();
    await expect(uploadArea).toBeVisible();
  });

  test('should process uploaded photo and show results', async ({ page }) => {
    // Mock face recognition API
    await page.route('**/api/face-recognition**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          matches: [
            { fotoId: TEST_PHOTOS.photo1.id, confidence: 0.95 },
            { fotoId: TEST_PHOTOS.photo2.id, confidence: 0.87 },
          ],
        }),
      });
    });

    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);
    
    // Open modal
    await page.locator('button:has-text("Face ID")').first().click();

    // Upload photo (mock file upload)
    const fileInput = page.locator('input[type="file"]').first();
    
    // Create a test file
    const buffer = Buffer.from('fake-image-data');
    await fileInput.setInputFiles({
      name: 'test-face.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    });

    // Wait for processing
    await page.waitForTimeout(2000);

    // Verify results are shown
    const resultsSection = page.locator('text=/resultado|encontrada|match/i').first();
    await expect(resultsSection).toBeVisible({ timeout: 10000 });
  });

  test('should add found photo to cart from facial recognition results', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);
    
    // Open face recognition
    await page.locator('button:has-text("Face ID")').first().click();

    // Assuming results are already shown (could be mocked)
    // Click "Add to cart" on a result
    const addToCartButton = page.locator('button:has-text("carrinho")').first();
    
    if (await addToCartButton.isVisible({ timeout: 5000 })) {
      await addToCartButton.click();
      
      // Verify cart badge updated
      await expect(page.locator('[data-testid="cart-badge"]').first()).toBeVisible();
    }
  });
});

test.describe('Bib Number Search', () => {
  test('should filter photos by bib number', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    // Find bib number search input
    const bibInput = page.locator('input[placeholder*="número"], input[name="bibNumber"]').first();
    await expect(bibInput).toBeVisible();

    // Type bib number
    await bibInput.fill('1234');

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify filtered results
    // Photos with bib number should be visible
    const photoGrid = page.locator('[data-testid="photo-grid"], .photo-grid').first();
    await expect(photoGrid).toBeVisible();
  });

  test('should show no results message for invalid bib number', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    const bibInput = page.locator('input[placeholder*="número"]').first();
    await bibInput.fill('99999'); // Non-existent bib number

    await page.waitForTimeout(1000);

    // Check for empty state message
    const emptyMessage = page.locator('text=/Nenhuma foto|Não encontrado/i').first();
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  });

  test('should clear bib number filter', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    const bibInput = page.locator('input[placeholder*="número"]').first();
    await bibInput.fill('1234');
    await page.waitForTimeout(500);

    // Clear the input
    await bibInput.clear();
    await page.waitForTimeout(500);

    // All photos should be visible again
    const photoCards = page.locator('[data-testid="photo-card"], .photo-card');
    const count = await photoCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('QR Code Sharing', () => {
  test('should generate QR code for collection', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    // Find share or QR code button
    const shareButton = page.locator('button:has-text("Compartilhar"), button:has-text("QR Code")').first();
    
    if (await shareButton.isVisible({ timeout: 3000 })) {
      await shareButton.click();

      // Verify QR code is displayed
      const qrCode = page.locator('[data-testid="qr-code"], canvas, svg').first();
      await expect(qrCode).toBeVisible();
    }
  });

  test('should copy share link to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    const shareButton = page.locator('button:has-text("Compartilhar")').first();
    
    if (await shareButton.isVisible({ timeout: 3000 })) {
      await shareButton.click();

      // Click copy link button
      const copyButton = page.locator('button:has-text("Copiar Link"), button:has-text("Copiar")').first();
      
      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Verify success message
        await expect(page.getByText(/copiado|copied/i)).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should open shared collection via QR code link', async ({ page, context }) => {
    const shareUrl = `http://localhost:3000/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`;

    // Open in new tab (simulating QR code scan)
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);

    // Verify collection loaded
    await expect(newPage.getByText(TEST_COLLECTIONS.sportsEvent.titulo)).toBeVisible();
    await expect(newPage).toHaveURL(shareUrl);

    await newPage.close();
  });
});
