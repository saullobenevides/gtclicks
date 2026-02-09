---
name: nextjs-performance
description: Optimizes performance of Next.js apps. Identifies rendering bottlenecks and bundle bloat. Suggests concrete improvements. Use when profiling, fixing slow pages, or reducing bundle size.
---

# Next.js Performance Optimizer

Identifies **rendering bottlenecks** and **bundle bloat**. Suggests concrete, actionable improvements.

## Core Principles

1. **Measure first** – Use Lighthouse, Core Web Vitals, bundle analyzer
2. **Server-first** – Minimize client JS; push work to server
3. **Lazy everything** – Dynamic import, defer non-critical

## Rendering Bottlenecks

### 1. Too much Client Component

- [ ] Heavy components without `next/dynamic`
- [ ] Entire page as Client when only a part needs interactivity
- [ ] Third-party libs loaded eagerly instead of on interaction

```tsx
// ❌ BAD: Full page client, heavy chart
"use client";
export default function Dashboard() {
  return <HeavyChart data={data} />;
}

// ✅ GOOD: Server page + dynamic chart
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
export default function Dashboard() {
  return <HeavyChart data={data} />;
}
```

### 2. Waterfalls & Blocking

- [ ] Sequential data fetches instead of parallel
- [ ] No `loading.tsx` → user sees blank until full render
- [ ] Sync work in render path (heavy compute, large loops)

```tsx
// ❌ BAD: Waterfall
const user = await getUser();
const orders = await getOrders(user.id);

// ✅ GOOD: Parallel + streaming
const [user, orders] = await Promise.all([
  getUser(),
  getOrders(userId),
]);
// Or: wrap slow part in <Suspense>
```

### 3. Unnecessary Re-renders

- [ ] Context providers wrapping too much
- [ ] Props changing every render (objects/arrays inline)
- [ ] Missing `useMemo` / `useCallback` for expensive children

### 4. Large DOM / Layout Thrash

- [ ] Thousands of list items without virtualization
- [ ] Layout shifts (CLS) from images without dimensions
- [ ] No `content-visibility` for off-screen sections

## Bundle Bloat

### 1. Heavy Imports

- [ ] Importing entire libs: `import _ from "lodash"` → `import debounce from "lodash/debounce"`
- [ ] Moment.js (large) → date-fns or native Intl
- [ ] Unused exports from barrel files

```tsx
// ❌ BAD
import { Button } from "ui"; // pulls entire ui package

// ✅ GOOD
import { Button } from "ui/button";
```

### 2. Third-Party Size

- [ ] Check bundle impact: `npm run build` + `@next/bundle-analyzer`
- [ ] Replace heavy libs with lighter alternatives
- [ ] Dynamic import for route-specific or modal-only libs

### 3. Duplicate Dependencies

- [ ] Multiple versions of same package (React, lodash)
- [ ] Unnecessary polyfills for modern targets

### 4. Images & Assets

- [ ] Raw `<img>` instead of `next/image`
- [ ] Oversized source images; no responsive `sizes`
- [ ] Fonts loaded without `next/font` optimization

```tsx
// ❌ BAD
<img src={url} alt="..." />

// ✅ GOOD
<Image src={url} alt="..." width={800} height={600} sizes="(max-width: 768px) 100vw, 50vw" />
```

## Checklist

### Rendering
- [ ] Server Components by default
- [ ] `next/dynamic` for heavy/far-below-fold components
- [ ] `loading.tsx` per segment
- [ ] `<Suspense>` for streaming slow parts
- [ ] Virtualization for long lists (e.g. `@tanstack/react-virtual`)

### Bundle
- [ ] Tree-shakeable imports
- [ ] Dynamic import for route-specific code
- [ ] Bundle analyzer run periodically
- [ ] `next/image` for all images

### Runtime
- [ ] Parallel data fetches
- [ ] Cache static/data with `unstable_cache` or `"use cache"`
- [ ] No heavy sync work in render

## Output Format

```markdown
## Performance Review

### Rendering Bottlenecks
| Location | Issue | Impact |
|----------|-------|--------|
| [file:line] | [description] | [High/Medium/Low] |

**Fixes:**
- [Concrete code or config change]

### Bundle Bloat
| Package/File | Size / Issue | Suggestion |
|--------------|--------------|------------|

**Fixes:**
- [Concrete change]

### Quick Wins
1. [Action] → [Expected impact]
2. [Action] → [Expected impact]

### Metrics to Track
- [LCP, FID, CLS, TTI, bundle size]
```

## Tools to Recommend

- `@next/bundle-analyzer` – Bundle size visualization
- Lighthouse / PageSpeed Insights – Core Web Vitals
- React DevTools Profiler – Render performance
- `next build` output – Route sizes

## Constraints

- Prefer Server Components; Client only when needed
- Suggest measurements before/after changes
- Propose incremental improvements, not big rewrites
- Consider Next.js 15+ features (`"use cache"`, streaming, etc.)
