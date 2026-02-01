# Plano de Estabilidade – Versão até Segunda

Checklist objetivo para ter uma versão estável do GTClicks até segunda-feira.

---

## ✅ Já resolvido (esta semana)

- [x] Erro 500 em `/api/fotografos/create` (username duplicado)
- [x] Validação de username ocupado (retorna 409 com mensagem clara)
- [x] Exibição de detalhes do erro no frontend (FotografoOnboarding)
- [x] Configuração do Prisma (lib/prisma.js)
- [x] Payment Brick (removido mercadoPago sem preferenceId)
- [x] `.gitattributes` para line endings

---

## 🔴 Crítico (fazer antes de segunda)

### 1. Build sem erros

```bash
npm run build
```

Se falhar, corrigir até passar.

### 2. Variáveis de ambiente no Vercel

Em **Vercel → gtclicks → Settings → Environment Variables**, confirmar:

| Variável                                                                                         | Necessário para |
| ------------------------------------------------------------------------------------------------ | --------------- |
| `DATABASE_URL`                                                                                   | Tudo (Prisma)   |
| `NEXT_PUBLIC_STACK_PROJECT_ID`                                                                   | Auth            |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`                                                       | Auth            |
| `STACK_SECRET_SERVER_KEY`                                                                        | Auth            |
| `MERCADOPAGO_ACCESS_TOKEN`                                                                       | Pagamentos      |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`                                                             | Checkout        |
| `S3_UPLOAD_BUCKET`, `S3_UPLOAD_REGION`, `S3_UPLOAD_ACCESS_KEY_ID`, `S3_UPLOAD_SECRET_ACCESS_KEY` | Upload de fotos |

### 3. Smoke test manual

Testar em **produção** (gtclicks.vercel.app):

| Fluxo                   | Passo                                                | Esperado                      |
| ----------------------- | ---------------------------------------------------- | ----------------------------- |
| **Home**                | Acessar `/`                                          | Página carrega sem erro       |
| **Busca**               | Acessar `/busca`                                     | Lista de coleções aparece     |
| **Login**               | Clicar Entrar, fazer login                           | Redireciona e mantém sessão   |
| **Cadastro fotógrafo**  | `/cadastro` → Como Funciona → Registrar → Onboarding | Concluir com username único   |
| **Carrinho**            | Adicionar foto ao carrinho                           | Item aparece                  |
| **Checkout**            | Ir ao checkout (logado)                              | Brick de pagamento carrega    |
| **Dashboard fotógrafo** | Após onboarding                                      | Acessa `/dashboard/fotografo` |

---

## 🟡 Importante (se der tempo)

### 4. Testes automatizados

```bash
npm test
```

Corrigir testes quebrados.

### 5. Lint

```bash
npm run lint .
```

Resolver erros críticos.

### 6. Migrações do banco

Confirmar que produção está com schema atualizado:

```bash
npx prisma migrate deploy
```

(Rodar no deploy ou manualmente se necessário.)

---

## 🟢 Desejável (pós segunda)

- Unificar redirect de checkout (`callbackUrl` vs `redirect`)
- Ajustes de UX do REVISAO_UI_UX_FLUXOS.md
- "Criar Conta" no header mobile → `/registrar`

---

## Comandos rápidos

```bash
# Verificar build
npm run build

# Testes
npm test

# Deploy (via git push para branch conectada ao Vercel)
git add . && git commit -m "fix: estabilização para segunda" && git push
```

---

## Checklist final antes de declarar estável

- [ ] `npm run build` passa
- [ ] Variáveis de ambiente conferidas no Vercel
- [ ] Smoke test manual em produção executado
- [ ] Cadastro de fotógrafo funciona (com username único)
- [ ] Checkout abre sem erro
- [ ] Nenhum 500 em fluxos principais
