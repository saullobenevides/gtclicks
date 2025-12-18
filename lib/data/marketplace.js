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
    return result; // Return actual result (even if empty)
  } catch (error) {
    console.warn("[data] Error executing query:", error.message);
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
          avatarUrl: colecao.fotografo.user?.image,
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
      downloads: fotografo.realDownloads ?? fotografo.downloads ?? 0,
    },
    avatarUrl: fotografo.user?.image,
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
            _count: {
              select: { fotos: true },
            },
          },
        });

        return data.map((colecao, index) => ({
          ...mapColecaoToCard(colecao, index),
          totalPhotos: colecao._count.fotos,
          photographerName: colecao.fotografo?.user?.name ?? (colecao.fotografo?.username || "Fotógrafo GTClicks"),
        }));
      },
      sampleCollections.map((item, index) => ({
        ...mapColecaoToCard(
          {
            ...item,
            fotografo: {
              username: item.fotografo?.username,
              cidade: item.fotografo?.cidade,
              user: { name: item.fotografo?.name },
            },
          },
          index
        ),
        totalPhotos: item.fotos?.length ?? 0,
        photographerName: item.fotografo?.name,
      }))
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

        const photographersWithDownloads = await Promise.all(
          data.map(async (fotografo) => {
            const downloads = await prisma.itemPedido.count({
              where: {
                foto: { fotografoId: fotografo.id },
                pedido: { status: "PAGO" },
              },
            });
            return { ...fotografo, realDownloads: downloads };
          })
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
          folders: {
            include: { _count: { select: { fotos: true } } },
            orderBy: { nome: 'asc' }
          },
        },
      });

      if (!data) return null;

      return {
        id: data.id,
        title: data.nome,
        precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : 0,
        description: data.descricao,
        photographer: data.fotografo?.user?.name ?? "Fotógrafo GTClicks",
        folders: data.folders.map(f => ({
             id: f.id,
             name: f.nome,
             parentId: f.parentId,
             count: f._count.fotos
        })),
        photos: data.fotos.map((foto) => ({
          id: foto.id,
          title: foto.titulo,
          orientation: foto.orientacao,
          tags: foto.tags,
          previewUrl: foto.previewUrl,
          folderId: foto.folderId, 
          colecao: { precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : 0 } // INJECTED PRICE
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

      if (!data) return null;

      return {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao,
        slug: data.slug,
        categoria: data.categoria, // Also added categoria if it exists in data
        status: data.status, // Also added status
        precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : 0, // Adjusted
        fotografoId: data.fotografoId, // Added fotografoId for save operations
        fotos: data.fotos.map((foto) => ({
          id: foto.id,
          titulo: foto.titulo,
          orientacao: foto.orientacao,
          tags: foto.tags,
          previewUrl: foto.previewUrl,
          folderId: foto.folderId, // Ensure folderId is passed
        })),
      };
    },
    sampleCollections.find((c) => c.id === id) ?? null
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

      if (!data) return null;

      const colecaoData = data.colecao ? {
        id: data.colecao.id,
        nome: data.colecao.nome,
        slug: data.colecao.slug,
        precoFoto: data.colecao.precoFoto ? parseFloat(data.colecao.precoFoto) : 0,
      } : null;

      return {
        id: data.id,
        titulo: data.titulo,
        orientacao: data.orientacao,
        descricao: data.descricao,
        tags: data.tags,
        previewUrl: data.previewUrl,
        categoria: data.categoria,
        corPredominante: data.corPredominante,
        width: data.width,
        height: data.height,
        camera: data.camera,
        lens: data.lens,
        focalLength: data.focalLength,
        iso: data.iso,
        shutterSpeed: data.shutterSpeed,
        aperture: data.aperture,
        colecao: colecaoData,
        fotografo: {
          id: data.fotografo?.id,
          username: data.fotografo?.username,
          name: data.fotografo?.user?.name ?? data.fotografo?.username,
          avatarUrl: data.fotografo?.user?.image,
          bio: data.fotografo?.bio,
        },
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

      const downloadsCount = await prisma.itemPedido.count({
        where: {
          foto: { fotografoId: data.id },
          pedido: { status: "PAGO" },
        },
      });

      return {
        username: data.username,
        name: data.user?.name ?? "Fotógrafo GTClicks",
        avatarUrl: data.user?.image,
        city: data.cidade,
        state: data.estado,
        cityState: data.cidade && data.estado ? `${data.cidade}, ${data.estado}` : (data.cidade || data.estado || "Brasil"),
        bio: data.bio,
        instagram: data.instagram,
        telefone: data.telefone,
        colecoesPublicadas: data.colecoes.length,
        downloads: downloadsCount,
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

export async function getPhotosByPhotographerUsername(username) {
  return safeExecute(
    async () => {
      if (!username) return [];

      const fotografo = await prisma.fotografo.findUnique({
        where: { username },
      });

      if (!fotografo) return [];

      const fotos = await prisma.foto.findMany({
        where: {
          fotografoId: fotografo.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          titulo: true,
          previewUrl: true,
          orientacao: true,
          tags: true,
          createdAt: true,
        },
      });

      return fotos;
    },
    []
  );
}

export async function getCollectionsByPhotographerUsername(username) {
  return safeExecute(
    async () => {
      if (!username) return [];

      const fotografo = await prisma.fotografo.findUnique({
        where: { username },
      });

      if (!fotografo) return [];

      const colecoes = await prisma.colecao.findMany({
        where: {
          fotografoId: fotografo.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          fotografo: {
            include: { user: true },
          },
          _count: {
            select: { fotos: true },
          },
        },
      });

      return colecoes.map((colecao, index) => ({
        ...mapColecaoToCard(colecao, index),
        totalPhotos: colecao._count.fotos,
        photographerName: colecao.fotografo?.user?.name,
      }));
    },
    []
  );
}

export async function searchCollections(filters = {}) {
  const { q, cor, orientacao, categoria } = filters;

  return safeExecute(
    async () => {
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
                          { tags: { has: q.toLowerCase() } },
                        ],
                      },
                    },
                  },
                  {
                    fotografo: {
                      OR: [
                        { username: { contains: q, mode: "insensitive" } },
                        { user: { name: { contains: q, mode: "insensitive" } } },
                      ],
                    },
                  },
                ],
              }
            : {},
          categoria && categoria !== 'all' ? { categoria: { equals: categoria } } : {},
          orientacao && orientacao !== 'all'
            ? {
                fotos: {
                  some: { orientacao: orientacao.toUpperCase() },
                },
              }
            : {},
          cor && cor !== 'all'
            ? {
                fotos: {
                  some: { corPredominante: cor },
                },
              }
            : {},
        ],
      };

      const data = await prisma.colecao.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 12,
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
    sampleCollections.filter((colecao) => {
        if (q) {
          const search = q.toLowerCase();
          const matchesName = colecao.nome?.toLowerCase().includes(search);
          const matchesDesc = colecao.descricao?.toLowerCase().includes(search);
          const matchesPhotos = colecao.fotos?.some(f => 
             f.titulo?.toLowerCase().includes(search) || 
             f.descricao?.toLowerCase().includes(search) ||
             f.tags?.some(t => t.toLowerCase().includes(search))
          );
          if (!matchesName && !matchesDesc && !matchesPhotos) return false;
        }
        if (categoria && categoria !== 'all' && colecao.categoria !== categoria) return false;
        // Mock filtering for orientation/color is harder without checking all photos in mock data, skipping for now or assuming true
        return true;
    }).map((colecao, index) => ({
        ...mapColecaoToCard(colecao, index),
        totalPhotos: colecao.fotos?.length ?? 0,
        photographerName: colecao.fotografo?.name
    }))
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
