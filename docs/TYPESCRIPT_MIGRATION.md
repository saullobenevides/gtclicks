# Migração para TypeScript

## Status Atual

A migração da camada `lib/` e configuração está **concluída**. O projeto compila com TypeScript e o build passa com sucesso.

## O que foi feito

### 1. Configuração base

- **tsconfig.json** com:
  - `allowJs: true` — permite JS durante a migração
  - `noImplicitAny: false` — reduz erros em código legado
  - `paths: { "@/*": ["./*"] }` — aliases
  - `exclude: ["node_modules", "__tests__"]` — testes excluídos da checagem
- **types/index.d.ts** — declarações para componentes UI (Button, Card, Separator, Badge, Dialog, Tabs) e layout (PageBreadcrumbs, PageSection, SectionHeader, ResponsiveGrid, BackButton, ImageWithFallback, StandardFaq, states, PhotoCard, ActionButton)

### 2. lib/ migrado para TypeScript

| Arquivo                                                 | Status          |
| ------------------------------------------------------- | --------------- |
| `lib/utils.js` → `lib/utils.ts`                         | ✅              |
| `lib/utils/formatters.js` → `lib/utils/formatters.ts`   | ✅              |
| `lib/utils/serialization.ts`                            | ✅ (já existia) |
| `lib/cache.ts`                                          | ✅              |
| `lib/prisma.ts`                                         | ✅              |
| `lib/auth.ts`                                           | ✅              |
| `lib/config.ts`                                         | ✅              |
| `lib/constants.ts`                                      | ✅              |
| `lib/serialization.ts`                                  | ✅              |
| `lib/admin/permissions.js` → `lib/admin/permissions.ts` | ✅              |
| `lib/mappers/collectionMapper.js` → `.ts`               | ✅              |
| `lib/mappers/photographerMapper.js` → `.ts`             | ✅              |
| `lib/mappers/photoMapper.js` → `.ts`                    | ✅              |
| `lib/data/marketplace.js` → `lib/data/marketplace.ts`   | ✅              |
| `lib/logger.js` → `lib/logger.ts`                       | ✅              |
| `lib/slug.js` → `lib/slug.ts`                           | ✅              |
| `lib/design-tokens.js` → `lib/design-tokens.ts`         | ✅              |
| `lib/validations.js` → `lib/validations.ts`             | ✅              |

### 3. config/ migrado

| Arquivo                             | Status |
| ----------------------------------- | ------ |
| `config/site.js` → `config/site.ts` | ✅     |

### 4. app/ parcialmente migrado

| Arquivo                                           | Status |
| ------------------------------------------------- | ------ |
| `app/(site)/checkout/page.tsx`                    | ✅     |
| `app/(site)/pedidos/page.tsx`                     | ✅     |
| `app/(site)/pedidos/[id]/page.tsx`                | ✅     |
| `app/(site)/contato/page.tsx`                     | ✅     |
| `app/(site)/como-funciona/page.tsx`               | ✅     |
| `app/(site)/categorias/page.tsx`                  | ✅     |
| `app/(site)/carrinho/page.tsx`                    | ✅     |
| `app/(site)/checkout/sucesso/page.tsx`            | ✅     |
| `app/(site)/login/page.tsx`                       | ✅     |
| `app/(site)/registrar/page.tsx`                   | ✅     |
| `app/(site)/cadastro/page.tsx`                    | ✅     |
| `app/(site)/meus-downloads/page.tsx`              | ✅     |
| `app/(site)/meus-favoritos/page.tsx`              | ✅     |
| `app/(site)/pagamento/falha/page.tsx`             | ✅     |
| `app/(site)/pagamento/pendente/page.tsx`          | ✅     |
| `app/(site)/pagamento/sucesso/page.tsx`           | ✅     |
| `app/(site)/showcase/page.tsx`                    | ✅     |
| `app/(site)/page.tsx`                             | ✅     |
| `app/(site)/busca/page.tsx`                       | ✅     |
| `app/(site)/colecoes/page.tsx`                    | ✅     |
| `app/(site)/colecoes/[slug]/page.tsx`             | ✅     |
| `app/(site)/faq/page.tsx`                         | ✅     |
| `app/(site)/privacidade/page.tsx`                 | ✅     |
| `app/(site)/termos/page.tsx`                      | ✅     |
| `app/(site)/fotografos/page.tsx`                  | ✅     |
| `app/(site)/fotografo/[username]/page.tsx`        | ✅     |
| `app/(site)/handler/[...stack]/page.tsx`          | ✅     |
| `app/api/admin/collections/[id]/approve/route.ts` | ✅     |

### 4.1 app/(site) — componentes de conteúdo migrados

| Componente                                                 | Status |
| ---------------------------------------------------------- | ------ |
| `HomeContent.tsx`                                          | ✅     |
| `HomeSkeleton.tsx`                                         | ✅     |
| `busca/BuscaResults.tsx`                                   | ✅     |
| `busca/BuscaResultsSkeleton.tsx`                           | ✅     |
| `fotografos/FotografosResults.tsx`                         | ✅     |
| `fotografos/FotografosResultsSkeleton.tsx`                 | ✅     |
| `fotografo/[username]/PhotographerCollections.tsx`         | ✅     |
| `fotografo/[username]/PhotographerCollectionsSkeleton.tsx` | ✅     |
| `colecoes/[slug]/CollectionRelated.tsx`                    | ✅     |
| `colecoes/[slug]/CollectionRelatedSkeleton.tsx`            | ✅     |
| `pedidos/PedidosContent.tsx`                               | ✅     |
| `pedidos/PedidosListSkeleton.tsx`                          | ✅     |
| `pedidos/[id]/PedidoDetailContent.tsx`                     | ✅     |
| `pedidos/[id]/PedidoDetailSkeleton.tsx`                    | ✅     |

### 5. actions/ — já em TypeScript

Todas as 11 actions estão em `.ts`.

### 6. Correções aplicadas

- `requireAdmin()` — obtém usuário do Stack Auth quando chamado sem argumentos
- `logAdminActivity` — usa console (AdminActivityLog não existe no schema)
- `lib/auth.ts` — type assertion para CurrentServerUser do Stack
- `lib/utils/serialization.ts` — cast via `unknown` para Decimal
- `checkout/page.tsx` — interface `OrderApiResponse`, tipos para componentes UI
- `z.record(z.string(), z.unknown())` — Zod v4 exige key + value em record

### 7. APIs migradas (completo)

| Rota                                                               | Status              |
| ------------------------------------------------------------------ | ------------------- |
| licencas, log, config/public                                       | ✅                  |
| admin/\* (check, audit, stats, orders, saques, etc)                | ✅                  |
| analytics/track                                                    | ✅                  |
| carrinho, carrinho/item, carrinho/sync                             | ✅                  |
| auth/sync, auth/code/send                                          | ✅                  |
| users/me, users/sync, users/me/dashboard, users/me/likes           | ✅                  |
| meus-downloads, fotos, fotos/batch, fotos/metrics                  | ✅                  |
| photos/[id]/like, photos/process                                   | ✅                  |
| pedidos, pedidos/[id], pedidos/[id]/pagamento, verificar-pagamento | ✅                  |
| colecoes, colecoes/[id], colecoes/[id]/folders, create-draft       | ✅                  |
| folders, folders/[id]                                              | ✅                  |
| fotografos/create, onboarding, update, resolve, fotos              | ✅                  |
| fotografos/pix, saques, financeiro                                 | ✅                  |
| fotografos/by-username/[username]/fotos                            | ✅                  |
| download/[token], upload, images/[key]                             | ✅                  |
| mercadopago/create-preference, webhooks/mercadopago                | ✅                  |
| checkout/process                                                   | ✅                  |

### 8. App-level migrado

| Arquivo                                         | Status |
| ----------------------------------------------- | ------ |
| app/layout.tsx                                  | ✅     |
| app/loading.tsx                                 | ✅     |
| app/not-found.tsx                               | ✅     |
| app/error.tsx                                   | ✅     |
| app/robots.ts                                   | ✅     |
| app/sitemap.ts                                  | ✅     |
| app/(site)/layout.tsx                           | ✅     |
| app/(dashboard)/layout.tsx                      | ✅     |
| app/(dashboard)/admin/layout.tsx                | ✅     |
| app/(dashboard)/dashboard/fotografo/layout.tsx  | ✅     |
| app/(dashboard)/dashboard/fotografo/loading.tsx | ✅     |

### 9. Dashboard e Admin migrados (17 páginas)

| Página                                                              | Status |
| ------------------------------------------------------------------- | ------ |
| `app/(dashboard)/dashboard/page.tsx`                                | ✅     |
| `app/(dashboard)/dashboard/fotografo/page.tsx`                      | ✅     |
| `app/(dashboard)/dashboard/fotografo/colecoes/page.tsx`             | ✅     |
| `app/(dashboard)/dashboard/fotografo/colecoes/[id]/editar/page.tsx` | ✅     |
| `app/(dashboard)/dashboard/fotografo/colecoes/nova/page.tsx`        | ✅     |
| `app/(dashboard)/dashboard/fotografo/fotos/page.tsx`                | ✅     |
| `app/(dashboard)/dashboard/fotografo/financeiro/page.tsx`           | ✅     |
| `app/(dashboard)/dashboard/fotografo/onboarding/page.tsx`           | ✅     |
| `app/(dashboard)/dashboard/fotografo/perfil/page.tsx`               | ✅     |
| `app/(dashboard)/admin/page.tsx`                                    | ✅     |
| `app/(dashboard)/admin/colecoes/page.tsx`                           | ✅     |
| `app/(dashboard)/admin/saques/page.tsx`                             | ✅     |
| `app/(dashboard)/admin/usuarios/page.tsx`                           | ✅     |
| `app/(dashboard)/admin/usuarios/[id]/page.tsx`                      | ✅     |
| `app/(dashboard)/admin/pedidos/page.tsx`                            | ✅     |
| `app/(dashboard)/admin/financeiro/page.tsx`                         | ✅     |
| `app/(dashboard)/admin/configuracoes/page.tsx`                      | ✅     |

**Notas:** PedidoStatus usa `PAGO` (não APPROVED). Declarações em `types/index.d.ts` para Table, Alert, Input, Label, StatsCard, AppPagination, SortableTableHead, FotografoOnboarding.

### 10. Componentes migrados (primeira leva)

| Componente                          | Status |
| ----------------------------------- | ------ |
| `ClientOnly.tsx`                    | ✅     |
| `ClientProviders.tsx`               | ✅     |
| `shared/BackButton.tsx`             | ✅     |
| `shared/ImageWithFallback.tsx`      | ✅     |
| `shared/StandardFaq.tsx`            | ✅     |
| `shared/states/EmptyState.tsx`      | ✅     |
| `shared/states/ErrorState.tsx`      | ✅     |
| `shared/states/LoadingState.tsx`    | ✅     |
| `shared/SortableTableHead.tsx`      | ✅     |
| `shared/AppPagination.tsx`          | ✅     |
| `shared/layout/PageSection.tsx`     | ✅     |
| `shared/layout/PageBreadcrumbs.tsx` | ✅     |
| `shared/layout/PageHeader.tsx`      | ✅     |
| `shared/layout/PageContainer.tsx`   | ✅     |
| `shared/layout/SectionHeader.tsx`   | ✅     |
| `shared/layout/ResponsiveGrid.tsx`  | ✅     |
| `shared/Breadcrumbs.tsx`            | ✅     |
| `shared/ExpandableDescription.tsx`  | ✅     |
| `shared/actions/ShareButton.tsx`    | ✅     |
| `shared/actions/ActionButton.tsx`   | ✅     |
| `admin/StatsCard.tsx`               | ✅     |

**Declarações:** Accordion, Pagination, Alert, Dialog (overlayClassName). StackTheme: `@ts-expect-error` para prop `appearance`.

### 11. Componentes migrados (terceira leva – Layout e shared)

| Componente                        | Status |
| --------------------------------- | ------ |
| `layout/Footer.tsx`               | ✅     |
| `layout/DashboardFooter.tsx`      | ✅     |
| `layout/DashboardHeader.tsx`      | ✅     |
| `layout/DashboardLayout.tsx`      | ✅     |
| `layout/Header.tsx`               | ✅     |
| `layout/MobileMenu.tsx`           | ✅     |
| `layout/NavUserActions.tsx`       | ✅     |
| `layout/NavigationController.tsx` | ✅     |
| `shared/Skeletons.tsx`            | ✅     |
| `shared/cards/IconCard.tsx`       | ✅     |
| `shared/cards/FeatureCard.tsx`    | ✅     |

**Declarações novas:** Sheet (SheetContent, SheetHeader, SheetTitle), DropdownMenu (DropdownMenuContent, DropdownMenuItem com asChild).

**Correções nesta leva:**

- `NavUserActions`: `alt={user.displayName ?? undefined}` (AvatarImage não aceita `null`)
- `getInitials`: aceita `string | null | undefined`
- `FooterSectionProps.links`: `readonly FooterLink[]` por causa do `as const` em siteConfig

### 12. Componentes migrados (quarta leva – Home)

| Componente                       | Status |
| -------------------------------- | ------ |
| `home/HeroSection.tsx`           | ✅     |
| `home/BuyerRanking.tsx`          | ✅     |
| `home/FAQSection.tsx`            | ✅     |
| `home/CTASection.tsx`            | ✅     |
| `home/PhotographerSpotlight.tsx` | ✅     |
| `home/FeaturedCollections.tsx`   | ✅     |
| `home/FeaturesGrid.tsx`          | ✅     |

**Declarações novas:** Carousel (CarouselContent, CarouselItem, CarouselPrevious, CarouselNext), CollectionCard em shared/cards.

**Tipos:** BuyerRanking (Buyer, LastMonthWinner), CTASection (CTALink), PhotographerSpotlight (Photographer), FeaturedCollections (collections), FeaturesGrid (Highlight).

### 13. Componentes migrados (quinta leva – Checkout e Pedidos)

| Componente                          | Status |
| ----------------------------------- | ------ |
| `checkout/PaymentBrick.tsx`         | ✅     |
| `checkout/CheckoutSteps.tsx`        | ✅     |
| `pedidos/PendingPaymentDisplay.tsx` | ✅     |
| `pedidos/RetryPaymentButton.tsx`    | ✅     |

**Notas:** PaymentBrick usa `as any` para initialization, customization e callbacks devido a tipos rígidos do SDK Mercado Pago. Props Payer (email, firstName, lastName), PaymentResult exportado. Checkout page: handlePaymentResult aceita `error?: unknown`.

### 14. Componentes migrados (sexta leva – Shared)

| Componente                             | Status |
| -------------------------------------- | ------ |
| `shared/cards/CollectionCard.tsx`      | ✅     |
| `shared/cards/PhotoCard.tsx`           | ✅     |
| `shared/actions/LikeButton.tsx`        | ✅     |
| `shared/PWAInstallBanner.tsx`          | ✅     |
| `shared/ServiceWorkerRegistration.tsx` | ✅     |

**Tipos:** CollectionCard (Collection, CollectionBadge), PhotoCard (Photo, PhotoCardProps), LikeButton (LikeButtonProps), PWAInstallBanner (BeforeInstallPromptEvent).

**Declarações:** SelectionContext em `@/features/collections/context/SelectionContext` (selectedIds, toggleSelection).

### 15. Componentes migrados (sétima leva – Providers e UserSync)

| Componente                           | Status |
| ------------------------------------ | ------ |
| `providers/AppProviders.tsx`         | ✅     |
| `providers/PhotoModalProvider.tsx`   | ✅     |
| `providers/ToastProvider.tsx`        | ✅     |
| `providers/LazyClientComponents.tsx` | ✅     |
| `UserSync.tsx`                       | ✅     |

**Tipos:** PhotoModalProvider (Photo, PhotoModalContextValue), AppProviders (children), UserSync (useUser com `or: "return-null"`).

**Declarações:** DialogOverlay, DialogContent aria-describedby, PhotoModalContent.

**Notas:** StackTheme usa `@ts-expect-error` para prop `appearance` (não na tipagem do SDK).

### 16. Componentes migrados (oitava leva – Photo, Notifications, Analytics, Badge)

| Componente                           | Status |
| ------------------------------------ | ------ |
| `photo/PhotoModalContent.tsx`        | ✅     |
| `notifications/NotificationBell.tsx` | ✅     |
| `analytics/ViewTracker.tsx`          | ✅     |
| `shared/Badge.tsx`                   | ✅     |

**Tipos:** PhotoModalContent (Photo, PhotoModalContentProps), NotificationBell (Notification), ViewTracker (ViewTrackerProps), Badge (BadgeVariant, BadgeSize, BadgeProps).

**Declarações:** Popover (Popover, PopoverTrigger, PopoverContent).

### 17. Componentes migrados (nona leva – Dashboard, Search, Mobile, Admin)

| Componente                              | Status |
| --------------------------------------- | ------ |
| `dashboard/EventPerformance.tsx`        | ✅     |
| `dashboard/PhotographerProfileForm.tsx` | ✅     |
| `dashboard/ClientDashboard.tsx`         | ✅     |
| `search/SelfieSearch.tsx`               | ✅     |
| `mobile/BottomNav.tsx`                  | ✅     |
| `admin/AdminSidebar.tsx`                | ✅     |

**Tipos:** EventPerformance (MetricCardProps, PhotoRanking, EventMetrics), PhotographerProfileForm (Photographer, VisibilitySettings), ClientDashboard (user), SelfieSearch (PhotoResult), BottomNav (navItems), AdminSidebar (navItems).

**Declarações:** Checkbox, Textarea, Label (htmlFor).

### 18. Componentes migrados (décima leva – Pedidos)

| Componente                          | Status |
| ----------------------------------- | ------ |
| `pedidos/PaymentStatusChecker.tsx`  | ✅     |

**Tipos:** PaymentStatusCheckerProps com `orderId: string`, `initialStatus: string`.

## Próximos passos (Fase 4+)

1. ~~**Migrar checkout/process**~~ — ✅ Concluído
2. **Migrar componentes restantes** — `components/ui/*.jsx` (shadcn), `PaymentStatusChecker` ✅, index.js ✅
3. **Migrar lib restante** — mail, mercadopago-webhook, s3-delete, s3-download, metrics, db, etc. (mercadopago.ts, s3-client.ts ✅)
4. **Reativar `noImplicitAny`** — após migração principal

### Migração desta sessão (Fase 4 — continuação)

| Arquivo                                                | Status |
| ------------------------------------------------------ | ------ |
| `app/api/checkout/process/route.js` → `route.ts`      | ✅     |
| `components/pedidos/PaymentStatusChecker.js` → `.tsx` | ✅     |
| `components/shared/actions/index.js` → `index.ts`     | ✅     |
| `components/shared/cards/index.js` → `index.ts`      | ✅     |
| `components/shared/layout/index.js` → `index.ts`      | ✅     |
| `lib/mercadopago.js` → `lib/mercadopago.ts`           | ✅     |
| `lib/s3-client.js` → `lib/s3-client.ts`               | ✅     |
| `proxy.ts` — correção `request.ip` → `x-real-ip`      | ✅     |

## Comandos úteis

```bash
# Verificar tipos sem build
npx tsc --noEmit

# Build (inclui checagem TypeScript)
npm run build
```

## Notas

- Next.js 16 usa `params` como `Promise` em rotas dinâmicas — use `await context.params`
- O schema Prisma (`ColecaoStatus`) tem apenas `RASCUNHO` e `PUBLICADA`
- Componentes UI em `.jsx` têm declarações em `types/index.d.ts` para compatibilidade
