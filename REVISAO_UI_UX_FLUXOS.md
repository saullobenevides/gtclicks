# Revisão UI/UX – Fluxos do Comprador e do Vendedor

Revisão completa da experiência de uso do GTClicks, considerando registro, login, onboarding e os fluxos de comprador e vendedor (fotógrafo). Baseada no [Manual de Contexto](.cursor/rules/gtclicks-context.md) e na estrutura atual do app.

---

## 1. Resumo dos fluxos mapeados

| Persona       | Entrada principal                  | Autenticação    | Destino após auth                |
| ------------- | ---------------------------------- | --------------- | -------------------------------- |
| **Comprador** | Explorar, Busca, Coleção, Carrinho | Login/Registrar | Dashboard → Downloads/Pedidos    |
| **Vendedor**  | Como Funciona, Cadastro, Dashboard | Login/Registrar | Onboarding → Dashboard Fotógrafo |

---

## 2. Registro e login

### 2.1 Rotas e comportamento

- **`/login`** – SignIn (Stack). Aceita `callbackUrl`; converte para `after_auth_return_to` e redireciona de volta para `/login` com esse param (Stack usa `after_auth_return_to`).
- **`/registrar`** – SignUp (Stack). Mesma lógica de `callbackUrl` → `after_auth_return_to`. Link “Já tem conta? Faça login” → `/login`.
- **`/cadastro`** – Redireciona para **`/como-funciona`** (não para `/registrar`). Usado no footer (“Começar a Vender”) e no dropdown “Seja Fotógrafo”.

### 2.2 Inconsistências

1. **“Criar Conta” no header (mobile)**  
   `NavUserActions.jsx` (mobile): ambos os botões apontam para `/login`. O segundo deveria ser “Criar Conta” → **`/registrar`**.

2. **Cadastro vs Registrar**

   - Footer e “Seja Fotógrafo” usam **`/cadastro`** → usuário cai em **Como Funciona** (correto para contexto “fotógrafo”).
   - Se a intenção for “só criar conta”, o ideal é **`/registrar`** com `callbackUrl` opcional.
   - Recomendação: manter `/cadastro` → Como Funciona para o CTA de fotógrafo; no header/entrada genérica usar **Entrar** → `/login` e **Criar Conta** → `/registrar`.

3. **Checkout sem sessão**  
   Checkout redireciona para **`/handler/sign-in?redirect=...`** (StackHandler), enquanto o resto do app usa **`/login?callbackUrl=...`**.

   - Unificar: redirecionar para **`/login?callbackUrl=/checkout`** (e preservar query do carrinho/orderId se necessário) para manter consistência e reuso da mesma tela de login.

4. **Meus Downloads sem login**  
   Link “Fazer Login” usa **`/login?redirect=/meus-downloads`**. O login espera **`callbackUrl`**; no servidor o redirect é tratado como `after_auth_return_to`. Confirmar se Stack está configurado para ler `redirect` ou `callbackUrl`/`after_auth_return_to` e documentar um único param (ex.: sempre `callbackUrl` no app e mapear para o que o Stack espera).

### 2.3 UI das páginas de auth

- **Login**

  - Badge “Login”, título “Acesse sua conta”, texto para Participante/Fotógrafo.
  - Card com `SignIn fullPage={false}`.
  - Sugestão: alinhar padding e max-width ao restante do app (ex.: `container-wide`, `glass-panel`/card do design system) e garantir contraste e área de toque em mobile.

- **Registrar**
  - Badge “Criar Conta”, título “Comece agora”, link para login.
  - Sugestão: mesmo alinhamento visual que o login e CTA claro “Já tem conta? Faça login”.

---

## 3. Fluxo do comprador

### 3.1 Jornada esperada

1. **Descoberta** – Home, Explorar (`/busca`), Categorias, Fotógrafos.
2. **Busca** – Busca por texto, filtros, (futuro: selfie).
3. **Coleção** – `/colecoes/[slug]`: ver fotos, preços, adicionar ao carrinho.
4. **Carrinho** – `/carrinho`: revisar itens, ir para checkout.
5. **Checkout** – `/checkout`: autenticação (se necessário), Mercado Pago (Pix/cartão).
6. **Pós-pagamento** – `/checkout/sucesso`, `/pagamento/sucesso`, `/pagamento/pendente`, `/pagamento/falha`.
7. **Acesso às fotos** – `/meus-downloads` (logado), `/pedidos` (histórico).

### 3.2 Pontos de atenção

- **Carrinho vazio**  
  Mensagem e CTA “Explorar Fotos” → `/busca`. OK.

- **Checkout**

  - Exige login; redirect atual para `handler/sign-in`. Unificar para `/login?callbackUrl=/checkout` (ver 2.2).
  - Modo “retry” com `orderId` na query: carrega pedido e permite novo pagamento. Manter feedback claro (“Tentando novamente o pedido #…”).

- **Sucesso**

  - `/checkout/sucesso`: confetti, status aprovado/pendente, link para downloads.
  - Garantir próximo passo óbvio: “Ver meus downloads” ou “Ver pedido”.

- **Falha**

  - `/pagamento/falha`: título e texto genéricos; botões “Voltar ao Carrinho” e “Continuar Navegando”.
  - Sugestão: usar classes do design system (`text-foreground`, `heading-display` se fizer sentido) e, se possível, mensagem específica quando o MP devolver motivo (ex.: “pagamento recusado”).

- **Pendente**

  - `/pagamento/pendente`: explicação e link “Ver Meus Pedidos”. O link aponta para “Ver Meus Pedidos” mas o href é `/meus-downloads`; para histórico de pedidos o correto é **`/pedidos`**. Ajustar: “Ver Meus Pedidos” → `/pedidos` e, se quiser, “Meus Downloads” → `/meus-downloads`.

- **Meus Downloads**

  - Sem login: card “Acesso Restrito” + “Fazer Login” com `callbackUrl`/redirect para `/meus-downloads`. Alinhar param com login (ver 2.2).

- **Pedidos**
  - Server component, exige login, redirect `/login?callbackUrl=/pedidos`. Lista com status, valor, link para detalhe. OK; garantir estados vazios e erro consistentes com o restante do app.

### 3.3 Dashboard do comprador

- **`/dashboard`**
  - Se usuário for FOTOGRAFO (ou tem `fotografo`), redireciona para `/dashboard/fotografo`.
  - Caso contrário: `ClientDashboard` – “Olá, {nome}”, cards Meus Downloads, Favoritos, “Área do Fotógrafo” (CTA “Começar Agora” → `/dashboard/fotografo`).
  - Sugestão: container e espaçamento iguais às outras páginas (ex.: `container-wide`), e garantir que “Começar Agora” para fotógrafo deixe claro que vai ao painel do fotógrafo (e que pode exigir onboarding se for a primeira vez).

---

## 4. Fluxo do vendedor (fotógrafo)

### 4.1 Jornada esperada

1. **Interesse** – Como Funciona (tab “Sou Fotógrafo”) ou “Seja Fotógrafo” no menu / footer (`/cadastro` → `/como-funciona`).
2. **Registro** – CTA “Começar Gratuitamente” → **`/registrar?callbackUrl=/dashboard/fotografo/onboarding`** (já logado: “Criar Meu Perfil” → `/dashboard/fotografo/onboarding`).
3. **Login** – Se já tem conta, “Acessar Dashboard” ou link de login com `callbackUrl` para onboarding ou dashboard.
4. **Onboarding** – `/dashboard/fotografo/onboarding`: wizard (Identidade, Contato & Local, Financeiro) → POST `/api/fotografos/create`. Após sucesso, layout redireciona para `/dashboard/fotografo`.
5. **Dashboard** – Coleções, Fotos, Financeiro, Perfil. Sidebar com mesmas entradas em desktop; mobile com navegação equivalente.

### 4.2 Autenticação e acesso ao dashboard fotógrafo

- **Layout** (`dashboard/fotografo/layout.js`):

  - Sem user → `/login`.
  - Com user: chama `/api/users/me` (role) e `/api/fotografos/resolve?userId=`.
  - Se role não é FOTOGRAFO nem ADMIN → `/?error=unauthorized`.
  - Se não tem perfil fotógrafo (`!data.data`) → `/dashboard/fotografo/onboarding`.
  - Onboarding não usa a sidebar; resto usa `DashboardLayout` + nav.

- **Onboarding**
  - Página usa **FotografoOnboarding** (em `features/photographer/components/FotografoOnboarding.js`), que chama **`/api/fotografos/create`**.
  - Existe também **OnboardingWizard** (em `features/photographer/onboarding/OnboardingWizard.js`) que usa **`/api/fotografos/onboarding`** – atualmente **não** usado pela rota de onboarding. Deixar um único fluxo (create ou onboarding) e um único endpoint evita confusão e bugs.

### 4.3 Inconsistências e melhorias

1. **Cadastro no footer**  
   `siteConfig.footerParams.photographers`: “Começar a Vender” → `/cadastro`. Hoje `/cadastro` redireciona para `/como-funciona`. Está coerente com “explicar primeiro, depois registrar”. Manter; garantir que em “Como Funciona” o CTA “Começar Gratuitamente” use **`/registrar?callbackUrl=/dashboard/fotografo/onboarding`** (já está assim quando não logado).

2. **“Fazer Upload” no footer**  
   Link para `/dashboard/fotografo/colecoes`. Usuário não logado ou sem perfil vai cair em login ou onboarding. OK; pode-se mostrar um tooltip ou mensagem em footer para “Área do fotógrafo – faça login”.

3. **Onboarding em tela cheia**

- Página de onboarding é só o wizard, sem header do app. Evita distração; garantir que “Voltar” ou “Sair” (se houver) não deixe o usuário perdido.
- Sugestão: após “Perfil criado”, um CTA explícito “Ir para o Dashboard” e redirect automático após 2s.

4. **ClientDashboard – “Começar Agora”**

- Link para `/dashboard/fotografo`. Se o usuário ainda não é fotógrafo, o layout do fotógrafo vai redirecionar para onboarding.
- Melhorar: no ClientDashboard, se o usuário não tem perfil fotógrafo, o botão pode ir direto para **`/dashboard/fotografo/onboarding`** com texto “Criar perfil de fotógrafo” ou “Completar cadastro de fotógrafo”.

---

## 5. Navegação global e CTAs

### 5.1 Header

- **Nav principal** (siteConfig): Explorar, Categorias, Fotógrafos, Como Funciona. Carrinho e Favoritos fora da lista, como ícones. OK.
- **Login/Registro**: ver 2.2 – corrigir “Criar Conta” no mobile para `/registrar`.
- **Logado**: dropdown com Meu Perfil Público, Painel do Fotógrafo (se tiver), Minha Conta (Stack), Meus Pedidos, Meus Downloads, Sair. “Seja Fotógrafo” só quando não tem `username` (perfil fotógrafo); link para `/cadastro`. Manter; garantir que `/cadastro` continue levando a Como Funciona para esse caso.

### 5.2 Mobile

- **MobileMenu**: busca, links principais, Favoritos, e `NavUserActions mobile` (Entrar + Criar Conta ou menu do usuário).
- Área de toque e ordem dos itens estão adequados; só ajustar destino de “Criar Conta” para `/registrar`.

### 5.3 Footer

- Links de fotógrafo: Começar a Vender → `/cadastro`, Fazer Upload → `/dashboard/fotografo/colecoes`, Painel Financeiro → `/dashboard/fotografo/financeiro`.
- Consistente com o fluxo “conhecer → registrar → usar dashboard”.

---

## 6. Checklist de ações recomendadas

### Alta prioridade

- [x] **NavUserActions (mobile)**  
       Segundo botão: “Criar Conta” → **`/registrar`** (não `/login`).

- [x] **Checkout sem sessão**  
       Redirecionar para **`/login?callbackUrl=/checkout`** (e preservar query string), em vez de `handler/sign-in`.

- [x] **Pagamento pendente**  
       Botão “Ver Meus Pedidos” → **`/pedidos`**; mantido também “Meus Downloads” como CTA.

- [x] **Parâmetro de redirect pós-login**  
       Login/Registrar usam `callbackUrl` → `after_auth_return_to`; SignIn/SignUp recebem `redirectUrl` com o valor correto após o redirect.

### Média prioridade

- [x] **Páginas de pagamento (falha/pendente)**  
       Design system: Card, glass-panel, text-foreground, heading-display, status-error/status-warning, surface-subtle; ícones XCircle e Clock.

- [x] **ClientDashboard**  
       CTA “Criar perfil de fotógrafo” → **`/dashboard/fotografo/onboarding`**; container-wide e glass-panel nos cards.

- [x] **Login/Registrar**  
       container-wide, glass-panel no card, text-foreground nos títulos; Login passa redirectUrl corretamente após redirect (after_auth_return_to).

### Baixa prioridade / documentação

- [x] **Onboarding**  
       Fluxo único: **FotografoOnboarding** + **POST /api/fotografos/create**. Página de onboarding importa `FotografoOnboarding`; após sucesso redireciona para `/dashboard/fotografo`. OnboardingWizard e POST `/api/fotografos/onboarding` documentados como deprecados para criação inicial (onboarding API mantida para atualização de perfil).

- [x] **Cadastro vs Registrar**  
       Documentado em **[FLUXO_AUTH_CADASTRO.md](./FLUXO_AUTH_CADASTRO.md)** e referência no README: `/cadastro` = entrada “quero ser fotógrafo” (redireciona para Como Funciona); `/registrar` = criar conta genérica.

---

## 7. Resumo

- **Comprador**: fluxo Explorar → Coleção → Carrinho → Checkout → Pagamento → Downloads/Pedidos está claro; principais ajustes são redirect de login no checkout, link correto em “Pagamento pendente” e padronização do param de callback.
- **Vendedor**: fluxo Como Funciona → Registrar (com callback para onboarding) → Onboarding → Dashboard está coerente; melhorar CTAs no dashboard do cliente e unificar implementação do onboarding.
- **Auth**: corrigir “Criar Conta” no mobile para `/registrar`, unificar tela de login no checkout e padronizar `callbackUrl` em todo o app.

Com esses ajustes, a UI/UX fica consistente com o design system e com os fluxos de comprador e vendedor descritos acima.
