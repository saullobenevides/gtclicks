/**
 * Data Access Layer – Minhas Coleções (dashboard fotógrafo).
 * Funções puras que interagem com o Prisma. Manual v3.0.
 */

import prisma from "@/lib/prisma";

/**
 * Busca o fotógrafo pelo userId (Stack).
 * @param {string} userId
 * @returns {Promise<{ id: string, userId: string } | null>}
 */
export async function getFotografoByUserId(userId) {
  if (!userId) return null;
  return prisma.fotografo.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });
}

/**
 * Lista coleções do fotógrafo com paginação.
 * @param {string} fotografoId
 * @param {{ page: number, limit: number }} options
 * @returns {Promise<{ total: number, colecoes: Array, totalPages: number }>}
 */
export async function getColecoesPaginated(
  fotografoId,
  { page = 1, limit = 10 } = {}
) {
  if (!fotografoId) return { total: 0, colecoes: [], totalPages: 0 };

  const skip = (page - 1) * limit;

  const [total, rawColecoes] = await Promise.all([
    prisma.colecao.count({
      where: { fotografoId },
    }),
    prisma.colecao.findMany({
      where: { fotografoId },
      include: {
        _count: {
          select: { fotos: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
  ]);

  const colecoes = rawColecoes.map((c) => ({
    ...c,
    precoFoto: c.precoFoto ? Number(c.precoFoto) : 0,
  }));

  const totalPages = Math.ceil(total / limit);

  return { total, colecoes, totalPages };
}
