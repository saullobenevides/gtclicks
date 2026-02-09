---
name: media-upload
description: Designs robust media upload pipelines for web apps. Focus on direct-to-storage uploads, resumable uploads, validation, virus scanning hooks, and thumbnail generation. Optimizes for bandwidth, CDN caching, and image delivery. Assumes Next.js + object storage + CDN.
---

# Media Upload Pipeline — Web Apps

Designs **robust media upload pipelines**. Focus: **direct-to-storage**, **resumable uploads**, **validation**, **virus scanning**, **thumbnails**. Optimizes for **bandwidth**, **CDN caching**, **image delivery**. Assumes **Next.js + object storage (S3) + CDN**.

## Architecture Overview

```
Client ──► API: presigned URL ──► Client PUT direct to S3
                                        │
                                        ▼
Webhook/API ◄── S3 event (optional) ──► Object in bucket
        │
        ├── Validation (type, size, dimensions)
        ├── Virus scan (async hook)
        ├── Thumbnail generation (sharp)
        └── DB record + previewUrl
```

## Direct-to-Storage Uploads

**Flow:**
1. Client requests presigned PUT URL from Next.js API (auth required)
2. API validates metadata (filename, contentType, size estimate); returns URL + s3Key
3. Client PUTs file directly to S3 (no Next.js proxy = no bandwidth cost on server)
4. Client calls "process" API with s3Key; server runs thumbnail + watermark

```ts
// API: Generate presigned URL
const command = new PutObjectCommand({
  Bucket,
  Key: s3Key,
  ContentType: contentType,
  ContentLength: size, // optional: enforce max
});
const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
return { uploadUrl, s3Key };
```

**CORS:** Configure S3 bucket CORS for client PUT from your domain.

**Key naming:** `{folder}/{uuid}.{ext}` — avoid collisions; enable cache busting if needed.

## Resumable Uploads

| Protocol | Use case | Notes |
|----------|----------|-------|
| **S3 Multipart** | Large files (>5MB) | Initiate, upload parts, complete; each part resumable |
| **TUS** | Generic resumable | TUS protocol server; client libraries (tus-js-client) |
| **Presigned PUT** | Simple, small files | Not resumable; retry = full re-upload |

**S3 Multipart flow:**
1. `CreateMultipartUpload` → uploadId
2. Presign `UploadPart` per part (1–5MB each)
3. Client uploads parts in parallel; retry failed parts only
4. `CompleteMultipartUpload` with part ETags
5. On failure: `AbortMultipartUpload` to clean up

**Idempotency:** Store uploadId per session; allow resume by part number.

## Validation

| Layer | What | Where |
|-------|------|-------|
| **Pre-upload** | ContentType whitelist, max size estimate | Presigned URL API |
| **Post-upload** | Actual bytes, dimensions, magic bytes | Process API (server) |
| **File type** | magic bytes (not extension) | Server after download |

```ts
// Whitelist
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

// Server: verify after download
const buffer = await downloadFromS3(s3Key);
if (buffer.length > MAX_SIZE_BYTES) throw new Error("File too large");
const metadata = await sharp(buffer).metadata();
if (![metadata.width, metadata.height].every(n => n && n <= 20000))
  throw new Error("Dimensions exceed limit");
```

**Never trust client** for size/type; always verify server-side after S3 read.

## Virus Scanning Hooks

| Strategy | When | Notes |
|----------|------|-------|
| **Pre-scan** | Before processing | Block malicious before thumbnail; use ClamAV or cloud scanner |
| **Async scan** | After upload, before publish | Queue (SQS, Bull); mark photo PENDING_SCAN → SCANNED |
| **S3 event → Lambda** | On PutObject | Lambda invokes scanner; updates DB or triggers webhook |

**Hook points:**
1. After `processUploadedImage` downloads from S3, before sharp processing
2. Or: S3 Event Notification → Lambda → scan → SNS/webhook to Next.js

**On threat:** Delete S3 object; delete DB record; notify admin; do not serve.

## Thumbnail Generation

| Output | Size | Use | Cache |
|--------|------|-----|-------|
| **Preview** | ~1200px or 800px | Cards, gallery | Long (immutable) |
| **Thumbnail** | ~400px | Grid, search | Long |
| **Original** | Full | Download only (post-payment) | Private, signed |

```ts
// sharp pipeline
const preview = await sharp(buffer)
  .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: 85, mozjpeg: true })
  .toBuffer();
// Upload preview to S3; store URL in previewUrl
```

**Watermark:** Apply in sharp before upload; previewUrl = watermarked version.

**Formats:** Prefer WebP for thumbnails if client supports; JPEG for compatibility.

## Bandwidth & CDN Optimization

| Tactic | Implementation |
|--------|----------------|
| **Direct upload** | Client → S3; no Next.js proxy |
| **CDN in front of S3** | CloudFront (or similar) origin = S3; custom domain |
| **Cache-Control** | `public, max-age=31536000, immutable` on thumbnails |
| **Content-Disposition** | `inline` for display; `attachment` for download |
| **Responsive images** | `srcset` with multiple sizes; or image CDN (Imgix, Cloudinary) |
| **Lazy load** | `loading="lazy"`; `next/image` with `sizes` |

**S3 → CDN:** Serve images via `https://cdn.example.com/images/{key}` not direct S3 URL. CDN caches at edge; reduces S3 egress.

**next/image:** Use `loader` pointing to CDN; or `/api/images/[key]` that redirects to CDN URL.

## Output Format

When designing an upload pipeline:

```markdown
## Pipeline: [Name]

### Flow
1. [Step]
2. [Step]

### Direct-to-storage
- Presigned: [yes/no]
- CORS: [config]

### Resumable
- Protocol: [S3 Multipart | TUS | none]
- Chunk size: [if applicable]

### Validation
- Pre: [list]
- Post: [list]

### Virus scan
- Point: [when]
- Action on threat: [what]

### Thumbnails
- Sizes: [list]
- Watermark: [where]

### CDN
- Cache headers: [values]
- Origin: [S3 or API]
```

## Constraints

- Never proxy large uploads through Next.js (memory, timeout, cost)
- Always validate server-side after S3; never trust client metadata
- Store only s3Key in DB; never expose s3Key to client (use previewUrl or signed download URL)
- Prefer async processing (queue) for heavy work; return 202 + jobId if needed
