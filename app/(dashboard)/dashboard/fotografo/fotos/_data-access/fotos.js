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

  const fotos = await prisma.foto.findMany({
    where: { fotografo: { userId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      titulo: true,
      previewUrl: true,
      numeroSequencial: true,
      colecaoId: true,
      colecao: {
        select: { id: true, nome: true, precoFoto: true, descontos: true },
      },
      licencas: {
        select: {
          licencaId: true,
          preco: true,
          licenca: { select: { id: true, nome: true } },
        },
      },
    },
  });

  return serializePrismaData(fotos);
}
