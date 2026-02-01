# Revisão de Componentes (shadcn/ui MCP)

Auditoria dos componentes do projeto usando as melhores práticas do shadcn/ui e checklist de qualidade.

---

## Checklist shadcn/ui (por componente)

### ✅ Componentes já revisados

- **Header**, **Footer**, **MobileMenu**, **BottomNav** → Ver HEADER_FOOTER_REVIEW.md
- **Dashboard do fotógrafo** → Ver DASHBOARD_REVIEW.md
- **EmptyState** → Variante `dashboard` adicionada
- **LoadingState**, **ErrorState** → `role="status"`, `aria-live`, `sr-only`

### 📋 Componentes auditados

| Componente            | shadcn                      | A11y                  | Responsivo | Status            |
| --------------------- | --------------------------- | --------------------- | ---------- | ----------------- |
| HeroSection           | Button                      | focus-visible         | sm/md/lg   | ✅                |
| CTASection            | -                           | IconCard links        | grid sm:3  | ✅                |
| FAQSection            | -                           | StandardFaq Accordion | max-w-3xl  | ✅                |
| FeaturesGrid          | FeatureCard, SectionHeader  | -                     | md:3 cols  | ✅                |
| FeaturedCollections   | CollectionCard, PageSection | aria-label no card    | grid       | ✅                |
| PhotographerSpotlight | Card, Avatar, Carousel      | Carousel a11y         | -          | ⚠️ Carousel nav   |
| BuyerRanking          | Card, Avatar                | -                     | podium md  | ✅                |
| IconCard              | Card                        | Link focus            | -          | ⚠️ aria-label     |
| FeatureCard           | Card                        | -                     | -          | ⚠️ text-gray-400  |
| StandardFaq           | Accordion                   | JSON-LD               | -          | ✅                |
| CollectionCard        | Card, Badge                 | aria-label            | aspect     | ✅                |
| PhotoModalContent     | Button                      | keyboard nav          | -          | ⚠️ aria-label nav |
| ShareButton           | Dialog, Button              | -                     | -          | ⚠️ aria-label     |
| SectionHeader         | Badge                       | -                     | -          | ✅                |
| PageSection           | -                           | section               | -          | ✅                |

---

## Correções aplicadas

### 1. HeroSection

- `bg-linear-to-b` → `bg-gradient-to-b` (Tailwind padrão)
- Botões: manter focus-visible (Button já tem)

### 2. IconCard

- `focus-visible:ring-2 focus-visible:ring-primary` no Link
- `aria-label` descritivo baseado no title

### 3. FeatureCard

- `text-gray-400` → `text-muted-foreground` (design tokens)

### 4. PhotographerSpotlight

- CarouselPrevious/Next: `aria-label="Anterior"` / `aria-label="Próximo"`

### 5. PhotoModalContent

- Nav prev/next: `aria-label="Foto anterior"` / `aria-label="Próxima foto"`
- Botão fechar: `aria-label="Fechar"`

### 6. ShareButton

- DialogTrigger: `aria-label="Ver QR Code"`
- Share Button: `aria-label="Compartilhar"`

---

## Mobile (considerações)

### Touch targets (Apple HIG / WCAG 2.5.5)

- **Mínimo 44x44px** para elementos interativos (links, botões, ícones clicáveis)
- Classes: `min-h-11 min-w-11` (44px) ou `min-h-[48px]` para CTAs principais

### Safe areas

- `padding-top: max(1rem, env(safe-area-inset-top))` no header/modal
- `padding-bottom: max(1rem, env(safe-area-inset-bottom))` no bottom bar/footer
- `paddingBottom: env(safe-area-inset-bottom)` no BottomNav

### Layout responsivo

- Botões full-width em mobile (`w-full sm:w-auto`) quando apropriado
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` para adaptar
- Espaçamento: `gap-4 sm:gap-6` (menor em mobile)
- Padding: `p-4 sm:p-6` ou `px-4 sm:px-8`

### Touch feedback

- `active:scale-[0.98]` ou `active:scale-95` para feedback tátil
- `touch-manipulation` para reduzir delay de 300ms em toques

### Componentes ajustados para mobile

- **HeroSection**: safe-area top, botões full-width, min-h-[48px]
- **CTASection**: padding responsivo, grid gap menor
- **IconCard**: min-h-[140px], touch-manipulation
- **PhotoModalContent**: nav/close min 44px, bottom bar safe-area
- **StandardFaq**: AccordionTrigger min-h-[48px]
- **PhotographerSpotlight**: carousel nav min 44px, padding responsivo
- **ShareButton**: botões min 44px

---

## Padrões recomendados

1. **Links/Buttons**: Sempre `aria-label` quando o conteúdo é só ícone
2. **Cards clicáveis**: `aria-label` ou `aria-labelledby`
3. **Cores**: Usar `text-muted-foreground`, `bg-primary` (tokens) em vez de `gray-400`, etc.
4. **Focus**: `focus-visible:ring-2 focus-visible:ring-primary` em elementos interativos
5. **Touch targets**: `min-h-[44px]` em mobile (Apple HIG)
6. **Semântica**: `<section>`, `<nav>`, `<article>` com `aria-labelledby` quando aplicável

---

## componentes/ui (shadcn base)

Os arquivos em `components/ui/` são componentes base do shadcn e não devem ser modificados sem necessidade. Exceções:

- **Modal.jsx** – Verificar se é redundante com dialog.jsx
- **Badge.js** (shared) – Pode conflitar com ui/badge.jsx

---

_Documento gerado após auditoria com MCP shadcn/ui._
