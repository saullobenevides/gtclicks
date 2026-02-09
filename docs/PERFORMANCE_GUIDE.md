# Guia de Otimização de Performance

## 1. Velocidade das Queries do Banco

### 1.1 Índices (Prisma Schema)

O schema já possui índices em campos críticos. Ao adicionar novas queries, verifique:

```prisma
// Exemplo: buscar por userId + status
@@index([userId, status])

// Ordenação por data
@@index([createdAt])
@@index([status, createdAt])
```

**Regra:** Índice em colunas usadas em `where`, `orderBy` e `groupBy`.

### 1.2 Evitar N+1

**Problema:** 1 query + N queries (uma por item).

**Solução:** Batch em uma única query ou agregação.

```javascript
// ❌ N+1
const fotografos = await prisma.fotografo.findMany({ take: 10 });
for (const f of fotografos) {
  const count = await prisma.itemPedido.count({
    where: { foto: { fotografoId: f.id } },
  });
}

// ✅ 1 + 1 queries
const fotografoIds = fotografos.map((f) => f.id);
const downloadRows = await prisma.itemPedido.findMany({
  where: { foto: { fotografoId: { in: fotografoIds } } },
  select: { foto: { select: { fotografoId: true } } },
});
const counts = downloadRows.reduce((acc, r) => {
  acc[r.foto.fotografoId] = (acc[r.foto.fotografoId] || 0) + 1;
  return acc;
}, {});
```

### 1.3 Select/Include Apenas o Necessário

```javascript
// ❌ Carrega tudo
prisma.colecao.findMany({ include: { fotos: true, fotografo: true } });

// ✅ Só o que precisa
prisma.colecao.findMany({
  select: {
    id: true,
    nome: true,
    capaUrl: true,
    fotografo: { select: { username: true, user: { select: { name: true } } } },
    _count: { select: { fotos: true } },
  },
});
```

### 1.4 Cache

O `lib/cache.js` oferece `getCached(key, fetcher, ttl)`.

- **Dev:** cache em memória
- **Produção:** Upstash Redis (via Vercel Marketplace) — variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`

**Uso atual:**

- `getHomepageData` – TTL 60s
- `getDistinctCities` – TTL 1h (dados que mudam pouco)
- `getDistinctPhotographerCities` – TTL 1h
- `searchPhotographers` – TTL 5 min
- `searchCollections` – TTL 5 min

**Invalidar cache** ao criar/atualizar/publicar coleções (já implementado em):

- `actions/collections.ts` — createCollection, updateCollection, bulkUpdateCollectionsStatus
- `app/api/colecoes/route.js` — POST
- `app/api/colecoes/[id]/route.js` — PUT (quando status = PUBLICADA)
- `app/api/admin/collections/[id]/approve/route.js`

```javascript
import { invalidate } from "@/lib/cache";

await invalidate("homepage:*");
await invalidate("marketplace:distinct-cities");
await invalidate("marketplace:distinct-photographer-cities");
await invalidate("search:*");
```

### 1.5 Connection Pooling

Com Neon/Postgres, use a connection string com pooling (`?pgbouncer=true` ou pooler) para reduzir latência de conexão.

---

## 2. Carregar Elementos Sem Banco Antes

### 2.1 Padrão: Shell + Suspense

Renderize o que não depende de dados imediatamente e use `Suspense` para o restante.

```jsx
// page.js
export default function Page() {
  return (
    <>
      {/* Shell estático - FCP imediato */}
      <PageHeader title="Meus Pedidos" />

      <Suspense fallback={<ListSkeleton />}>
        <DataContent />
      </Suspense>
    </>
  );
}

// DataContent.jsx - async, busca dados
async function DataContent() {
  const data = await fetchData();
  return <List data={data} />;
}
```

### 2.2 O Que Pode Ser Estático

| Elemento         | Depende do banco? | Ação                         |
| ---------------- | ----------------- | ---------------------------- |
| Header/Footer    | Não               | Já no layout                 |
| Título da página | Não               | Renderizar antes do Suspense |
| Breadcrumbs      | Às vezes          | Versão estática ou em layout |
| Filtros (labels) | Não               | Estático                     |
| Opções de filtro | Sim (ex: cidades) | Cache agressivo ou Suspense  |
| Lista/Grid       | Sim               | Dentro de Suspense           |

### 2.3 Ordem de Carregamento

1. **Layout** (Header, Footer) – sempre primeiro
2. **Shell da página** – título, breadcrumbs, filtros (se não precisarem de dados)
3. **Suspense fallback** – skeleton
4. **Conteúdo com dados** – streaming

### 2.4 Páginas Otimizadas com Streaming

| Página                   | Shell imediato                      | Em Suspense                   |
| ------------------------ | ----------------------------------- | ----------------------------- |
| **Home**                 | HeroSection                         | Coleções, Fotógrafos, Ranking |
| **Busca**                | Header + filtros (cidades em cache) | Resultados                    |
| **Fotógrafos**           | Header + filtros (cidades em cache) | Grid de fotógrafos            |
| **Pedidos**              | Título                              | Lista de pedidos              |
| **Pedidos/[id]**         | Link "Voltar"                       | Detalhe do pedido             |
| **Coleções/[slug]**      | Hero + grid de fotos                | "Outras Coleções"             |
| **Fotógrafo/[username]** | Header do perfil                    | Grid de coleções              |
| **Dashboard/colecoes**   | -                                   | Lista de coleções             |
| **Dashboard/fotos**      | -                                   | Grid de fotos                 |

---

## 3. Outras Otimizações

- **Lazy load Payment Brick** — checkout carrega o SDK do Mercado Pago sob demanda
- **optimizePackageImports** — Recharts, lucide-react, @radix-ui/react-icons
- **Preconnect** — S3 e Google (imagens) no layout
- **Imagens prioritárias** — HeroSection e CollectionHero com `priority`
- **Skeleton no checkout** — layout espelhado durante carregamento

## 4. Otimizações de Banco (BD)

- [x] Índices: Colecao (status+views, status+cidade), ItemPedido (fotoId, pedidoId), Transacao (fotografoId), SolicitacaoSaque (fotografoId, status), Fotografo (cidade)
- [x] `getRelatedCollections` — 1 query em vez de carregar todas as coleções
- [x] `getCollections` — limite padrão 50
- [x] Queries unificadas: getPhotosByPhotographerUsername, getCollectionsByPhotographerUsername, getFotosByUserId
- [x] `getPhotoById` — select mínimo (sem licencas)
- [x] api/pedidos POST — batch fetch (evita N+1)
- [x] api/pedidos GET — paginação (page, limit)
- [x] api/pedidos/[id] — select mínimo em itens/foto/licenca
- [x] api/fotos — select mínimo (fotografo.user.name, licencas)
- [x] api/colecoes/[id] DELETE — select fotografo.userId (ownership)
- [x] actions/collections — select fotografo.userId em updateCollection e setCollectionCover
- [x] getCollectionByIdForEditSafe — select fotos (campos do editor)
- [x] PedidosContent — remove \_count.itens, usa itens.length
- [x] getFotosByUserId (dashboard fotos) — select mínimo com colecao e licencas
- [x] api/fotografos/fotos — select mínimo em licencas

## 5. Checklist Rápido

- [x] Índices nas colunas de `where`/`orderBy` — schema otimizado
- [x] Sem N+1 (batch ou agregação) — photographers em getHomepageData corrigido
- [x] `select`/`include` mínimos — otimizado: fotógrafos, coleções, pedidos, getCollectionBySlug
- [x] Cache para dados que mudam pouco — homepage, cidades (Upstash Redis)
- [x] Invalidação de cache ao publicar coleções — actions e APIs
- [x] `loading.js` em rotas com dados — 40+ rotas cobertas
- [x] Suspense para conteúdo que depende de fetch — 9 páginas otimizadas
- [x] Shell estático antes do Suspense — home, busca, pedidos, fotógrafos, etc.
