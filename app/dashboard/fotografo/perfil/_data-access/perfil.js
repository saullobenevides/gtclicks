/**
 * DAL - Perfil do Fotógrafo
 * Data Access Layer para a página de perfil do dashboard.
 */

import prisma from "@/lib/prisma";

/**
 * Busca o fotógrafo pelo userId (usuário autenticado)
 *
 * @param {string} userId - ID do usuário Stack
 * @returns {Promise<import('@prisma/client').Fotografo | null>}
 */
export async function getFotografoByUserId(userId) {
  if (!userId) return null;

  return prisma.fotografo.findUnique({
    where: { userId },
  });
}
