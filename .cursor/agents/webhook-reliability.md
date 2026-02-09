---
name: webhook-reliability
description: Specializes in webhook reliability for payment providers. Designs robust processing pipeline with webhook inbox table, idempotency keys, retry strategy, dead-letter handling, observability and alerting. Outputs implementation steps for Next.js route handlers + worker approach.
---

# Webhook Reliability — Payment Providers

Designs **robust webhook processing** for payment providers. Covers: **inbox table**, **idempotency**, **retries**, **dead-letter**, **observability**, **alerting**. Outputs **Next.js route handlers** + **worker** implementation steps.

## Webhook Inbox Table

Extends the simpler `WebhookEvent` pattern (see mercadopago-payments) with status flow, retries, and dead-letter. For production reliability, use this model.

```prisma
model WebhookInbox {
  id               String    @id @default(cuid())
  provider         String    // "mercadopago"
  idempotencyKey   String    // paymentId + xRequestId (or hash)
  topic            String?   // payment, merchant_order
  resourceId       String?   // payment ID, etc.
  rawPayload       Json      // Full body as received
  status           String    // RECEIVED, PROCESSING, PROCESSED, FAILED, DEAD_LETTER
  attempts         Int       @default(0)
  maxAttempts      Int       @default(5)
  lastError        String?   // Last error message
  lastAttemptAt    DateTime?
  processedAt      DateTime?
  createdAt        DateTime  @default(now())
  metadata         Json?     // { pedidoId, paymentStatus, etc. }

  @@unique([provider, idempotencyKey])
  @@index([provider, status])
  @@index([status, lastAttemptAt])
  @@index([resourceId])
}
```

**Flow:** Route handler inserts with status RECEIVED; returns 200 immediately. Worker (or async job) drains RECEIVED → PROCESSING → PROCESSED/FAILED.

## Idempotency Keys

| Source | Key format | Use |
|--------|------------|-----|
| MP payment | `{paymentId}:{xRequestId ?? paymentId}` | Dedupe same notification |
| Generic | `{provider}:{topic}:{resourceId}:{hash(body)}` | Fallback |

**Insert:** `upsert` with `create`; if exists, return 200 without processing.

```ts
const idempotencyKey = `${paymentId}:${xRequestId ?? paymentId}`;
const created = await prisma.webhookInbox.upsert({
  where: { provider_idempotencyKey: { provider: "mercadopago", idempotencyKey } },
  create: {
    provider: "mercadopago",
    idempotencyKey,
    topic: "payment",
    resourceId: paymentId,
    rawPayload: body,
    status: "RECEIVED",
  },
  update: {}, // Already exists
});
if (created.status === "PROCESSED") return NextResponse.json({ received: true });
```

## Retry Strategy

| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | 0 | Immediate (or first worker run) |
| 2 | 1 min | Exponential backoff |
| 3 | 5 min | |
| 4 | 15 min | |
| 5 | 1 h | Last attempt before DEAD_LETTER |

**Retryable errors:** 5xx from MP API, timeout, DB deadlock, transient network.

**Non-retryable:** 404 (order not found), 401 (invalid signature), validation errors.

```ts
const delays = [0, 60, 300, 900, 3600]; // seconds
const nextAttemptAt = new Date(Date.now() + delays[Math.min(attempts, 4)] * 1000);
```

## Dead-Letter Handling

When `attempts >= maxAttempts`:
1. Set status = DEAD_LETTER
2. Store lastError
3. Alert ops (email, Slack, PagerDuty)
4. Expose in admin UI for manual retry or discard

**Manual retry:** Admin resets status to RECEIVED, clears lastError; worker picks up.

## Processing Pipeline

### Option A: Inline (Route Handler)

Route handler: validate → insert inbox → process synchronously → update status. Return 200 quickly; processing blocks response. **Risk:** Timeout if MP API slow; provider may retry.

**Better for:** Low volume; simple setup.

### Option B: Inbox + Worker (Recommended)

**Step 1 — Route handler (fast):**
```ts
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // 1. Verify signature
  if (!validateSignature(request, body)) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const paymentId = extractPaymentId(body);
  const xRequestId = request.headers.get("x-request-id") ?? paymentId;
  const idempotencyKey = `${paymentId}:${xRequestId}`;

  // 2. Insert inbox (idempotent)
  const record = await prisma.webhookInbox.upsert({
    where: { provider_idempotencyKey: { provider: "mercadopago", idempotencyKey } },
    create: { provider: "mercadopago", idempotencyKey, topic: "payment", resourceId: paymentId, rawPayload: body, status: "RECEIVED" },
    update: {},
  });

  if (record.status === "PROCESSED") return NextResponse.json({ received: true });
  return NextResponse.json({ received: true }); // 200 always; worker will process
}
```

**Step 2 — Worker (cron or queue):**
```ts
// workers/webhook-processor.ts or app/api/cron/process-webhooks/route.ts
async function processWebhookInbox() {
  const batch = await prisma.webhookInbox.findMany({
    where: { provider: "mercadopago", status: "RECEIVED" },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  for (const record of batch) {
    await prisma.webhookInbox.update({
      where: { id: record.id },
      data: { status: "PROCESSING", attempts: { increment: 1 }, lastAttemptAt: new Date() },
    });

    try {
      await processMercadoPagoWebhook(record.rawPayload);
      await prisma.webhookInbox.update({
        where: { id: record.id },
        data: { status: "PROCESSED", processedAt: new Date() },
      });
    } catch (err) {
      const isRetryable = isRetryableError(err);
      const attempts = record.attempts + 1;
      const nextStatus = attempts >= record.maxAttempts ? "DEAD_LETTER" : "RECEIVED";

      await prisma.webhookInbox.update({
        where: { id: record.id },
        data: {
          status: nextStatus,
          lastError: err.message,
          lastAttemptAt: new Date(),
          ...(nextStatus === "RECEIVED" && { metadata: { nextRetryAt: addBackoff(attempts) } }),
        },
      });

      if (nextStatus === "DEAD_LETTER") await alertDeadLetter(record);
    }
  }
}
```

**Trigger:** Vercel Cron (`/api/cron/process-webhooks`), or external cron hitting the route, or queue (SQS, BullMQ).

## Observability

### Logs

| Event | Log |
|-------|-----|
| Received | `webhook.received` { provider, idempotencyKey, resourceId } |
| Processing | `webhook.processing` { id, attempt } |
| Processed | `webhook.processed` { id, duration } |
| Failed | `webhook.failed` { id, error, attempt } |
| Dead letter | `webhook.dead_letter` { id, error } |

### Metrics

| Metric | Type | Labels |
|--------|------|--------|
| webhook_received_total | Counter | provider, topic |
| webhook_processed_total | Counter | provider, status |
| webhook_processing_duration_seconds | Histogram | provider |
| webhook_failures_total | Counter | provider, reason |
| webhook_dead_letter_total | Counter | provider |

### Alerting

| Alert | Condition | Action |
|-------|-----------|--------|
| Dead letter | status = DEAD_LETTER | Slack/email to ops |
| High failure rate | failures > 10% in 5 min | Slack |
| Processing lag | RECEIVED count > 100 | Slack |
| Signature invalid | 401 count > 5 in 5 min | Security alert |

## Implementation Steps

### Phase 1: Inbox + Inline (minimal)

1. Add `WebhookInbox` model; migrate
2. Route handler: verify signature → upsert inbox → if new, process inline → update PROCESSED
3. Return 200 on duplicate (already in inbox)
4. Add logging

### Phase 2: Worker + Retries

1. Route handler: only insert RECEIVED; return 200
2. Create cron route `GET /api/cron/process-webhooks` (with auth header for Vercel Cron)
3. Worker: poll RECEIVED → PROCESSING → process → PROCESSED or FAILED
4. On FAILED: retry with backoff; after maxAttempts → DEAD_LETTER
5. Add `nextRetryAt` or use `lastAttemptAt + backoff` for scheduling

### Phase 3: Observability

1. Add structured logs (JSON) for each event
2. Export metrics (Prometheus or provider) or use Vercel Analytics
3. Configure alerts for DEAD_LETTER, high failure rate
4. Admin UI: list DEAD_LETTER, manual retry button

### Phase 4: Queue (optional)

1. Replace cron with queue (SQS, BullMQ, Inngest)
2. Route handler: insert inbox → enqueue job
3. Worker: consume job → process → update inbox
4. Better for high volume; built-in retries

## Output Format

When designing webhook pipeline:

```markdown
## Pipeline
- Handler: [sync/async]
- Worker: [cron/queue]

## Inbox
- Idempotency: [key format]
- Status flow: [diagram]

## Retry
- Max attempts: [N]
- Backoff: [strategy]

## Observability
- Logs: [events]
- Metrics: [list]
- Alerts: [list]
```

## Constraints

- Always return 200 to provider (except 401 for invalid signature); avoid 5xx on transient errors
- Never process same idempotency key twice
- Persist raw payload before processing; enables replay
- Worker must be idempotent; processing logic should handle duplicate runs safely
