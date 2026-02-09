---
name: react-components
description: Builds reusable React components. Prefers composition over prop explosion. Uses Tailwind and shadcn/ui patterns. Optimizes for readability and reusability. Use when creating UI components, refactoring for composability, or avoiding prop drilling.
---

# React Components Specialist

Build reusable, composable React components. Prefer **composition over prop explosion**. Use **Tailwind** and **shadcn/ui** patterns.

## Core Principles

1. **Composition** – Compose small primitives instead of bloated, configurable components
2. **Readability** – Clear intent, predictable API, minimal cognitive load
3. **Reusability** – Generic enough to reuse; specific enough to be useful

## Composition over Prop Explosion

```tsx
// ❌ Prop explosion
<Card
  variant="outlined"
  padding="lg"
  shadow="md"
  rounded="xl"
  headerAlign="center"
  footerAlign="right"
  showHeader={true}
  showFooter={true}
/>

// ✅ Composition
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

## shadcn/ui Patterns

- **Compound components** – Parent + children with shared context via `Slot` or `createContext`
- **Radix primitives** – Use for accessibility (Radix UI under shadcn)
- **AsChild pattern** – `asChild` to merge props onto child element
- **Variants via `cva`** – `cva()` for type-safe style variants
- **`cn()` utility** – Merge Tailwind classes cleanly

```tsx
// Variant pattern (cva)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: { default: "bg-primary text-primary-foreground", outline: "border" },
      size: { sm: "h-8 px-3", md: "h-9 px-4", lg: "h-10 px-6" },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);
```

## Tailwind Conventions

- Use design tokens: `primary`, `muted`, `accent`, etc.
- Prefer semantic tokens over raw colors
- Extract repeated patterns into `@apply` or shared classes only when justified
- Mobile-first: base styles, then `sm:`, `md:`, `lg:`

## Component Structure

```tsx
// 1. Primitive or compound component
// 2. Clear exported API
// 3. Typed props with minimal required fields

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

Card.Header = function CardHeader({ ... }) { ... };
Card.Content = function CardContent({ ... }) { ... };
Card.Footer = function CardFooter({ ... }) { ... };
```

## Readability Checklist

- [ ] Component name reflects purpose
- [ ] Props are minimal; complex config via composition
- [ ] Children/slots over boolean flags
- [ ] Single responsibility per component
- [ ] Forward refs when wrapping native elements

## Reusability Checklist

- [ ] No business logic; only presentation
- [ ] Accepts `className` for customization
- [ ] Uses `...rest` for HTML props passthrough
- [ ] Typed with `React.ComponentProps<"element">` when wrapping
- [ ] Variants via `cva` instead of many optional props

## Output Format

When proposing a component:

```markdown
## Component: [Name]
**Purpose:** [One line]

## API (composition)
[Usage example]

## Structure
[File/export structure]

## Variants (if any)
[ cva variants ]

## Notes
[Accessibility, edge cases]
```

## Constraints

- No prop explosion (max ~5 props; prefer composition beyond that)
- Tailwind only; no inline styles or CSS modules unless necessary
- Follow shadcn/ui conventions (compound components, Radix, cva)
- Server Components by default; add `"use client"` only when needed
