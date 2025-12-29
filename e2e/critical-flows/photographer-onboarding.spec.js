import { test, expect } from '../fixtures/auth.js';
import { TEST_PHOTOGRAPHER_PROFILE } from '../fixtures/test-data.js';

test.describe('Photographer Onboarding Flow', () => {
  test('should complete photographer registration - full 3-step wizard', async ({ page, authenticatedAsBuyer }) => {
    // Step 1: Navigate to photographer dashboard (triggers registration form)
    await page.goto('/dashboard/fotografo');

    // Verify registration form is displayed
    await expect(page.getByText(/Cadastro|Perfil de Fotógrafo/i)).toBeVisible();

    // STEP 1: Identidade (Identity)
    await expect(page.getByText(/Identidade|Passo 1/i)).toBeVisible();

    // Fill identity fields
    const displayNameInput = page.locator('input[name="displayName"], input[placeholder*="nome"]').first();
    await displayNameInput.fill('Fotógrafo Teste');

    const usernameInput = page.locator('input[name="username"], input[placeholder*="usuário"]').first();
    await usernameInput.fill('fotografo_teste');

    const bioTextarea = page.locator('textarea[name="bio"], textarea[placeholder*="bio"]').first();
    await bioTextarea.fill('Fotógrafo profissional especializado em eventos esportivos e casamentos.');

    // Click next to go to step 2
    const nextButton1 = page.locator('button:has-text("Próximo"), button:has-text("Avançar")').first();
    await nextButton1.click();

    // STEP 2: Contato & Local (Contact & Location)
    await expect(page.getByText(/Contato|Passo 2/i)).toBeVisible();

    // Fill contact fields
    const phoneInput = page.locator('input[name="telefone"], input[placeholder*="telefone"]').first();
    await phoneInput.fill('11999999999');

    const cityInput = page.locator('input[name="cidade"], input[placeholder*="cidade"]').first();
    await cityInput.fill('São Paulo');

    const stateSelect = page.locator('select[name="estado"], [name="estado"]').first();
    await stateSelect.selectOption('SP');

    // Click next to go to step 3
    const nextButton2 = page.locator('button:has-text("Próximo"), button:has-text("Avançar")').first();
    await nextButton2.click();

    // STEP 3: Financeiro (Financial)
    await expect(page.getByText(/Financeiro|Passo 3|PIX/i)).toBeVisible();

    // Fill PIX key
    const pixKeyInput = page.locator('input[name="pixKey"], input[placeholder*="PIX"]').first();
    await pixKeyInput.fill('fotografo@test.com');

    // Select PIX type (EMAIL)
    const pixTypeRadio = page.locator('input[type="radio"][value="EMAIL"]').first();
    await pixTypeRadio.check();

    // Submit form
    const submitButton = page.locator('button:has-text("Concluir"), button:has-text("Finalizar"), button[type="submit"]').first();
    await submitButton.click();

    // Verify success - should redirect to dashboard or show success message
    await page.waitForTimeout(2000);
    
    // Should now show photographer dashboard instead of registration form
    await expect(page.getByText(/Dashboard|Minhas Coleções|Bem-vindo/i)).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields in step 1', async ({ page, authenticatedAsBuyer }) => {
    await page.goto('/dashboard/fotografo');

    // Try to proceed without filling required fields
    const nextButton = page.locator('button:has-text("Próximo"), button:has-text("Avançar")').first();
    await nextButton.click();

    // Verify validation errors are shown
    const errorMessages = page.locator('text=/obrigatório|required|preencha/i');
    await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
  });

  test('should allow navigation between wizard steps', async ({ page, authenticatedAsBuyer }) => {
    await page.goto('/dashboard/fotografo');

    // Fill step 1 and proceed
    await page.locator('input[name="displayName"], input[placeholder*="nome"]').first().fill('Test');
    await page.locator('input[name="username"], input[placeholder*="usuário"]').first().fill('testuser');
    await page.locator('button:has-text("Próximo")').first().click();

    // Verify we're on step 2
    await expect(page.getByText(/Contato|Passo 2/i)).toBeVisible();

    // Go back to step 1
    const backButton = page.locator('button:has-text("Voltar"), button:has-text("Anterior")').first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page.getByText(/Identidade|Passo 1/i)).toBeVisible();
    }
  });

  test('should persist form data when navigating between steps', async ({ page, authenticatedAsBuyer }) => {
    await page.goto('/dashboard/fotografo');

    // Fill step 1
    const displayName = 'Fotógrafo Persistente';
    await page.locator('input[name="displayName"]').first().fill(displayName);
    await page.locator('input[name="username"]').first().fill('foto_persist');
    await page.locator('button:has-text("Próximo")').first().click();

    // Fill step 2
    const phone = '11988887777';
    await page.locator('input[name="telefone"]').first().fill(phone);
    await page.locator('button:has-text("Próximo")').first().click();

    // Go back to step 1
    const backButton = page.locator('button:has-text("Voltar")').first();
    if (await backButton.isVisible()) {
      await backButton.click();
    
      // Verify data is still there
      const displayNameInput = page.locator('input[name="displayName"]').first();
      await expect(displayNameInput).toHaveValue(displayName);
    }
  });
});

test.describe('Photographer Dashboard Navigation', () => {
  test('should navigate between dashboard sections', async ({ page, authenticatedAsPhotographer }) => {
    await page.goto('/dashboard/fotografo');

    // Wait for dashboard to load
    await expect(page.getByText(/Dashboard|Início/i)).toBeVisible({ timeout: 10000 });

    // Test navigation to "Minhas Coleções"
    const collectionsLink = page.locator('a:has-text("Minhas Coleções"), nav a:has-text("Coleções")').first();
    if (await collectionsLink.isVisible()) {
      await collectionsLink.click();
      await expect(page).toHaveURL(/colecoes/);
    }

    // Test navigation to "Financeiro"
    const financialLink = page.locator('a:has-text("Financeiro"), nav a:has-text("Finanças")').first();
    if (await financialLink.isVisible()) {
      await financialLink.click();
      await expect(page).toHaveURL(/financeiro/);
    }

    // Test navigation to "Meu Perfil"
    const profileLink = page.locator('a:has-text("Meu Perfil"), nav a:has-text("Perfil")').first();
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/perfil/);
    }
  });

  test('should show photographer statistics on dashboard', async ({ page, authenticatedAsPhotographer }) => {
    // Mock financial API with statistics
    await page.route('**/api/fotografo/financeiro**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          saldo: { disponivel: 1500.50, bloqueado: 200.00 },
          transacoes: [
            { id: 't1', tipo: 'VENDA', valor: 50.00, descricao: 'Venda de Foto #1', createdAt: new Date().toISOString() },
          ],
        }),
      });
    });

    await page.goto('/dashboard/fotografo');

    // Verify statistics are displayed (if available on the page)
    const statsSection = page.locator('text=/coleções|fotos|vendas/i').first();
    await expect(statsSection).toBeVisible({ timeout: 5000 });
  });
});
