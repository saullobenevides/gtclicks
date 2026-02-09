---
name: s3-media-pipeline
description: Designs S3 media pipeline for photo marketplace in Next.js. Prefers direct-to-S3 uploads via presigned URLs. Covers client upload flow, presigned endpoint, validation, key strategy, finalize step, thumbnail generation, and private delivery. Secure defaults.
---

# S3 Media Pipeline — Photo Marketplace

Designs **S3 media pipeline** for photo marketplace. Prefers **direct-to-S3** via **presigned URLs**. Covers: client flow, presigned endpoint, validation, key strategy, finalize, thumbnails, private delivery. **Secure defaults**.

## Architecture Overview

```
Client ──► POST /api/upload (presigned) ──► returns { uploadUrl, s3Key }
    │
    └──► PUT to uploadUrl (direct S3) ──► progress/resume
                │
                ▼
Client ──► POST /api/photos/process { s3Key, colecaoId } ──► finalize
                │
                ├──► Download from S3
                ├──► Thumbnail + watermark
                ├──► Upload preview to S3
                └──► Write Foto record (previewUrl, status)
```

## Object Key Strategy

| Pattern | Example | Use |
|---------|---------|-----|
| **tenant/photographer/event** | `{fotografoId}/{colecaoId}/{uuid}.jpg` | Original |
| **Preview** | `previews/{fotografoId}/{fotoId}.jpg` | Thumbnail/watermarked |
| **Fallback** | `uploads/{uuid}.{ext}` | Simple; no hierarchy |

**Recommended:** `originals/{fotografoId}/{colecaoId}/{uuid}.{ext}` — enables lifecycle, prefix-based policies, and easy cleanup per event.

```ts
const s3Key = `originals/${fotografoId}/${colecaoId ?? "orphan"}/${randomUUID()}.${ext}`;
```

## Server Endpoint: Presigned PUT

```ts
// app/api/upload/route.ts
const schema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  contentLength: z.number().min(1).max(50 * 1024 * 1024), // 50MB
  checksumSha256: z.string().optional(), // If client computed
  fotografoId: z.string().cuid(),
  colecaoId: z.string().cuid().optional(),
});

const { filename, contentType, contentLength, fotografoId, colecaoId } = schema.parse(body);

// Verify fotografo belongs to session
const fotografo = await prisma.fotografo.findFirst({
  where: { id: fotografoId, userId: session.user.id },
});
if (!fotografo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

const ext = contentType.split("/")[1] === "jpeg" ? "jpg" : contentType.split("/")[1];
const s3Key = `originals/${fotografoId}/${colecaoId ?? "orphan"}/${randomUUID()}.${ext}`;

const command = new PutObjectCommand({
  Bucket,
  Key: s3Key,
  ContentType: contentType,
  ContentLength: contentLength,
  ...(checksumSha256 && { ChecksumSHA256: checksumSha256 }),
});

const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min
return NextResponse.json({ uploadUrl, s3Key });
```

## Multipart (Resume-Friendly)

For files > 5MB, use S3 Multipart:

```ts
// 1. CreateMultipartUpload
// 2. Presign UploadPart for each part (5MB chunks)
// 3. Client uploads parts; retry failed parts only
// 4. CompleteMultipartUpload with ETags
```

**Endpoint:** `POST /api/upload/multipart/init` → returns `uploadId` + presigned URLs for each part. Client tracks progress per part; resumes from last failed part.

## Client Upload Flow

```tsx
// 1. Get presigned URL
const { uploadUrl, s3Key } = await fetch("/api/upload", {
  method: "POST",
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    contentLength: file.size,
    fotografoId,
    colecaoId,
  }),
}).then(r => r.json());

// 2. Upload with progress
const xhr = new XMLHttpRequest();
xhr.upload.onprogress = (e) => setProgress(e.loaded / e.total * 100);
xhr.open("PUT", uploadUrl);
xhr.setRequestHeader("Content-Type", file.type);
xhr.send(file);

// 3. On success: finalize
await fetch("/api/photos/process", {
  method: "POST",
  body: JSON.stringify({ s3Key, colecaoId, folderId, titulo }),
});
```

**Resume:** For multipart, store `uploadId` + completed part numbers in localStorage; on retry, only upload missing parts.

## Validation

| Layer | Check | Where |
|-------|-------|-------|
| **Pre-upload** | contentType whitelist, contentLength max | Presigned API |
| **Post-upload** | Magic bytes (not extension), dimensions | Process API |
| **Mime** | `image/jpeg`, `image/png`, `image/webp` only | Zod schema |
| **Size** | Max 50MB (configurable) | contentLength |
| **Checksum** | Optional SHA256; S3 validates on PutObject | ChecksumSHA256 header |

```ts
// Post-upload: verify magic bytes
const magic = buffer.subarray(0, 4);
const isJpeg = magic[0] === 0xff && magic[1] === 0xd8;
const isPng = magic.toString("hex") === "89504e47";
if (!isJpeg && !isPng && !isWebp(buffer)) throw new Error("Invalid image");
```

## Post-Upload Finalize

```ts
// POST /api/photos/process
// 1. Validate session + fotografo + colecao
// 2. Assert s3Key exists (HeadObject or GetObject)
// 3. Create Foto record (PENDENTE, previewUrl empty)
// 4. Trigger processing (sync or async)
// 5. Update Foto: previewUrl, status PUBLICADA
```

**Sync:** Process inline in route (simple; blocks). **Async:** Queue job; return 202; client polls or uses webhook.

## Thumbnail Generation Strategy

| Size | Key pattern | Use |
|------|-------------|-----|
| **Preview** | `previews/{fotoId}.jpg` | Cards, gallery (1200px, watermark) |
| **Thumbnail** | `thumbnails/{fotoId}.jpg` | Grid (400px) |
| **Original** | `originals/...` | Download only (private) |

**Async job:** On finalize, enqueue `processPhotoJob({ s3Key, fotoId })`. Worker: download → resize → watermark → upload to `previews/` → update Foto.previewUrl.

**Storage layout:**
```
bucket/
  originals/{fotografoId}/{colecaoId}/{uuid}.jpg   # Private
  previews/{fotoId}.jpg                             # Public or signed
  thumbnails/{fotoId}.jpg                           # Public or signed
```

## Private Originals + Controlled Delivery

- **Originals:** Never public. Bucket policy: deny public read on `originals/*`.
- **Delivery:** `/api/download/[token]` — verify ItemPedido.downloadToken, Pedido PAGO, then generate presigned GET for `item.foto.s3Key`.
- **Expiry:** 5–15 min for download URL.
- **Content-Disposition:** `attachment; filename="..."` to force download.

```ts
const command = new GetObjectCommand({
  Bucket,
  Key: item.foto.s3Key,
  ResponseContentDisposition: `attachment; filename="${item.foto.titulo}.jpg"`,
});
const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
return NextResponse.redirect(signedUrl);
```

## Secure Defaults

| Setting | Default | Rationale |
|---------|---------|-----------|
| **Bucket policy** | Deny public on originals | No accidental exposure |
| **Presigned expiry** | 15 min | Minimize replay window |
| **ContentType** | Whitelist only | Prevent upload of non-images |
| **contentLength** | Enforced in PutObjectCommand | Server-side size check |
| **CORS** | Restrict to app origin | Prevent cross-origin abuse |
| **previewUrl** | CDN or signed | Never expose raw s3Key |

## Output Format

When designing a pipeline:

```markdown
## Pipeline: [Name]
### Key strategy
[Pattern]

### Endpoints
- POST /api/upload → presigned PUT
- POST /api/photos/process → finalize

### Validation
- Pre: [list]
- Post: [list]

### Thumbnail flow
[Sync/async, storage layout]

### Delivery
[Private/signed, expiry]
```

## Constraints

- Never expose s3Key to client; use previewUrl or download token
- Always validate fotografo ownership before minting presigned URL
- Prefer multipart for files > 5MB for resume
- Use ChecksumSHA256 when client can compute (integrity)
- Log uploads for audit; rate limit per fotografo
