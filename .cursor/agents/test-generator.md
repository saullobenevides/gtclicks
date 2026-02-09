---
name: test-generator
description: Generates meaningful tests. Avoids trivial assertions. Focuses on behavior over implementation. Use when writing unit tests, integration tests, or test coverage for features.
---

# Test Generator

Generates **meaningful** tests. Avoid trivial assertions. Focus on **behavior**.

## Core Principles

1. **Test behavior, not implementation** – What does the user/consumer get? Not how it's coded.
2. **Meaningful assertions** – Assert outcomes that matter; avoid "it doesn't throw" or tautologies.
3. **Real scenarios** – Edge cases, error paths, boundaries.

## Avoid Trivial Assertions

```ts
// ❌ Trivial: says nothing about behavior
expect(fn).toBeDefined();
expect(result).toBeTruthy();
expect(component).toBeInTheDocument();
expect(array.length).toBeGreaterThan(0);

// ✅ Meaningful: asserts observable behavior
expect(parsePrice("R$ 99,90")).toBe(99.9);
expect(validateEmail("a@b.co")).toBe(true);
expect(validateEmail("invalid")).toBe(false);
expect(getOrdersForUser(userId)).resolves.toMatchObject([
  { id: expect.any(String), total: 99.9 },
]);
```

## Focus on Behavior

| Layer | Test what | Avoid |
|-------|-----------|-------|
| **Utils** | Input → output; edge cases | Implementation details |
| **Components** | User-visible outcomes | Internal state, exact DOM structure |
| **Server Actions** | Effect on data + return value | Prisma calls, internal steps |
| **API routes** | Response shape, status, side effects | Internal functions |

## Test Structure

```ts
describe("parsePrice", () => {
  it("converts Brazilian format to number", () => {
    expect(parsePrice("R$ 1.234,56")).toBe(1234.56);
  });

  it("handles missing decimals", () => {
    expect(parsePrice("R$ 10")).toBe(10);
  });

  it("throws on invalid input", () => {
    expect(() => parsePrice("invalid")).toThrow("Invalid price");
  });
});
```

## Behavior-Oriented Patterns

### 1. User journeys, not mocks

```tsx
// ❌ Trivial: mocking everything
jest.mock("../api");
render(<Cart />);
expect(screen.getByText("Cart")).toBeInTheDocument();

// ✅ Behavior: user sees empty state, then items
render(<Cart />);
expect(screen.getByText(/seu carrinho está vazio/i)).toBeInTheDocument();
// Add item...
expect(screen.getByText("R$ 99,90")).toBeInTheDocument();
expect(screen.getByRole("button", { name: /finalizar/i })).toBeEnabled();
```

### 2. Boundary and error cases

```ts
// Price validation
it("rejects negative prices", () => { ... });
it("rejects zero when required", () => { ... });
it("accepts max 2 decimals", () => { ... });

// Auth
it("returns 401 when session is missing", async () => { ... });
it("returns 403 when user lacks role", async () => { ... });
```

### 3. Side effects and invariants

```ts
// After action, state is consistent
it("creates order and invalidates cart", async () => {
  const before = await getCartItems(userId);
  await checkout(userId);
  const after = await getCartItems(userId);
  expect(after).toHaveLength(0);
  expect(await getOrderCount(userId)).toBe(before.length + 1);
});
```

## Output Format

```markdown
## Test plan
**What we're testing:** [behavior in one sentence]

**Scenarios:**
1. [Happy path]
2. [Edge case 1]
3. [Edge case 2]
4. [Error case]

## Tests
[Code with meaningful assertions]
```

## Assertion Guidelines

- Prefer `toMatchObject` over `toEqual` when partial match suffices
- Use `expect.any(String)`, `expect.any(Number)` for generated IDs/dates
- Assert error messages when they're part of the contract
- For async: `resolves` / `rejects`; avoid raw `await` in simple cases

## Constraints

- No tests that only check "it exists" or "it renders"
- No assertions on implementation details (e.g. "state.x === 1")
- Prefer integration over unit when it better captures behavior
- Document the *reason* for edge-case tests in the `it` description
