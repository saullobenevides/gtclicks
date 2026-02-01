# 📜 GTClicks - Manual de Contexto e Diretrizes Pro (v3.1)

## 🎯 1. Visão Geral do Projeto

O **GTClicks** é um marketplace de fotografia desportiva e de eventos. O objetivo principal é permitir que fotógrafos monetizem as suas coleções através de uma plataforma automatizada, enquanto os clientes encontram as suas fotos rapidamente usando tecnologia de ponta.

### 🚀 Onde queremos chegar

- Ser a maior plataforma de nicho no Brasil para fotos de surf, corridas e eventos sociais.
- Implementar **Busca Facial (Selfie)** para automação total da experiência do utilizador.
- Escalar o processamento de imagens com marcas de água dinâmicas e entrega instantânea após pagamento.

---

## 🏗️ 2. Arquitetura Next.js e Padrões de Estruturação

É **obrigatório** seguir o padrão de **Camadas Privadas** em novas rotas dentro de `app/`. Pastas com prefixo `_` (ex: `_components/`, `_data-access/`) são privadas e não afetam o roteamento (convenção oficial Next.js).

### 📁 Estrutura de Pastas

**Por rota (ex: `app/dashboard/fotografo/colecoes/`):**

- `page.js` / `page.jsx`: **Server Component** (ponto de entrada). Valida sessão, chama DAL, gere SEO.
- `_components/`: Componentes exclusivos da rota. O principal Client Component pode chamar-se `Content.jsx`, `XContent.jsx` ou `XClient.jsx` (ex: `ColecoesContent.jsx`, `EditCollectionClient.jsx`).
- `_data-access/`: **Data Access Layer (DAL)**. Funções puras que interagem com o Prisma.

**Server Actions (duas opções):**

- `actions/` (raiz): **Atual do projeto**. Server Actions globais (cart, checkout, collections, etc.) com `"use server"` no topo do ficheiro. Use para mutações partilhadas entre várias rotas.
- `_actions/` (por rota): Opcional. Para ações exclusivas de uma página. Permite colocalização.

### 🔄 Fluxo de Dados Padrão

1. Utilizador acede à rota → `page.js` (Server) valida sessão e chama `_data-access`.
2. Dados são passados para o Client Component em `_components/`.
3. Interações que alteram dados chamam Server Actions (de `actions/` ou `_actions/`).
4. A Action valida com Zod, executa no banco, chama `revalidatePath()` ou `refresh()` e retorna para a UI.

### 📌 Server Actions (Next.js 16)

- Ficheiro com `"use server"` no topo: todas as exportações são Server Functions.
- Para Client Components: importar de ficheiro dedicado (não é possível definir `use server` em Client Components).
- Após mutações: usar `revalidatePath()` ou `revalidateTag()` para atualizar cache; `refresh()` de `next/cache` para refrescar o router.
- Para estados de loading: `useActionState` + `startTransition` quando a Action é chamada por event handlers (não forms).
- Autenticação: sempre validar sessão/roles dentro da Action antes de operações sensíveis.

### 📌 Cache Components (opcional, Next.js 16+)

Se ativar `cacheComponents: true` em `next.config`, pode usar `"use cache"` para cachear funções/componentes, `cacheLife` e `cacheTag` para revalidação. Útil para catálogos, listagens e dados que mudam com baixa frequência. Ver docs oficiais para migração.

---

## ⚖️ 3. Regras de Negócio e Licenciamento

Para simplificar o MVP e focar na conversão, o modelo de licenciamento foi consolidado:

- **Licença Única**: Não existem múltiplos tipos (comercial, etc). **Todas as fotos são vendidas apenas para Uso Pessoal**.
- **Preços**: Definidos pelo fotógrafo no nível da `Colecao` ou individualmente na `Foto`.
- **Entrega**: A foto original em alta resolução só é libertada (geração de `downloadToken`) após confirmação de pagamento via Webhook.

---

## 💻 4. Stack Técnica e Restrições de Segurança

- **Framework**: Next.js 16 (App Router) + React 19.
- **Banco de Dados**: Prisma + PostgreSQL (Neon).
- **Autenticação**: Neon Auth (Stack) integrada via `StackProvider`.
- **Pagamentos**: Mercado Pago (SDK React + Webhooks).
- **Imagens**:
  - Nunca expor `s3Key` no cliente.
  - Utilizar `sharp` para processamento e marca d'água.
  - `next/image` configurado para domínios S3.
- **IA**: AWS Rekognition para indexação e busca por selfie.

---

## 🛠️ 5. Diretrizes para a IA (Prompting)

Ao gerar código para o GTClicks, a IA deve:

1. **Validar Roles**: Garantir que apenas `FOTOGRAFO` ou `ADMIN` acedem a áreas de gestão.
2. **Tratar Erros**: Usar `sonner` para notificações de sucesso/erro na interface.
3. **Zod**: Validar rigorosamente todos os campos de formulário nas Server Actions.
4. **Revalidação**: Após mutações em Server Actions, chamar `revalidatePath()` ou `refresh()` para a UI refletir os dados atualizados.
5. **Performance**: Sugerir `next/dynamic` para componentes pesados de dashboards.
6. **Estilo**: Manter o tema **Dark Mode** e usar as fontes **Inter** e **Syne**.

---

**Nota**: Atualizar este ficheiro quando houver mudanças no `prisma/schema.prisma`, na stack principal ou na estrutura de pastas. Consultar a documentação oficial Next.js (MCP `nextjs_docs`) para convenções atualizadas.
