# Revisão Severa de Segurança — APIs GTClicks

**Data:** 09/02/2025  
**Tipo:** Auditoria exaustiva de todas as rotas de API  
**Objetivo:** Garantir a segurança da plataforma contra IDOR, auth bypass, vazamento de dados e abuse

---

## Executive Summary

| Severidade | Quantidade | Ação |
|------------|------------|------|
| **Crítica** | 3 | Corrigir imediatamente |
| **Alta** | 4 | Corrigir em até 48h |
| **Média** | 5 | Corrigir em sprint |
| **Baixa** | 3 | Observação / backlog |

---

## 1. Vulnerabilidades Críticas

### 1.1 `POST /api/admin/collections/[id]/suspend` — Sem autenticação

**Arquivo:** `app/api/admin/collections/[id]/suspend/route.ts`

**Risco:** Rota **sem `requireAdmin()`**. Qualquer pessoa pode enviar `POST /api/admin/collections/QUALQUER_ID/suspend` e rebaixar qualquer coleção para RASCUNHO (efetivamente tirando do ar).

```ts
// ❌ ATUAL: Nenhuma verificação de auth
export async function POST(...) {
  const { id } = await context.params;
  await prisma.colecao.update({
    where: { id },
    data: { status: "RASCUNHO" },
  });
  return NextResponse.json({ success: true });
}
```

**Correção:** Adicionar `await requireAdmin();` no início do handler.

---

### 1.2 `POST /api/colecoes` — Criação de coleção sem auth + IDOR

**Arquivo:** `app/api/colecoes/route.ts`

**Risco:** Rota **sem autenticação**. Aceita `fotografoId` no body e cria coleção para qualquer fotógrafo. Permite:
- Criar coleções em nome de outros fotógrafos
- Poluir o sistema com dados falsos
- Manipular catálogo de terceiros

```ts
// ❌ ATUAL: Sem auth, fotografoId vem do cliente
export async function POST(request: Request) {
  const body = await request.json();
  const { fotografoId, nome, descricao, capaUrl } = body;
  const colecao = await prisma.colecao.create({
    data: { nome, slug, descricao, capaUrl, fotografoId },
  });
  return NextResponse.json({ data: colecao }, { status: 201 });
}
```

**Correção:**
1. Exigir `getAuthenticatedUser()`.
2. Resolver `fotografoId` via `userId` do usuário autenticado (não aceitar do body).
3. Ou usar apenas `create-draft` (que já tem auth) e deprecar este POST.

---

### 1.3 `GET /api/fotografos/fotos` — IDOR em fotos do fotógrafo

**Arquivo:** `app/api/fotografos/fotos/route.ts`

**Risco:** Rota **sem autenticação**. Aceita `userId` via query e retorna **todas** as fotos do fotógrafo (incluindo PENDENTE, REJEITADA). Permite:
- Enumerar fotos de qualquer fotógrafo
- Ver fotos em rascunho/rejeitadas antes de publicação
- Não filtra por `status: PUBLICADA`

```ts
// ❌ ATUAL: userId vem do query, sem auth, sem filtro status
const userId = searchParams.get("userId");
const fotografo = await prisma.fotografo.findUnique({ where: { userId } });
const fotos = await prisma.foto.findMany({
  where: { fotografoId: fotografo.id },
  // SEM status: "PUBLICADA"
});
```

**Correção:**
1. Se for rota pública (ex.: perfil do fotógrafo): filtrar `status: "PUBLICADA"` e usar apenas `username` (não `userId`) — `by-username/[username]/fotos` já faz isso corretamente.
2. Se for rota de dashboard do fotógrafo: exigir auth e validar `fotografo.userId === user.id`. Nunca aceitar `userId` do cliente para dados sensíveis.

---

## 2. Vulnerabilidades Alta

### 2.1 `GET /api/colecoes/[id]/folders` — IDOR em pastas

**Arquivo:** `app/api/colecoes/[id]/folders/route.ts`

**Risco:** Exige `stackServerApp.getUser()` mas **não verifica ownership da coleção**. Qualquer usuário autenticado pode listar pastas de qualquer coleção (incluindo de outros fotógrafos).

```ts
// ❌ ATUAL: Auth sim, mas sem verificar se coleção pertence ao user
const user = await stackServerApp.getUser();
const { id: colecaoId } = await context.params;
const fotos = await prisma.foto.findMany({
  where: { colecaoId },  // Qualquer colecaoId!
  select: { folder: true },
});
```

**Correção:** Antes de buscar fotos, validar:
```ts
const colecao = await prisma.colecao.findUnique({
  where: { id: colecaoId },
  include: { fotografo: true },
});
if (!colecao || colecao.fotografo.userId !== user.id) {
  return NextResponse.json({ error: "Coleção não encontrada ou sem permissão" }, { status: 403 });
}
```

---

### 2.2 `POST /api/fotos` — IDOR em colecaoId

**Arquivo:** `app/api/fotos/route.ts`

**Risco:** `colecaoId` é passado pelo cliente e **não é validado** como pertencente ao fotógrafo. Um fotógrafo malicioso pode vincular sua foto a uma coleção de outro fotógrafo.

```ts
// ❌ ATUAL: colecaoId vem do body sem validação de ownership
const novaFoto = await prisma.foto.create({
  data: {
    ...
    ...(colecaoId ? { colecao: { connect: { id: colecaoId } } } : {}),
  },
});
```

**Correção:** Se `colecaoId` for informado, validar:
```ts
if (colecaoId) {
  const colecao = await prisma.colecao.findUnique({
    where: { id: colecaoId },
    select: { fotografoId: true },
  });
  if (!colecao || colecao.fotografoId !== fotografo.id) {
    return NextResponse.json({ error: "Coleção inválida ou sem permissão" }, { status: 403 });
  }
}
```

---

### 2.3 `GET /api/colecoes` — Exposição de coleções RASCUNHO

**Arquivo:** `app/api/colecoes/route.ts`

**Risco:** GET retorna coleções **sem filtrar por status**. Coleções em RASCUNHO ficam expostas ao público.

```ts
// ❌ ATUAL: Sem filtro status
const colecoes = await prisma.colecao.findMany({
  where: fotografoId ? { fotografoId } : undefined,
  orderBy: { createdAt: "desc" },
});
```

**Correção:** Para listagem pública, filtrar `status: "PUBLICADA"`:
```ts
where: {
  ...(fotografoId ? { fotografoId } : {}),
  status: "PUBLICADA",
},
```

---

### 2.4 `admin/orders` — Vazamento de stack trace em produção

**Arquivo:** `app/api/admin/orders/route.ts`

**Risco:** Em erro 500, retorna `stack` do erro ao cliente. Stack traces expõem caminhos de arquivos, estrutura do código e dependências.

```ts
// ❌ ATUAL: Stack vazado na resposta
return NextResponse.json(
  { error: "Internal server error", message, stack },
  { status: 500 }
);
```

**Correção:** Never return `stack` in production:
```ts
return NextResponse.json(
  {
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { message, stack }),
  },
  { status: 500 }
);
```

---

## 3. Vulnerabilidades Médias

### 3.1 `POST /api/analytics/track` — Sem rate limit

**Arquivo:** `app/api/analytics/track/route.ts`

**Risco:** Rota pública sem auth. Permite inflar views de fotos/coleções em massa. Já valida `PUBLICADA`, mas não tem rate limit.

**Correção:** Incluir `/api/analytics/track` no proxy para rate limit (30 req/min por IP).

---

### 3.2 `POST /api/fotos/metrics` — Sem rate limit

**Arquivo:** `app/api/fotos/metrics/route.ts`

**Risco:** Similar ao analytics. Valida `PUBLICADA`, mas sem rate limit permite inflar métricas.

**Correção:** Incluir `/api/fotos/metrics` no proxy para rate limit.

---

### 3.3 `POST /api/photos/[id]/like` — Like em foto não publicada

**Arquivo:** `app/api/photos/[id]/like/route.ts`

**Risco:** Não valida se foto está `PUBLICADA`. Usuário pode dar like em fotos em rascunho (se souber o ID).

**Correção:** Antes de criar/deletar like, verificar:
```ts
const foto = await prisma.foto.findFirst({
  where: { id, status: "PUBLICADA" },
});
if (!foto) {
  return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
}
```

---

### 3.4 `requireAdmin` usa redirect em API

**Arquivo:** `lib/admin/permissions.ts`

**Risco:** `requireAdmin()` chama `redirect()` em caso de falha. Para rotas API, o ideal é retornar `NextResponse.json({ error: "Unauthorized" }, { status: 403 })` em vez de redirect. O redirect pode causar comportamento inesperado em chamadas AJAX/fetch.

**Correção:** Criar `requireAdminApi()` que retorna 403 em vez de redirect, ou aceitar um parâmetro `{ redirect: false }` para uso em APIs.

---

### 3.5 `GET /api/users/me` — Auth via header spoofável

**Arquivo:** `app/api/users/me/route.ts`

**Risco:** Usa `x-stack-auth-email` do header. Se esse header puder ser enviado pelo cliente (ex.: via fetch/curl), qualquer um pode se passar por outro usuário.

**Mitigação:** Garantir que o Stack Auth define esse header **apenas no servidor** (middleware/server components), nunca aceitando do cliente. Se o Stack Auth não garante isso, migrar para `getAuthenticatedUser()` que usa sessão/cookies.

---

## 4. Vulnerabilidades Baixas (Observação)

### 4.1 Rotas sem rate limit

Rotas que poderiam se beneficiar de rate limit adicional:
- `/api/analytics/track`
- `/api/fotos/metrics`
- `/api/photos/[id]/like`
- `/api/fotografos/create` (criação de perfil)
- `/api/colecoes/create-draft`

### 4.2 Webhook MP GET

`GET /api/webhooks/mercadopago` retorna `{ status: "ok" }`. Público. Aceitável para health check, mas não deve expor informações sensíveis.

### 4.3 Detalhes de erro em desenvolvimento

Várias rotas retornam `details` ou `message` de erro em ambiente dev. Verificar que em produção apenas mensagem genérica é retornada.

---

## 5. Rotas Auditadas (Resumo)

| Rota | Auth | Ownership | Observação |
|------|------|-----------|------------|
| `admin/*` | Maioria OK | N/A | **suspend** sem requireAdmin |
| `admin/collections/[id]` | requireAdmin | N/A | OK |
| `admin/collections/[id]/approve` | requireAdmin | N/A | OK |
| `admin/collections/[id]/reject` | requireAdmin | N/A | OK |
| `admin/collections/[id]/suspend` | ❌ Nenhum | N/A | **Crítico** |
| `admin/orders` | getAuth + role | N/A | Vazamento stack |
| `analytics/track` | Público | N/A | Sem rate limit |
| `colecoes` GET/POST | GET público, POST ❌ | POST aceita fotografoId do body | **Crítico** |
| `colecoes/[id]/folders` | stackUser | ❌ Não verifica coleção | **Alto** |
| `colecoes/create-draft` | stackUser | OK (fotografo do user) | OK |
| `colecoes/[id]` PUT/DELETE | stackUser | ✅ Verifica ownership | OK |
| `fotos` GET | Público | N/A | OK (só PUBLICADA) |
| `fotos` POST | getAuth | ❌ colecaoId não validado | **Alto** |
| `fotos/batch` | getAuth | ✅ fotografoId validado | OK |
| `fotos/metrics` | Público | valida PUBLICADA | Sem rate limit |
| `fotografos/fotos` | ❌ Nenhum | ❌ userId do query | **Crítico** |
| `fotografos/by-username/[username]/fotos` | Público | N/A | OK (só PUBLICADA) |
| `fotografos/resolve` | getAuth | ✅ user.id do servidor | OK (corrigido) |
| `fotografos/*` (outras) | getAuth | OK | OK |
| `pedidos/*` | getAuth | ✅ userId do pedido | OK |
| `download/[token]` | Opcional | ✅ token + ownership | OK |
| `webhooks/mercadopago` | Assinatura | N/A | OK |
| `images/[key]` | 404 | N/A | OK (desabilitado) |

---

## 6. Plano de Correção (Prioridade)

### Imediato (Crítico)
1. [x] `admin/collections/[id]/suspend` — adicionar `requireAdminApi()`
2. [x] `colecoes` POST — exigir auth + resolver fotografoId do user
3. [x] `fotografos/fotos` GET — auth + ownership (user.id do servidor)

### Urgente (Alto)
4. [x] `colecoes/[id]/folders` — validar ownership da coleção
5. [x] `fotos` POST — validar ownership de colecaoId
6. [x] `colecoes` GET — filtrar `status: PUBLICADA`
7. [x] `admin/orders` — não retornar stack em produção

### Em sprint (Médio)
8. [x] Rate limit para analytics/track e fotos/metrics
9. [x] `photos/[id]/like` — validar foto PUBLICADA
10. [x] `requireAdminApi` — versão para API que retorna 403 em vez de redirect
11. [x] `users/me` — migrado para `getAuthenticatedUser()` (sessão, não header)

---

## 7. Checklist de Testes (Segurança)

Após correções, validar:

- [x] `POST /api/admin/collections/X/suspend` sem auth → 401/403
- [x] `POST /api/colecoes` sem auth com fotografoId arbitrário → 401
- [x] `GET /api/fotografos/fotos` sem auth → 401; com auth retorna apenas fotos do próprio fotógrafo
- [x] `GET /api/colecoes/X/folders` com user A e coleção do user B → 403
- [x] `POST /api/fotos` com colecaoId de outro fotógrafo → 403
- [x] `GET /api/colecoes` → não retorna coleções RASCUNHO
- [x] Erro 500 em admin/orders → resposta sem stack em produção
