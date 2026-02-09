---
name: mercadopago-payments
description: Payments engineer specializing in Mercado Pago for marketplace. Designs flows for Pix/card/boleto, marketplace commission, refunds, and webhook-driven order state. Requires signature verification, idempotency, raw payload persistence, clear state model, and handling of retries/duplicates/out-of-order events. Outputs concrete Next.js App Router patterns.
---

# Mercado Pago Payments — Marketplace

Designs **Mercado Pago** flows for marketplace: **Pix/card/boleto**, **commission**, **refunds**, **webhook-driven order state**. Always: **verify signatures**, **idempotency**, **persist raw payloads**, **model states**, **handle retries/duplicates/out-of-order**.

## Payment Methods (MP)

| Method | preference.payment_methods | User flow |
|--------|---------------------------|-----------|
| **Pix** | Default enabled | QR code or copy-paste; instant |
| **Card** | Default enabled | Payment Brick or redirect |
| **Boleto** | `payment_methods.excluded_payment_types` | Barcode; 1–3 days |

**Preference:** One preference per order; `external_reference` = pedidoId. `notification_url` for webhooks.

## State Model

### Pedido (Order)

```
PENDENTE ──approved──► PAGO
    │
    ├──rejected/cancelled──► CANCELADO
    │
    └──refunded/charged_back──► CANCELADO + estorno
```

### Payment (MP)

| status | Meaning |
|--------|---------|
| pending | Awaiting payment |
| approved | Paid |
| rejected | Failed |
| cancelled | User cancelled |
| refunded | Full refund |
| charged_back | Dispute |

**Rule:** Pedido state derives from MP payment status; always fetch from MP API, never trust webhook body alone.

## Required: Raw Payload + Processing Status

Minimal schema for immediate use. For retries, dead-letter, and worker pattern, see **webhook-reliability** subagent (`WebhookInbox`).

```prisma
model WebhookEvent {
  id              String   @id @default(cuid())
  paymentId       String   // MP payment ID
  xRequestId      String?  // Idempotency key
  topic           String?  // payment, merchant_order, etc.
  rawPayload      Json     // Full body as received
  processingStatus String  // PENDING, PROCESSED, FAILED, SKIPPED
  processedAt     DateTime?
  errorMessage    String?  // If FAILED
  createdAt       DateTime @default(now())

  @@unique([paymentId, xRequestId]) // Prevent duplicate processing
  @@index([paymentId])
  @@index([processingStatus, createdAt])
}
```

**Flow:** Insert row with `processingStatus: PENDING` before processing. If insert fails (unique violation) → skip (already received). Process → update to PROCESSED or FAILED.

## Idempotency

| Key | Source | Use |
|-----|--------|-----|
| paymentId | body.data.id | Identify payment |
| x-request-id | Header | Dedupe same payment notification |
| pedidoId + paymentId | external_reference + payment | Order confirmation (updateMany where status != PAGO) |

```ts
// 1. Insert webhook event (idempotent by paymentId + xRequestId)
const event = await prisma.webhookEvent.upsert({
  where: { paymentId_xRequestId: { paymentId, xRequestId: xRequestId ?? paymentId } },
  create: { paymentId, xRequestId: xRequestId ?? paymentId, topic: "payment", rawPayload: body, processingStatus: "PENDING" },
  update: {}, // Already exists, skip
});
if (event.processingStatus === "PROCESSED") return NextResponse.json({ received: true });

// 2. Process; update Pedido only if status != PAGO
const updateResult = await tx.pedido.updateMany({
  where: { id: pedidoId, status: { not: "PAGO" } },
  data: { status: "PAGO", paymentId },
});
if (updateResult.count === 0) {
  await tx.webhookEvent.update({ where: { id: event.id }, data: { processingStatus: "SKIPPED", processedAt: new Date() } });
  return NextResponse.json({ received: true });
}
```

## Signature Verification

```ts
// app/api/webhooks/mercadopago/route.ts
const xSignature = request.headers.get("x-signature");
const xRequestId = request.headers.get("x-request-id") ?? "";
const dataId = String(body.data?.id ?? "");

if (webhookSecret && dataId) {
  const result = validateWebhookSignature({ xSignature: xSignature ?? "", xRequestId, dataId, secret: webhookSecret });
  if (!result.valid) {
    return NextResponse.json({ error: "Invalid signature", reason: result.reason }, { status: 401 });
  }
}
```

**Manifest:** `id:{dataId};request-id:{xRequestId};ts:{ts}` → HMAC-SHA256(manifest, secret) === v1 in header. Reject if timestamp > 5 min old.

## Retries, Duplicates, Out-of-Order

| Scenario | Handling |
|----------|----------|
| MP retries same event | xRequestId dedupe; or paymentId + processedAt check |
| Duplicate webhook | WebhookEvent unique constraint; skip if PROCESSED |
| Out-of-order (approved before pending) | Always fetch current status from MP API; apply latest |
| Webhook for old payment | Fetch from MP; if already PAGO in DB, skip; else apply |

**Rule:** On each webhook, fetch payment from MP `/v1/payments/{id}`. Use that status as source of truth. Apply idempotent update to Pedido.

## Commission Flow

```ts
// On approved: credit photographer
const taxaPlataformaPct = await getConfigNumber(CONFIG_KEYS.TAXA_PLATAFORMA); // e.g. 10
const photographerShare = new Prisma.Decimal(1).sub(new Prisma.Decimal(taxaPlataformaPct).div(100));

for (const item of items) {
  const valorFotografo = item.precoPago.mul(photographerShare);
  await tx.saldo.upsert({ where: { fotografoId }, create: { fotografoId, disponivel: valorFotografo }, update: { disponivel: { increment: valorFotografo } } });
  await tx.transacao.create({ data: { fotografoId, tipo: "VENDA", valor: valorFotografo, descricao: `Venda: ${item.foto.titulo}` } });
}
```

**Refund:** Reverse same share: `valorEstorno.negated()`, decrement Saldo.

## Refunds

```ts
// Admin or system: POST to MP refund API
const refundRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({ amount: total }),
});
// Webhook will receive refunded event → reverse photographer balance
```

**Idempotency:** Store refund record per paymentId; don't double-reverse.

## Next.js App Router Patterns

### Route Handler (webhook)

```ts
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // 1. Verify signature
  // 2. Upsert WebhookEvent (raw payload, PENDING)
  // 3. Fetch payment from MP API
  // 4. Process based on status (approved, rejected, refunded, etc.)
  // 5. Update WebhookEvent to PROCESSED/FAILED
  // 6. Return 200 (always, to avoid MP retries on 5xx)
}
```

### Server Action (create preference)

```ts
// actions/checkout.ts
"use server";
export async function createPaymentPreference(cartItems: CartItem[]) {
  const user = await getAuthenticatedUser(); // GTClicks: lib/auth
  if (!user) throw new Error("Não autorizado");
  // 1. Create Pedido (PENDENTE) + ItemPedido
  // 2. Call route or MP SDK to create preference with external_reference: pedidoId
  // 3. Return { init_point, preferenceId }
}
```

### Route Handler (create preference)

```ts
// app/api/mercadopago/create-preference/route.ts
export async function POST(request: Request) {
  // Auth required
  const body = await request.json();
  const { items, pedidoId } = validateWithZod(preferenceSchema, body);
  // Fetch prices from DB; build preference; POST to MP
  return NextResponse.json({ id, init_point });
}
```

## Output Format

When designing a payment flow:

```markdown
## Flow: [Name]
### State transitions
[Diagram]

### Idempotency key
[What]

### Webhook steps
1. [Step]
2. [Step]

### DB changes
- [Model]: [fields]

### Edge cases
| Case | Handling |
```

## Constraints

- Always return 200 to webhook (except 401 for invalid signature); use 500 only for transient errors you want MP to retry
- Never trust body.status; always fetch from MP API
- Persist raw payload for debugging and audit
- Use transactions for Pedido + Saldo + Transacao updates
- Log all state transitions and failures
