# Revisão de Estrutura do Projeto GTClicks

**Referência:** `.cursor/agents/lead-orchestrator.md`  
**Data:** 9 de fevereiro de 2025  
**Objetivo:** Avaliar a estrutura do projeto conforme as diretrizes do Lead Orchestrator e especialistas.

---

## 1. Resumo Executivo

| Critério | Status | Observação |
|----------|--------|------------|
| **Modelo de dados** | ✅ Alinhado | User, Fotografo, Colecao, Foto, Pedido, ItemPedido, Saldo, SolicitacaoSaque conforme lead-orchestrator |
| **Camadas privadas** | 🟡 Parcial | Apenas coleções, fotos e perfil usam `_components/` + `_data-access/` |
| **Server Actions** | ✅ Conforme | Todas em `actions/` com `"use server"` |
| **Segurança** | ✅ Bom | s3Key protegido, webhook MP com HMAC, roles validadas |
| **Specialists cobertura** | 🟡 Parcial | Mercado Pago, S3, webhooks presentes; Asaas legado coexiste |
| **Hard Rules** | ✅ Respeitadas | Idempotência MP, S3 privado, acesso pago via autorização |

---

## 2. Arquitetura Overview

### 2.1 Estrutura de pastas (visão do Lead Orchestrator)

```
gtclicks/
├── app/
│   ├── (dashboard)/          # Dashboard fotógrafo + Admin
│   │   ├── admin/            # Admin: coleções, pedidos, saques, usuários, financeiro
│   │   └── dashboard/       # Fotógrafo: coleções, fotos, perfil, financeiro, onboarding
│   ├── (site)/               # Site público: busca, coleções, checkout, pedidos
│   └── api/                  # REST APIs: webhooks, upload, checkout, download
├── actions/                  # Server Actions globais (✅ todos com "use server")
├── components/               # Componentes compartilhados (admin, checkout, shared, ui)
├── features/                # ⚠️ Estrutura alternativa: cart, collections, photographer
├── lib/                     # Utilitários: auth, prisma, s3, mercadopago, validations
├── prisma/                  # Schema, migrations
└── types/                   # Declarações TypeScript
```

### 2.2 Duplicação de responsabilidades

Existem **duas estruturas** para funcionalidades de domínio:

| Domínio | `app/` (rotas) | `features/` |
|---------|----------------|-------------|
| Coleções | `dashboard/fotografo/colecoes/` com `_components/` + `_data-access/` | `features/collections/` (CollectionEditor, hooks, utils) |
| Carrinho | `(site)/carrinho` | `features/cart/` (CartContext, useCheckout) |
| Fotógrafo | `dashboard/fotografo/` | `features/photographer/` (DashboardContent, onboarding) |

**Recomendação:** Consolidar em uma abordagem. O manual (`gtclicks-context.md`) prioriza **camadas privadas por rota** (`_components/`, `_data-access/`). O `features/` pode ser mantido para lógica compartilhada que não pertence à rota (ex: hooks, contextos), mas componentes de UI deveriam migrar para `_components/` das rotas correspondentes.

---

## 3. Camadas Privadas (gtclicks-reviewer)

### 3.1 Implementado conforme padrão

| Rota | `page` | `_data-access/` | `_components/` |
|------|--------|-----------------|---------------|
| `dashboard/fotografo/colecoes/` | ✅ page.tsx | ✅ colecoes.js | ✅ ColecoesContent.jsx |
| `dashboard/fotografo/fotos/` | ✅ page.tsx | ✅ fotos.js | ✅ FotosContent.jsx |
| `dashboard/fotografo/perfil/` | ✅ page.tsx | ✅ perfil.js | ❌ (usa componentes diretos) |
| `colecoes/[slug]/` | ✅ page.tsx | ❌ | ✅ CollectionHero, CollectionFAQ |

### 3.2 Pendente

- **Dashboard início** (`page.js`) – não usa DAL; chama API `/api/fotografos/resolve`
- **Financeiro** – usa Server Action sem DAL dedicado
- **Admin** – layout com validação; sem `_data-access/` por rota
- **Pedidos, meus-downloads, meus-favoritos** – mistura Server/Client sem camadas privadas
- **Busca, categorias, checkout** – componentes em `components/` ou inline, não em `_components/`

---

## 4. Server Actions e Validação

### 4.1 Actions com `"use server"` ✅

| Action | `"use server"` | Validação Zod |
|--------|----------------|---------------|
| admin.ts | ✅ | (verificar) |
| cart.ts | ✅ | (verificar) |
| checkout.ts | ✅ | (verificar) |
| collections.ts | ✅ | (verificar) |
| folders.ts | ✅ | (verificar) |
| notifications.ts | ✅ | (verificar) |
| orders.ts | ✅ | (verificar) |
| payouts.ts | ✅ | (verificar) |
| photographers.ts | ✅ | (verificar) |
| photos.ts | ✅ | (verificar) |
| rekognition.ts | ✅ | (verificar) |

### 4.2 Revalidação

- Após mutações: verificar presença de `revalidatePath()` ou `refresh()` em todas as actions de escrita.

---

## 5. Especialistas e Cobertura

### 5.1 Agentes referenciados no Lead Orchestrator

| Especialista | Evidência no projeto |
|--------------|----------------------|
| **mercadopago-payments** | ✅ lib/mercadopago.ts, webhook em api/webhooks/mercadopago |
| **webhook-reliability** | 🟡 Idempotência via `updateMany`; sem tabela inbox formal |
| **media-upload** | ✅ api/upload, presigned URLs, S3 |
| **s3-media-pipeline** | ✅ lib/s3-*, watermark, processing |
| **content-protection** | ✅ api/download/[token], downloadToken em ItemPedido |
| **marketplace-security** | ✅ Roles, auth checks |
| **product-marketplace** | ✅ Schema Prisma alinhado |
| **nextjs-app-router** | ✅ App Router, layouts |
| **react-components** | ✅ shadcn/ui em components/ui |
| **admin-tools** | ✅ app/(dashboard)/admin |
| **test-generator** | ✅ Jest + Playwright |
| **gtclicks-reviewer** | ✅ Regras em .cursor/rules |

### 5.2 Pontos de atenção

- **Asaas:** Código legado em `lib/asaas.ts`, `api/asaas/`, `api/webhooks/asaas`. Considerar remoção ou isolamento se MP for o único gateway.
- **Webhook inbox:** Não há tabela dedicada para retries/dedupe; idempotência é feita via status do pedido.

---

## 6. Hard Rules (Lead Orchestrator)

| Regra | Status |
|-------|--------|
| Mercado Pago: idempotência + webhook verification + out-of-order | ✅ Idempotência; verificar ordem de eventos em cenários edge |
| S3: originals privados; signed URLs após autorização | ✅ |
| Nunca depender de checks client-side para conteúdo pago | ✅ Download via token server-side |
| Preferir incrementos simples e shippáveis | ✅ |

---

## 7. Verifier Pass (mental)

| Item | Status |
|------|--------|
| Estados consistentes? | ✅ PedidoStatus, ColecaoStatus, FotoStatus definidos |
| Auth checks faltando? | 🟡 Revisar rotas Admin e APIs sensíveis |
| Race conditions? | 🟡 Webhook + polling podem concorrer; idempotência mitiga |
| Índices faltando? | ✅ Schema com @@index em chaves de busca |
| Testes faltando? | 🟡 /api/checkout/process sem teste unitário |

---

## 8. Mix JS/TS e Migração

- **lib/:** Parcialmente migrado (vários .ts); restam .js: mercadopago-webhook, db, processing, mail, rekognition, watermark
- **app/:** Maioria .tsx em pages; muitos loading.js; _data-access em .js
- **features/:** Quase todo .js
- **actions/:** 100% TypeScript ✅

**Ver:** `docs/TYPESCRIPT_MIGRATION.md` para roadmap.

---

## 9. PR Checklist (para novas features)

- [ ] Camadas privadas: `page` + `_components/` + `_data-access/` (ou justificar exceção)
- [ ] Server Action com `"use server"` + Zod em inputs
- [ ] `revalidatePath()` ou `refresh()` após mutações
- [ ] Não expor `s3Key` no cliente
- [ ] Validação de roles (FOTOGRAFO/ADMIN) em áreas restritas
- [ ] Notificações com sonner
- [ ] Testes para actions e rotas críticas

---

## 10. Testing Checklist

- [ ] **Unit:** Novas actions e DAL com Jest
- [ ] **API:** Rotas críticas (checkout, download, webhook) com testes de integração
- [ ] **E2E:** Fluxo principal (busca → carrinho → checkout → download) com Playwright
- [ ] **Segurança:** Testar acesso não autorizado a pedidos e downloads

---

## 11. Recomendações Priorizadas

### Alta

1. **Unificar DAL:** Extender `_data-access/` para financeiro, admin e pedidos.
2. **Teste checkout:** Adicionar teste unitário para `/api/checkout/process`.

### Média

3. **features vs app:** Decidir se `features/` é para contexto/hooks apenas ou migrar componentes para `_components/` das rotas.
4. **Migração TS:** Completar lib/ e features/ para TypeScript.

### Baixa

5. **Webhook inbox:** Avaliar tabela de inbox para retries e dedupe explícitos.
6. **Asaas:** Documentar ou remover se obsoleto.

---

_Documento gerado com base em `.cursor/agents/lead-orchestrator.md` e `.cursor/agents/gtclicks-reviewer.md`._
