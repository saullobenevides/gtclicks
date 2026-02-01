# GTClicks

Marketplace de fotos em Next.js 16 (App Router) com Prisma + PostgreSQL e autenticacao via **Neon Auth (Stack)**. O objetivo e permitir multiplos fotografos, licenciamento flexivel e checkout seguro.

## Stack

- **Next.js 16**: SSR/SSG/ISR para vitrines e paginas dinamicas.
- **Prisma + PostgreSQL (Neon)**: modelagem de usuarios, fotografos, colecoes, fotos, licencas e pedidos.
- **Neon Auth (Stack)**: autenticacao pronta com login social (Google e Facebook), handler automatico e componentes React.
- **Tailwind CSS + design system**: tokens em `DESIGN_SYSTEM.md`, tema escuro por padrao.
- **Mercado Pago**: pagamentos integrados (preference, webhook, verificacao) e liberacao de downloads apos pagamento.

## Scripts uteis

| Comando                 | Descricao                                                   |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Ambiente local em `http://localhost:3000`.                  |
| `npm run build`         | Compila para producao.                                      |
| `npm run lint`          | Executa ESLint.                                             |
| `npm run db:generate`   | Gera o Prisma Client.                                       |
| `npm run db:push`       | Sincroniza o schema com o banco.                            |
| `npm run db:migrate`    | Cria uma migracao (modo interativo).                        |
| `npm run db:seed`       | Popula com dados demo (usuarios, colecoes, fotos, pedidos). |
| `npm run test`          | Roda testes unitários (Jest).                               |
| `npm run test:coverage` | Roda testes com relatório de cobertura.                     |
| `npm run test:e2e`      | Roda testes E2E (Playwright).                               |

## Configurando o banco

1. Crie um banco PostgreSQL (Neon recomendado).
2. Ajuste `DATABASE_URL` no `.env`.
3. Rode:
   ```bash
   npm run db:generate
   npm run db:push   # ou npm run db:migrate -- --name init
   npm run db:seed
   ```
4. Depois do seed voce tera clientes, fotografos e pedidos mockados (`senha-demo` e usada nos registros locais).

## Storage (S3/Spaces)

Configure um bucket compatível com S3 e adicione as variáveis:

```ini
S3_UPLOAD_BUCKET=seu-bucket
S3_UPLOAD_REGION=sa-east-1
S3_UPLOAD_ACCESS_KEY_ID=seu-access-key
S3_UPLOAD_SECRET_ACCESS_KEY=seu-secret-key
```

O endpoint `/api/upload` gera URLs assinadas que o dashboard de upload usa para enviar previews/originais diretamente ao storage.

## Integrando Neon Auth (Stack)

1. Crie um projeto em [https://app.stack-auth.com](https://app.stack-auth.com) e copie as chaves para o `.env`:
   ```ini
   NEXT_PUBLIC_STACK_PROJECT_ID="d19cc055-ea18-4f02-84b1-fe509c8c649f"
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pck_..."
   STACK_SECRET_SERVER_KEY="ssk_..."
   ```
2. O arquivo `stack/client.js` instancia o `StackClientApp` e o `app/layout.js` envolve toda a aplicacao com `StackProvider` + `StackTheme`.
3. A rota `app/handler/[...stack]/page.js` expoe todas as telas gerenciadas pelo Neon Auth (sign-in, sign-up, account settings etc.).
4. **Login** (`/login`) e **Registrar** (`/registrar`) usam `<SignIn />` e `<SignUp />` do `@stackframe/stack`. **Cadastro** (`/cadastro`) redireciona para **Como Funciona** (entrada “quero ser fotógrafo”). Detalhes: **[FLUXO_AUTH_CADASTRO.md](./FLUXO_AUTH_CADASTRO.md)**.

> Dica: configure os provedores (Google/Facebook) direto no painel da Neon para que aparecam automaticamente no componente de login.

## Estrutura de pastas

- `app/page.js` - Home SSR com destaques (colecoes, fotografos e fluxos).
- `app/colecoes`, `app/foto`, `app/fotografo` - Rotas dinamicas com fallback quando o banco estiver vazio.
- `app/api/*` - REST endpoints (fotos, pedidos, upload) prontos para conectar a storage e PSP.
- `app/handler/[...stack]` - Handler do Neon Auth.
- `stack/client.js` - Inicializacao do SDK da Neon Auth (Stack).
- `lib/data/marketplace.js` - Funcoes que trazem dados reais via Prisma ou caem em mocks.
- `prisma/schema.prisma` - Schema completo (User, Fotografo, Colecao, Foto, Licenca, Pedido).
- `prisma/seed.mjs` - Seed com conteudo em pt-BR.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores. Principais grupos:

- **Banco**: `DATABASE_URL` (PostgreSQL/Neon).
- **Auth (Stack)**: `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY`.
- **S3**: `S3_UPLOAD_BUCKET`, `S3_UPLOAD_REGION`, `S3_UPLOAD_ACCESS_KEY_ID`, `S3_UPLOAD_SECRET_ACCESS_KEY`.
- **Mercado Pago**: `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`.
- **App**: `NEXT_PUBLIC_APP_URL` (base URL para webhooks e redirects).

Opcionais: `RESEND_API_KEY` (e-mail), `REKOGNITION_COLLECTION_ID` (reconhecimento facial), `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, `USE_MOCK_DATA` (dev), `ANALYZE` (bundle), `DEBUG` (Prisma logs).

## Próximos Passos

1.  **Checkout / Mercado Pago** - [INTEGRADO] Preference, webhook e verificacao de pagamento ativos; possivel refinamento de UX e testes.
2.  **Sync Neon -> Prisma** - [CONCLUÍDO] Sincronização automática em `lib/auth.js` e `api/auth/sync`.
3.  **Área do Cliente** - painel para pedidos e downloads (iniciado em `/meus-downloads`).
4.  **Armazenamento** - S3 com URLs pre-assinadas em `/api/upload` e nos itens do pedido; integrado.
5.  **Notificações** - [CONCLUÍDO] Sistema de notificação interna no banco.

## Linguagem (JS/TS)

O projeto e majoritariamente JavaScript (`.js`/`.jsx`). Alguns modulos em TypeScript (`.ts`/`.tsx`) em `actions/` e em `lib/` (ex.: `serialization.ts`, `tools.ts`) para tipagem em fluxos criticos. Nao e obrigatorio migrar tudo para TS; novos codos podem seguir em JS ou TS conforme a necessidade.

## Segurança e dependências

O projeto mantém dependências atualizadas e sem vulnerabilidades **críticas** conhecidas. Em desenvolvimento e antes de releases:

- Rode `npm audit` para ver o relatório atual.
- Use `npm audit fix` para aplicar correções seguras (sem breaking changes).
- Vulnerabilidades que exijam `npm audit fix --force` (ex.: em `@stackframe/stack` ou `@aws-sdk/*`) ficam documentadas aqui; atualize quando houver versões compatíveis.

**Vulnerabilidades conhecidas:** O `npm audit` pode reportar vulnerabilidades em dependências transitivas, por exemplo **elliptic** (via `@stackframe/stack`) e **fast-xml-parser** (via AWS SDK). A correção hoje exigiria breaking changes (atualização de Stack ou AWS SDK). A decisão é manter as versões atuais até haver versões compatíveis; esta seção deve ser atualizada quando houver correções disponíveis.

Opcional em CI: falhar o build em vulnerabilidades high/critical (ex.: `npm audit --audit-level=high`). As falhas conhecidas listadas acima podem ser ignoradas no CI até atualização dos pacotes.

## Pasta `.agent/`

A pasta `.agent/` contem skills, workflows e scripts usados por ferramentas de agente/IA (Cursor, Codex, etc.). Nao faz parte do runtime da aplicacao; pode ser excluida do deploy (ex.: configurar o build para ignorar `.agent/`).

**Scripts opcionais (requerem Python no PATH):** Em desenvolvimento, pode-se rodar `python .agent/scripts/checklist.py .` para checagem incremental (segurança, lint, schema, testes, UX, SEO). Antes de releases, `python .agent/scripts/verify_all.py . --url http://localhost:3000` executa a suíte completa (incl. Lighthouse e E2E). O uso de Python é opcional; nao é dependência do projeto. Detalhes em **[docs/DEV.md](./docs/DEV.md)**.

---

As **diretrizes de contexto e arquitetura** do projeto estão em **[.cursor/rules/gtclicks-context.md](./.cursor/rules/gtclicks-context.md)** (Manual Pro v3.0). A **revisão do app** face ao manual está em **[REVIEW.md](./REVIEW.md)**. O plano de testes está em **[TESTING.md](./TESTING.md)**. Fluxos de **auth, cadastro e onboarding** (cadastro vs registrar, fluxo único do fotógrafo) estão em **[FLUXO_AUTH_CADASTRO.md](./FLUXO_AUTH_CADASTRO.md)**; revisão UI/UX dos fluxos em **[REVISAO_UI_UX_FLUXOS.md](./REVISAO_UI_UX_FLUXOS.md)**. **Análise completa** (multi-perspectiva com base no framework .agent/): **[ANALISE_COMPLETA.md](./ANALISE_COMPLETA.md)**. **Revisão multi-perspectiva com o framework .agent/** (Antigravity Kit): **[REVISAO_AGENT.md](./REVISAO_AGENT.md)**.

Qualquer duvida sobre a camada de dados, confira `lib/data/marketplace.js` e os comentarios do seed. Boas fotos!
