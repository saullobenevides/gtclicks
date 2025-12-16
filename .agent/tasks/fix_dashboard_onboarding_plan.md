---
description: Replanejamento da Correção do Dashboard e Onboarding
---

# Estratégia de Correção: Dashboard e Onboarding (Stack Auth + Next.js SSR)

Identificamos que a abordagem anterior causou instabilidade no SSR devido à execução incorreta de hooks de cliente (`useUser`, `localStorage`) no servidor. Este plano visa restaurar a estabilidade e implementar o onboarding de forma correta.

## 1. Restauração e Limpeza (Ponto Zero)
- [ ] **Reverter `app/layout.js`:** Remover `ClientProviders`, `ClientOnly` e imports dinâmicos complexos. Voltar para uma estrutura simples com `StackProvider` (client-side wrapper).
- [ ] **Restaurar `stack/client.js`:** Garantir que a configuração do `tokenStore` esteja correta para o ambiente (cookie vs nextjs-cookie).
- [ ] **Limpar Componentes Utilitários:** Remover `components/ClientOnly.js` e `components/ClientProviders.js` se não forem mais necessários na nova arquitetura.

## 2. Isolamento da Autenticação (Client-Side Boundary)
- [ ] **Criar `components/providers/AppProviders.js`:** Um componente `'use client'` único que agrupa `StackProvider`, `UserSync` (refatorado), e `CartProvider`.
    - Isso garante que tudo dentro dele seja renderizado no contexto do cliente, protegendo o `layout.js` server-side.
- [ ] **Refatorar `UserSync` e `CartContext`:**
    - Garantir verificação rigorosa de `typeof window !== 'undefined'` antes de acessar `localStorage` ou cookies.
    - Utilizar guards (`if (!mounted) return null`) para evitar hydration mismatches.

## 3. Implementação da Página de Dashboard (`/dashboard/fotografo`)
- [ ] **Abordagem Client-First:** A página `/dashboard/fotografo/page.js` será um Server Component simples que importa um componente **`DashboardContent`** (Client Component).
- [ ] **Componente `DashboardContent`:**
    - Responsável por chamar `useUser()` e decidir o que renderizar.
    - **Estado de Loading:** Mostra spinner enquanto `user` carrega.
    - **Verificação de Perfil:** Chama API `/api/fotografos/resolve`.
    - **Decisão Lógica:**
        - Se perfil existe -> Renderiza Dashboard (Stats, etc).
        - Se perfil NÃO existe -> Renderiza **`FotografoOnboarding`**.

## 4. Validação
- [ ] **Teste de Acesso:** Acessar `/dashboard/fotografo` sem crash de servidor (Erro 500).
- [ ] **Teste de Fluxo:**
    - Verificar se usuário sem perfil vê o Wizard "Vamos criar sua identidade".
    - Preencher Wizard e criar perfil.
    - Verificar se após criação, o Dashboard completo é exibido.

## Notas Técnicas
- Evitar `stackServerApp.getUser()` em Server Components de páginas protegidas que dependem de estado dinâmico (cookies) se isso estiver causando conflito com o Turbopack/Next 16. Preferir verificar no cliente e redirecionar se necessário, ou usar middleware (futuro).
- O foco é: **Não quebrar o Build/SSR**. Se o dado precisa de cookie do browser, busque no browser.
