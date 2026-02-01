# Revisão do Header e Footer (shadcn/ui)

Revisão aplicada ao **Header**, **Footer** e **BottomNav** (desktop e mobile) usando as melhores práticas do shadcn/ui e padrões de UX/UI.

---

## Alterações aplicadas

### 1. **Header** (`components/layout/Header.jsx`)

#### Desktop
- **Semântica**: `role="banner"`, `<nav aria-label="Navegação principal">`.
- **Logo**: `aria-label="GTClicks - Ir para página inicial"`, `focus-visible:ring-2 focus-visible:ring-primary`.
- **Nav pills**: `aria-current="page"` no item ativo, `min-h-[40px]` para área de toque.
- **Botões de ação**: `aria-label` descritivo em Search, Heart, Cart (incluindo contagem de itens quando > 0).
- **Cart badge**: `aria-hidden` no badge (conteúdo duplicado em aria-label do botão).
- **Separator**: componente `Separator` shadcn entre Cart e User.
- **Mobile toggle**: `Button` shadcn com `aria-expanded`, `aria-controls="mobile-menu"`, `aria-label="Abrir menu"`, `h-11 w-11` (área de toque ~44px).
- **Transição**: `duration-300 ease-out`, backdrop `bg-surface-page/95`.
- **Altura**: `h-16 md:h-[76px]` (64px mobile, 76px desktop).

#### Estilos
- Nav pills: `bg-black/40 backdrop-blur-md border-white/10`.
- Item ativo: `bg-white text-black font-semibold`.
- Item inativo: `text-muted-foreground hover:text-white hover:bg-white/10`.

---

### 2. **MobileMenu** (`components/layout/MobileMenu.jsx`)

#### Migração para Sheet (shadcn)
- Uso do componente **Sheet** em vez de overlay customizado.
- `SheetContent` com `side="right"`, `w-[85%] max-w-sm`.
- Botão fechar padrão do Sheet oculto (`[&>button]:hidden`), header customizado mantido.
- `aria-describedby={undefined}` para evitar avisos de a11y.

#### A11y
- `SheetHeader` com `SheetTitle` em sr-only para leitores de tela.
- `nav aria-label="Links do menu"`.
- Links com `aria-current="page"`, `min-h-[48px]` (área de toque).
- Botão fechar com `aria-label="Fechar menu"`.
- Input de busca com `Input` shadcn, `autoComplete="off"`.

#### Layout
- `Input` shadcn para o campo de busca.
- `Separator` entre nav e "Meus Favoritos".
- Estilos alinhados ao tema escuro: `bg-black/40 border-white/10`.

---

### 3. **Footer** (`components/layout/Footer.jsx`)

#### Estrutura
- `role="contentinfo"` no `<footer>`.
- Componente auxiliar `FooterSection` com `aria-labelledby` e IDs únicos (`footer-plataforma`, `footer-fotografos`, `footer-suporte`).
- `Separator` shadcn na divisão antes do copyright.

#### Links
- Links com `min-h-[44px]` em mobile para área de toque.
- `py-2` em mobile, `md:py-1` em desktop.

#### Redes sociais
- Array `socialLinks` com `label` e `icon` para `aria-label`.
- `role="group" aria-label="Redes sociais"`.
- Cada ícone com `aria-label` (Instagram, YouTube, Twitter, TikTok).
- `min-h-[44px] min-w-[44px]` em mobile.

#### Copyright
- Layout flex responsivo: coluna em mobile, linha em desktop.
- `order` para reordenar em mobile.

#### Estilos
- `bg-black/40 backdrop-blur-sm border-white/10`.
- Espaçamento `py-12 md:py-16`.

---

### 4. **BottomNav** (`components/mobile/BottomNav.jsx`)

#### A11y
- `aria-label="Navegação móvel"`.
- Cada link com `aria-current="page"` quando ativo.
- `aria-label` dinâmico no Carrinho: inclui contagem quando > 0.
- `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset`.
- Badge com `aria-hidden`.

#### UX
- `h-16 min-h-[64px]` (área de toque adequada).
- Badge do carrinho: `min-w-[18px] h-[18px]`, `border-2 border-black`.
- `truncate max-w-full` no label para evitar overflow.
- Removido indicador de barra no topo (simplificação visual).

#### Estilos
- `bg-black/95 backdrop-blur-xl border-white/10`.
- `paddingBottom: env(safe-area-inset-bottom)` para dispositivos com notch.

---

### 5. **Layout** (`app/layout.js`)

- `main` com `pt-16 pb-24 md:pt-[76px] md:pb-0` para alinhar ao Header (64px mobile, 76px desktop) e espaço para BottomNav (64px).

---

## Checklist shadcn/ui

- [x] Separator component para divisores.
- [x] Sheet component para menu mobile (melhor a11y e animações).
- [x] Input component no campo de busca mobile.
- [x] Button component no toggle mobile (em vez de `<button>`).
- [x] aria-labels em ícones e ações.
- [x] aria-current nos links ativos.
- [x] role="banner", role="contentinfo", aria-labelledby.
- [x] focus-visible para navegação por teclado.
- [x] min-h-[44px] / min-h-[48px] para áreas de toque (Apple HIG, WCAG).
- [x] safe-area-inset-bottom no BottomNav.

---

_Documento gerado após revisão com MCP shadcn/ui e padrões de UX/UI._
