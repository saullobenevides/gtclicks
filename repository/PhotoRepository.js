import prisma from "@/lib/prisma";
import { PedidoStatus } from "@prisma/client";

/**
 * Repository for Foto (Photo) database operations
 */
export class PhotoRepository {
  /**
   * Get photo by ID with full relations
   * @param {string} id - Photo ID
   */
  async getById(id) {
    if (!id) return null;

    return await prisma.foto.findUnique({
      where: { id },
      include: {
        fotografo: { include: { user: true } },
        colecao: true,
        licencas: {
          include: { licenca: true },
        },
      },
    });
  }

  /**
   * Get photos by photographer username
   * @param {string} username - Photographer username
   */
  async getByPhotographerUsername(username) {
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
  }

  /**
   * Search photos with filters
   * @param {Object} filters - Search filters (q, cor, orientacao, categoria)
   */
  async search(filters = {}) {
    const { q, cor, orientacao, categoria } = filters;

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

    return await prisma.foto.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  }

  /**
   * Get latest downloads
   * @param {number} limit - Number of downloads to retrieve
   */
  async getLatestDownloads(limit = 5) {
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
  }
}

export const photoRepository = new PhotoRepository();
