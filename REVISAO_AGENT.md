# Revisão GTClicks com framework .agent/

Revisão multi-perspectiva do projeto usando o **Antigravity Kit** (`.agent/`): agentes Explorer, Backend, Frontend, Security Auditor, Database Architect e Test Engineer. Referência: [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md).

---

## 1. Metodologia e scripts .agent

### 1.1 Framework

- **Agentes (20):** Personas por domínio; nesta revisão usados: explorer-agent, backend-specialist, frontend-specialist, security-auditor, database-architect, test-engineer.
- **Skills (36):** Conhecimento modular (ex.: api-patterns, react-patterns, vulnerability-scanner, database-design, testing-patterns).
- **Scripts mestres (2):** `checklist.py` (desenvolvimento) e `verify_all.py` (pré-release).

### 1.2 Checklist (desenvolvimento)

```bash
python .agent/scripts/checklist.py .
# Com URL (inclui performance):
python .agent/scripts/checklist.py . --url http://localhost:3000
```

Ordem das checagens (CORE_CHECKS):

| Prioridade | Nome              | Script (relativo ao repo)                                      | Obrigatório |
| ---------- | ----------------- | -------------------------------------------------------------- | ----------- |
| P0         | Security Scan     | `.agent/skills/vulnerability-scanner/scripts/security_scan.py` | Sim         |
| P1         | Lint Check        | `.agent/skills/lint-and-validate/scripts/lint_runner.py`       | Sim         |
| P2         | Schema Validation | `.agent/skills/database-design/scripts/schema_validator.py`    | Não         |
| P3         | Test Runner       | `.agent/skills/testing-patterns/scripts/test_runner.py`        | Não         |
| P4         | UX Audit          | `.agent/skills/frontend-design/scripts/ux_audit.py`            | Não         |
| P5         | SEO Check         | `.agent/skills/seo-fundamentals/scripts/seo_checker.py`        | Não         |

Com `--url`: adiciona PERFORMANCE_CHECKS (Lighthouse, Playwright E2E via scripts em `performance-profiling` e `webapp-testing`).

### 1.3 Verificação completa (pré-release)

```bash
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

Inclui: Security, Lint, Type Coverage, Schema, Test Suite, UX, SEO, Lighthouse, Playwright E2E, e opcionalmente Bundle Analysis e Mobile Audit.

**Requisito:** Python no PATH. Não é dependência do projeto; uso opcional. Documentar em README ou docs/DEV.md.

---

## 2. Explorer Agent – Mapeamento e auditoria

_Referência: [.agent/agents/explorer-agent.md](.agent/agents/explorer-agent.md)_

### 2.1 Padrão arquitetural

- **Stack:** Next.js 16 (App Router), React 19, Prisma 6, Stack (Neon Auth), Mercado Pago, AWS S3/Rekognition.
- **Estrutura:** `app/` (rotas + API), `components/`, `features/`, `lib/`, `actions/`, `prisma/`. Camadas privadas com `_components/`, `_data-access/` em dashboard e coleções.
- **Entradas:** `app/page.js`, `app/layout.js`, `app/api/*` (REST), `stack/client.js` e `stack/server.js`.

### 2.2 Fluxo de dados

- **Auth:** Stack como fonte de identidade; `lib/auth.js` → `getAuthenticatedUser()` faz sync com Prisma (User).
- **API:** Rotas protegidas usam `getAuthenticatedUser()` (lib/auth) ou `stackServerApp.getUser()` (folders, coleções create-draft, users/me, photos/like).
- **Imagens:** S3 (previewUrl público); download via `/api/download/[token]` com token de item do pedido.

### 2.3 Checklist Explorer

- [x] Padrão arquitetural identificado (Next.js full-stack, REST).
- [x] Dependências críticas mapeadas (next, react, prisma, @stackframe/stack, mercadopago, aws-sdk).
- [x] Fluxo de auth documentado (FLUXO_AUTH_CADASTRO.md quando existir).
- [ ] Executar `checklist.py` localmente para health report automatizado (requer Python).

---

## 3. Backend Specialist – API e servidor

_Referência: [.agent/agents/backend-specialist.md](.agent/agents/backend-specialist.md)_

### 3.1 Autenticação nas rotas

- **getAuthenticatedUser():** carrinho, checkout/process, fotografos/create, fotografos/onboarding, fotos, upload, pedidos, admin/\*, auth/sync, auth/code/send, users/sync, fotografo update/financeiro/saques, pedidos/[id], verificar-pagamento, photos/process.
- **stackServerApp.getUser():** folders, folders/[id], colecoes/[id], colecoes/create-draft, colecoes/[id]/folders, users/me/dashboard, users/me/likes, photos/[id]/like.

POST `/api/fotografos/create` exige usuário autenticado; usa apenas `user.id` do servidor (userId do body ignorado). Documentado em FLUXO_AUTH_CADASTRO.md quando existir.

### 3.2 Validação (Zod)

Rotas que recebem body e usam schemas de `lib/validations.js` ou Zod local:

| Rota                   | Schema                        |
| ---------------------- | ----------------------------- |
| fotografos/create      | fotografoCreateBodySchema     |
| carrinho/item (DELETE) | carrinhoItemBodySchema        |
| checkout/process       | checkoutProcessBodySchema     |
| carrinho/sync          | cartSyncSchema                |
| fotos/batch            | photoBatchSchema              |
| upload                 | uploadRequestSchema           |
| fotografos/onboarding  | fotografoOnboardingBodySchema |
| photos/process         | processPhotoSchema (local)    |
| admin/collections      | querySchema (local)           |
| admin/users            | querySchema (local)           |
| admin/orders           | querySchema (local)           |

Retorno 400 com mensagem clara em caso de falha de validação (safeParse).

### 3.3 Checklist Backend

- [x] Rotas protegidas com auth (getAuthenticatedUser ou stackServerApp.getUser).
- [x] Validação Zod nas rotas críticas com body.
- [x] Respostas consistentes (JSON, status 4xx/5xx).
- [x] Webhook Mercado Pago com validação de assinatura (MERCADOPAGO_WEBHOOK_SECRET).

---

## 4. Frontend Specialist – UI e design system

_Referência: [.agent/agents/frontend-specialist.md](.agent/agents/frontend-specialist.md)_

### 4.1 Design system

- **Tema:** Dark mode; tokens em `app/globals.css` e `tailwind.config.js`: text-primary, surface-page, action-primary, border-default, status-success/error/warning, radius-\*, shadow-card, etc.
- **Documentação:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) – regra de ouro: evitar valores arbitrários (hex, px solto); usar tokens. Utilitários container-wide e glass-panel documentados.
- **Componentes:** shadcn/ui (Radix) em `components/ui/`; EmptyState, Card, PageHeader, AppPagination.

### 4.2 Estados vazios e erro

- **Pedidos, meus-downloads, meus-favoritos:** uso de EmptyState com variant="dashboard" e Card/tokens quando aplicável.
- **Pagamento falha:** mensagem genérica + exibição segura de status e message da query (safeStatus, safeMessage).

### 4.3 Checklist Frontend

- [x] Tokens usados em páginas prioritárias (como-funciona, layout, PhotoModalContent, AnalyticsOverview).
- [x] Estados vazios padronizados (EmptyState + Card).
- [x] Responsividade e alvos de toque considerados (min-h 44–48px onde aplicável).
- [x] next/image e optimizePackageImports (lucide-react, Radix) em uso.

---

## 5. Security Auditor – Segurança

_Referência: [.agent/agents/security-auditor.md](.agent/agents/security-auditor.md)_

### 5.1 OWASP Top 10 (resumo)

| Item                          | Status  | Nota                                                                                                                                                   |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A01 Broken Access Control     | OK      | Rotas protegidas com getAuthenticatedUser/role; redirect para login quando não autenticado.                                                            |
| A02 Cryptographic Failures    | OK      | Credenciais via Stack; secrets em env; webhook com HMAC.                                                                                               |
| A03 Injection                 | OK      | Prisma (queries parametrizadas); JSON-LD com dados controlados; sem eval.                                                                              |
| A04 Insecure Design           | OK      | Auth em create; fluxos documentados.                                                                                                                   |
| A05 Security Misconfiguration | OK      | poweredByHeader: false; .env para sensíveis.                                                                                                           |
| A06 Vulnerable Components     | Atenção | npm audit: vulnerabilidades em elliptic (Stack) e fast-xml-parser (AWS SDK); correção exige breaking changes. Manter npm audit e documentar no README. |
| A07 Auth Failures             | OK      | Sessão via Stack; create usa apenas user.id do servidor.                                                                                               |
| A08 Integrity                 | OK      | Webhook com assinatura; lock files versionados.                                                                                                        |
| A09 Logging                   | OK      | lib/logger; sem dados sensíveis em log.                                                                                                                |
| A10 Exceptional Conditions    | OK      | Tratamento de erro nas rotas; webhook idempotente (updateMany com status not PAGO).                                                                    |

### 5.2 XSS e entrada de usuário

- **dangerouslySetInnerHTML:** usado apenas para JSON-LD (layout.js, StandardFaq, fotografo/[username], colecoes/[slug]). Conteúdo controlado pelo app, não pelo usuário → risco baixo. Manter sempre dados controlados.
- **Pagamento falha:** status e message da query sanitizados (safeStatus, safeMessage) antes de exibir.

### 5.3 Checklist Security

- [x] Sem secrets em código.
- [x] Input validado nas rotas críticas (Zod).
- [x] Webhook MP com validação de assinatura.
- [ ] Rodar `npm audit` e documentar decisões sobre vulnerabilidades que exigem breaking change.

---

## 6. Database Architect – Schema e dados

_Referência: [.agent/agents/database-architect.md](.agent/agents/database-architect.md)_

### 6.1 Modelo (Prisma)

- **Entidades principais:** User, Fotografo, Colecao, Folder, Foto, Licenca, Pedido, ItemPedido, Carrinho, ItemCarrinho, Saldo, Transacao, Notification, Like, SolicitacaoSaque, UsageLog.
- **Enums:** UserRole, FotoStatus, OrientacaoFoto, StatusPedido, FaceIndexingStatus, etc.
- **Relações:** User ↔ Fotografo, Colecao → Folder → Foto, Pedido → ItemPedido (downloadToken), User → Carrinho → ItemCarrinho.

### 6.2 Migrações e ambiente

- Migrações em `prisma/migrations/`; `postinstall` executa `prisma generate`.
- DATABASE_URL (Neon/PostgreSQL) em .env; directUrl opcional para Neon pooling.

### 6.3 Checklist Database

- [x] Schema normalizado; relações e constraints definidas.
- [x] Índices e uso de Prisma para evitar N+1 (includes onde necessário).
- [ ] Executar `schema_validator.py` (checklist.py P2) se Python disponível.

---

## 7. Test Engineer – Testes e cobertura

_Referência: [.agent/agents/test-engineer.md](.agent/agents/test-engineer.md)_

### 7.1 Pirâmide de testes

- **Unitários (Jest):** lib/validations, lib/utils/formatters; actions (cart, collections, photographers); **tests**/unit (cart, collections, photographers, data, financial).
- **API (Jest):** carrinho (route, item), checkout/process, webhooks/mercadopago, download/[token], fotografos/create, folders (route, [id]), upload, photos/process, colecoes/create-draft.
- **E2E (Playwright):** e2e/ (buyer-flow, checkout-flow, client-flow, etc.); playwright.config.js com webServer e testDir e2e.

### 7.2 Cobertura e CI

- **jest.config.js:** collectCoverageFrom para lib, actions, app/api; coverageDirectory e reporters; coverageThreshold opcional (comentado).
- **Scripts:** `npm test`, `npm run test:coverage`, `npm run test:e2e`. CI pode rodar `npm test` e, se aplicável, `npm run test:e2e`.

### 7.3 Checklist Test Engineer

- [x] Testes unitários para validations e formatters.
- [x] Testes de API para carrinho, checkout, webhook, fotografos/create, folders, upload, download, photos/process, colecoes/create-draft.
- [x] E2E buyer-flow (home, busca, carrinho, checkout).
- [x] Mocks de getAuthenticatedUser e Prisma nos testes de API.
- [ ] Executar `test_runner.py` (checklist.py P3) e `playwright_runner.py` (verify_all) se Python disponível.

---

## 8. Resumo executivo e próximos passos

### 8.1 Conformidade com .agent

| Área     | Status | Observação                                          |
| -------- | ------ | --------------------------------------------------- |
| Explorer | OK     | Arquitetura mapeada; fluxos documentados.           |
| Backend  | OK     | Auth e Zod nas rotas críticas.                      |
| Frontend | OK     | Tokens e estados vazios alinhados ao design system. |
| Security | OK     | OWASP coberto; A06 documentado (npm audit).         |
| Database | OK     | Schema e migrações consistentes.                    |
| Testes   | OK     | Unit, API e E2E em uso; cobertura configurada.      |

### 8.2 Recomendações

1. **Scripts .agent:** Com Python no PATH, rodar em desenvolvimento `python .agent/scripts/checklist.py .` e antes de release `python .agent/scripts/verify_all.py . --url http://localhost:3000`.
2. **Dependências:** Manter README atualizado sobre npm audit e vulnerabilidades conhecidas (elliptic, fast-xml-parser) até atualização compatível dos pacotes.
3. **Documentação:** Manter FLUXO_AUTH_CADASTRO.md, DESIGN_SYSTEM.md e TESTING.md alinhados às mudanças de rotas e fluxos.

### 8.3 Documentos de referência

- [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md) – Agentes e skills.
- [.agent/agents/](.agent/agents/) – Definição dos agentes (explorer, backend, frontend, security-auditor, database-architect, test-engineer).
- [.agent/scripts/checklist.py](.agent/scripts/checklist.py) – Ordem de checagens (P0–P5 + performance com URL).
- [.agent/scripts/verify_all.py](.agent/scripts/verify_all.py) – Suíte completa.
- [docs/DEV.md](docs/DEV.md) – Uso dos scripts e testes (quando existir).
- [FLUXO_AUTH_CADASTRO.md](FLUXO_AUTH_CADASTRO.md) – Auth e onboarding (quando existir).
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) – Tokens e componentes.
- [TESTING.md](TESTING.md) – Estratégia de testes.

---

_Revisão refeita com o framework .agent/ (Antigravity Kit). Última atualização: fevereiro 2025._
