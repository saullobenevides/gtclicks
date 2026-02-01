# Fluxo de Auth e Cadastro

Documentação das rotas de autenticação, registro e onboarding do GTClicks.

---

## Cadastro vs Registrar

| Rota             | Uso                           | Comportamento                                                                                                                                                                                                        |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`/cadastro`**  | Entrada “quero ser fotógrafo” | Redireciona para **`/como-funciona`**. Usado no footer (“Começar a Vender”) e no menu (“Seja Fotógrafo”). O usuário vê primeiro a explicação e depois o CTA para registrar com callback para onboarding.             |
| **`/registrar`** | Criar conta genérica          | Página de **SignUp** (Stack). Usado no header (“Criar Conta”) e quando se quer apenas criar conta (ex.: comprador). Aceita `callbackUrl` para redirecionar após o registro (ex.: `/dashboard/fotografo/onboarding`). |

- **Login:** `/login` – SignIn (Stack). Aceita `callbackUrl`; internamente o app converte para `after_auth_return_to` para o Stack.
- Em todo o app, use **`callbackUrl`** como parâmetro de retorno pós-auth (ex.: `/login?callbackUrl=/checkout`).

---

## Onboarding do fotógrafo (fluxo único)

O onboarding **inicial** do fotógrafo é um fluxo único:

1. **Página:** `app/dashboard/fotografo/onboarding/page.js`
2. **Componente:** `features/photographer/components/FotografoOnboarding.js`
3. **API:** **POST `/api/fotografos/create`**

O wizard tem 3 passos: Identidade (nome, username), Contato & Local (cidade, estado, etc.), Financeiro (chave Pix). Ao concluir, o componente redireciona para `/dashboard/fotografo`.

- **POST `/api/fotografos/create`** exige **usuário autenticado**: o servidor usa apenas o `user.id` retornado por `getAuthenticatedUser()` e ignora qualquer `userId` no body. Sem auth, a rota retorna 401.
- **POST `/api/fotografos/onboarding`** existe para **atualização** de perfil (fotógrafo já criado), não para criação inicial. O componente `features/photographer/onboarding/OnboardingWizard.js` que usa essa API está **deprecado** para o fluxo inicial; pode ser reutilizado no futuro para “editar perfil” com campos extras (CPF, especialidades, etc.).

---

## Resumo de rotas de auth

| Rota                              | Descrição                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/login`                          | Entrar (SignIn). `callbackUrl` → retorno após login.                                                 |
| `/registrar`                      | Criar conta (SignUp). `callbackUrl` → retorno após registro.                                         |
| `/cadastro`                       | Redireciona para `/como-funciona` (CTA fotógrafo).                                                   |
| `/como-funciona`                  | Explicação + CTA “Começar Gratuitamente” → `/registrar?callbackUrl=/dashboard/fotografo/onboarding`. |
| `/dashboard/fotografo/onboarding` | Wizard inicial do fotógrafo → POST `/api/fotografos/create`.                                         |

Referência completa dos fluxos de comprador e vendedor: **[REVISAO_UI_UX_FLUXOS.md](./REVISAO_UI_UX_FLUXOS.md)**.
