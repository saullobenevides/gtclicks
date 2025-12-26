import prisma from "@/lib/prisma";

/**
 * Repository for Fotografo (Photographer) database operations
 */
export class PhotographerRepository {
  /**
   * Get photographers for homepage (top 10 by collection count)
   */
  async getForHomepage() {
    return await prisma.fotografo.findMany({
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
          _count: 'desc'
        }
      }
    });
  }

  /**
   * Get photographer by username with relations
   * @param {string} username - Photographer username
   */
  async getByUsername(username) {
    if (!username) return null;

    return await prisma.fotografo.findUnique({
      where: { username },
      include: {
        user: true,
        colecoes: true,
        _count: { select: { fotos: true } },
      },
    });
  }

  /**
   * Count paid downloads for a photographer
   * @param {string} fotografoId - Photographer ID
   */
  async countDownloads(fotografoId) {
    return await prisma.itemPedido.count({
      where: {
        foto: { fotografoId },
        pedido: { status: "PAGO" },
      },
    });
  }
}

export const photographerRepository = new PhotographerRepository();
