---
name: nextjs-data-fetching
description: Expert in Next.js data fetching patterns. Prefers server components when possible. Optimizes caching and reduces waterfalls. Uses modern Next.js best practices. Use when designing data flows, fixing performance issues, or implementing fetch strategies.
---

# Next.js Data Fetching Expert

Expert in Next.js data fetching. Prefer **Server Components** by default. Optimize **caching** and eliminate **waterfalls**.

## Core Principles

1. **Server-first** – Fetch on the server unless interactivity requires client
2. **Minimize waterfalls** – Parallel fetches, colocate data with consumption
3. **Cache wisely** – Default to cache; opt out with `dynamic` only when needed

## Server vs Client Fetching

| Scenario | Prefer | Reason |
|----------|--------|--------|
| Initial page load | Server Component | No JS, faster TTFB, SEO |
| User-triggered (search, filter) | Client + `use()` / SWR / React Query | Requires interactivity |
| Layout data | Server, in `layout.tsx` | Shared across segments |
| Real-time | Client + WebSocket / polling | Needs live updates |

## Eliminating Waterfalls

```tsx
// ❌ Waterfall: parent waits → child waits
async function Page() {
  const user = await getUser();        // 1. wait
  return <Profile userId={user.id} />; // 2. then Profile fetches
}

// ✅ Parallel: start both early
async function Page() {
  const userPromise = getUser();
  const postsPromise = getPosts();
  const [user, posts] = await Promise.all([userPromise, postsPromise]);
  return <Profile user={user} posts={posts} />;
}
```

- **Colocate fetches** – Fetch in the component that renders the data
- **Eager parallel** – `Promise.all` or start promises before `await`
- **Streaming** – Wrap slow parts in `<Suspense>` so fast content renders first

## Caching Strategy

| Method | Use case |
|--------|----------|
| **Fetch (default)** | GET requests cached; `revalidate` / `cache` options |
| **`fetch()`** | `cache: 'force-cache'` (default) or `cache: 'no-store'` |
| **`unstable_cache`** | Wrap any async (DB, SDK) for caching |
| **`"use cache"`** | Cache functions or components (Next.js 15+) |
| **`revalidatePath` / `revalidateTag`** | Invalidate after mutations |

```tsx
// Cache wrapper for non-fetch (e.g. Prisma)
import { unstable_cache } from 'next/cache';

const getCachedCollections = unstable_cache(
  async () => prisma.collection.findMany(),
  ['collections'],
  { revalidate: 60, tags: ['collections'] }
);
```

## Modern Patterns (Next.js 15+)

- **`loading.tsx`** – Per-segment loading UI
- **`error.tsx`** – Per-segment error boundary
- **`<Suspense>`** – Stream partial content; avoid blocking entire page
- **`use()`** – Unwrap promises in Client Components (React 19)
- **`preload()`** – Start fetch before component mounts
- **Parallel routes** – `@modal`, `@sidebar` for independent data streams

## Streaming Pattern

```tsx
// Fast shell + slow content streamed
export default function Page() {
  return (
    <>
      <Header />           {/* Renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowData />       {/* Streams when ready */}
      </Suspense>
    </>
  );
}
```

## Checklist

- [ ] Server Component for initial data when possible
- [ ] No sequential awaits when data can be fetched in parallel
- [ ] `loading.tsx` for segment-level loading
- [ ] Cache DB/SDK calls with `unstable_cache` or `"use cache"`
- [ ] Invalidate with `revalidateTag` after mutations
- [ ] `<Suspense>` for slow parts; don't block full page

## Output Format

When proposing a data strategy:

```markdown
## Data flow
[Who fetches what, where]

## Parallelization
[How to avoid waterfalls]

## Caching
- [What to cache, TTL, tags]
- [Invalidation strategy]

## Components
- Server: [list]
- Client: [list + reason]

## Edge cases
[Loading, error, empty states]
```

## Constraints

- Prefer Server Components; add `"use client"` only when necessary
- No `useEffect` for initial fetch in Server Components
- Use `fetch` options or `unstable_cache` — avoid ad-hoc caching
- Document cache keys and tags for invalidation
