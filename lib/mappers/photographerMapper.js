/**
 * Maps a Fotografo entity from Prisma to a card display format
 * @param {Object} fotografo - Prisma Fotografo entity with relations
 * @returns {Object} Mapped photographer card data
 */
export function mapFotografoToCard(fotografo) {
  return {
    username: fotografo.username,
    name: fotografo.user?.name ?? "Fotógrafo GTClicks",
    city: fotografo.cidade ?? "Brasil",
    specialties: fotografo.especialidades?.length
      ? fotografo.especialidades
      : ["autorais"],
    stats: {
      colecoes: fotografo.colecoes?.length ?? 0,
    },
    avatarUrl: fotografo.user?.image,
  };
}

/**
 * Maps a Fotografo entity to profile page format
 * @param {Object} data - Prisma Fotografo entity
 * @param {number} downloadsCount - Count of paid downloads
 * @returns {Object} Photographer profile data
 */
export function mapFotografoToProfile(data, downloadsCount = 0) {
  if (!data) return null;

  return {
    username: data.username,
    name: data.user?.name ?? "Fotógrafo GTClicks",
    avatarUrl: data.user?.image,
    city: data.cidade,
    state: data.estado,
    cityState: data.cidade && data.estado 
      ? `${data.cidade}, ${data.estado}` 
      : (data.cidade || data.estado || "Brasil"),
    bio: data.bio,
    instagram: data.instagram,
    telefone: data.telefone,
    colecoesPublicadas: data.colecoes?.length ?? 0,
    downloads: downloadsCount,
  };
}
