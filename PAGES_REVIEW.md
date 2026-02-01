# Revisão de Páginas (shadcn/ui MCP)

Auditoria das páginas do app para desktop e mobile, com base nas melhores práticas do shadcn/ui.

---

## Páginas revisadas

### Públicas

| Página                  | Desktop | Mobile | Correções                              |
| ----------------------- | ------- | ------ | -------------------------------------- |
| `/` (Home)              | ✅      | ✅     | pb-24 md:pb-0 para BottomNav           |
| `/busca`                | ✅      | ✅     | Empty state, text-muted, min-h CTA     |
| `/categorias`           | ✅      | ✅     | bg-gradient, min-h cards, aria-label   |
| `/colecoes`             | -       | -      | Redirect para /busca                   |
| `/colecoes/[slug]`      | -       | -      | Via componentes                        |
| `/fotografos`           | -       | -      | Via layout                             |
| `/fotografo/[username]` | ✅      | ✅     | bg-gradient, text-muted                |
| `/como-funciona`        | -       | -      | Via PageSection                        |
| `/faq`                  | ✅      | ✅     | px-4, CTA min-h                        |
| `/contato`              | ✅      | ✅     | grid responsivo, text-muted, form cols |

### Auth

| Página       | Desktop | Mobile | Correções          |
| ------------ | ------- | ------ | ------------------ |
| `/login`     | ✅      | ✅     | px-4, p responsivo |
| `/registrar` | -       | -      |                    |
| `/cadastro`  | -       | -      |                    |

### Carrinho / Checkout

| Página              | Desktop | Mobile | Correções                                       |
| ------------------- | ------- | ------ | ----------------------------------------------- |
| `/carrinho`         | ✅      | ✅     | px-4, grid gap, botões min-h, aria-label remove |
| `/checkout`         | ✅      | ✅     | px-4, gap, sticky lg-only                       |
| `/checkout/sucesso` | ✅      | ✅     | px-4, py responsivo                             |

### Pagamento

| Página                | Desktop | Mobile | Correções                                      |
| --------------------- | ------- | ------ | ---------------------------------------------- |
| `/pagamento/falha`    | ✅      | ✅     | container-wide, px-4, p responsivo, CTAs min-h |
| `/pagamento/pendente` | ✅      | ✅     | Idem                                           |
| `/pagamento/sucesso`  | ✅      | ✅     | Idem                                           |

### Usuário

| Página            | Desktop | Mobile | Correções           |
| ----------------- | ------- | ------ | ------------------- |
| `/meus-favoritos` | ✅      | ✅     | EmptyState com icon |
| `/meus-downloads` | ✅      | ✅     | EmptyState com icon |
| `/pedidos`        | ✅      | ✅     | px-4, CTA min-h     |
| `/pedidos/[id]`   | -       | -      |                     |

### Dashboard fotógrafo

| Página                                      | Desktop | Mobile | Correções               |
| ------------------------------------------- | ------- | ------ | ----------------------- |
| Início, Coleções, Fotos, Financeiro, Perfil | ✅      | ✅     | Ver DASHBOARD_REVIEW.md |

---

## Padrões aplicados

### Desktop

- `container-wide` ou `container` com padding consistente
- Grid responsivo: `grid-cols-1 lg:grid-cols-2` ou similar
- Gap: `gap-8 sm:gap-12`
- Cards com `glass-panel`, `border-white/10`

### Mobile

- **Touch targets**: `min-h-[48px]` ou `min-h-11 min-w-11` em botões
- **Padding**: `px-4` em páginas que usam container-wide
- **Grid**: `grid-cols-1` em mobile, `sm:grid-cols-2` em tablet
- **Forms**: `grid-cols-1 sm:grid-cols-2` para campos lado a lado
- **CTAs**: `w-full sm:w-auto` quando apropriado

### Consistência

- `text-gray-400` → `text-muted-foreground`
- `bg-linear-to-*` → `bg-gradient-to-*` (Tailwind padrão)
- EmptyState com `icon` quando disponível
- `aria-label` em botões icon-only

---

## Páginas pendentes (Admin, etc.)

- **Admin** (`/admin/*`): layout específico, cards glass-panel
- **Termos, Privacidade**: páginas estáticas com container
- **Handler** (Stack Auth): componente externo
- **Showcase**: página de demonstração

---

_Documento gerado após auditoria com MCP shadcn/ui._
