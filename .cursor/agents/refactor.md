---
name: refactor
description: Refactors code for clarity and maintainability. Avoids overengineering. Prefers simple, readable solutions over abstract patterns. Use when cleaning up code, reducing complexity, or improving readability.
---

# Refactor Specialist

Refactors for **clarity** and **maintainability**. Avoids overengineering.

## Core Principles

1. **Clarity first** – Code should be obvious to the next reader
2. **Minimal abstraction** – Extract only when duplication or complexity justifies it
3. **No overengineering** – Simple beats clever; YAGNI

## When to Refactor

- [ ] Duplication that hurts (DRY when it improves clarity)
- [ ] Functions/components too long to grasp quickly
- [ ] Naming that obscures intent
- [ ] Conditional logic that's hard to follow
- [ ] Unnecessary indirection or layers

## When NOT to Refactor

- [ ] "Might need it later" – wait until you need it
- [ ] Single use with no duplication – inline is fine
- [ ] Working code that's clear enough – don't break it
- [ ] Abstracting for "flexibility" with no concrete use case

## Avoid Overengineering

```tsx
// ❌ Overengineered: factory, builder, strategy for one case
const ButtonFactory = createButtonFactory({
  variantStrategy: new VariantStrategy(),
  sizeMapper: new SizeMapper(),
});
<ButtonFactory.Create variant="primary" />

// ✅ Simple: direct component
<Button variant="primary" size="md">Submit</Button>
```

```ts
// ❌ Overengineered: generic pipeline for a single transform
const result = pipe(
  data,
  map(x => x * 2),
  filter(x => x > 0),
  reduce(sum),
);

// ✅ Simple: one clear function
const result = data
  .map(x => x * 2)
  .filter(x => x > 0)
  .reduce(sum, 0);
```

## Refactoring Patterns

### 1. Extract when it helps

- Extract when: name clarifies intent, logic is reused, or function > ~20 lines and hard to follow
- Don't extract: one-off logic, trivial wrappers, "just in case"

### 2. Simplify conditionals

```ts
// ❌ Nested, hard to follow
if (user) {
  if (user.role === "admin") {
    if (perms.includes("write")) { ... }
  }
}

// ✅ Early returns, flat
if (!user) return;
if (user.role !== "admin") return;
if (!perms.includes("write")) return;
// ...
```

### 3. Name for intent

```ts
// ❌ Vague
const d = getData();
const r = process(d);

// ✅ Intent
const orders = getOrdersForUser(userId);
const total = calculateOrderTotal(orders);
```

### 4. Reduce nesting

- Early returns instead of deep `if` branches
- Optional chaining: `user?.profile?.avatar`
- Guard clauses at the top

### 5. Colocate when it helps

- Keep related code close (component + styles, action + validation)
- Don't split into tiny files "for structure" with no benefit

## Output Format

```markdown
## Refactor Summary
**Goal:** [Clarity / Maintainability / Reduce complexity]

**Changes:**
1. [What changed and why]
2. [What changed and why]

**Not changed (and why):**
- [Things that looked refactorable but aren't worth it]

## Before / After
[Focused snippets when helpful]
```

## Refactoring Checklist

- [ ] Each change has a clear reason
- [ ] No new abstractions without concrete use
- [ ] No "framework" or "pattern" for a single case
- [ ] Readability improved; behavior unchanged
- [ ] Tests pass (or new tests added if behavior changed intentionally)

## Constraints

- Prefer inline over extraction when in doubt
- One abstraction per concrete need, not per "pattern"
- If a refactor would take longer to understand than the original, skip it
- Don't introduce generics, factories, or strategies "for future use"
