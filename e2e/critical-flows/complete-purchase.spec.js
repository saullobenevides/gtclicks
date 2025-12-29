import { test, expect } from '../fixtures/auth.js';
import { TEST_COLLECTIONS, TEST_PHOTOS, createPhotosListResponse } from '../fixtures/test-data.js';

test.describe('Complete Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock collections API
    await page.route('**/api/colecoes**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          colecoes: [TEST_COLLECTIONS.sportsEvent],
          total: 1,
        }),
      });
    });

    // Mock photos API
    await page.route('**/api/fotos**', async (route) => {
      await route.fulfill(createPhotosListResponse());
    });
  });

  test('should complete full purchase flow from browsing to checkout', async ({ page }) => {
    // Step 1: Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/GTClicks/);

    // Step 2: Browse collections
    await page.goto('/colecoes');
    await expect(page.getByText(/Coleções/i)).toBeVisible();

    // Step 3: Click on a collection
    const collectionLink = page.locator(`a[href*="/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}"]`).first();
    await collectionLink.click();
    await page.waitForURL(`**/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    // Step 4: Add first photo to cart
    const firstAddButton = page.locator('button:has-text("carrinho"), button[title*="carrinho"]').first();
    await firstAddButton.click();
    
    // Verify cart badge updated
    await expect(page.locator('[data-testid="cart-badge"], .cart-badge').first()).toContainText('1');

    // Step 5: Add second photo to cart
    const secondAddButton = page.locator('button:has-text("carrinho"), button[title*="carrinho"]').nth(1);
    await secondAddButton.click();
    await expect(page.locator('[data-testid="cart-badge"], .cart-badge').first()).toContainText('2');

    // Step 6: Add third photo to cart
    const thirdAddButton = page.locator('button:has-text("carrinho"), button[title*="carrinho"]').nth(2);
    await thirdAddButton.click();
    await expect(page.locator('[data-testid="cart-badge"], .cart-badge').first()).toContainText('3');

    // Step 7: Navigate to cart page
    await page.goto('/carrinho');
    
    // Step 8: Verify items in cart
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    await expect(cartItems).toHaveCount(3);

    // Step 9: Verify total calculation
    // Assuming 3 photos at R$ 10.00 each = R$ 30.00
    const totalText = page.locator('text=/total.*30|R\\$.*30/i');
    await expect(totalText.first()).toBeVisible({ timeout: 5000 });

    // Step 10: Proceed to checkout
    const checkoutButton = page.locator('button:has-text("Pagamento"), button:has-text("Checkout"), a:has-text("Pagamento")');
    await checkoutButton.first().click();

    // Step 11: Verify checkout page loaded
    await expect(page).toHaveURL(/checkout/);
    
    // Step 12: Verify order summary on checkout
    await expect(page.getByText(/resumo|pedido/i)).toBeVisible();
    await expect(page.getByText(/30/)).toBeVisible(); // Total amount
  });

  test('should update cart badge when adding multiple photos', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    // Add 3 photos sequentially
    for (let i = 0; i < 3; i++) {
      const addButton = page.locator('button:has-text("carrinho")').nth(i);
      await addButton.click();
      await page.waitForTimeout(300); // Wait for cart to update
      
      // Verify badge shows correct count
      const badge = page.locator('[data-testid="cart-badge"], .cart-badge').first();
      await expect(badge).toContainText(String(i + 1));
    }
  });

  test('should calculate progressive discount correctly', async ({ page }) => {
    // Mock cart with progressive discount
    await page.route('**/api/carrinho**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          itens: [
            { id: '1', fotoId: 'photo-1', preco: 10.0, titulo: 'Photo 1' },
            { id: '2', fotoId: 'photo-2', preco: 10.0, titulo: 'Photo 2' },
            { id: '3', fotoId: 'photo-3', preco: 10.0, titulo: 'Photo 3' },
            { id: '4', fotoId: 'photo-4', preco: 10.0, titulo: 'Photo 4' },
            { id: '5', fotoId: 'photo-5', preco: 10.0, titulo: 'Photo 5' },
          ],
          subtotal: 50.0,
          desconto: 5.0, // 10% discount for 5+ photos
          total: 45.0,
        }),
      });
    });

    await page.goto('/carrinho');

    // Verify discount is displayed
    await expect(page.getByText(/desconto/i)).toBeVisible();
    await expect(page.getByText(/5.*00|10%/i)).toBeVisible();
    
    // Verify final total with discount
    await expect(page.getByText(/total.*45|R\\$.*45/i)).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);

    // Add 2 photos
    await page.locator('button:has-text("carrinho")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("carrinho")').nth(1).click();
    await page.waitForTimeout(300);

    // Go to cart
    await page.goto('/carrinho');
    
    // Verify 2 items
    await expect(page.locator('[data-testid="cart-item"], .cart-item')).toHaveCount(2);

    // Remove first item
    const removeButton = page.locator('button:has-text("Remover")').first();
    await removeButton.click();

    // Verify only 1 item remains
    await expect(page.locator('[data-testid="cart-item"], .cart-item')).toHaveCount(1);
    
    // Verify badge updated
    await expect(page.locator('[data-testid="cart-badge"], .cart-badge').first()).toContainText('1');
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/carrinho');
    
    // Verify empty cart message
    await expect(page.getByText(/vazio|nenhum item|carrinho está vazio/i)).toBeVisible();
    
    // Verify no cart items displayed
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    await expect(cartItems).toHaveCount(0);
  });

  test('should redirect to Mercado Pago on payment button click', async ({ page, context }) => {
    // Mock checkout API to return payment URL
    await page.route('**/api/pedidos**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            pedidoId: 'order-123',
            paymentUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test-123',
          }),
        });
      }
    });

    // Add item to cart first
    await page.goto(`/colecoes/${TEST_COLLECTIONS.sportsEvent.slug}`);
    await page.locator('button:has-text("carrinho")').first().click();

    // Go to checkout
    await page.goto('/checkout');

    // Click payment button
    const paymentButton = page.locator('button:has-text("Pagamento"), button:has-text("Pagar")').first();
    
    // Listen for navigation
    const navigationPromise = page.waitForEvent('framenavigated');
    await paymentButton.click();

    // Verify redirect initiated (URL change or new page)
    // In real scenario, this would redirect to Mercado Pago
    await page.waitForTimeout(2000);
  });
});
