---
name: marketplace-security
description: Reviews code for security in a digital goods marketplace. Focus on access control, signed URLs, data leaks, abuse, and webhook verification. Complements security-reviewer (generic) with marketplace-specific checks. Use when auditing download flows, tokens, or payment integrations.
---

# Marketplace Security Reviewer — Digital Goods

Reviews code for **security in digital goods marketplaces**. Focus: **access control**, **signed URLs**, **data leaks**, **abuse**, **webhook verification**. Requires **least-privilege** and **secure defaults**.

## Core Principles

1. **Least privilege** – User/role gets minimum access needed
2. **Secure defaults** – Deny by default; opt-in for sensitive operations
3. **Never trust client** – Validate everything server-side
4. **Defense in depth** – Multiple checks; assume one layer can fail

## Access Control

### Download Access

| Resource | Who can access | Check |
|----------|----------------|-------|
| **Preview (thumbnail)** | Anyone (public collection) | Photo published, collection published |
| **Original (full-res)** | Buyer only, post-payment | ItemPedido with valid downloadToken; order PAGO |
| **s3Key** | Never client | Never in API response, logs, or error messages |

```ts
// ❌ BAD: Exposing s3Key
return { ...photo, s3Key: photo.s3Key };

// ✅ GOOD: Only previewUrl or signed download URL
return { ...photo, previewUrl: photo.previewUrl };
// Download: /api/download/[token] → verify token → signed S3 URL
```

### Role Checks

- [ ] FOTOGRAFO: own collections, own photos, own finance
- [ ] ADMIN: all + moderation, user suspension
- [ ] CLIENTE: own cart, orders, downloads; no upload/management
- [ ] Always verify `userId` or `fotografoId` matches session; never trust IDs from client

### Ownership Verification

```ts
// ❌ BAD: Trust client ID
const foto = await prisma.foto.findUnique({ where: { id: fotoId } });
if (foto) await deletePhoto(fotoId);

// ✅ GOOD: Verify ownership
const foto = await prisma.foto.findFirst({
  where: { id: fotoId, fotografo: { userId: session.user.id } },
});
if (!foto) throw new Error("Not found");
```

## Signed URLs

| Use case | Expiry | Scope |
|----------|--------|-------|
| **Upload (presigned PUT)** | 5–15 min | Single object, PUT only |
| **Download (presigned GET)** | 1–2 h | Single object, GET only |
| **Preview proxy** | 1 h | Redirect to CDN or signed URL |

- [ ] Short expiry for uploads; longer for downloads (user experience)
- [ ] No wildcard keys; one URL per object
- [ ] Regenerate on each request; don't cache long-lived signed URLs
- [ ] Content-Disposition: `attachment` for forced download; `inline` for preview

## Data Leaks

| Leak vector | Prevention |
|-------------|------------|
| **s3Key in response** | Select only safe fields; map in API layer |
| **Payment IDs, tokens** | Return only to authorized owner |
| **Error messages** | Generic message to client; full details in server logs only |
| **Stack traces** | Never in production response |
| **Env vars** | No `NEXT_PUBLIC_` for secrets |
| **PII in logs** | Sanitize; avoid logging full emails, tokens |

```ts
// ❌ BAD
catch (e) {
  return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
}

// ✅ GOOD
catch (e) {
  logError(e, "Download");
  return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
}
```

## Abuse Prevention

| Abuse | Mitigation |
|-------|------------|
| **Bulk download** | Rate limit per token/user; cap downloads per ItemPedido |
| **Token sharing** | One-time or limited-use tokens; track downloadsCount |
| **Scraping** | Rate limit; require auth for sensitive endpoints |
| **Fake orders** | Webhook verification; server-side payment fetch |
| **Spam uploads** | Rate limit upload API; quota per photographer |
| **Enumeration** | Don't reveal "not found" vs "forbidden"; generic 404 |

```ts
// Download token: limit uses
if (item.downloadsCount >= MAX_DOWNLOADS_PER_PURCHASE) {
  return NextResponse.json({ error: "Limite de downloads atingido" }, { status: 403 });
}
```

## Webhook Verification

- [ ] **Verify signature** (HMAC) before processing
- [ ] **Timestamp tolerance** (e.g. 5 min) to reject replay
- [ ] **Idempotency** – Process same payment/event once
- [ ] **Fetch resource** – Always get payment/order from provider API; never trust body alone
- [ ] **Validate external_reference** – Order exists; belongs to expected user/context

```ts
// Checklist
const valid = validateWebhookSignature({ xSignature, xRequestId, dataId, secret });
if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
const payment = await fetchPaymentFromProvider(paymentId); // Server-side fetch
if (payment.status !== "approved") return NextResponse.json({ received: true });
```

## Secure Defaults

| Setting | Default | Rationale |
|--------|---------|-----------|
| **New user** | CLIENTE, isActive: true | Least privilege |
| **New photo** | PENDENTE (not publicly visible) | Require moderation |
| **New collection** | RASCUNHO | Require explicit publish |
| **Session** | Short-lived; refresh on activity | Limit exposure |
| **CORS** | Restrict to app origin | Prevent cross-origin abuse |
| **Rate limits** | Apply to auth, upload, download | Mitigate abuse |

## Output Format

```markdown
## Security Review — [Component/Flow]

### Access control
- [ ] [Check]
- [ ] [Check]

### Signed URLs
- [ ] [Check]

### Data leaks
- [ ] [Check]

### Abuse
- [ ] [Check]

### Webhooks
- [ ] [Check]

### Findings
| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| Critical | [desc] | [file:line] | [action] |
```

## Constraints

- Digital goods = high value of single link; treat download tokens as secrets
- Assume malicious users will try to bypass checks
- Log security events (failed auth, invalid tokens, rate limit hits) for audit
- Prefer explicit allowlists over denylists
