# Revisão de Segurança — GTClicks (Atualizada)

**Data:** 09/02/2025  
**Metodologia:** Lead Orchestrator + security-reviewer + marketplace-security + content-protection + admin-tools  
**Escopo:** Fotógrafos, clientes e admin

---

## A) Plano da Análise

1. **Delegar** aos agentes: security-reviewer (auth, validação, vazamentos), marketplace-security (download, webhook, acesso), content-protection (s3Key, signed URLs), admin-tools (rotas admin, audit).
2. **Consolidar** achados em uma única análise por severidade.
3. **Verificar** estados, auth, race conditions, índices.
4. **Entregar** PR checklist e testing checklist.

---

## Executive Summary

| Severidade | Quantidade | Status |
|------------|------------|--------|
| **Crítica** | 2 | ✅ Corrigidas |
| **Alta** | 0 | — |
| **Média** | 2 | ✅ Corrigidas |
| **Baixa** | 2 | Observação |

**Correções anteriores aplicadas:** Todas as vulnerabilidades da revisão v1 foram corrigidas (images, meus-downloads, webhook, fotos, analytics, download, coleções, create-preference, proxy rate limit, mapColecaoToEditor, logs).

**Correções v2 aplicadas:** admin/collections DELETE (requireAdmin), fotografos/resolve (auth + ownership), fotos/metrics (validação PUBLICADA), log (rate limit + sanitização).

---

## 1. Vulnerabilidades Críticas (Novas)

### 1.1 `DELETE /api/admin/collections/[id]` — Sem autenticação

**Localização:** `app/api/admin/collections/[id]/route.ts`  
**Personas afetadas:** Admin, sistema

**Risco:** Rota **sem verificação de auth**. Qualquer pessoa pode enviar `DELETE /api/admin/collections/QUALQUER_ID` e excluir qualquer coleção do sistema.

```ts
// ❌ ATUAL: Nenhuma verificação
export async function DELETE(...) {
  const { id } = await context.params;
  await prisma.colecao.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

**Correção:**
```ts
import { requireAdmin } from "@/lib/admin/permissions";

export async function DELETE(...) {
  await requireAdmin();
  // ... resto da lógica
}
```

---

### 1.2 `/api/fotografos/resolve` — IDOR em dados financeiros

**Localização:** `app/api/fotografos/resolve/route.ts`  
**Personas afetadas:** Fotógrafos

**Risco:** Rota **sem autenticação**. Aceita `userId`, `username` ou `email` via query e retorna dados completos do fotógrafo: **email, saldo, receita, vendas, pedidos, coleções**. Qualquer um pode enumerar fotógrafos e obter dados financeiros e PII.

**Uso atual:** Dashboard do fotógrafo chama `?userId=${user.id}`. O servidor não valida que o userId pertence à sessão.

**Correção:**
1. Exigir `getAuthenticatedUser()`.
2. Usar apenas `user.id` do servidor; ignorar params do cliente.
3. Validar que o fotógrafo pertence ao usuário: `fotografo.userId === user.id`. Se o usuário não for fotógrafo, retornar null ou 403.

---

## 2. Vulnerabilidades Médias (Novas)

### 2.1 `/api/fotos/metrics` — Inflação de métricas sem auth

**Localização:** `app/api/fotos/metrics/route.ts`  
**Personas afetadas:** Fotógrafos, marketplace

**Risco:** Rota **sem autenticação**. Aceita `id` e `action` (view, like) via query e incrementa views/likes para qualquer foto. Permite inflar métricas e distorcer rankings.

**Correção:** Alinhar com `/api/analytics/track`: validar que a foto existe e está `PUBLICADA` antes de incrementar; considerar rate limit ou descontinuar em favor de analytics/track.

---

### 2.2 `/api/log` — Log injection e spam

**Localização:** `app/api/log/route.ts`  
**Personas afetadas:** Sistema

**Risco:** Rota **sem autenticação**. Aceita POST com `message`, `stack`, `url` e grava no log do servidor. Permite:
- Log injection (payloads maliciosos nos logs)
- Spam de logs
- Possível vazamento se logs forem expostos

**Correção:**
1. Rate limit na rota (incluir `/api/log` no proxy).
2. Sanitizar/truncar `message` e `stack` (limitar tamanho, remover caracteres de controle).
3. (Opcional) Validar que a requisição vem do app (origem, token interno).

---

## 3. Vulnerabilidades Baixas (Observação)

### 3.1 `/api/licencas` — Público sem auth

**Localização:** `app/api/licencas/route.ts`  
**Personas afetadas:** Clientes, checkout

**Risco:** Rota pública retorna lista de licenças. **Aceitável** — licenças são dados de catálogo, não sensíveis. Manter como está.

---

### 3.2 `/api/users/me` — Auth via header

**Localização:** `app/api/users/me/route.ts`  
**Personas afetadas:** Clientes, fotógrafos

**Risco:** Usa `x-stack-auth-email` do header. Garantir que o Stack Auth define esse header **no servidor** (não enviado pelo cliente). Se for confiável, OK.

---

## 4. Status das Correções Anteriores (v1)

| Item | Status |
|------|--------|
| `/api/images/[key]` IDOR | ✅ Desabilitada (404) |
| `/api/meus-downloads` IDOR | ✅ Auth + userId do servidor |
| Webhook MP sem secret | ✅ 503 se não configurado |
| POST `/api/fotos` vazamento s3Key | ✅ Select sem s3Key |
| GET `/api/fotos` sem filtro status | ✅ `status: PUBLICADA` |
| `/api/fotografos/.../fotos` sem filtro | ✅ `status: PUBLICADA` |
| `/api/analytics/track` inflação | ✅ Valida entidade PUBLICADA |
| Download rate limit | ✅ proxy.ts + lib/rate-limit |
| Download limite por compra | ✅ MAX_DOWNLOADS_PER_PURCHASE = 10 |
| Download verificação sessão | ✅ Opcional quando logado |
| Download vazamento erros | ✅ Mensagem genérica |
| Coleções PUT/DELETE erros | ✅ details só em dev |
| create-preference sem auth | ✅ Auth + ownership do pedido |
| Rate limit global | ✅ proxy.ts (download, upload, checkout, auth) |
| mapColecaoToEditor s3Key | ✅ Removido do output |
| Logs PII no webhook | ✅ Email não logado |

---

## 5. Arquitetura de Segurança (Resumo)

### Autenticação
- **Stack Auth** como fonte de identidade
- **getAuthenticatedUser()** (lib/auth) para rotas que precisam de User no DB
- **stackServerApp.getUser()** para rotas que usam identidade Stack
- **requireAdmin()** (lib/admin/permissions) para rotas admin

### Autorização
- **FOTOGRAFO:** Ownership via `fotografo.userId === user.id`
- **ADMIN:** `user.role === "ADMIN"` + `isActive` + `!suspendedAt`
- **CLIENTE:** Ownership via `pedido.userId === user.id` ou `itemPedido.pedido.userId`

### Proteção de Conteúdo
- **s3Key:** Nunca exposto ao cliente
- **Download:** Token não-previsível (cuid), status PAGO, rate limit, limite por compra
- **Preview:** Via `previewUrl` (URL S3 pública para thumbnails)

### Rate Limiting (proxy.ts)
- `/api/download/*`, `/api/upload`, `/api/checkout`, `/api/mercadopago`, `/api/auth/*`, `/api/log`
- 30 req/min por IP (Upstash Redis)

---

## 6. Verifier Pass

- [ ] **Estados:** Pedido (PENDENTE → PAGO → CANCELADO); Foto (PENDENTE → PUBLICADA); Coleção (RASCUNHO → PUBLICADA)
- [x] **Auth:** Maioria das rotas protegidas; **exceções corrigidas:** admin/collections/[id] DELETE, fotografos/resolve, fotos/metrics, log
- [ ] **Race conditions:** Webhook MP usa transação; create-preference valida pedido
- [x] **Índices:** Prisma schema com índices em fotografoId, status, userId, etc.
- [ ] **Testes:** Cobrir novas correções (resolve, admin delete, fotos/metrics, log)

---

## 7. PR Checklist (Segurança)

- [x] Corrigir `DELETE /api/admin/collections/[id]` — adicionar `requireAdmin()`
- [x] Corrigir `/api/fotografos/resolve` — auth + validar ownership
- [x] Corrigir `/api/fotos/metrics` — validar foto PUBLICADA ou descontinuar
- [x] Hardening `/api/log` — rate limit + sanitização
- [ ] Atualizar `.env.example`: `MERCADOPAGO_WEBHOOK_SECRET` obrigatório em produção
- [ ] Rodar testes após correções

---

## 8. Testing Checklist (Segurança)

- [ ] `DELETE /api/admin/collections/[id]` sem auth → deve retornar 401/403
- [ ] `GET /api/fotografos/resolve?userId=OUTRO` sem auth → deve retornar 401
- [ ] `GET /api/fotografos/resolve?userId=MEU_ID` com auth → deve retornar apenas se eu for o dono
- [ ] `POST /api/fotos/metrics?id=X&action=view` → validar comportamento (só fotos PUBLICADAS)
- [ ] `POST /api/log` com payload grande → deve ter rate limit
- [ ] `GET /api/meus-downloads` sem auth → 401
- [ ] `GET /api/images/qualquer-key` → 404
- [ ] Webhook MP sem secret → 503
- [ ] Download com token válido → funciona; token inválido → 404

---

## 9. Próximos Passos (Prioridade)

1. ~~Corrigir `DELETE /api/admin/collections/[id]` (requireAdmin)~~ ✅
2. ~~Corrigir `/api/fotografos/resolve` (auth + ownership)~~ ✅
3. ~~Corrigir `/api/fotos/metrics` e `/api/log`~~ ✅
4. **Manutenção:** Revisar periodicamente novas rotas API para auth e ownership
