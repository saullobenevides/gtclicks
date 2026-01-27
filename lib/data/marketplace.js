import prisma from "@/lib/prisma";
import { PedidoStatus } from "@prisma/client";
import {
  mapColecaoToCard,
  mapColecaoToHomepage,
  mapColecaoToDetail,
  mapColecaoToEditor,
} from "../mappers/collectionMapper";
import {
  mapFotografoToCard,
  mapFotografoToProfile,
} from "../mappers/photographerMapper";
import { mapFotoToDetail } from "../mappers/photoMapper";
import {
  sampleCollections,
  sampleHighlights,
  samplePhotographers,
  samplePhoto,
  sampleDownloads,
} from "./mocks/sampleData";
import { getCached, invalidate } from "@/lib/cache";

async function safeExecute(callback, fallback) {
  try {
    const result = await callback();
    return result;
  } catch (error) {
    console.warn("[data] Error executing query:", error.message);
    return fallback;
  }
}

export async function getHomepageData() {
  const [featuredCollections, recentCollections, photographers] =
    await Promise.all([
      // 1. Featured Collections by Views
      safeExecute(
        async () => {
          const data = await prisma.colecao.findMany({
            where: { status: "PUBLICADA" },
            take: 3,
            orderBy: { views: "desc" },
            include: {
              fotografo: { include: { user: true } },
              _count: { select: { fotos: true } },
            },
          });
          return data.map((colecao, index) =>
            mapColecaoToHomepage(colecao, index),
          );
        },
        sampleCollections.slice(0, 3).map((item, index) => ({
          ...mapColecaoToCard(
            {
              ...item,
              fotografo: {
                username: item.fotografo?.username,
                cidade: item.fotografo?.cidade,
                user: { name: item.fotografo?.name },
              },
            },
            index,
          ),
          totalPhotos: item.fotos?.length ?? 0,
          photographerName: item.fotografo?.name,
        })),
      ),
      // 2. Recent Collections by Date
      safeExecute(
        async () => {
          const data = await prisma.colecao.findMany({
            where: { status: "PUBLICADA" },
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              fotografo: { include: { user: true } },
              _count: { select: { fotos: true } },
            },
          });
          return data.map((colecao, index) =>
            mapColecaoToHomepage(colecao, index),
          );
        },
        sampleCollections.slice(0, 3).map((item, index) => ({
          ...mapColecaoToCard(
            {
              ...item,
              fotografo: {
                username: item.fotografo?.username,
                cidade: item.fotografo?.cidade,
                user: { name: item.fotografo?.name },
              },
            },
            index,
          ),
          totalPhotos: item.fotos?.length ?? 0,
          photographerName: item.fotografo?.name,
        })),
      ),
      // 3. Photographers (Existing Logic)
      safeExecute(
        async () => {
          const data = await prisma.fotografo.findMany({
            take: 10,
            include: {
              user: true,
              colecoes: true,
              _count: {
                select: { fotos: true },
              },
            },
            orderBy: {
              colecoes: {
                _count: "desc",
              },
            },
          });

          const photographersWithDownloads = await Promise.all(
            data.map(async (fotografo) => {
              const downloads = await prisma.itemPedido.count({
                where: {
                  foto: { fotografoId: fotografo.id },
                  pedido: { status: "PAGO" },
                },
              });
              return { ...fotografo, realDownloads: downloads };
            }),
          );
          return photographersWithDownloads.map(mapFotografoToCard);
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
        })),
      ),
    ]);

  return {
    featuredCollections,
    recentCollections,
    photographers,
    highlights: sampleHighlights,
  };
}

export async function getCollections() {
  return safeExecute(
    async () => {
      const data = await prisma.colecao.findMany({
        where: { status: "PUBLICADA" },
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
      return data.map((colecao, index) => mapColecaoToHomepage(colecao, index));
    },
    sampleCollections.map((colecao, index) => ({
      ...mapColecaoToCard(
        {
          ...colecao,
          fotografo: { user: { name: colecao.fotografo?.name } },
        },
        index,
      ),
      totalPhotos: colecao.fotos?.length ?? 0,
      photographerName: colecao.fotografo?.name,
    })),
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
          folders: {
            include: { _count: { select: { fotos: true } } },
            orderBy: { nome: "asc" },
          },
        },
      });
      return mapColecaoToDetail(data);
    },
    sampleCollections
      .filter((colecao) => colecao.slug === slug)
      .map((colecao) => ({
        id: colecao.id,
        title: colecao.nome,
        description: colecao.descricao,
        photographer: colecao.fotografo?.name,
        photographerUsername: colecao.fotografo?.username,
        photos: colecao.fotos,
      }))[0] ?? null,
  );
}

export async function getCollectionByIdForEdit(id) {
  return safeExecute(
    async () => {
      if (!id) return null;
      const data = await prisma.colecao.findUnique({
        where: { id },
        include: {
          fotos: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      return mapColecaoToEditor(data);
    },
    sampleCollections.find((c) => c.id === id) ?? null,
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
          colecao: true,
          licencas: {
            include: { licenca: true },
          },
        },
      });
      return mapFotoToDetail(data);
    },
    samplePhoto
      ? {
          id: samplePhoto.id,
          titulo: samplePhoto.titulo,
          orientacao: samplePhoto.orientacao,
          descricao: samplePhoto.descricao,
          previewUrl: samplePhoto.previewUrl,
          width: samplePhoto.width,
          height: samplePhoto.height,
          camera: samplePhoto.camera,
          lens: samplePhoto.lens,
          focalLength: samplePhoto.focalLength,
          iso: samplePhoto.iso,
          shutterSpeed: samplePhoto.shutterSpeed,
          aperture: samplePhoto.aperture,
          fotografo: samplePhoto.fotografo,
          licencas: samplePhoto.licencas,
          colecao: null,
        }
      : null,
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
      const downloadsCount = await prisma.itemPedido.count({
        where: {
          foto: { fotografoId: data.id },
          pedido: { status: "PAGO" },
        },
      });
      return mapFotografoToProfile(data, downloadsCount);
    },
    (() => {
      const fallback = samplePhotographers.find(
        (item) => item.username === username,
      );
      if (!fallback) return null;
      return {
        username: fallback.username,
        name: fallback.name,
        city: fallback.cidade,
        bio: fallback.bio,
        colecoesPublicadas: fallback.colecoesPublicadas,
        downloads: fallback.downloads,
      };
    })(),
  );
}

export async function getPhotosByPhotographerUsername(username) {
  return safeExecute(async () => {
    if (!username) return [];
    const fotografo = await prisma.fotografo.findUnique({
      where: { username },
    });
    if (!fotografo) return [];
    return await prisma.foto.findMany({
      where: {
        fotografoId: fotografo.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        titulo: true,
        previewUrl: true,
        orientacao: true,
        createdAt: true,
      },
    });
  }, []);
}

export async function getCollectionsByPhotographerUsername(
  username,
  page = 1,
  limit = 12,
) {
  const skip = (page - 1) * limit;

  return safeExecute(
    async () => {
      if (!username) return { data: [], metadata: { total: 0 } };
      const fotografo = await prisma.fotografo.findUnique({
        where: { username },
      });
      if (!fotografo) return { data: [], metadata: { total: 0 } };

      const where = {
        fotografoId: fotografo.id,
        status: "PUBLICADA",
      };

      const [count, colecoes] = await Promise.all([
        prisma.colecao.count({ where }),
        prisma.colecao.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: skip,
          include: {
            fotografo: {
              include: { user: true },
            },
            _count: {
              select: { fotos: true },
            },
          },
        }),
      ]);

      return {
        data: colecoes.map((colecao, index) =>
          mapColecaoToHomepage(colecao, index),
        ),
        metadata: {
          total: count,
          page: Number(page),
          totalPages: Math.ceil(count / limit),
          hasMore: skip + colecoes.length < count,
        },
      };
    },
    { data: [], metadata: { total: 0 } },
  );
}

export async function searchCollections(filters = {}) {
  const { q, cor, orientacao, categoria, date, page = 1, limit = 12 } = filters;
  const skip = (page - 1) * limit;

  return safeExecute(
    async () => {
      let dateFilter = {};
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        if (!isNaN(startOfDay.getTime())) {
          dateFilter = {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          };
        }
      }

      const where = {
        AND: [
          q
            ? {
                OR: [
                  { nome: { contains: q, mode: "insensitive" } },
                  { descricao: { contains: q, mode: "insensitive" } },
                  {
                    fotos: {
                      some: {
                        OR: [
                          { titulo: { contains: q, mode: "insensitive" } },
                          { descricao: { contains: q, mode: "insensitive" } },
                        ],
                      },
                    },
                  },
                  {
                    fotografo: {
                      OR: [
                        { username: { contains: q, mode: "insensitive" } },
                        {
                          user: { name: { contains: q, mode: "insensitive" } },
                        },
                      ],
                    },
                  },
                ],
              }
            : {},
          categoria && categoria !== "all"
            ? { categoria: { equals: categoria } }
            : {},
          orientacao && orientacao !== "all"
            ? {
                fotos: {
                  some: { orientacao: orientacao.toUpperCase() },
                },
              }
            : {},
          cor && cor !== "all"
            ? {
                fotos: {
                  some: { corPredominante: cor },
                },
              }
            : {},
          { status: "PUBLICADA" },
          dateFilter,
        ],
      };

      const [count, data] = await Promise.all([
        prisma.colecao.count({ where }),
        prisma.colecao.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: skip,
          include: {
            fotografo: {
              include: { user: true },
            },
            _count: {
              select: { fotos: true },
            },
          },
        }),
      ]);

      return {
        data: data.map((colecao, index) =>
          mapColecaoToHomepage(colecao, index),
        ),
        metadata: {
          total: count,
          page: Number(page),
          totalPages: Math.ceil(count / limit),
          hasMore: skip + data.length < count,
        },
      };
    },
    (() => {
      const filtered = sampleCollections.filter((colecao) => {
        if (q) {
          const search = q.toLowerCase();
          const matchesName = colecao.nome?.toLowerCase().includes(search);
          const matchesDesc = colecao.descricao?.toLowerCase().includes(search);
          const matchesPhotos = colecao.fotos?.some(
            (f) =>
              f.titulo?.toLowerCase().includes(search) ||
              f.descricao?.toLowerCase().includes(search),
          );
          if (!matchesName && !matchesDesc && !matchesPhotos) return false;
        }
        if (categoria && categoria !== "all" && colecao.categoria !== categoria)
          return false;
        return true;
      });

      const paginated = filtered.slice(skip, skip + limit);

      return {
        data: paginated.map((colecao, index) => ({
          ...mapColecaoToCard(colecao, index),
          totalPhotos: colecao.fotos?.length ?? 0,
          photographerName: colecao.fotografo?.name,
        })),
        metadata: {
          total: filtered.length,
          page: Number(page),
          totalPages: Math.ceil(filtered.length / limit),
          hasMore: skip + paginated.length < filtered.length,
        },
      };
    })(),
  );
}

export async function searchPhotos(filters = {}) {
  return safeExecute(
    async () => {
      const { q, cor, orientacao, categoria } = filters;
      const where = {
        AND: [
          q
            ? {
                OR: [
                  { titulo: { contains: q, mode: "insensitive" } },
                  { descricao: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          cor ? { corPredominante: { equals: cor } } : {},
          orientacao ? { orientacao: orientacao.toUpperCase() } : {},
          categoria ? { categoria: { equals: categoria } } : {},
        ],
      };
      return await prisma.foto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 12,
      });
    },
    sampleCollections
      .flatMap((colecao) => colecao.fotos ?? [])
      .filter((foto) => {
        const { q, cor, orientacao, categoria } = filters;
        if (q) {
          const search = q.toLowerCase();
          const matchesTitle = foto.titulo?.toLowerCase().includes(search);
          const matchesDesc = foto.descricao?.toLowerCase().includes(search);
          if (!matchesTitle && !matchesDesc) return false;
        }
        if (cor && foto.corPredominante !== cor) return false;
        if (orientacao && foto.orientacao !== orientacao.toUpperCase())
          return false;
        if (categoria && foto.categoria !== categoria) return false;
        return true;
      }),
  );
}

export async function getLatestDownloads(limit = 5) {
  return safeExecute(async () => {
    const pedidos = await prisma.pedido.findMany({
      where: { status: "PAGO" }, // Using string literal as enum might be removed
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
      })),
    );
  }, sampleDownloads);
}
