# Análise Completa do App GTClicks

Análise multi-perspectiva do projeto conforme o framework **.agent/** (Antigravity Kit): Explorer, Backend, Frontend, Security, Database, Testing e Code Review. Referência: [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md).

---

## 1. Metodologia

- **Agentes/skills usados:** explorer-agent (mapeamento e auditoria), code-review-checklist, backend-specialist, frontend-specialist, security-auditor, database-design, test-engineer.
- **Scripts .agent:** O script `python .agent/scripts/checklist.py .` (Security Scan, Lint, Schema, Test, UX, SEO) **não foi executado** neste ambiente (Python não encontrado). Recomenda-se rodar localmente para validação automatizada.
- **Documentos de contexto:** [.cursor/rules/gtclicks-context.md](.cursor/rules/gtclicks-context.md), [REVIEW_COMPLETA.md](REVIEW_COMPLETA.md), [REVISAO_UI_UX_FLUXOS.md](REVISAO_UI_UX_FLUXOS.md), [FLUXO_AUTH_CADASTRO.md](FLUXO_AUTH_CADASTRO.md).

---

## 2. Explorer Agent – Mapeamento e Auditoria

### 2.1 Padrão arquitetural

- **Tipo:** Next.js 16 App Router (full-stack), React 19, Server Components + Client Components.
- **Camadas:** `app/` (rotas + páginas), `components/`, `features/`, `lib/`, `actions/`, `prisma/`. Camadas privadas com prefixo `_` (`_components/`, `_data-access/`) em rotas como dashboard e coleções.
- **Entradas:** `app/page.js` (home), `app/layout.js`, `app/api/*` (REST), `stack/` (Stack Auth client/server).

### 2.2 Dependências críticas

- **Runtime:** next 16, react 19, prisma 6, @stackframe/stack (auth), mercadopago, @aws-sdk (S3, Rekognition), sharp, zod.
- **UI:** Radix, tailwindcss 4, lucide-react, sonner.
- **Testes:** Jest, Playwright, @testing-library/react.

### 2.3 Fluxo de dados

- **Auth:** Stack (Neon Auth) como fonte de identidade; `lib/auth.js` faz sync com Prisma (User) via `getAuthenticatedUser()`.
- **API:** Rotas em `app/api/*` usam `getAuthenticatedUser()` ou checagem de role (ADMIN/FOTOGRAFO); dados via Prisma.
- **Imagens:** S3 (previewUrl público; s3Key nunca exposto no cliente). Download com token em `/api/download/[token]`.

### 2.4 Riscos e dívida técnica

- **Dois fluxos de onboarding** documentados como “um único fluxo” em uso (FotografoOnboarding + create); OnboardingWizard + API onboarding deprecados para criação inicial.
- **JavaScript predominante:** Parte do código em TypeScript (actions/, lib/); migração gradual.
- **Uso de `dangerouslySetInnerHTML`:** Apenas para JSON-LD (dados controlados pelo app), não para HTML de usuário → risco XSS baixo, mas manter sempre dados controlados.

---

## 3. Backend Specialist – API e Servidor

### 3.1 Padrões de API

- **Estilo:** REST em `app/api/*`. Sem GraphQL/tRPC.
- **Autenticação:** Maioria das rotas protegidas usa `getAuthenticatedUser()`; rotas admin verificam `role === 'ADMIN'`; dashboard fotógrafo usa `/api/users/me` e `/api/fotografos/resolve`.
- **Respostas:** JSON; erros com status 4xx/5xx e mensagem em `error` ou `details`.

### 3.2 Segurança de entrada

- **Validação:** Zod em Server Actions (actions/); em rotas API a validação é variada (algumas checagens manuais).
- **Ids:** Uso de `cuid` e IDs do Prisma; sem exposição direta de s3Key no cliente.
- **Webhook Mercado Pago:** Assinatura HMAC-SHA256 quando `MERCADOPAGO_WEBHOOK_SECRET` está definido (`lib/mercadopago-webhook.js`, `app/api/webhooks/mercadopago/route.js`).

### 3.3 Pontos de atenção

- **POST /api/fotografos/create:** Não exige auth no endpoint; confia em `userId` no body. Garantir que apenas o próprio usuário (ou fluxo controlado pós-login) chame essa rota.
- **Consistência:** Padronizar validação (ex.: Zod) em todas as rotas API que recebem body.

---

## 4. Frontend Specialist – UI e UX

### 4.1 Design system

- **Tema:** Dark mode; tokens em `app/globals.css` (surface-page, action-primary, text-primary, etc.) e `tailwind.config.js`.
- **Componentes:** shadcn/ui (Radix) em `components/ui/`; cards, botões, modais, paginação, separator.
- **Tipografia:** Inter + Syne (manual de contexto); utilitários `.heading-display`, `.heading-section`.

### 4.2 Estrutura de páginas

- **Layout:** Header fixo, container-wide, footer; páginas com `PageContainer`, `PageHeader` onde aplicável.
- **Responsividade:** Breakpoints sm/md/lg; BottomNav/mobile menu; touch targets (min-h 44–48px) considerados.
- **Acessibilidade:** Uso de `aria-label`, `aria-current`, `role="navigation"` em componentes de navegação e paginação.

### 4.3 Performance

- **Imagens:** `next/image` com domínios configurados (S3, Google, Unsplash, etc.); formatos avif/webp; `optimizePackageImports` para lucide-react e Radix.
- **Bundle:** Bundle analyzer via `ANALYZE=true`; compressão ativada; `poweredByHeader: false`.

### 4.4 Sugestões

- Manter uso consistente de tokens (text-foreground, surface-_, border-_) em novas páginas.
- Garantir que estados vazios e erro tenham mensagens e CTAs claros (já aplicado em fluxos revisados).

---

## 5. Security Auditor – Segurança

### 5.1 OWASP Top 10 (resumo)

| Item                          | Status | Nota                                                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| A01 Broken Access Control     | 🟢     | Rotas protegidas com getAuthenticatedUser/role; redirect para login quando não autenticado. |
| A02 Cryptographic Failures    | 🟢     | Senhas/credenciais via Stack; secrets só em `process.env`; webhook com HMAC.                |
| A03 Injection                 | 🟢     | Prisma (queries parametrizadas); JSON-LD com dados controlados; sem eval.                   |
| A04 Insecure Design           | 🟡     | Fluxo de auth e onboarding documentado; threat modeling não explícito no repo.              |
| A05 Security Misconfiguration | 🟢     | `poweredByHeader: false`; variáveis sensíveis em .env.                                      |
| A06 Vulnerable Components     | 🟡     | Manter dependências atualizadas (`npm audit`).                                              |
| A07 Authentication Failures   | 🟢     | Stack Auth; sessão; redirect pós-login com callbackUrl.                                     |
| A08–A10                       | 🟡     | Verificar integridade de deps, logging e SSRF em chamadas externas conforme escala.         |

### 5.2 Secrets e credenciais

- **Nenhum secret hardcoded** no código de aplicação; uso de `process.env` (S3, Stack, Mercado Pago, Resend, Rekognition).
- **.env.example** documenta variáveis; garantir que `.env` não seja commitado.

### 5.3 Recomendações

- Executar `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` quando Python estiver disponível.
- Revisar periodicamente rotas que recebem `userId` ou parâmetros sensíveis no body (ex.: create fotógrafo) para garantir que apenas o próprio usuário ou sistema autorizado invoque.

---

## 6. Database Architect – Schema e Dados

### 6.1 Modelo (Prisma)

- **Entidades principais:** User, Fotografo, Colecao, Foto, Licenca, Pedido, PedidoItem, Carrinho, Like, Notification, Saldo, Transacao, SolicitacaoSaque, Folder.
- **Enums:** UserRole (CLIENTE, FOTOGRAFO, ADMIN), FotoStatus, ColecaoStatus, OrientacaoFoto, etc.
- **Relações:** User 1:1 Fotografo; Fotografo 1:N Colecao/Foto; Colecao N:N Foto (via tabela de junção ou relação direta conforme schema); Pedido N:1 User, N:1 PedidoItem.

### 6.2 Migrações

- Migrações em `prisma/migrations/` (add_financial_models, add_foto_metrics, sync_schema, folder_model, etc.); schema estável e versionado.

### 6.3 Boas práticas

- Uso de `cuid`/`@default(cuid())` e `@unique` onde apropriado; `s3Key` único; índices implícitos em FKs.
- Evitar expor s3Key no cliente; apenas previewUrl e download por token.

### 6.4 Sugestões

- Rodar `schema_validator.py` (skill database-design) se disponível.
- Para listagens grandes (fotos, pedidos), garantir paginação e índices (ex.: createdAt, userId) já utilizados.

---

## 7. Test Engineer – Testes

### 7.1 Cobertura atual

- **Jest:** `__tests__/unit/` (actions: cart, collections, photographers; data: marketplace; financial); `lib/__tests__/` (mercadopago, validations, s3-client); `app/api/.../__tests__/` (upload, download, webhooks mercadopago, create-draft coleções).
- **Playwright:** E2E configurado (`playwright.config.js`, `test:e2e`).

### 7.2 Pontos fortes

- Testes unitários para Server Actions e lógica de negócio; testes de API para rotas críticas (upload, download, webhook MP).
- Jest configurado com jsdom e setup; cobertura acionável com `test:coverage`.

### 7.3 Sugestões

- Aumentar cobertura de rotas API que alteram dados (ex.: checkout process, fotografos/create, folders).
- Manter E2E para fluxos críticos (login, checkout, onboarding) conforme [TESTING.md](TESTING.md).
- Executar `python .agent/skills/testing-patterns/scripts/test_runner.py` quando disponível.

---

## 8. Code Review Checklist (resumo)

- **Correção:** Tratamento de erro e edge cases em ações críticas (checkout, webhook, auth).
- **Segurança:** Inputs validados (Zod em actions); sem secrets em código; webhook assinado.
- **Performance:** Prisma com take/skip; next/image; otimização de imports.
- **Qualidade:** Nomenclatura clara; uso de componentes e tokens; DRY em fluxos repetidos.
- **Testes:** Testes para actions e APIs críticas; E2E configurado.
- **Documentação:** README, .cursor/rules, REVIEW_COMPLETA, REVISAO_UI_UX_FLUXOS, FLUXO_AUTH_CADASTRO.

---

## 9. Verificação de scripts .agent (não executados)

| Script              | Caminho                                      | Objetivo                              |
| ------------------- | -------------------------------------------- | ------------------------------------- |
| checklist.py        | .agent/scripts/checklist.py                  | Security, Lint, Schema, Test, UX, SEO |
| security_scan.py    | .agent/skills/vulnerability-scanner/scripts/ | Varredura de vulnerabilidades         |
| lint_runner.py      | .agent/skills/lint-and-validate/scripts/     | Lint e qualidade                      |
| schema_validator.py | .agent/skills/database-design/scripts/       | Validação do schema                   |
| test_runner.py      | .agent/skills/testing-patterns/scripts/      | Execução de testes                    |
| ux_audit.py         | .agent/skills/frontend-design/scripts/       | Auditoria UX                          |
| seo_checker.py      | .agent/skills/seo-fundamentals/scripts/      | Meta tags e SEO                       |

**Como rodar (quando Python estiver disponível):**

```bash
# Checagem rápida (core)
python .agent/scripts/checklist.py .

# Verificação completa (com URL para Lighthouse)
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

---

## 10. Síntese e Próximos Passos

### 10.1 Pontos fortes

- Arquitetura Next.js 16 App Router com camadas claras (Server/Client, \_components, \_data-access).
- Auth centralizada (Stack + Prisma) e proteção de rotas por usuário e role.
- Design system consistente (dark, tokens, shadcn); fluxos de comprador e vendedor documentados.
- Webhook Mercado Pago com assinatura; download por token; s3Key não exposto.
- Testes unitários e de API para ações e rotas críticas; E2E configurado.

### 10.2 Ações recomendadas

1. **Executar scripts .agent** quando Python estiver disponível (checklist.py e verify_all.py).
2. **API:** Padronizar validação (ex.: Zod) em todas as rotas que recebem body; revisar POST /api/fotografos/create (garantir que apenas usuário autenticado/onboarding invoque).
3. **Testes:** Aumentar cobertura em rotas de checkout, folders e fotografos.
4. **Dependências:** Rodar `npm audit` e atualizar pacotes com vulnerabilidades conhecidas.
5. **Documentação:** Manter REVIEW_COMPLETA, REVISAO_UI_UX_FLUXOS e FLUXO_AUTH_CADASTRO alinhados às mudanças de fluxo e auth.

### 10.3 Referências

- [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md) – Agentes, skills e workflows.
- [.cursor/rules/gtclicks-context.md](.cursor/rules/gtclicks-context.md) – Regras e arquitetura do projeto.
- [REVIEW_COMPLETA.md](REVIEW_COMPLETA.md) – Revisão face ao manual.
- [REVISAO_UI_UX_FLUXOS.md](REVISAO_UI_UX_FLUXOS.md) – Fluxos comprador/vendedor e auth.
- [FLUXO_AUTH_CADASTRO.md](FLUXO_AUTH_CADASTRO.md) – Cadastro vs registrar e onboarding.
- [TESTING.md](TESTING.md) – Plano de testes.

---

_Análise gerada com base nos critérios do framework .agent/ (Explorer, Backend, Frontend, Security, Database, Test, Code Review). Scripts automatizados do .agent não foram executados neste ambiente._
