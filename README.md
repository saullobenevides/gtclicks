# GTClicks

Marketplace de fotos em Next.js 16 (App Router) com Prisma + PostgreSQL e autenticacao via **Neon Auth (Stack)**. O objetivo e permitir multiplos fotografos, licenciamento flexivel e checkout seguro.

## Stack

- **Next.js 16**: SSR/SSG/ISR para vitrines e paginas dinamicas.
- **Prisma + PostgreSQL (Neon)**: modelagem de usuarios, fotografos, colecoes, fotos, licencas e pedidos.
- **Neon Auth (Stack)**: autenticacao pronta com login social (Google e Facebook), handler automatico e componentes React.
- **CSS Modules + globals.css**: tokens e layouts proprios.
- **Stripe/Mercado Pago (roadmap)**: pagamentos e webhooks para liberar downloads.

## Scripts uteis

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Ambiente local em `http://localhost:3000`. |
| `npm run build` | Compila para producao. |
| `npm run lint` | Executa ESLint. |
| `npm run db:generate` | Gera o Prisma Client. |
| `npm run db:push` | Sincroniza o schema com o banco. |
| `npm run db:migrate` | Cria uma migracao (modo interativo). |
| `npm run db:seed` | Popula com dados demo (usuarios, colecoes, fotos, pedidos). |

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
4. As paginas `/login` e `/cadastro` usam os componentes `<SignIn />` e `<SignUp />` do pacote `@stackframe/stack`, ja com botoes sociais de Google e Facebook.

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

## Próximos Passos

1.  **Refinamento do Checkout** - integrar gateway de pagamento real (Stripe/MercadoPago) e webhooks.
2.  **Sync Neon -> Prisma** - [CONCLUÍDO] Sincronização automática implementada em `lib/auth.js` e `api/auth/sync`.
3.  **Área do Cliente** - painel para visualizar pedidos e downloads (já iniciado em `/meus-downloads`).
4.  **Armazenamento** - integrar S3/Spaces com URLs pre-assinadas reais na rota `/api/upload` e nos itens do pedido.
5.  **Notificações** - [CONCLUÍDO] Sistema de notificação interna implementado no banco de dados.

Qualquer duvida sobre a camada de dados, confira `lib/data/marketplace.js` e os comentarios do seed. Boas fotos!
