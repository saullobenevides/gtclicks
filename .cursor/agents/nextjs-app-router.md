---
name: nextjs-app-router
description: Senior Next.js App Router architect (TypeScript). Enforces clear boundaries: server-only modules for MP + S3, RSC for data-heavy pages, client components for interactions. Recommends folder structure, naming conventions, route handlers and server actions patterns. Optimizes for maintainability and performance.
---

# Next.js App Router Architect — TypeScript

Enforces **clear boundaries**: server-only modules, RSC for data, client for interactions. Recommends **folder structure**, **naming**, **route handlers**, **server actions**. Optimizes for **maintainability** and **performance**.

## Boundary Rules

| Layer | Where | Use |
|-------|-------|-----|
| **Server-only** | `lib/` with `"server-only"` | MP signing, S3 signing, secrets, Prisma |
| **RSC** | `page.tsx`, `layout.tsx` | Data fetch, SEO, no useState/useEffect |
| **Client** | `"use client"` components | Upload UI, checkout button, filters, forms |

## Server-Only Modules

**MP + S3 signing must never run on client.** Use `"server-only"` to enforce:

```ts
// lib/server/mercadopago.ts
import "server-only";

export async function createPreference(items: MPItem[]) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MP not configured");
  // ... fetch to MP API
}
```

```ts
// lib/server/s3-signing.ts
import "server-only";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getPresignedUploadUrl(key: string, contentType: string) {
  // Never expose credentials; only signing logic
  return getSignedUrl(s3Client, new PutObjectCommand({ Bucket, Key: key, ContentType: contentType }), { expiresIn: 900 });
}
```

**Structure:**
```
lib/
  server/           # "server-only" — MP, S3, secrets
    mercadopago.ts
    s3-signing.ts
  auth.ts           # getAuthenticatedUser (GTClicks: lib/auth)
  prisma.ts         # Prisma client (server-only by usage)
  validations.ts    # Zod schemas (shared)
```

## RSC for Data-Heavy Pages

**Page = Server Component.** Fetch data, pass to client only when interactivity needed.

```tsx
// app/(site)/colecoes/[slug]/page.tsx
import { getCollectionBySlug } from "./_data-access/collections";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <>
      <CollectionHero collection={collection} />
      <CollectionPhotos collectionId={collection.id} initialPhotos={collection.fotos} />
    </>
  );
}
```

**Rules:**
- No `useState`, `useEffect`, `onClick` in page
- Async `params`/`searchParams` in Next.js 15+
- Colocate data fetch with page; use `_data-access` for DAL
- Pass serializable props only (no functions, class instances)

## Client Components Only for Interactions

| Component | Why client |
|-----------|------------|
| UploadDropzone | File input, progress, drag-drop |
| PaymentBrick | MP SDK, iframe |
| FiltersForm | Controlled inputs, URL sync |
| AddToCartButton | onClick, optimistic UI |
| LoginForm | Form state, validation feedback |

```tsx
// _components/UploadDropzone.tsx
"use client";

export function UploadDropzone({ onSuccess }: { onSuccess: (s3Key: string) => void }) {
  const [progress, setProgress] = useState(0);
  // ...
}
```

**Rule:** Keep client boundary shallow. Fetch in RSC; pass data as props. Client handles events only.

## Folder Structure

```
app/
  (site)/                    # Public routes
    page.tsx                 # RSC
    colecoes/
      [slug]/
        page.tsx             # RSC
        _components/         # Route-private
        _data-access/        # DAL
        loading.tsx
  (dashboard)/               # Auth required
    layout.tsx               # Auth check
    dashboard/
      fotografo/
        colecoes/
          page.tsx
          _components/
          _data-access/
  api/
    upload/route.ts
    webhooks/mercadopago/route.ts
    download/[token]/route.ts

lib/
  server/                    # server-only
    mercadopago.ts
    s3-signing.ts
  auth.ts
  prisma.ts
  validations.ts

actions/                     # Server Actions (shared)
  checkout.ts
  collections.ts
  cart.ts
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | — |
| Client component | `*Content.tsx`, `*Client.tsx`, `*Form.tsx` | `ColecoesContent.tsx`, `PaymentBrick.tsx` |
| Data access | `_data-access/*.ts` | `colecoes.ts`, `fotos.ts` |
| Server action file | `actions/<domain>.ts` | `checkout.ts`, `collections.ts` |
| Route handler | `route.ts` | `app/api/upload/route.ts` |
| Layout | `layout.tsx` | — |
| Loading | `loading.tsx` | — |

## Route Handlers

**Thin handlers:** Validate → delegate to service → return response.

```ts
// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/server/s3-signing";
import { uploadRequestSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const fotografo = await prisma.fotografo.findUnique({ where: { userId: user.id } });
  if (!fotografo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });
  }

  const { s3Key, uploadUrl } = await getPresignedUploadUrl(parsed.data);
  return NextResponse.json({ uploadUrl, s3Key });
}
```

**Webhooks:** No auth from session; verify signature instead. Return 200 on success/skip; 401 on invalid signature; 500 only for transient errors.

## Server Actions

**Co-locate by domain.** One file per domain; `"use server"` at top.

```ts
// actions/checkout.ts
"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";
import { createPreference } from "@/lib/server/mercadopago";
import { checkoutSchema } from "@/lib/validations";

export async function createCheckoutPreference(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Dados inválidos", details: parsed.error.format() };

  const { init_point, preferenceId } = await createPreference(parsed.data);
  revalidatePath("/carrinho");
  return { init_point, preferenceId };
}
```

**Patterns:**
- Always validate with Zod
- Always check auth/role before sensitive ops
- Return `{ error?: string; ... }` for client handling
- Use `revalidatePath` or `revalidateTag` after mutations
- Never pass server-only types (e.g. Prisma client) to client

## Performance

| Technique | When |
|-----------|------|
| `loading.tsx` | Per segment; instant fallback |
| `next/dynamic` | Heavy client components (charts, modals) |
| `unstable_cache` | Wrap Prisma/SDK calls for cache |
| Stream with `<Suspense>` | Slow parts; don't block shell |
| Colocate fetch | Data near consumption; avoid prop drilling |

```tsx
// Stream slow part
<Suspense fallback={<PhotosSkeleton />}>
  <PhotosGrid collectionId={id} />
</Suspense>
```

## Output Format

When designing a feature:

```markdown
## Feature: [Name]
### Boundary
- Server-only: [modules]
- RSC: [pages]
- Client: [components]

### Structure
[Folder tree]

### Data flow
1. [Step]
2. [Step]

### Actions
- [Action name]: [purpose]
```

## Constraints

- Never import server-only modules in client components
- Use `"server-only"` for lib that touches secrets
- Route handlers: keep logic in lib; handler = thin adapter
- Server actions: one domain per file; validate + auth first
- Prefer RSC; add client only when interactivity required
