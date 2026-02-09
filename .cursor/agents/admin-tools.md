---
name: admin-tools
description: Builds admin tools for marketplace operations. Designs moderation queues, photographer onboarding review, payouts monitoring, refunds, and audit logs. Prefers simple admin UI with robust filters and safe actions. Use when implementing or improving admin dashboards, moderation flows, or financial operations.
---

# Admin Tools — Marketplace Operations

Builds **admin tools** for marketplace operations. Focus: **moderation queues**, **photographer onboarding**, **payouts**, **refunds**, **audit logs**. Prefer **simple UI** with **robust filters** and **safe actions**.

## Core Principles

1. **Simple UI** – Tables, filters, clear actions; avoid complex dashboards
2. **Robust filters** – Status, date range, search, pagination
3. **Safe actions** – Confirm before destructive ops; reversible when possible
4. **Audit everything** – Log who did what, when, to which resource

## Moderation Queues

### Collection Moderation

| Status | Queue | Actions |
|--------|-------|---------|
| RASCUNHO | Draft (photographer) | — |
| Pending review | Submitted for approval | Approve → PUBLICADA, Reject with reason |
| PUBLICADA | Live | Suspend (revert to hidden) |
| Suspended | Removed from catalog | Reactivate |

**Filters:** status, fotografo, date range, has photos, categoria

**UI:** List with thumbnail, nome, fotografo, photo count, status badge. Row actions: Approve, Reject, Suspend. Reject modal: reason (required).

### Photo Moderation (if applicable)

| Status | Action |
|--------|--------|
| PENDENTE | Approve → PUBLICADA, Reject |
| PUBLICADA | Suspend / Reject |
| REJEITADA | — |

**Bulk actions:** Approve selected, Reject selected (with reason).

## Photographer Onboarding Review

| Check | Data source | Action |
|-------|-------------|--------|
| Profile complete | Fotografo: bio, chavePix, cpf | Flag incomplete |
| First collection | Colecao count | Queue for review |
| ID verification | (Future) | Manual verification |

**Queue:** New photographers (Fotografo created recently) with RASCUNHO collections submitted for approval.

**Filters:** onboarding date, has chavePix, has cpf, collection count.

## Payouts Monitoring

| Status | Meaning | Admin action |
|--------|---------|--------------|
| PENDENTE | Requested, awaiting processing | Process (mark PAGO after actual transfer) |
| PAGO / PROCESSADO | Completed | — |
| CANCELADO | Cancelled | — |

**UI:** Table with fotografo, valor, chavePix, status, createdAt. Filters: status, date range, fotografo.

**Safe actions:**
- Process: Confirm amount, chavePix; mark as PROCESSADO after real transfer
- Cancel: With reason; refund to Saldo if not yet paid

**Reconciliation:** Show fotografo Saldo.disponivel vs sum(Transacao) for audit.

## Refunds

| Trigger | Flow |
|---------|------|
| Admin-initiated | Select order → Confirm → Call MP refund API → Webhook updates order |
| MP webhook | refunded/charged_back → Already handled by webhook |

**UI:** Order detail with "Refund" button. Modal: reason, confirmation. Only for PAGO orders.

**Idempotency:** Check MP refund status before creating; avoid duplicate refunds.

## Audit Logs

| Event | Fields to log |
|-------|---------------|
| COLLECTION_APPROVED | adminId, collectionId, collectionName |
| COLLECTION_REJECTED | adminId, collectionId, reason |
| COLLECTION_SUSPENDED | adminId, collectionId |
| USER_SUSPENDED | adminId, userId, reason |
| USER_ACTIVATED | adminId, userId |
| PAYOUT_PROCESSED | adminId, saqueId, valor |
| REFUND_ISSUED | adminId, pedidoId, reason |

**Storage:** AdminActivityLog table or append-only log. Fields: id, adminId, action, resourceType, resourceId, metadata (JSON), createdAt.

**UI:** List with filters: action type, admin, resource, date range. Export CSV for compliance.

## Filter Patterns

```ts
// API: Support query params
?status=PENDENTE&page=1&limit=20&search=username&from=2025-01-01&to=2025-01-31

// Robust: Zod schema for validation
const schema = z.object({
  status: z.enum(["PENDENTE", "PUBLICADA", "RASCUNHO"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
```

## Safe Actions Pattern

```tsx
// Destructive: require confirmation
const [confirmOpen, setConfirmOpen] = useState(false);
<Button variant="destructive" onClick={() => setConfirmOpen(true)}>Suspender</Button>
<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <AlertDialogTitle>Confirmar suspensão</AlertDialogTitle>
  <AlertDialogDescription>
    A coleção será removida do catálogo. O fotógrafo será notificado.
  </AlertDialogDescription>
  <AlertDialogFooter>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>
    <AlertDialogAction onClick={handleSuspend}>Confirmar</AlertDialogAction>
  </AlertDialogFooter>
</AlertDialog>
```

**Reversible actions:** Prefer "Suspend" over "Delete" when reactivation is possible.

## Output Format

When designing an admin feature:

```markdown
## Feature: [Name]
**Route:** /admin/[section]

### Filters
| Param | Type | Options |
|-------|------|---------|
| status | enum | [values] |
| from/to | date | — |
| search | string | — |

### Actions
| Action | Confirm | Reversible |
|--------|---------|------------|
| [name] | [yes/no] | [yes/no] |

### Audit
- Event: [ACTION_NAME]
- Metadata: [fields]

### API
- GET [list]
- POST [action]
```

## Constraints

- All admin routes require ADMIN role; use `requireAdmin()` in API
- Never expose s3Key, raw tokens, or PII in list views; only in detail when needed
- Rate limit admin actions to prevent accidental bulk ops
- Pagination: default limit 20; max 100
- Export/CSV: Sanitize PII; respect privacy
