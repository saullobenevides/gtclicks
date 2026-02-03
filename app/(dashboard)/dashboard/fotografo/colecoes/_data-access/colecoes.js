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

const SORT_FIELDS = {
  nome: "nome",
  status: "status",
  createdAt: "createdAt",
  fotos: "fotos",
};

/**
 * Lista coleções do fotógrafo com paginação, filtros e ordenação.
 * @param {string} fotografoId
 * @param {{ page: number, limit: number, status?: string, q?: string, sort?: string, order?: string }} options
 * @returns {Promise<{ total: number, colecoes: Array, totalPages: number }>}
 */
export async function getColecoesPaginated(
  fotografoId,
  { page = 1, limit = 10, status, q, sort = "createdAt", order = "desc" } = {}
) {
  if (!fotografoId) return { total: 0, colecoes: [], totalPages: 0 };

  const skip = (page - 1) * limit;

  const where = { fotografoId };

  if (status && status !== "all") {
    where.status = status;
  }

  if (q?.trim()) {
    where.OR = [
      { nome: { contains: q.trim(), mode: "insensitive" } },
      { descricao: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const dir = order === "asc" ? "asc" : "desc";
  const sortField = SORT_FIELDS[sort] || "createdAt";

  let orderBy;
  if (sortField === "fotos") {
    orderBy = { fotos: { _count: dir } };
  } else {
    orderBy = { [sortField]: dir };
  }

  const [total, rawColecoes] = await Promise.all([
    prisma.colecao.count({ where }),
    prisma.colecao.findMany({
      where,
      include: {
        _count: {
          select: { fotos: true },
        },
      },
      orderBy,
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
