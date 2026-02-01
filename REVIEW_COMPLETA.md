# Revisão Completa do App GTClicks

Revisão abrangente do projeto GTClicks, com base no [Manual de Contexto v3.1](.cursor/rules/gtclicks-context.md). Atualizado em fevereiro de 2025.

---

## 1. Resumo Executivo

| Área             | Status     | Resumo                                                                     |
| ---------------- | ---------- | -------------------------------------------------------------------------- |
| **Arquitetura**  | 🟡 Parcial | Camadas Privadas em coleções, perfil, fotos; financeiro e início pendentes |
| **Segurança**    | 🟢 Bom     | s3Key protegido; roles validadas; webhook MP com assinatura HMAC           |
| **UI/UX**        | 🟢 Bom     | Dark theme, shadcn/ui, responsivo, touch targets, acessibilidade           |
| **Testes**       | 🟢 Bom     | 89 testes; webhook e download cobertos                                     |
| **Performance**  | 🟢 Bom     | next/dynamic, ISR, imagens otimizadas                                      |
| **Logs**         | 🟡 Parcial | Logger centralizado; webhook e api/log migrados; ~298 console.\* restantes |
| **Documentação** | 🟢 Bom     | README, .env.example, TESTING.md, manual de contexto                       |

---

## 2. Arquitetura e Camadas Privadas

### 2.1 Implementado (conforme Manual v3.1)

| Rota                                | Estrutura                                                     |
| ----------------------------------- | ------------------------------------------------------------- |
| `app/colecoes/[slug]/`              | `_components/` (CollectionHero, CollectionFAQ)                |
| `app/dashboard/fotografo/colecoes/` | `_data-access/colecoes.js`, `_components/ColecoesContent.jsx` |
| `app/dashboard/fotografo/perfil/`   | `_data-access/perfil.js` (getFotografoByUserId)               |
| `app/dashboard/fotografo/fotos/`    | `_data-access/fotos.js`, `_components/FotosContent.jsx`       |

### 2.2 Pendente

- **Dashboard início** (`page.js`) – usa `FotografoDashboardClient` com fetch em `/api/fotografos/resolve`
- **Financeiro** – Client Component com `getFinancialData()` (Server Action)
- **Admin** – layout com validação; sem DAL por rota
- **Pedidos, meus-downloads, meus-favoritos** – mistura Server/Client

### 2.3 Stack Técnica

- Next.js 16 (App Router) + React 19
- Prisma + PostgreSQL (Neon)
- Stack (Neon Auth) – login social
- Mercado Pago – SDK + Webhooks
- AWS S3 + Rekognition
- Tailwind CSS 4 + shadcn/ui (Radix)
- Zod, Sonner

---

## 3. Segurança

### 3.1 s3Key

- ✅ APIs públicas sem s3Key
- ✅ `/api/fotos/batch` – apenas campos seguros
- ⚠️ Editor – s3Key apenas em gestão autenticada (FOTOGRAFO/ADMIN)

### 3.2 Webhook Mercado Pago

- ✅ Validação de assinatura HMAC-SHA256 quando `MERCADOPAGO_WEBHOOK_SECRET` configurado
- ✅ Idempotência via `updateMany` com `status: { not: "PAGO" }`
- ✅ `.env.example` documenta `MERCADOPAGO_WEBHOOK_SECRET`

### 3.3 Roles

- Admin – layout + APIs validam `role === 'ADMIN'`
- Dashboard fotógrafo – layout valida FOTOGRAFO ou ADMIN

---

## 4. UI/UX

### 4.1 Design System

- Tema Dark Mode (Inter + Syne)
- Botões: primário (preto + borda vermelha), secundário (#4A4A4A)
- Tokens em `globals.css` e `design-tokens.js`

### 4.2 Revisões Aplicadas

- DASHBOARD_REVIEW.md, HEADER_FOOTER_REVIEW.md, COMPONENTS_REVIEW.md, PAGES_REVIEW.md

### 4.3 Acessibilidade e Mobile

- Touch targets ≥ 44px
- aria-label, aria-current, role em navegação
- Safe area para notch
- Grids responsivos

---

## 5. Testes

### 5.1 Unitários (Jest) – 89 testes passando

| Área    | Arquivos                                                                                      |
| ------- | --------------------------------------------------------------------------------------------- |
| Lib     | slug, s3-client, mercadopago, mercadopago-payments, validations, formatters                   |
| Actions | cart, collections, photographers                                                              |
| Data    | marketplace                                                                                   |
| Unit    | financial                                                                                     |
| API     | upload, photos/process, colecoes/create-draft, **webhooks/mercadopago**, **download/[token]** |

### 5.2 E2E (Playwright)

- 14 specs em `e2e/` (checkout, photographer, collection, facial-search, webhook, etc.)

### 5.3 Lacunas

- `/api/checkout/process` – sem teste unitário
- E2E – validar estabilidade do fluxo principal

---

## 6. Logs e Tratamento de Erros

### 6.1 Logger (`lib/logger.js`)

- `logError(error, context)` – erros com stack
- `logWarn(message, context)` – avisos
- `logInfo(message, context)` – informações
- `logDebug(message, context)` – desativado em produção

### 6.2 Migrado para o Logger

- Webhook Mercado Pago
- API `/api/log`

### 6.3 Pendente

- ~298 ocorrências de `console.*` em 113 arquivos
- Migração gradual recomendada para rotas críticas

---

## 7. Performance

- `next/dynamic` – FAQSection, DashboardContent, CollectionEditor
- ISR – home (3600), busca (600)
- Imagens – AVIF/WebP, remotePatterns
- `optimizePackageImports` – lucide-react, Radix

---

## 8. Pontos de Atenção

### 8.1 Prioridade Média

1. **E2E** – garantir fluxo principal estável
2. **Logger** – migrar mais rotas críticas (checkout, batch, process)
3. **s3Key no editor** – avaliar identificador opaco em PhotoManagerTab

### 8.2 Prioridade Baixa

1. **Camadas Privadas** – financeiro, início do dashboard
2. **Admin** – DAL por rota
3. **Licença múltipla** – schema suporta; UI MVP em Uso Pessoal

---

## 9. Checklist para Novas Funcionalidades

- [ ] Camadas Privadas: `page` + `_components/` + `_data-access/` + `_actions/` quando fizer sentido
- [ ] Validar roles (FOTOGRAFO/ADMIN) em áreas de gestão
- [ ] Não expor s3Key em respostas públicas
- [ ] Zod em formulários e Server Actions
- [ ] Sonner para feedback de sucesso/erro
- [ ] `revalidatePath()` ou `refresh()` após mutações
- [ ] Logger (`lib/logger`) em vez de `console.*` em rotas críticas
- [ ] Testes para novas actions e rotas críticas

---

## 10. Documentos Relacionados

| Documento                           | Descrição                 |
| ----------------------------------- | ------------------------- |
| `.cursor/rules/gtclicks-context.md` | Manual de contexto v3.1   |
| `REVIEW.md`                         | Revisão anterior          |
| `TESTING.md`                        | Estratégia de testes      |
| `DASHBOARD_REVIEW.md`               | Dashboard do fotógrafo    |
| `HEADER_FOOTER_REVIEW.md`           | Header, Footer, BottomNav |
| `COMPONENTS_REVIEW.md`              | Componentes gerais        |
| `PAGES_REVIEW.md`                   | Páginas públicas e user   |
| `DESIGN_SYSTEM.md`                  | Tokens e design system    |

---

_Revisão refeita em fevereiro de 2025._
