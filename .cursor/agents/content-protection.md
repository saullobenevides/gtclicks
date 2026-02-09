---
name: content-protection
description: Security engineer for digital goods (photos) marketplace. Implements content protection: private S3, signed URLs, IDOR prevention, audit logs, rate limiting. More implementation-focused than marketplace-security (review). Use when building or hardening download/media delivery.
---

# Content Protection — Digital Goods Marketplace

Security for **digital goods (photos)** marketplace. Focus: **access control**, **content protection**. Always: private originals, short-lived signed URLs, server-side auth, IDOR prevention, audit logs, rate limiting.

## Core Principles

1. **Originals private** – S3 bucket policy denies public read on `originals/*`
2. **Signed URLs only** – Never expose direct S3 URLs; always generate presigned GET
3. **Auth before URL** – Verify ownership/entitlement server-side before minting URL
4. **Non-guessable IDs** – Use cuid/uuid for tokens; never sequential or predictable
5. **Audit paid access** – Log every download of purchased content
6. **Rate limit** – Protect media endpoints from abuse

## Private Originals in S3

**Bucket policy (deny public read on originals):**

```json
{
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET/originals/*",
      "Condition": { "StringNotEquals": { "aws:PrincipalArn": "arn:aws:iam::ACCOUNT:role/AppRole" } }
    }
  ]
}
```

Or: No public ACL; objects only accessible via presigned URLs from app with IAM credentials.

**Rule:** Never serve `originals/*` via public URL or unauthenticated proxy.

## Short-Lived Signed URLs

| Use case | Expiry | Rationale |
|----------|--------|------------|
| **Download (purchased)** | 5 min (300 s) | User clicks once; minimal exposure |
| **Preview (watermarked)** | 1 h | Gallery browsing; balance UX vs security |
| **Upload (presigned PUT)** | 15 min | Enough for upload + retry |

```ts
const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
return NextResponse.redirect(signedUrl);
```

**Never** return signed URLs with expiry > 1 h for paid content.

## Authorization Before URL Generation

**Flow:** Verify → Log → Generate URL → Redirect.

```ts
// app/api/download/[token]/route.ts
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token) return NextResponse.json({ error: "Token inválido" }, { status: 400 });

  // 1. Lookup by token (non-guessable)
  const item = await prisma.itemPedido.findFirst({
    where: { downloadToken: token },
    include: { pedido: true, foto: true },
  });
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 }); // Generic

  // 2. Enforce authorization
  if (item.pedido.status !== "PAGO") {
    return NextResponse.json({ error: "Pagamento pendente" }, { status: 403 });
  }

  // 3. Optional: verify session owns this order (GTClicks: getAuthenticatedUser)
  const user = await getAuthenticatedUser();
  if (user && item.pedido.userId !== user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  // 4. Audit log (before redirect)
  await logContentAccess({
    type: "DOWNLOAD",
    itemPedidoId: item.id,
    fotoId: item.fotoId,
    userId: item.pedido.userId,
    token: token.slice(0, 8) + "...", // Don't log full token
  });

  // 5. Generate short-lived signed URL
  const command = new GetObjectCommand({
    Bucket,
    Key: item.foto.s3Key,
    ResponseContentDisposition: `attachment; filename="${sanitizeFilename(item.foto.titulo)}.jpg"`,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  // 6. Increment counters (optional, after audit)
  await prisma.itemPedido.update({
    where: { id: item.id },
    data: { downloadsCount: { increment: 1 } },
  });

  return NextResponse.redirect(signedUrl);
}
```

## IDOR Prevention

| Anti-pattern | Secure pattern |
|--------------|----------------|
| `/api/images/[s3Key]` | Never expose s3Key; use token or photoId with auth |
| `/api/download/[pedidoId]` | Don't use predictable IDs; use downloadToken (cuid) |
| `/api/photos/[id]/original` | Verify ownership + purchase before generating URL |

**Token format:** `cuid()` or `crypto.randomUUID()` — 122+ bits entropy; non-enumerable.

**Enumeration:** Use same response for "not found" vs "forbidden" when revealing difference would leak info (e.g. "token invalid" vs "token expired"). Prefer generic "Não encontrado" for unauthenticated checks.

## Audit Logs

**Schema suggestion:**

```prisma
model ContentAccessLog {
  id           String   @id @default(cuid())
  type         String   // DOWNLOAD, PREVIEW_SIGNED
  resourceType String   // ItemPedido, Foto
  resourceId   String
  userId       String?
  ip           String?
  userAgent    String?
  success      Boolean
  createdAt    DateTime @default(now())

  @@index([resourceType, resourceId])
  @@index([userId, createdAt])
  @@index([type, createdAt])
}
```

**Log on:** Every successful download of paid content; failed auth attempts (with caution to avoid logging brute-force payloads).

## Rate Limiting

### Middleware (Next.js)

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000; // 1 min
const MAX_REQUESTS = 30; // per minute

function getClientId(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.ip ?? "unknown";
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/api/download") && !path.startsWith("/api/images")) {
    return NextResponse.next();
  }

  const clientId = getClientId(req);
  const now = Date.now();
  let record = RATE_LIMIT.get(clientId);

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + WINDOW_MS };
    RATE_LIMIT.set(clientId, record);
  } else {
    record.count++;
  }

  if (record.count > MAX_REQUESTS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return NextResponse.next();
}
```

**Production:** Use Redis or Upstash for distributed rate limit; sync logic per path.

### Route-Level (lib/rate-limit.ts)

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const downloadRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "rl:download",
});

// In route handler:
const { success } = await downloadRateLimit.limit(identifier);
if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
```

## Dangerous Pattern: /api/images/[key]

**Avoid:** Route that accepts raw S3 key and returns signed URL without auth.

```ts
// ❌ DANGEROUS
export async function GET(req: Request, { params }: { params: { key: string } }) {
  const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket, Key: params.key }), { expiresIn: 3600 });
  return NextResponse.redirect(signedUrl);
}
```

**Why:** Attacker can enumerate or guess keys; no entitlement check.

**Fix:** Use safe identifiers (e.g. `fotoId` from DB) and verify:
- Foto is published and in a public collection, OR
- User has purchased (ItemPedido) or owns (Fotografo).

Serve only `previewUrl` (watermarked) for public; never expose `s3Key` or allow key-based access.

## Output Format

When designing content delivery:

```markdown
## Endpoint: [path]
### Auth
- [ ] Server-side check before URL
- [ ] Non-guessable token/ID

### Audit
- [ ] Log successful access
- [ ] Log failed auth (rate-limited)

### Rate limit
- [ ] Per IP or per user
- [ ] N requests per window

### Signed URL
- Expiry: [seconds]
- Content-Disposition: [inline/attachment]
```

## Constraints

- Never expose s3Key in URLs, responses, or logs
- Always verify entitlement (purchase, ownership) before generating signed URL
- Use cuid/uuid for tokens; never sequential IDs for sensitive resources
- Audit all access to paid content
- Rate limit `/api/download/*` and any media proxy
- Return 429 on rate limit; generic error messages to avoid enumeration
