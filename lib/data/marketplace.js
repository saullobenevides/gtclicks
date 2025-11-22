import { PedidoStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  sampleCollections,
  sampleHighlights,
  samplePhotographers,
  samplePhoto,
  sampleDownloads,
} from "./sampleData";

async function safeExecute(callback, fallback) {
  try {
    const result = await callback();

    if (Array.isArray(result)) {
      return result.length ? result : fallback;
    }

    return result ?? fallback;
  } catch (error) {
    console.warn("[data] Falling back to mock data:", error.message);
    return fallback;
  }
}

const gradientFallbacks = [
  "linear-gradient(135deg,#1c3b3b,#58c6b0)",
  "linear-gradient(135deg,#1b1f3a,#5258f2)",
  "linear-gradient(135deg,#511b4b,#fb5ce3)",
];

function mapColecaoToCard(colecao, index = 0) {
  return {
    id: colecao.id,
    name: colecao.nome,
    slug: colecao.slug,
    description: colecao.descricao ?? "",
    cover: colecao.capaUrl ?? gradientFallbacks[index % gradientFallbacks.length],
    photographer: colecao.fotografo
      ? {
          name: colecao.fotografo.user?.name ?? colecao.fotografo.username,
          city: colecao.fotografo.cidade,
        }
      : undefined,
  };
}

function mapFotografoToCard(fotografo) {
  return {
    username: fotografo.username,
    name: fotografo.user?.name ?? "Fotógrafo GTClicks",
    city: fotografo.cidade ?? "Brasil",
    specialties: fotografo.especialidades?.length
      ? fotografo.especialidades
      : ["autorais"],
    stats: {
      colecoes: fotografo.colecoes?.length ?? 0,
      downloads: fotografo._count?.fotos ?? 0,
    },
  };
}

export async function getHomepageData() {
  const [collections, photographers] = await Promise.all([
    safeExecute(
      async () => {
        const data = await prisma.colecao.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            fotografo: {
              include: { user: true },
            },
          },
        });

        return data.map(mapColecaoToCard);
      },
      sampleCollections.map((item, index) =>
        mapColecaoToCard(
          {
            ...item,
            fotografo: {
              username: item.fotografo?.username,
              cidade: item.fotografo?.cidade,
              user: { name: item.fotografo?.name },
            },
          },
          index
        )
      )
    ),
    safeExecute(
      async () => {
        const data = await prisma.fotografo.findMany({
          take: 3,
          include: {
            user: true,
            colecoes: true,
            _count: {
              select: { fotos: true },
            },
          },
        });

        return data.map(mapFotografoToCard);
      },
      samplePhotographers.map((item) => ({
        username: item.username,
        name: item.name,
        city: item.cidade,
        specialties: item.specialties ?? ["autorais"],
        stats: {
          colecoes: item.colecoesPublicadas ?? 0,
          downloads: item.downloads ?? 0,
        },
      }))
    ),
  ]);

  return {
    collections,
    photographers,
    highlights: sampleHighlights,
  };
}

export async function getCollections() {
  return safeExecute(
    async () => {
      const data = await prisma.colecao.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          fotografo: {
            include: { user: true },
          },
          _count: {
            select: { fotos: true },
          },
        },
      });

      return data.map((colecao, index) => ({
        ...mapColecaoToCard(colecao, index),
        totalPhotos: colecao._count.fotos,
        photographerName: colecao.fotografo?.user?.name,
      }));
    },
    sampleCollections.map((colecao, index) => ({
      ...mapColecaoToCard(
        {
          ...colecao,
          fotografo: { user: { name: colecao.fotografo?.name } },
        },
        index
      ),
      totalPhotos: colecao.fotos?.length ?? 0,
      photographerName: colecao.fotografo?.name,
    }))
  );
}

export async function getCollectionBySlug(slug) {
  return safeExecute(
    async () => {
      if (!slug) return null;

      const data = await prisma.colecao.findUnique({
        where: { slug },
        include: {
          fotografo: { include: { user: true } },
          fotos: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!data) return null;

      return {
        id: data.id,
        title: data.nome,
        description: data.descricao,
        photographer: data.fotografo?.user?.name ?? "Fotógrafo GTClicks",
        photos: data.fotos.map((foto) => ({
          id: foto.id,
          title: foto.titulo,
          orientation: foto.orientacao,
          tags: foto.tags,
        })),
      };
    },
    sampleCollections
      .filter((colecao) => colecao.slug === slug)
      .map((colecao) => ({
        id: colecao.id,
        title: colecao.nome,
        description: colecao.descricao,
        photographer: colecao.fotografo?.name,
        photos: colecao.fotos,
      }))[0] ?? null
  );
}

export async function getPhotoById(id) {
  return safeExecute(
    async () => {
      if (!id) return null;

      const data = await prisma.foto.findUnique({
        where: { id },
        include: {
          fotografo: { include: { user: true } },
          licencas: {
            include: { licenca: true },
          },
        },
      });

      if (!data) return null;

      return {
        id: data.id,
        titulo: data.titulo,
        orientacao: data.orientacao,
        descricao: data.descricao,
        tags: data.tags,
        previewUrl: data.previewUrl,
        categoria: data.categoria,
        corPredominante: data.corPredominante,
        fotografo: {
          id: data.fotografo?.id,
          username: data.fotografo?.username,
          bio: data.fotografo?.bio,
        },
        licencas: data.licencas.map((item) => ({
          id: item.licencaId,
          nome: item.licenca.nome,
          descricao: item.licenca.descricao,
          preco: item.preco.toNumber(),
        })),
      };
    },
    samplePhoto
      ? {
          id: samplePhoto.id,
          titulo: samplePhoto.titulo,
          orientacao: samplePhoto.orientacao,
          descricao: samplePhoto.descricao,
          tags: samplePhoto.tags,
          previewUrl: samplePhoto.previewUrl,
          fotografo: samplePhoto.fotografo,
          licencas: samplePhoto.licencas,
        }
      : null
  );
}

export async function getPhotographerByUsername(username) {
  return safeExecute(
    async () => {
      if (!username) return null;

      const data = await prisma.fotografo.findUnique({
        where: { username },
        include: {
          user: true,
          colecoes: true,
          _count: { select: { fotos: true } },
        },
      });

      if (!data) return null;

      return {
        username: data.username,
        name: data.user?.name ?? "Fotógrafo GTClicks",
        city: data.cidade,
        bio: data.bio,
        colecoesPublicadas: data.colecoes.length,
        downloads: data._count.fotos * 10,
      };
    },
    (() => {
      const fallback = samplePhotographers.find((item) => item.username === username);
      if (!fallback) return null;
      return {
        username: fallback.username,
        name: fallback.name,
        city: fallback.cidade,
        bio: fallback.bio,
        colecoesPublicadas: fallback.colecoesPublicadas,
        downloads: fallback.downloads,
      };
    })()
  );
}

export async function searchPhotos(filters = {}) {
  const { q, cor, orientacao, categoria } = filters;

  return safeExecute(
    async () => {
      const where = {
        AND: [
          q
            ? {
                OR: [
                  { titulo: { contains: q, mode: "insensitive" } },
                  { descricao: { contains: q, mode: "insensitive" } },
                  { tags: { has: q.toLowerCase() } },
                ],
              }
            : {},
          cor ? { corPredominante: { equals: cor } } : {},
          orientacao
            ? { orientacao: orientacao.toUpperCase() }
            : {},
          categoria ? { categoria: { equals: categoria } } : {},
        ],
      };

      const data = await prisma.foto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 12,
      });

      return data;
    },
    sampleCollections
      .flatMap((colecao) => colecao.fotos ?? [])
      .filter((foto) => {
        if (q) {
          const search = q.toLowerCase();
          const matchesTitle = foto.titulo?.toLowerCase().includes(search);
          const matchesDesc = foto.descricao?.toLowerCase().includes(search);
          const matchesTags = foto.tags?.some((tag) => tag.toLowerCase().includes(search));
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }
        if (cor && foto.corPredominante !== cor) return false;
        if (orientacao && foto.orientacao !== orientacao.toUpperCase()) return false;
        if (categoria && foto.categoria !== categoria) return false;
        return true;
      })
  );
}

export async function getLatestDownloads(limit = 5) {
  return safeExecute(
    async () => {
      const pedidos = await prisma.pedido.findMany({
        where: { status: PedidoStatus.PAGO },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          itens: {
            include: {
              foto: { select: { titulo: true } },
              licenca: { select: { nome: true } },
            },
          },
        },
      });

      return pedidos.flatMap((pedido) =>
        pedido.itens.map((item) => ({
          itemId: item.id,
          fotoId: item.fotoId,
          titulo: item.foto?.titulo ?? "Foto GTClicks",
          licenca: item.licenca?.nome ?? "Licença",
          expiresAt: item.expiresAt?.toISOString().slice(0, 10) ?? "2025-01-30",
        }))
      );
    },
    sampleDownloads
  );
}
