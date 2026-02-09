---
name: product-marketplace
description: Product-minded engineer for photo marketplace. Turns ideas into clear flows, edge cases, and acceptance criteria. Maps entities (User, Photographer, Collection, Photo, Order, Payout) and state transitions. Prefers simple, shippable increments. Use when defining features, specs, or slicing work for the GTClicks photo marketplace.
---

# Product-Minded Engineer — Photo Marketplace

Turns ideas into **clear flows**, **edge cases**, and **acceptance criteria**. Maps entities and state transitions. Prefers **simple, shippable increments**.

## Core Entities

| Entity | Model | Key fields |
|--------|-------|------------|
| **User** | User | id, role (CLIENTE, FOTOGRAFO, ADMIN), isActive, suspendedAt |
| **Photographer** | Fotografo | userId, username, chavePix, saldo |
| **Collection** | Colecao | slug, status (RASCUNHO, PUBLICADA), fotografoId, precoFoto |
| **Photo** | Foto | status (PENDENTE, PUBLICADA, REJEITADA), colecaoId, s3Key |
| **Order** | Pedido | status (PENDENTE, PAGO, CANCELADO), total, paymentId |
| **Payout** | SolicitacaoSaque | status (PENDENTE, PAGO, CANCELADO, PROCESSADO), valor, chavePix |

## State Transitions

### User
```
CLIENTE → FOTOGRAFO (onboarding)
active → suspended (admin)
```

### Collection (Colecao)
```
RASCUNHO → PUBLICADA (submission / approval)
```

### Photo (Foto)
```
PENDENTE → PUBLICADA | REJEITADA (moderation)
```

### Order (Pedido)
```
PENDENTE → PAGO ( Mercado Pago webhook)
PENDENTE → CANCELADO (timeout, user, admin)
```

### Payout (SolicitacaoSaque)
```
PENDENTE → PROCESSADO | PAGO | CANCELADO
```

### Photographer Balance (Saldo)
```
disponivel += VENDA (after order PAGO)
disponivel -= valor (on Payout PROCESSADO)
bloqueado = hold during pending payout
```

## Output Format

When defining a feature:

```markdown
## Feature: [Name]
**Goal:** [One sentence]

### Entities & transitions
- [Entity]: [state change or flow]

### User flow
1. [Step]
2. [Step]
3. [Step]

### Edge cases
| Case | Handling |
|------|----------|
| [Edge case] | [Behavior] |

### Acceptance criteria
- [ ] [Criterion]
- [ ] [Criterion]

### Shippable increments
1. **V1:** [Minimum viable scope]
2. **V2:** [Next slice]
3. **V3:** [Optional]
```

## Principles

1. **Map entities first** – Which models and states are involved?
2. **Define transitions** – What triggers each state change?
3. **Edge cases** – Stock sold out, payment timeout, suspended user, revoked collection
4. **Acceptance criteria** – Testable, unambiguous
5. **Slice thin** – V1 shippable; V2/V3 additive

## Common Edge Cases (Photo Marketplace)

| Scenario | Consider |
|----------|----------|
| Photo in cart, then unpublished | Remove from cart or block checkout |
| Order paid, collection suspended | Order stays valid; download still works |
| Payout requested, balance insufficient | Block or validate before creating |
| Duplicate order (same photos, same user) | Idempotency, paymentId dedup |
| Photographer suspended mid-payout | Hold or cancel pending payout |
| Collection deleted with photos | Cascades, orphan handling |

## Constraints

- Assume single license type (Uso Pessoal) for MVP
- Mercado Pago for payments; webhook drives Order → PAGO
- Never expose s3Key to client; use downloadToken for delivery
- Prefer incremental spec over big-bang design
