---
name: e2e-marketplace
description: Writes high-value tests for critical marketplace flows. Prioritizes end-to-end tests for signup, upload, checkout, access to purchased content, and webhooks. Uses Playwright patterns and avoids brittle selectors. Use when writing or reviewing E2E tests for marketplace features.
---

# E2E Marketplace Tests

Writes **high-value E2E tests** for critical marketplace flows. Prioritizes: **signup**, **upload**, **checkout**, **access to purchased content**, **webhooks**. Uses **Playwright patterns**; avoids **brittle selectors**.

## Priority Flows

| Priority | Flow | Why |
|----------|------|-----|
| 1 | **Signup** (cliente, fotografo) | Auth is foundation; blocks everything |
| 2 | **Upload** (photo to collection) | Revenue source; S3 + processing |
| 3 | **Checkout** | Money path; cart → order → payment |
| 4 | **Access purchased content** | Download token, verification |
| 5 | **Webhooks** | Payment confirmation; state machine |

## Selector Hierarchy (Avoid Brittle)

| Prefer | Avoid | Reason |
|--------|-------|--------|
| `getByRole('button', { name: /finalizar/i })` | `getByClassName('btn-checkout')` | Semantic; survives refactors |
| `getByLabelText(/email/i)` | `getByTestId('email-input')` | Accessible; user-facing |
| `getByPlaceholderText(/senha/i)` | `getBySelector('#pwd')` | Stable; descriptive |
| `getByText(/meus pedidos/i)` | `getBySelector('.nav-link-3')` | Content-based |
| `getByRole('link', { name: /carrinho/i })` | `getByHref('/carrinho')` | Role + name |

**Fallback:** `data-testid` only when role/label/text are ambiguous (e.g. dynamic lists). Use sparingly.

## Test Structure

```ts
import { test, expect } from '@playwright/test';

test.describe('Checkout flow', () => {
  test('cliente completes purchase and accesses download', async ({ page }) => {
    // 1. Setup: logged-in user, cart with items
    await loginAsCliente(page);
    await addPhotoToCart(page, { collectionSlug: 'surf-2025', photoIndex: 0 });

    // 2. Checkout
    await page.getByRole('link', { name: /carrinho/i }).click();
    await page.getByRole('button', { name: /finalizar|checkout/i }).click();
    await expect(page).toHaveURL(/checkout/);

    // 3. Payment (mock or sandbox)
    // ...

    // 4. Success + download
    await expect(page.getByText(/obrigado|sucesso/i)).toBeVisible();
    await page.getByRole('link', { name: /meus downloads|baixar/i }).click();
    await expect(page.getByRole('link', { name: /download/i }).first()).toBeVisible();
  });
});
```

## Flow-Specific Patterns

### Signup

```ts
// Cliente signup
await page.getByRole('link', { name: /cadastr|registr/i }).click();
await page.getByLabelText(/email/i).fill(`test-${Date.now()}@example.com`);
await page.getByLabelText(/nome/i).fill('Test User');
await page.getByRole('button', { name: /criar|cadastr/i }).click();
await expect(page).toHaveURL(/dashboard|onboarding/);

// Fotografo: complete onboarding
await page.getByLabelText(/nome de usuário|username/i).fill(`foto_${Date.now()}`);
await page.getByLabelText(/chave pix/i).fill('test@mail.com');
await page.getByRole('button', { name: /concluir|próximo/i }).click();
```

### Upload

```ts
// Navigate to collection editor
await page.getByRole('link', { name: /coleções|collections/i }).click();
await page.getByRole('link', { name: /nova|novo/i }).first().click();
await page.getByLabelText(/nome da coleção/i).fill('E2E Test Collection');
await page.getByRole('button', { name: /criar|salvar/i }).click();

// Upload (file input - use label or role)
const fileInput = page.getByLabel(/adicionar foto|upload|enviar/i).locator('input[type="file"]');
await fileInput.setInputFiles('fixtures/test-photo.jpg');
await expect(page.getByText(/processando|sucesso|publicada/i)).toBeVisible({ timeout: 15000 });
```

### Checkout

```ts
// Add to cart
await page.goto(`/colecoes/${collectionSlug}`);
await page.getByRole('button', { name: /adicionar|comprar|cart/i }).first().click();
await expect(page.getByText(/adicionado|no carrinho/i)).toBeVisible();

// Checkout
await page.getByRole('link', { name: /carrinho/i }).click();
await page.getByRole('button', { name: /finalizar|ir para pagamento/i }).click();
// Payment Brick or redirect - use sandbox when possible
```

### Access Purchased Content

```ts
// After payment confirmed (webhook or mock)
await page.goto('/meus-downloads');
await expect(page.getByRole('heading', { name: /meus downloads/i })).toBeVisible();
const downloadLink = page.getByRole('link', { name: /baixar|download/i }).first();
await expect(downloadLink).toBeVisible();
// Optional: verify href contains token or /api/download/
```

### Webhooks (API-Level)

```ts
// Webhook: simulate MP notification
const res = await request.post('/api/webhooks/mercadopago', {
  data: { type: 'payment', data: { id: paymentId } },
  headers: { 'x-signature': validSignature, 'x-request-id': requestId },
});
expect(res.ok()).toBeTruthy();
// Verify order status in DB or via API
```

## Fixtures & Helpers

```ts
// e2e/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  cliente: async ({ page }, use) => {
    await loginAsCliente(page);
    await use({});
  },
  fotografo: async ({ page }, use) => {
    await loginAsFotografo(page);
    await use({});
  },
});

// e2e/helpers/auth.ts
export async function loginAsCliente(page: Page) {
  // Use test account or signup
  await page.goto('/login');
  await page.getByLabelText(/email/i).fill(process.env.E2E_CLIENTE_EMAIL!);
  await page.getByLabelText(/senha/i).fill(process.env.E2E_CLIENTE_PASSWORD!);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await expect(page).toHaveURL(/\/(dashboard|meus-downloads|colecoes)/);
}
```

## Sandbox / Mocking

| Flow | Strategy |
|------|----------|
| **Payment** | Mercado Pago sandbox; or mock webhook to simulate approval |
| **Upload** | Real S3 or localstack; small test image in fixtures |
| **Auth** | Test accounts; or Stack Auth test mode |
| **Webhooks** | POST to local; valid signature from test secret |

## Anti-Patterns

- [ ] No `page.waitForTimeout(5000)` — use `expect().toBeVisible({ timeout })` or `waitForLoadState`
- [ ] No CSS selectors like `.btn-primary` — use role/label
- [ ] No shared mutable state — each test independent; seed or cleanup
- [ ] No hardcoded IDs — use slugs, search, or generated data
- [ ] No testing implementation — test user-visible outcomes

## Output Format

When writing tests:

```markdown
## Test: [Flow name]
**File:** e2e/[flow].spec.ts

### Prerequisites
- [Auth state, data]

### Steps
1. [Action] → [Expected]
2. [Action] → [Expected]

### Selectors used
- [Role/label] for [element]

### Fixtures
- [If any]
```

## Constraints

- Tests run against `baseURL` (localhost or preview)
- Use `test.describe.serial()` only when order matters (e.g. checkout depends on cart)
- Prefer `fullyParallel: true` for speed; isolate with fixtures
- Webhook tests: may need `request` context (API only) or full page if verifying redirect
