---
name: abuse-prevention
description: Focus on abuse prevention for media marketplaces. Detects suspicious behavior (mass downloads, token sharing), proposes limits, watermark options, and monitoring signals. Provides implementable rules and data to capture.
---

# Abuse Prevention — Media Marketplace

Prevents **abuse** in media marketplaces. Detects **mass downloads**, **token sharing**. Proposes **limits**, **watermark options**, **monitoring signals**. Provides **implementable rules** and **data to capture**.

## Abuse Vectors

| Abuse | Description | Detection |
|-------|-------------|-----------|
| **Mass downloads** | One token used to download many times | downloadsCount per ItemPedido |
| **Token sharing** | Same token used from many IPs/devices | IP diversity per token |
| **Scraping** | Bulk fetch of previews | Rate limit, request pattern |
| **Account farming** | Multiple accounts for cheap access | New accounts + immediate bulk buy |
| **Resale** | Download once, redistribute | Hard to prevent; watermark helps |

## Implementable Limits

### Per Token (ItemPedido)

| Limit | Default | Rationale |
|-------|---------|-----------|
| **Downloads per purchase** | 5–10 | Legit: re-download after device change; abuse: sharing |
| **Unique IPs per token** | 2–3 | Legit: home + mobile; abuse: sharing |
| **Time window** | 30 days from first download | Or unlimited; depends on policy |

```ts
// In download route
const MAX_DOWNLOADS_PER_PURCHASE = 10;
const MAX_UNIQUE_IPS_PER_TOKEN = 3;

if (item.downloadsCount >= MAX_DOWNLOADS_PER_PURCHASE) {
  return NextResponse.json({ error: "Limite de downloads atingido. Entre em contato com o suporte." }, { status: 403 });
}
```

### Per User (userId)

| Limit | Default | Rationale |
|-------|---------|-----------|
| **Downloads per hour** | 50 | Prevents bulk scraping |
| **Downloads per day** | 200 | Same |
| **Active tokens** | N/A | Track for anomaly |

### Per IP

| Limit | Default | Rationale |
|-------|---------|-----------|
| **Download requests per minute** | 20 | Rate limit; prevents bots |
| **Unique tokens per IP per day** | 10 | Sharing: many tokens from same IP |

## Data to Capture

### DownloadAccessLog (required)

```prisma
model DownloadAccessLog {
  id           String   @id @default(cuid())
  itemPedidoId String
  itemPedido   ItemPedido @relation(fields: [itemPedidoId], references: [id])
  token        String   // First 8 chars for audit; full for lookup
  userId       String?
  ip           String?  // From x-forwarded-for or request
  userAgent    String?
  success      Boolean
  reason       String?  // BLOCKED_LIMIT, BLOCKED_IP, etc.
  createdAt    DateTime @default(now())

  @@index([itemPedidoId, createdAt])
  @@index([token, createdAt])
  @@index([ip, createdAt])
  @@index([userId, createdAt])
}
```

### Existing Fields to Use

| Model | Field | Use |
|-------|-------|-----|
| ItemPedido | downloadsCount | Enforce max |
| ItemPedido | downloadToken | Audit; never log full |
| Pedido | userId | Per-user limits |

### Aggregation Queries

```sql
-- Unique IPs per token (last 30 days)
SELECT COUNT(DISTINCT ip) FROM DownloadAccessLog
WHERE itemPedidoId = ? AND createdAt > NOW() - INTERVAL '30 days';

-- Downloads per user per hour
SELECT COUNT(*) FROM DownloadAccessLog
WHERE userId = ? AND createdAt > NOW() - INTERVAL '1 hour';
```

## Watermark Options

| Strategy | Use | Trade-off |
|----------|-----|-----------|
| **Visible tiled** | Preview + delivered original | Deters sharing; UX impact |
| **Visible on preview only** | Preview watermarked; original clean | User gets clean file; sharing risk |
| **Invisible (steganography)** | Fingerprint in pixels | Forensics; complex |
| **Per-user watermark** | User ID/email in corner | Trace leaks; visible |
| **Dynamic on delivery** | User ID + timestamp on each download | Trace sharing; processing cost |

**Recommendation:** Preview = tiled watermark (current). Delivered original = clean for paid user. If high leakage: add subtle per-download fingerprint (e.g. small text in corner with download ID).

```ts
// Sharp: per-download watermark
const watermarkText = `ID: ${downloadId}`; // Or user email hash
// Composite small text in corner
```

## Monitoring Signals

| Signal | Threshold | Action |
|--------|-----------|--------|
| downloadsCount > MAX | Already blocked | Log; alert if repeated attempts |
| Unique IPs per token > 3 | Warn | Log; optional block |
| Same IP, many tokens | 10+ tokens/day | Flag for review |
| New user + bulk buy + fast downloads | Heuristic | Queue for manual review |
| Rate limit hit | 429 | Log IP; possible temporary block |
| Failed auth on download | 403 | Log; track brute force |

### Alert Rules

```ts
// Pseudocode
if (downloadAccessLogs.filter(d => d.itemPedidoId === id).map(d => d.ip).distinct().length > 3) {
  await createAlert({ type: "TOKEN_SHARING_SUSPECT", itemPedidoId: id });
}
if (downloadsCount === MAX && success === false) {
  await logSuspiciousAttempt({ itemPedidoId: id, ip, userAgent });
}
```

## Implementable Rules

### Rule 1: Cap downloads per purchase

```ts
if (item.downloadsCount >= MAX_DOWNLOADS_PER_PURCHASE) {
  await logDownloadAttempt({ itemPedidoId: item.id, success: false, reason: "BLOCKED_LIMIT", ip });
  return NextResponse.json({ error: "Limite de downloads atingido" }, { status: 403 });
}
```

### Rule 2: Cap unique IPs per token

```ts
const uniqueIps = await prisma.downloadAccessLog.findMany({
  where: { itemPedidoId: item.id, success: true },
  select: { ip: true },
  distinct: ["ip"],
});
if (uniqueIps.length >= MAX_UNIQUE_IPS && !uniqueIps.some(u => u.ip === currentIp)) {
  await logDownloadAttempt({ ..., reason: "BLOCKED_IP_DIVERSITY" });
  return NextResponse.json({ error: "Limite de dispositivos atingido" }, { status: 403 });
}
```

### Rule 3: Rate limit per IP

```ts
const count = await redis.incr(`rl:download:${ip}`);
if (count === 1) await redis.expire(`rl:download:${ip}`, 60); // 1 min window
if (count > 20) return NextResponse.json({ error: "Muitas requisições" }, { status: 429 });
```

### Rule 4: Log every access

```ts
await prisma.downloadAccessLog.create({
  data: {
    itemPedidoId: item.id,
    token: token.slice(0, 8) + "...",
    userId: item.pedido.userId,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0],
    userAgent: req.headers.get("user-agent"),
    success: true,
  },
});
```

## Output Format

When implementing abuse prevention:

```markdown
## Limits
| Limit | Value | Enforced |

## Data to capture
- [Model/field]

## Watermark
- Preview: [strategy]
- Delivered: [strategy]

## Alerts
| Signal | Threshold | Action |
```

## Constraints

- Never log full downloadToken; use prefix or hash
- Respect privacy; IP only for abuse detection; retention policy
- Config-driven limits (env or SystemConfig) for easy tuning
- User-facing errors: generic; internal logs: detailed for ops
