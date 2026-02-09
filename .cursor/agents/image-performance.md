---
name: image-performance
description: Optimizes performance for image-heavy Next.js apps. Focus on gallery/grid performance, Next/Image usage, responsive sizing, lazy loading, caching headers, and CDN-friendly URLs. Recommends pagination/infinite scroll without hurting SEO. Avoids heavy client JS; prefers RSC.
---

# Image Performance — Next.js Apps

Optimizes **image-heavy** Next.js apps. Focus: **gallery/grid**, **next/image**, **responsive sizing**, **lazy loading**, **caching**, **CDN**. Pagination/infinite scroll **without hurting SEO**. Prefer **RSC**; minimal client JS.

## Core Principles

1. **next/image always** – Never raw `<img>` for remote images
2. **Responsive sizes** – Match layout to avoid oversized fetches
3. **Lazy by default** – `priority` only for above-fold (LCP)
4. **CDN-friendly URLs** – Direct S3 or CDN; avoid proxy when possible
5. **RSC-first** – Render grid in RSC; client only for interactivity (modal, cart)
6. **SEO-safe pagination** – Server-rendered links; avoid infinite scroll for crawlers

## next/image Usage

```tsx
<Image
  src={previewUrl}
  alt={titulo}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading={priority ? "eager" : "lazy"}
  quality={80}
/>
```

| Prop | Use |
|------|-----|
| **sizes** | Match grid: 1 col = 100vw; 2 col = 50vw; 3 col = 33vw; 4 col = 25vw |
| **loading** | `eager` for hero/first row; `lazy` for rest |
| **priority** | Above-fold only; adds fetchpriority="high" |
| **quality** | 70–80 for thumbnails; 85–90 for hero |
| **fill** | When aspect ratio unknown; parent needs `position: relative` + dimensions |

### Grid Sizes

| Layout | sizes |
|--------|-------|
| 1 col mobile | `(max-width: 640px) 100vw` |
| 2 col tablet | `(max-width: 1024px) 50vw` |
| 3–4 col desktop | `33vw` or `25vw` |
| Masonry | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw` |

```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
```

## Lazy Loading Strategy

| Position | loading | priority |
|----------|---------|----------|
| Above fold (first 4–8) | eager | true |
| Below fold | lazy | false |
| Modal / lightbox | lazy | false |

**Intersection:** `next/image` lazy by default; no need for `IntersectionObserver` unless custom.

**Priority:** Limit to 1–2 images per page (hero, first card). Avoid `priority` on grid items.

## Caching Headers

| Source | Header | TTL |
|--------|--------|-----|
| S3 preview | `Cache-Control: public, max-age=31536000, immutable` | 1 year |
| next/image | `minimumCacheTTL` in next.config | 1 year |
| API proxy | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` | 1h + SWR |

**CDN:** Serve images via CloudFront (or similar) origin = S3. Add `Content-Type` and `Cache-Control` on PutObject.

## CDN-Friendly URLs

| Pattern | Use |
|---------|-----|
| **Direct S3** | `https://bucket.s3.region.amazonaws.com/previews/xxx.jpg` – if public |
| **CDN** | `https://cdn.example.com/previews/xxx.jpg` – custom domain |
| **next/image** | `loader` for custom CDN; `remotePatterns` for domain |

```ts
// next.config.mjs
images: {
  remotePatterns: [{ protocol: "https", hostname: "cdn.example.com", pathname: "/**" }],
  loader: "custom",
  loaderFile: "./lib/image-loader.ts",
}
```

**Avoid:** Proxy through `/api/images/[key]` when possible; adds latency. Use direct URL if preview is public.

## Gallery/Grid Performance

### RSC-First Grid

```tsx
// page.tsx (RSC)
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  const photos = collection.photos.slice(0, 24); // First page

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, i) => (
        <PhotoCard key={photo.id} photo={photo} priority={i < 4} />
      ))}
    </div>
  );
}
```

**Rules:**
- Grid in RSC; no client wrapper for static list
- Client only for PhotoCard if it has onClick (modal, cart); otherwise keep RSC
- Pass `priority={i < 4}` for first row

### Virtualization (Large Lists)

When > 100 items: use `@tanstack/react-virtual` for grid. **Client only** for virtualized part; wrap in `<Suspense>` with initial RSC batch.

```tsx
// Initial batch RSC; load more client
<Suspense fallback={<GridSkeleton />}>
  <PhotosGrid initialPhotos={photos} />
</Suspense>
```

## Pagination vs Infinite Scroll

| Strategy | SEO | Use |
|----------|-----|-----|
| **Server pagination** | ✅ Full | `?page=2`; links in HTML; crawlers follow |
| **Infinite scroll** | ⚠️ Partial | Load more on scroll; add "Load more" link for crawlers |
| **Hybrid** | ✅ | First page RSC; "Load more" button + link to `?page=2` |

**SEO-safe pattern:**
```tsx
// Render first page with links to other pages
<div>
  {photos.map(...)}
  <nav>
    <Link href={`/colecoes/${slug}?page=2`}>Página 2</Link>
    <Link href={`/colecoes/${slug}?page=3`}>Página 3</Link>
  </nav>
  {/* Optional: Load more button for client-side append */}
</div>
```

**Infinite scroll:** Load more via fetch; append to DOM. Add `<Link href="?page=2">` for crawlers (hidden or visible).

## Avoid Heavy Client JS

| Avoid | Prefer |
|-------|--------|
| Client component for entire grid | RSC grid; client only for interactive cards |
| JS for pagination | `<Link href="?page=2">` |
| Client-side image filtering | Server filter via searchParams |
| Heavy gallery lib (e.g. full lightbox) | Simple modal + `next/image` |

**Minimal client:** PhotoCard with `onClick` for modal → `"use client"` only on PhotoCard. Grid stays RSC.

## Output Format

When optimizing a gallery:

```markdown
## Gallery: [Route]
### Layout
- RSC: [yes/no]
- Client: [what]

### next/image
- sizes: [value]
- priority: [first N]
- quality: [value]

### Pagination
- Type: [server / infinite / hybrid]
- SEO: [links]

### Caching
- [Headers]

### CDN
- [URL pattern]
```

## Constraints

- Use `next/image` for all remote images
- Set `sizes` to match actual grid layout
- Never use `priority` on more than 4 images per page
- Pagination: ensure crawlers can reach pages via links
- Prefer RSC; add client boundary only for interactivity
