import prisma from "@/lib/prisma";

/**
 * Repository for Colecao (Collection) database operations
 */
export class CollectionRepository {
  /**
   * Get collections for homepage (latest 3)
   */
  async getForHomepage() {
    return await prisma.colecao.findMany({
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
  }

  /**
   * Get all collections
   */
  async getAll() {
    return await prisma.colecao.findMany({
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
  }

  /**
   * Get collection by slug with photos and folders
   * @param {string} slug - Collection slug
   */
  async getBySlug(slug) {
    if (!slug) return null;

    return await prisma.colecao.findUnique({
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
  }

  /**
   * Get collection by ID for editing
   * @param {string} id - Collection ID
   */
  async getByIdForEdit(id) {
    if (!id) return null;

    return await prisma.colecao.findUnique({
      where: { id },
      include: {
        fotos: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Get collections by photographer username
   * @param {string} username - Photographer username
   */
  async getByPhotographerUsername(username) {
    if (!username) return [];

    const fotografo = await prisma.fotografo.findUnique({
      where: { username },
    });

    if (!fotografo) return [];

    return await prisma.colecao.findMany({
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
  }

  /**
   * Search collections with filters
   * @param {Object} filters - Search filters (q, cor, orientacao, categoria, date)
   */
  async search(filters = {}) {
    const { q, cor, orientacao, categoria, date } = filters;

    // Date filtering logic
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
            lte: endOfDay
          }
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
        dateFilter,
      ],
    };

    return await prisma.colecao.findMany({
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
  }
}

export const collectionRepository = new CollectionRepository();
