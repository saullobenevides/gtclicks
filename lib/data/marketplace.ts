import prisma from "@/lib/prisma";
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
import { getCached } from "@/lib/cache";
import { serializePrismaData } from "@/lib/utils/serialization";

async function safeExecute<T>(
  callback: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    console.error("[data] Error executing query:", error);
    if (
      process.env.NODE_ENV === "production" &&
      process.env.USE_MOCK_DATA !== "true"
    ) {
      throw error;
    }
    console.warn("[data] Using fallback data due to error.");
    return fallback;
  }
}

const HOMEPAGE_CACHE_KEY = "homepage:data";
const HOMEPAGE_CACHE_TTL = 60;

export async function getHomepageData() {
  return getCached(HOMEPAGE_CACHE_KEY, fetchHomepageData, HOMEPAGE_CACHE_TTL);
}

async function fetchHomepageData() {
  const [
    featuredCollections,
    recentCollections,
    photographers,
    topBuyers,
    lastMonthWinner,
  ] = await Promise.all([
    safeExecute(
      async () => {
        const data = await prisma.colecao.findMany({
          where: { status: "PUBLICADA" },
          take: 3,
          orderBy: { views: "desc" },
          include: {
            fotografo: {
              select: {
                username: true,
                cidade: true,
                user: { select: { name: true } },
              },
            },
            _count: { select: { fotos: true } },
          },
        });
        return data.map((colecao, index) =>
          mapColecaoToHomepage(colecao, index)
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
          index
        ),
        totalPhotos: item.fotos?.length ?? 0,
        photographerName: item.fotografo?.name,
        precoFoto: 0,
      }))
    ),
    safeExecute(
      async () => {
        const data = await prisma.colecao.findMany({
          where: { status: "PUBLICADA" },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            fotografo: {
              select: {
                username: true,
                cidade: true,
                user: { select: { name: true } },
              },
            },
            _count: { select: { fotos: true } },
          },
        });
        return data.map((colecao, index) =>
          mapColecaoToHomepage(colecao, index)
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
          index
        ),
        totalPhotos: item.fotos?.length ?? 0,
        photographerName: item.fotografo?.name,
        precoFoto: 0,
      }))
    ),
    safeExecute(
      async () => {
        const data = await prisma.fotografo.findMany({
          take: 10,
          include: {
            user: { select: { name: true, image: true } },
            _count: { select: { fotos: true, colecoes: true } },
          },
          orderBy: { colecoes: { _count: "desc" } },
        });

        const fotografoIds = data.map((f) => f.id);
        const downloadRows = await prisma.itemPedido.findMany({
          where: {
            pedido: { status: "PAGO" },
            foto: { fotografoId: { in: fotografoIds } },
          },
          select: { foto: { select: { fotografoId: true } } },
        });
        const downloadsByFotografo = downloadRows.reduce(
          (acc: Record<string, number>, row) => {
            const fid = row.foto.fotografoId;
            acc[fid] = (acc[fid] || 0) + 1;
            return acc;
          },
          {}
        );

        const photographersWithDownloads = data.map((f) => ({
          ...f,
          realDownloads: downloadsByFotografo[f.id] || 0,
        }));
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
        avatarUrl: undefined,
      }))
    ),
    safeExecute(async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const aggregations = await prisma.pedido.groupBy({
        by: ["userId"],
        _sum: { total: true },
        _count: { _all: true },
        where: {
          status: "PAGO",
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: {
          _sum: { total: "desc" },
        },
        take: 3,
      });

      const userIds = aggregations.map((a) => a.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true },
      });

      return aggregations.map((agg, index) => {
        const user = users.find((u) => u.id === agg.userId) || {
          id: `buyer-${index}`,
          name: "Usuário",
          image: null,
        };
        return {
          id: user.id,
          rank: index + 1,
          name: user.name,
          avatar: user.image,
          totalSpent: Number(agg._sum.total || 0),
          ordersCount: agg._count._all,
        };
      });
    }, [
      {
        id: "mock1",
        rank: 1,
        name: "Sofia Martinez",
        avatar: null,
        totalSpent: 1250.0,
        ordersCount: 15,
      },
      {
        id: "mock2",
        rank: 2,
        name: "Lucas Silva",
        avatar: null,
        totalSpent: 980.5,
        ordersCount: 8,
      },
      {
        id: "mock3",
        rank: 3,
        name: "Ana Costa",
        avatar: null,
        totalSpent: 450.0,
        ordersCount: 4,
      },
    ]),
    safeExecute(
      async () => {
        const now = new Date();
        const startOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const endOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        );

        const aggregations = await prisma.pedido.groupBy({
          by: ["userId"],
          _sum: { total: true },
          _count: { _all: true },
          where: {
            status: "PAGO",
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
          orderBy: { _sum: { total: "desc" } },
          take: 1,
        });

        if (aggregations.length === 0) return null;

        const agg = aggregations[0];
        const user = await prisma.user.findUnique({
          where: { id: agg.userId },
          select: { id: true, name: true, image: true },
        });

        return {
          id: user?.id || `winner-${agg.userId}`,
          name: user?.name || "Usuário",
          avatar: user?.image || null,
          totalSpent: Number(agg._sum.total || 0),
          ordersCount: agg._count._all,
        };
      },
      {
        id: "mock-winner",
        name: "Sofia Martinez",
        avatar: null,
        totalSpent: 4894,
        ordersCount: 12,
      }
    ),
  ]);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const currentMonth = monthNames[new Date().getMonth()];
  const lastMonth = monthNames[(new Date().getMonth() + 11) % 12];

  return {
    featuredCollections,
    recentCollections,
    photographers,
    highlights: sampleHighlights,
    topBuyers: topBuyers || [],
    lastMonthWinner: lastMonthWinner || null,
    rankingMonth: currentMonth,
    lastMonthName: lastMonth,
  };
}

export async function getCollections(limit = 50) {
  return safeExecute(
    async () => {
      const data = await prisma.colecao.findMany({
        where: { status: "PUBLICADA" },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          fotografo: {
            select: {
              username: true,
              cidade: true,
              user: { select: { name: true } },
            },
          },
          _count: { select: { fotos: true } },
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
        index
      ),
      totalPhotos: colecao.fotos?.length ?? 0,
      photographerName: colecao.fotografo?.name,
      precoFoto: 0,
    }))
  );
}

export async function getRelatedCollections(
  excludeId: string | null | undefined,
  limit = 3
) {
  return safeExecute(async () => {
    const data = await prisma.colecao.findMany({
      where: {
        status: "PUBLICADA",
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        fotografo: {
          select: {
            username: true,
            cidade: true,
            user: { select: { name: true } },
          },
        },
        _count: { select: { fotos: true } },
      },
    });
    return data.map((colecao, index) => mapColecaoToHomepage(colecao, index));
  }, []);
}

export async function getCollectionBySlugSafe(slug: string | null | undefined) {
  return safeExecute(async () => {
    if (!slug) return null;
    const data = await prisma.colecao.findUnique({
      where: { slug },
      include: {
        fotografo: {
          select: {
            username: true,
            user: { select: { name: true, image: true } },
          },
        },
        fotos: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            titulo: true,
            numeroSequencial: true,
            orientacao: true,
            previewUrl: true,
            folderId: true,
            dataCaptura: true,
          },
        },
        folders: {
          select: {
            id: true,
            nome: true,
            parentId: true,
            _count: { select: { fotos: true } },
          },
          orderBy: { nome: "asc" },
        },
      },
    });

    if (!data) return null;

    const result = {
      id: data.id,
      title: data.nome,
      capaUrl: data.capaUrl,
      location:
        data.local ||
        (data.cidade
          ? `${data.cidade}${data.estado ? `, ${data.estado}` : ""}`
          : null),
      eventDate: data.dataInicio,
      precoFoto: data.precoFoto ? Number(data.precoFoto) : 0,
      description: data.descricao,
      photographer: data.fotografo?.user?.name ?? "Fotógrafo GTClicks",
      photographerAvatar: data.fotografo?.user?.image,
      photographerUsername: data.fotografo?.username,
      folders: (data.folders || []).map((f) => ({
        id: f.id,
        name: f.nome,
        parentId: f.parentId,
        count: f._count?.fotos ?? 0,
      })),
      photos: (data.fotos || []).map((foto) => ({
        id: foto.id,
        title: foto.titulo,
        numeroSequencial: foto.numeroSequencial,
        orientation: foto.orientacao,
        previewUrl: foto.previewUrl,
        folderId: foto.folderId,
        dataCaptura: foto.dataCaptura,
        colecao: {
          precoFoto: data.precoFoto ? Number(data.precoFoto) : 0,
          descontos: (data.descontos as unknown[]) || [],
          nome: data.nome,
        },
      })),
    };

    return serializePrismaData(result);
  }, null);
}

export async function getCollectionByIdForEditSafe(
  id: string | null | undefined
) {
  return safeExecute(async () => {
    if (!id) return null;
    const data = await prisma.colecao.findUnique({
      where: { id },
      include: {
        fotos: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            titulo: true,
            orientacao: true,
            previewUrl: true,
            folderId: true,
            sequentialId: true,
            numeroSequencial: true,
          },
        },
      },
    });

    if (!data) return null;

    const result = mapColecaoToEditor(data);
    return serializePrismaData(result);
  }, null as ReturnType<typeof mapColecaoToEditor>);
}

export async function getPhotoById(id: string | null | undefined) {
  return safeExecute(
    async () => {
      if (!id) return null;
      const data = await prisma.foto.findUnique({
        where: { id },
        select: {
          id: true,
          titulo: true,
          numeroSequencial: true,
          orientacao: true,
          descricao: true,
          previewUrl: true,
          categoriaFoto: true,
          width: true,
          height: true,
          camera: true,
          lens: true,
          focalLength: true,
          iso: true,
          shutterSpeed: true,
          aperture: true,
          fotografo: {
            select: {
              id: true,
              username: true,
              bio: true,
              user: { select: { name: true, image: true } },
            },
          },
          colecao: {
            select: { id: true, nome: true, slug: true, precoFoto: true },
          },
        },
      });
      return mapFotoToDetail(data);
    },
    samplePhoto
      ? mapFotoToDetail(samplePhoto as Parameters<typeof mapFotoToDetail>[0])
      : null
  );
}

export async function getPhotographerByUsername(
  username: string | null | undefined
) {
  return safeExecute(
    async () => {
      if (!username) return null;
      const data = await prisma.fotografo.findUnique({
        where: { username },
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { fotos: true, colecoes: true } },
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
        (item) => item.username === username
      );
      if (!fallback) return null;
      return {
        username: fallback.username,
        name: fallback.name,
        avatarUrl: undefined,
        city: fallback.cidade,
        state: null,
        cityState: fallback.cidade ?? null,
        bio: fallback.bio,
        instagram: null,
        telefone: null,
        portfolioUrl: null,
        equipamentos: null,
        especialidades: fallback.specialties ?? [],
        colecoesPublicadas: fallback.colecoesPublicadas,
        downloads: fallback.downloads,
      };
    })()
  );
}

export async function getPhotosByPhotographerUsername(
  username: string | null | undefined
) {
  return safeExecute(async () => {
    if (!username) return [];
    return prisma.foto.findMany({
      where: { fotografo: { username } },
      orderBy: { createdAt: "desc" },
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

export interface SearchFilters {
  q?: string;
  cidade?: string;
  categoria?: string;
  cor?: string;
  orientacao?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export async function getCollectionsByPhotographerUsername(
  username: string | null | undefined,
  page = 1,
  limit = 12
) {
  const skip = (page - 1) * limit;

  return safeExecute(
    async () => {
      if (!username) return { data: [], metadata: { total: 0 } };

      const where = {
        fotografo: { username },
        status: "PUBLICADA" as const,
      };

      const [count, colecoes] = await Promise.all([
        prisma.colecao.count({ where }),
        prisma.colecao.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
          include: {
            fotografo: {
              select: {
                username: true,
                cidade: true,
                user: { select: { name: true } },
              },
            },
            _count: { select: { fotos: true } },
          },
        }),
      ]);

      return {
        data: colecoes.map((colecao, index) =>
          mapColecaoToHomepage(colecao, index)
        ),
        metadata: {
          total: count,
          page: Number(page),
          totalPages: Math.ceil(count / limit),
          hasMore: skip + colecoes.length < count,
        },
      };
    },
    { data: [], metadata: { total: 0 } }
  );
}

const CITIES_CACHE_KEY = "marketplace:distinct-cities";
const CITIES_CACHE_TTL = 3600;

export async function getDistinctCities() {
  return getCached(CITIES_CACHE_KEY, fetchDistinctCities, CITIES_CACHE_TTL);
}

async function fetchDistinctCities() {
  return safeExecute(async () => {
    const rows = await prisma.colecao.findMany({
      where: { status: "PUBLICADA", cidade: { not: null } },
      select: { cidade: true },
      distinct: ["cidade"],
      orderBy: { cidade: "asc" },
    });
    return rows.map((r) => r.cidade).filter(Boolean) as string[];
  }, ["Manaus, AM", "São Paulo, SP"]);
}

const PHOTOGRAPHER_CITIES_CACHE_KEY = "marketplace:photographer-cities";
const PHOTOGRAPHER_CITIES_TTL = 3600;

export async function getDistinctPhotographerCities() {
  return getCached(
    PHOTOGRAPHER_CITIES_CACHE_KEY,
    fetchDistinctPhotographerCities,
    PHOTOGRAPHER_CITIES_TTL
  );
}

async function fetchDistinctPhotographerCities() {
  return safeExecute(async () => {
    const rows = await prisma.fotografo.findMany({
      where: {
        cidade: { not: null },
        user: { isActive: true },
      },
      select: { cidade: true },
      distinct: ["cidade"],
      orderBy: { cidade: "asc" },
    });
    return rows.map((r) => r.cidade).filter(Boolean) as string[];
  }, ["Manaus, AM", "São Paulo, SP"]);
}

const SEARCH_PHOTOGRAPHERS_TTL = 300;

export async function searchPhotographers(filters: SearchFilters = {}) {
  const { q, cidade, categoria, page = 1, limit = 12 } = filters;
  const cacheKey = `search:photographers:${[
    q,
    cidade,
    categoria,
    page,
    limit,
  ].join(":")}`;

  return getCached(
    cacheKey,
    () => searchPhotographersFetch(filters),
    SEARCH_PHOTOGRAPHERS_TTL
  );
}

async function searchPhotographersFetch(filters: SearchFilters = {}) {
  const { q, cidade, categoria, page = 1, limit = 12 } = filters;
  const skip = (page - 1) * limit;

  return safeExecute(
    async () => {
      const where = {
        user: { isActive: true },
        ...(cidade && cidade !== "all" ? { cidade: { equals: cidade } } : {}),
        ...(q
          ? {
              OR: [
                { username: { contains: q, mode: "insensitive" as const } },
                {
                  user: { name: { contains: q, mode: "insensitive" as const } },
                },
                { bio: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(categoria && categoria !== "all"
          ? {
              colecoes: {
                some: {
                  status: "PUBLICADA" as const,
                  categoria: { equals: categoria },
                },
              },
            }
          : {}),
      };

      const [count, data] = await Promise.all([
        prisma.fotografo.count({ where }),
        prisma.fotografo.findMany({
          where,
          include: {
            user: { select: { name: true, image: true } },
            _count: { select: { colecoes: true } },
          },
          orderBy: { user: { name: "asc" } },
          skip,
          take: limit,
        }),
      ]);

      return {
        data,
        metadata: {
          total: count,
          page: Number(page),
          totalPages: Math.ceil(count / limit),
          hasMore: skip + data.length < count,
        },
      };
    },
    { data: [], metadata: { total: 0, page: 1, totalPages: 0, hasMore: false } }
  );
}

const SEARCH_COLLECTIONS_TTL = 300;

export async function searchCollections(filters: SearchFilters = {}) {
  const {
    q,
    cor,
    orientacao,
    categoria,
    cidade,
    date,
    page = 1,
    limit = 12,
  } = filters;
  const cacheKey = `search:collections:${[
    q,
    cor,
    orientacao,
    categoria,
    cidade,
    date,
    page,
    limit,
  ].join(":")}`;

  return getCached(
    cacheKey,
    () => searchCollectionsFetch(filters),
    SEARCH_COLLECTIONS_TTL
  );
}

async function searchCollectionsFetch(filters: SearchFilters = {}) {
  const {
    q,
    cor,
    orientacao,
    categoria,
    cidade,
    date,
    page = 1,
    limit = 12,
  } = filters;
  const skip = (page - 1) * limit;

  return safeExecute(
    async () => {
      let dateFilter: Record<string, unknown> = {};
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        if (!isNaN(startOfDay.getTime())) {
          dateFilter = {
            OR: [
              {
                AND: [
                  { dataInicio: { not: null } },
                  { dataFim: { not: null } },
                  { dataInicio: { lte: endOfDay } },
                  { dataFim: { gte: startOfDay } },
                ],
              },
              {
                AND: [
                  { dataInicio: { gte: startOfDay } },
                  { dataInicio: { lte: endOfDay } },
                  { dataFim: null },
                ],
              },
            ],
          };
        }
      }

      const where = {
        AND: [
          q
            ? {
                OR: [
                  { nome: { contains: q, mode: "insensitive" as const } },
                  { descricao: { contains: q, mode: "insensitive" as const } },
                  {
                    fotos: {
                      some: {
                        OR: [
                          {
                            titulo: {
                              contains: q,
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            descricao: {
                              contains: q,
                              mode: "insensitive" as const,
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    fotografo: {
                      OR: [
                        {
                          username: {
                            contains: q,
                            mode: "insensitive" as const,
                          },
                        },
                        {
                          user: {
                            name: { contains: q, mode: "insensitive" as const },
                          },
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
          cidade && cidade !== "all" ? { cidade: { equals: cidade } } : {},
          orientacao && orientacao !== "all"
            ? {
                fotos: {
                  some: {
                    orientacao: orientacao.toUpperCase() as
                      | "HORIZONTAL"
                      | "VERTICAL",
                  },
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
          { status: "PUBLICADA" as const },
          Object.keys(dateFilter).length ? dateFilter : {},
        ],
      };

      const [count, data] = await Promise.all([
        prisma.colecao.count({ where }),
        prisma.colecao.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
          include: {
            fotografo: {
              select: {
                username: true,
                cidade: true,
                user: { select: { name: true } },
              },
            },
            _count: { select: { fotos: true } },
          },
        }),
      ]);

      return {
        data: data.map((colecao, index) =>
          mapColecaoToHomepage(colecao, index)
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
            (f: { titulo?: string; descricao?: string }) =>
              f.titulo?.toLowerCase().includes(search) ||
              f.descricao?.toLowerCase().includes(search)
          );
          if (!matchesName && !matchesDesc && !matchesPhotos) return false;
        }
        if (categoria && categoria !== "all" && colecao.categoria !== categoria)
          return false;
        const colCidade = colecao.cidade ?? colecao.fotografo?.cidade;
        if (cidade && cidade !== "all" && colCidade !== cidade) return false;
        if (date) {
          const d = new Date(date);
          d.setUTCHours(0, 0, 0, 0);
          const start = colecao.dataInicio
            ? new Date(colecao.dataInicio)
            : null;
          const end = colecao.dataFim ? new Date(colecao.dataFim) : null;
          if (start && end) {
            const s = new Date(start);
            s.setUTCHours(0, 0, 0, 0);
            const e = new Date(end);
            e.setUTCHours(23, 59, 59, 999);
            if (d.getTime() < s.getTime() || d.getTime() > e.getTime())
              return false;
          } else if (start) {
            const s = new Date(start);
            s.setUTCHours(0, 0, 0, 0);
            if (s.getTime() !== d.getTime()) return false;
          } else return false;
        }
        return true;
      });

      const paginated = filtered.slice(skip, skip + limit);

      return {
        data: paginated.map((colecao, index) => ({
          ...mapColecaoToCard(colecao, index),
          totalPhotos: colecao.fotos?.length ?? 0,
          photographerName: colecao.fotografo?.name,
          precoFoto: 0,
        })),
        metadata: {
          total: filtered.length,
          page: Number(page),
          totalPages: Math.ceil(filtered.length / limit),
          hasMore: skip + paginated.length < filtered.length,
        },
      };
    })()
  );
}

export async function searchPhotos(filters: SearchFilters = {}) {
  return safeExecute(
    async () => {
      const { q, cor, orientacao, categoria } = filters;
      const where = {
        AND: [
          q
            ? {
                OR: [
                  { titulo: { contains: q, mode: "insensitive" as const } },
                  { descricao: { contains: q, mode: "insensitive" as const } },
                ],
              }
            : {},
          cor ? { corPredominante: { equals: cor } } : {},
          orientacao
            ? {
                orientacao: orientacao.toUpperCase() as
                  | "HORIZONTAL"
                  | "VERTICAL",
              }
            : {},
          categoria ? { categoriaFoto: { equals: categoria } } : {},
        ],
      };
      return prisma.foto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 12,
      });
    },
    sampleCollections
      .flatMap((colecao) => colecao.fotos ?? [])
      .filter(
        (foto: {
          titulo?: string;
          descricao?: string;
          corPredominante?: string;
          orientacao?: string;
          categoria?: string;
        }) => {
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
        }
      )
  );
}

export async function getLatestDownloads(limit = 5) {
  return safeExecute(async () => {
    const pedidos = await prisma.pedido.findMany({
      where: { status: "PAGO" },
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      }))
    );
  }, sampleDownloads);
}
