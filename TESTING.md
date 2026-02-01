# Plano de testes – GTClicks

Este documento descreve a estratégia de testes, o que já existe e o que falta para deixar a suíte completa.

---

## O que já existe

### Testes unitários (Jest)

| Área        | Arquivo                                           | O que cobre                          |
| ----------- | ------------------------------------------------- | ------------------------------------ |
| **Lib**     | `lib/__tests__/slug.test.js`                      | Geração de slug                      |
| **Lib**     | `lib/__tests__/s3-client.test.js`                 | Cliente S3 (env, presigner)          |
| **Lib**     | `lib/__tests__/mercadopago.test.js`               | Payout Pix, preferências             |
| **Lib**     | `lib/__tests__/mercadopago-payments.test.js`      | Rota create-preference (mock)        |
| **Utils**   | `__tests__/unit/financial.test.js`                | `calculateCommission`, descontos     |
| **Dados**   | `__tests__/unit/data/marketplace.test.js`         | `getHomepageData` (contrato e mocks) |
| **Actions** | `__tests__/unit/actions/collections.test.ts`      | create/update/get collections        |
| **Actions** | `__tests__/unit/actions/photographers.test.ts`    | create/update fotógrafo, resolve     |
| **API**     | `app/api/colecoes/__tests__/create-draft.test.js` | Rota create-draft                    |
| **API**     | `app/api/upload/__tests__/route.test.js`          | Rota de upload (presigned)           |
| **API**     | `app/api/photos/process/__tests__/route.test.js`  | Processamento de foto                |

### E2E (Playwright)

- Config em `playwright.config.js`, testes em `e2e/`.
- `testPathIgnorePatterns` do Jest ignora `e2e/` e `tests/e2e/`.

---

## Lacunas (o que falta para ficar completo)

### 1. Lib – alta prioridade (lógica pura, fácil de testar)

- **`lib/validations.js`** – schemas Zod (cartItem, cartSync, photographerProfile, uploadMetadata, uploadRequest, photoBatch). Validar casos válidos e inválidos.
- **`lib/utils/formatters.js`** – `formatCurrency`, `formatDate`, `formatDateLong`, `formatDateShort`.
- **`lib/utils.js`** – `calcularDescontoProgressivo`, `aplicarDesconto`, `formatTimeAgo` (parcialmente coberto por financial).
- **`lib/password.js`** – `hashPassword` / `verifyPassword` (mock bcrypt ou integração leve).
- **Mappers** – `lib/mappers/collectionMapper.js`, `photographerMapper.js`, `photoMapper.js` – transformações Prisma → UI (objeto de entrada/saída).

### 2. Actions – prioridade alta (fluxos de negócio)

- **`actions/cart.ts`** – addToCart, removeFromCart, clearCart, getCartItems (com mocks de auth e prisma).
- **`actions/checkout.ts`** – criação de pedido, preferência MP (já coberto em parte pela rota).
- **`actions/orders.ts`** – listar pedidos, detalhe.
- **`actions/notifications.ts`** – marcar como lida, listar.
- **`actions/folders.ts`** – CRUD de pastas.
- **`actions/photos.ts`** – operações em fotos (batch, like, etc.).
- **`actions/admin.ts`** / **`actions/payouts.ts`** – se forem críticos para o produto.

### 3. API routes – prioridade média

Rotas críticas ainda sem teste unitário/integração:

- **`/api/auth/sync`** – sync usuário Stack → Prisma.
- **`/api/carrinho/*`** – GET/POST/DELETE itens, sync.
- **`/api/checkout/process`** – fluxo de pagamento (MP, criação de pedido).
- **`/api/download/[token]`** – liberação de download (token, limites).
- **`/api/pedidos`** – listar; **`/api/pedidos/[id]`** – detalhe; **`/api/pedidos/[id]/verificar-pagamento`**.
- **`/api/webhooks/mercadopago`** – recebimento de notificação (idempotência, status).
- **`/api/fotografos/create`**, **resolve**, **saques** – conforme importância.
- **`/api/licencas`** – listar licenças.

Padrão: mock de `getAuthenticatedUser`, Prisma e, quando fizer sentido, `NextResponse` (como em `mercadopago-payments.test.js`). Usar `Request` do `jest.env.js` para body JSON.

### 4. Componentes React – prioridade média/baixa

- **CartContext** – add/remove item, sync com API, localStorage.
- **Checkout** – exibição de resumo, botão de pagamento (com mock de useCheckout).
- **Header** – links, carrinho, login (smoke ou snapshot).
- **Cards** – CollectionCard, PhotoCard – props → render (sem rede).

Recomendação: usar React Testing Library, mock de `next/navigation` e providers (Stack, Cart) quando necessário.

### 5. E2E – prioridade média

- Garantir que exista pelo menos um fluxo E2E estável: **home → busca → foto → carrinho → checkout** (ou até pagamento pendente).
- Outros: **login**, **cadastro fotógrafo**, **dashboard fotógrafo (coleção)**.
- Manter `e2e/` fora do Jest (`testPathIgnorePatterns`) e rodar com `npm run test:e2e`.

### 6. Cobertura e CI

- Habilitar **coverage** do Jest (`collectCoverageFrom`, `coverageThreshold` opcional).
- Script `npm run test:coverage` para relatório local.
- Em CI: rodar `npm test` e, se aplicável, `npm run test:e2e` com servidor já levantado ou via `webServer` do Playwright.

---

## Prioridades sugeridas (ordem de implementação)

1. **Lib: validations + formatters** – rápidos, estáveis, protegem regras de negócio e formatação.
2. **Actions: cart** – carrinho é crítico para conversão.
3. **API: carrinho + download** – segurança e fluxo pós-pagamento.
4. **API: webhook Mercado Pago** – idempotência e atualização de status do pedido.
5. **Lib: mappers** – evita regressões em listagens/detalhes.
6. **Componentes: CartContext + Checkout** – confiança na UI do fluxo de compra.
7. **E2E: um fluxo completo** – smoke de ponta a ponta.
8. **Coverage** – metas por pasta (lib, actions, app/api) e alertas em CI.

---

## Como rodar

```bash
# Unitários
npm test

# Unitários com cobertura
npm run test:coverage

# Um arquivo
npx jest lib/__tests__/validations.test.js

# E2E (sobe o app)
npm run test:e2e
```

---

## Convenções

- **Unitários**: Jest, mocks para Prisma, auth, Next (Request/Response quando necessário).
- **E2E**: Playwright, um browser (ex.: chromium) suficiente para smoke; mais browsers em CI se desejado.
- Novos módulos de lib/ e actions/: preferir pelo menos um teste por função crítica ou por schema de validação.
