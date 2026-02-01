# Revisão do App – Manual de Contexto (v3.0)

Revisão do projeto GTClicks com base no [Manual de Contexto e Diretrizes](./.cursor/rules/gtclicks-context.md) (Camadas Privadas, regras de negócio, stack e diretrizes para IA).

---

## Resumo executivo

| Critério                                                               | Estado  | Observação                                                                                                           |
| ---------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| **Camadas Privadas** (page + \_components + \_actions + \_data-access) | Parcial | Apenas `app/colecoes/[slug]/` usa `_components/`. Nenhuma rota usa `_actions/` nem `_data-access/`.                  |
| **Validação de roles** (FOTOGRAFO/ADMIN em áreas de gestão)            | Parcial | Admin valida ADMIN. Dashboard fotógrafo não validava role (apenas perfil resolve); corrigido.                        |
| **Sonner** (sucesso/erro na UI)                                        | OK      | Usado em admin/financeiro, checkout, componentes (ShareButton, PhotographerProfileForm, SelfieSearch, ActionButton). |
| **Zod** (formulários e Server Actions)                                 | OK      | Actions e várias rotas API usam Zod.                                                                                 |
| **next/dynamic** (componentes pesados)                                 | Parcial | Apenas home usa `dynamic` para FAQSection. Dashboards podem usar mais.                                               |
| **Dark Mode + Inter/Syne**                                             | OK      | Layout usa `className="dark"`, fontes Inter e Syne.                                                                  |
| **s3Key não exposto ao cliente**                                       | Atenção | Ver secção abaixo.                                                                                                   |

---

## 1. Arquitetura – Camadas Privadas

**Obrigatório no manual:** cada rota em `app/` com a estrutura:

- `page.tsx` (Server) → fetch via DAL, SEO
- `_components/` → `content.tsx` (Client) e componentes da rota
- `_actions/` → Server Actions com `"use server"` e Zod
- `_data-access/` → DAL com Prisma

**Situação atual:**

- Apenas **`app/colecoes/[slug]/`** usa `_components/` (CollectionHero, CollectionFAQ). Não há `content.tsx` nem `_actions/`/`_data-access/` em nenhuma rota.
- **Páginas de dashboard** (ex.: `app/dashboard/fotografo/colecoes/page.js`) usam Prisma diretamente no `page.js` e importam de `features/` ou `components/`.
- **Actions** estão na pasta global **`actions/`** (cart, collections, photographers, etc.), não em `_actions/` por rota.

**Recomendações:**

1. **Novas rotas:** adotar a estrutura completa (page + `_components/content.tsx` + `_actions/` + `_data-access/`).
2. **Rotas existentes (refactor gradual):**
   - Extrair acesso a dados para `_data-access/` por rota (ex.: `dashboard/fotografo/colecoes/_data-access/colecoes.js`).
   - Manter `actions/` global ou passar a ter `_actions/` por rota para ações exclusivas daquela página.
   - Introduzir `_components/content.tsx` onde a página tiver muita interatividade no cliente.

---

## 2. Regras de negócio e licenciamento

**Manual:** licença única (Uso Pessoal), preços por Coleção/Foto, entrega só após webhook.

**Situação atual:**

- Schema Prisma tem **Licenca**, **FotoLicenca** (múltiplas licenças por foto). A UI de compra pode estar simplificada para uma licença; o modelo ainda suporta várias.
- Entrega por `downloadToken` após webhook está implementada.

**Recomendações:**

- Alinhar modelo e UI ao MVP: **uma licença (Uso Pessoal)** por foto; esconder ou simplificar fluxos de múltiplas licenças até que sejam necessários.

---

## 3. Stack e segurança

### 3.1 s3Key no cliente

**Manual:** “Nunca expor `s3Key` no cliente.”

**Situação atual:**

- **`/api/upload`** devolve `s3Key` ao cliente (uploader) para referência pós-upload – uso interno/autenticado, aceitável se restrito a fotógrafo/admin.
- **`lib/mappers/collectionMapper.js`** – `mapColecaoToEditor` inclui `s3Key` em cada foto (“Needed for cover generation”). Esses dados são usados no editor (dashboard fotógrafo); o cliente recebe `s3Key` no payload do editor.
- **`/api/fotos/batch`** devolve objetos de foto com `s3Key` para o front (gestão de fotos).
- **`mapFotoToDetail`** (detalhe público da foto) **não** expõe `s3Key` – correto.
- Rotas de download e imagens usam `s3Key` apenas no servidor.

**Recomendações:**

1. Manter **mapFotoToDetail** e respostas públicas **sem** `s3Key`.
2. Para editor e batch: preferir gerar capa/thumb no servidor e enviar apenas `previewUrl` (ou URL assinada) ao cliente; se for inevitável enviar `s3Key` em áreas autenticadas de gestão, documentar e restringir a FOTOGRAFO/ADMIN e nunca em APIs públicas.
3. Revisar `/api/fotos/batch`: avaliar retornar apenas `previewUrl` (e eventualmente um identificador opaco) em vez de `s3Key` no JSON enviado ao browser.

### 3.2 Validação de roles

**Manual:** “Garantir que apenas FOTOGRAFO ou ADMIN acedem a áreas de gestão.”

**Situação atual (após correção):**

- **Admin:** layout usa `useUser` + `/api/users/me` e redireciona se `role !== 'ADMIN'`. Rotas em `app/api/admin/*` usam `getAuthenticatedUser()` e checam `user.role === 'ADMIN'`. OK.
- **Dashboard fotógrafo:** layout só verificava se o utilizador tinha perfil de fotógrafo (`/api/fotografos/resolve`). **Correção aplicada:** o layout agora também valida, via `/api/users/me`, que `role` é `FOTOGRAFO` ou `ADMIN` antes de permitir acesso; caso contrário redireciona.

---

## 4. Diretrizes para a IA

| Diretriz                                           | Estado                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Validar roles (FOTOGRAFO/ADMIN) em áreas de gestão | Aplicado no layout do dashboard fotógrafo; APIs admin já validavam.                              |
| Tratar erros com sonner                            | Em uso em checkout, admin/financeiro e vários componentes.                                       |
| Zod em formulários / Server Actions                | Em uso nas actions e em várias rotas API.                                                        |
| next/dynamic para componentes pesados              | Home (FAQSection); dashboard fotógrafo (DashboardContent); editor de coleção (CollectionEditor). |
| Dark Mode + Inter/Syne                             | Layout raiz com `dark`, Inter e Syne.                                                            |

---

## 5. Passos implementados (pós-revisão)

- **Camadas Privadas:** `app/dashboard/fotografo/colecoes/` refatorado com `_data-access/colecoes.js` (getFotografoByUserId, getColecoesPaginated) e `_components/ColecoesContent.jsx` (Client). A `page.js` passa a ser Server Component que valida sessão, chama o DAL e renderiza o content.
- **s3Key:** A resposta da API `/api/fotos/batch` passou a devolver apenas campos seguros (id, titulo, previewUrl, etc.), sem `s3Key`. O editor continua a receber dados via `getCollectionForEdit` (que inclui s3Key apenas para gestão autenticada).
- **next/dynamic:** Dashboard do fotógrafo (`page.js`), editor de coleção (nova e editar) passaram a usar `dynamic()` para carregar DashboardContent e CollectionEditor com `ssr: false` e estado de loading.
- **Licença única (MVP):** Constante `LICENSE_MVP_LABEL = "Uso Pessoal"` em `lib/constants.js`; PhotoModalContent e CollectionSearchClient passaram a usar essa constante ao adicionar itens ao carrinho.

---

## 6. Checklist para novas funcionalidades

Ao adicionar novas rotas ou fluxos:

1. [ ] Usar **Camadas Privadas**: `page` (Server) + `_components/content.tsx` (Client) + `_actions/` + `_data-access/` quando fizer sentido.
2. [ ] Em áreas de gestão, validar **role FOTOGRAFO ou ADMIN** (layout ou API).
3. [ ] **Não expor `s3Key`** em respostas para o cliente, exceto em fluxos internos documentados e restritos a gestão.
4. [ ] Validar formulários com **Zod** nas Server Actions.
5. [ ] Usar **sonner** para feedback de sucesso/erro.
6. [ ] Manter **Dark Mode** e fontes **Inter** e **Syne**.
7. [ ] Considerar **next/dynamic** para componentes pesados em dashboards.

---

_Documento gerado com base no Manual de Contexto (`.cursor/rules/gtclicks-context.md`). Atualizar quando houver mudanças no schema ou na stack._
