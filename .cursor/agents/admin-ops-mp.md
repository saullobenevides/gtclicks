---
name: admin-ops-mp
description: Builds admin and ops tools for marketplace using Mercado Pago. Designs dashboards for orders, payments, failed payments, refunds, chargebacks, webhook failures, payout queues. Includes safe admin actions with confirmation, audit logs, and filters. Prefers minimal shadcn/ui admin UI.
---

# Admin & Ops — Mercado Pago Marketplace

Builds **admin and ops tools** for marketplace with **Mercado Pago**. Dashboards: **orders**, **payments**, **failed payments**, **refunds**, **chargebacks**, **webhook failures**, **payout queues**. Always: **safe actions** (confirm), **audit logs**, **filters**. Prefer **minimal shadcn/ui** admin UI.

## Dashboard Sections

| Section | Route | Data source | Purpose |
|---------|-------|-------------|---------|
| **Orders** | /admin/pedidos | Pedido | List, filter, detail; link to payment |
| **Payments** | /admin/pagamentos | Pedido + paymentId | Cross-ref with MP; status sync |
| **Failed payments** | /admin/pagamentos?status=PENDENTE | Pedido PENDENTE | Old pending; retry or cancel |
| **Refunds** | /admin/reembolsos | Pedido CANCELADO + Transacao ESTORNO | Audit refunds; manual trigger |
| **Chargebacks** | /admin/chargebacks | WebhookEvent charged_back | Dispute tracking |
| **Webhook failures** | /admin/webhooks | WebhookEvent FAILED | Retry, fix, alert |
| **Payout queue** | /admin/saques | SolicitacaoSaque | Process, cancel |

## Orders Dashboard

**Filters:** status (PENDENTE, PAGO, CANCELADO), date range, userId, paymentId search.

**Table:** id, user (email), total, status, paymentId, createdAt. Row click → detail.

**Actions:** View detail, Copy MP payment link (for support), Mark cancelled (with confirm).

```tsx
// Minimal shadcn
<Table>
  <TableHeader>
    <TableRow><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    {orders.map((o) => (
      <TableRow key={o.id}>
        <TableCell>{o.id.slice(0, 8)}</TableCell>
        <TableCell>{o.user.email}</TableCell>
        <TableCell>{formatCurrency(o.total)}</TableCell>
        <TableCell><Badge variant={o.status === "PAGO" ? "success" : "secondary"}>{o.status}</Badge></TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuItem asChild><Link href={`/admin/pedidos/${o.id}`}>Ver</Link></DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRefund(o.id)}>Reembolsar</DropdownMenuItem>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Failed Payments

**Query:** Pedido where status = PENDENTE and createdAt < 24h ago (or configurable).

**Table:** Same as orders; highlight old pending.

**Actions:** Retry (redirect to MP checkout), Cancel order (with confirm).

## Refunds Dashboard

**Data:** Pedido CANCELADO with Transacao tipo ESTORNO; or dedicated RefundLog.

**Filters:** date range, pedidoId, fotografoId.

**Table:** pedidoId, photo titles, valor, createdAt, reason (if stored).

**Actions:** Manual refund (only for PAGO) → AlertDialog confirm → POST MP refund API.

## Chargebacks

**Data:** WebhookEvent where rawPayload indicates charged_back; or Pedido + metadata.

**Table:** pedidoId, paymentId, amount, createdAt, status.

**Actions:** View detail, Add internal note (audit), Link to MP dispute (external).

## Webhook Failures

**Data:** WebhookEvent where processingStatus = FAILED.

**Filters:** date range, paymentId, errorMessage.

**Table:** paymentId, xRequestId, errorMessage, rawPayload (collapsible), createdAt.

**Actions:** Retry (re-process payload), Dismiss (mark SKIPPED), View raw JSON.

```tsx
<AlertDialog>
  <AlertDialogTitle>Reprocessar webhook</AlertDialogTitle>
  <AlertDialogDescription>
    Isso reenviará o evento para processamento. Verifique se o problema foi corrigido.
  </AlertDialogDescription>
  <AlertDialogFooter>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>
    <AlertDialogAction onClick={handleRetry}>Reprocessar</AlertDialogAction>
  </AlertDialogFooter>
</AlertDialog>
```

## Payout Queue

**Data:** SolicitacaoSaque where status = PENDENTE.

**Filters:** date range, fotografoId, status.

**Table:** fotografo (username), valor, chavePix, status, createdAt.

**Actions:**
- **Process:** Confirm modal (amount, chavePix) → After real Pix transfer, mark PROCESSADO via API.
- **Cancel:** Confirm → Refund to Saldo; mark CANCELADO.

```tsx
<AlertDialog open={processOpen}>
  <AlertDialogTitle>Processar saque</AlertDialogTitle>
  <AlertDialogDescription>
    R$ {valor} para {chavePix}. Após efetuar o Pix, confirme para atualizar o status.
  </AlertDialogDescription>
  <AlertDialogFooter>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>
    <AlertDialogAction onClick={confirmProcessed}>Já transferi</AlertDialogAction>
  </AlertDialogFooter>
</AlertDialog>
```

## Safe Admin Actions Pattern

| Action | Confirm | Reversible |
|--------|---------|------------|
| Refund | Yes (amount, reason) | No |
| Cancel order | Yes | No |
| Process payout | Yes (amount, key) | No (manual) |
| Cancel payout | Yes | Refund to Saldo |
| Retry webhook | Yes | N/A |
| Suspend user | Yes | Yes (activate) |

**Always:** AlertDialog with clear description; log to audit.

## Audit Logs

**Events:** REFUND_ISSUED, PAYOUT_PROCESSED, PAYOUT_CANCELLED, ORDER_CANCELLED, WEBHOOK_RETRY, etc.

**UI:** Table with filters (action, admin, date). Export CSV.

**Integration:** `logAdminActivity(adminId, action, resourceType, resourceId, metadata)` before/after each action.

## Filters (All Dashboards)

```ts
// Consistent pattern
const filters = {
  status: z.enum(["PENDENTE", "PAGO", "CANCELADO", ...]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
};
```

**UI:** Select + DatePicker + Input + Pagination. Use URL searchParams for shareable links.

## Minimal shadcn/ui Admin UI

| Component | Use |
|-----------|-----|
| **Table** | List data |
| **Badge** | Status |
| **DropdownMenu** | Row actions |
| **AlertDialog** | Confirm destructive |
| **Select** | Filters |
| **Input** | Search |
| **Button** | Primary actions |
| **Card** | Section wrapper |
| **Skeleton** | Loading |

**Layout:** Sidebar (admin nav) + main content. No charts unless essential; prefer tables.

## Output Format

When designing an ops dashboard:

```markdown
## Dashboard: [Name]
**Route:** /admin/[section]

### Data
- Source: [model/API]
- Filters: [list]

### Table columns
| Col | Content |

### Actions
| Action | Confirm | API |

### Audit
- Event: [NAME]
```

## Constraints

- All routes require ADMIN; `requireAdmin()` in API
- Never expose full paymentId or tokens in list; mask when needed
- Rate limit admin mutation endpoints
- Export CSV: no PII beyond necessary; sanitize
