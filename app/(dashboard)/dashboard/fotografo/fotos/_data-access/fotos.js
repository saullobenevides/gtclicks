/**
 * DAL - Minhas Fotos
 * Data Access Layer para a página de fotos do dashboard do fotógrafo.
 */

import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/utils/serialization";

/**
 * Busca fotos do fotógrafo pelo userId
 *
 * @param {string} userId - ID do usuário Stack
 * @returns {Promise<Array>} Fotos publicadas do fotógrafo (serializadas para Client Components)
 */
export async function getFotosByUserId(userId) {
  if (!userId) return [];

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId },
  });

  if (!fotografo) return [];

  const fotos = await prisma.foto.findMany({
    where: { fotografoId: fotografo.id },
    orderBy: { createdAt: "desc" },
    include: {
      licencas: {
        include: { licenca: true },
      },
    },
  });

  return serializePrismaData(fotos);
}
