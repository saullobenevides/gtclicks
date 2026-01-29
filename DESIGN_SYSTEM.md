# Design System - GTClicks

Este documento define os tokens semânticos e padrões visuais do GTClicks, garantindo consistência em toda a plataforma.

## Visão Geral do App

O GTClicks é um marketplace de fotografia esportiva de alto impacto. O design é focado em performance, modernidade e "visibilidade de conteúdo", utilizando um tema escuro (Dark Mode) por padrão para destacar as fotografias.

---

## Paleta de Cores (Valores → Tokens)

### Texto

| Token            | Valor     | Uso                                   |
| :--------------- | :-------- | :------------------------------------ |
| `text-primary`   | `#fafafa` | Títulos e textos de alta importância  |
| `text-secondary` | `#a1a1aa` | Textos de apoio e legendas            |
| `text-muted`     | `#71717a` | Placeholders e estados desabilitados  |
| `text-on-dark`   | `#ffffff` | Texto sobre fundos escuros/pretos     |
| `text-on-brand`  | `#ffffff` | Texto sobre fundo primário (vermelho) |

### Superfícies (Fundos)

| Token              | Valor     | Uso                                    |
| :----------------- | :-------- | :------------------------------------- |
| `surface-page`     | `#000000` | Fundo principal da aplicação           |
| `surface-section`  | `#0a0a0a` | Seções alternadas ou áreas de conteúdo |
| `surface-card`     | `#0a0a0a` | Cards e elementos de interface         |
| `surface-subtle`   | `#171717` | Destacamento leve ou áreas neutras     |
| `surface-elevated` | `#1c1c1c` | Modais e elementos flutuantes          |

### Ações (Botões e Links)

| Token                   | Valor     | Uso                                    |
| :---------------------- | :-------- | :------------------------------------- |
| `action-primary`        | `#ef233c` | Botões principais e CTAs primários     |
| `action-primary-hover`  | `#d90429` | Hover do botão primário                |
| `action-primary-active` | `#b91c1c` | Estado pressionado do botão primário   |
| `action-secondary`      | `#262626` | Botões de suporte e ações neutras      |
| `action-strong`         | `#ffffff` | CTAs de conversão máxima (ex: Comprar) |
| `action-strong-hover`   | `#f4f4f5` | Hover do CTA forte                     |

### Bordas

| Token            | Valor     | Uso                                  |
| :--------------- | :-------- | :----------------------------------- |
| `border-default` | `#262626` | Bordas padrão de inputs e containers |
| `border-subtle`  | `#171717` | Linhas divisórias sutis              |
| `border-focus`   | `#ef233c` | Anéis de foco e estados ativos       |

### Status

| Token            | Valor     | Uso                        |
| :--------------- | :-------- | :------------------------- |
| `status-success` | `#22c55e` | Sucesso e confirmação      |
| `status-warning` | `#eab308` | Alertas e avisos           |
| `status-error`   | `#ef4444` | Falhas e mensagens de erro |

---

## Espaçamento

- **space-1**: 4px (`0.25rem`)
- **space-2**: 8px (`0.5rem`)
- **space-3**: 12px (`0.75rem`)
- **space-4**: 16px (`1rem`)
- **space-6**: 24px (`1.5rem`)
- **space-8**: 32px (`2rem`)
- **space-12**: 48px (`3rem`)
- **space-16**: 64px (`4rem`)
- **space-20**: 80px (`5rem`)

---

## Tipografia

### Tamanhos

- **text-xs**: 12px
- **text-sm**: 14px
- **text-base**: 16px
- **text-lg**: 18px
- **text-xl**: 20px
- **text-2xl**: 24px
- **text-3xl**: 30px
- **text-4xl**: 36px
- **text-5xl**: 48px

### Pesos

- **font-normal**: 400
- **font-medium**: 500
- **font-semibold**: 600
- **font-bold**: 700

---

## Bordas e Sombras

### Border Radius

- **radius-sm**: 6px
- **radius-md**: 8px
- **radius-lg**: 12px
- **radius-xl**: 16px
- **radius-2xl**: 24px
- **radius-full**: 9999px

### Sombras

- **shadow-sm**: Sombra sutil de profundidade mínima
- **shadow-md**: Sombra padrão para cards destacados
- **shadow-lg**: Sombra intensa para modais e popovers
- **shadow-card**: `0 8px 32px rgba(0, 0, 0, 0.4)`
- **shadow-card-hover**: `0 12px 48px rgba(0, 0, 0, 0.6)`
- **shadow-button-primary**: `0 4px 14px 0 rgba(239, 35, 60, 0.39)`

---

## Componentes Documentados

### Botões

- **Primary**: `bg-action-primary` | `text-text-on-brand` | `rounded-radius-md` | `shadow-button-primary`
- **Secondary**: `bg-surface-card` | `text-text-primary` | `border-border-default` | `rounded-radius-md`
- **Strong (CTA)**: `bg-action-strong` | `text-black` | `font-bold` | `rounded-radius-md` | `shadow-lg`

### Cards

- **Base**: `bg-surface-card` | `rounded-radius-xl` | `p-space-6` | `shadow-card`
- **Interativo**: Adiciona `hover:shadow-card-hover` | `transition-all`

### Inputs

- **Base**: `bg-surface-card` | `border-border-default` | `rounded-radius-sm` | `p-space-3`
- **Focus**: `focus:border-border-focus` | `focus:ring-1` | `focus:ring-border-focus`

---

## Regra de Ouro

**NUNCA** use valores arbitrários (ex: `16px`, `#3B82F6`). **SEMPRE** use os tokens semânticos documentados acima.
