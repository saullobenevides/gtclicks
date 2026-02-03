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

const DEFAULT_VISIBILITY = {
  bio: true,
  cidade: true,
  estado: true,
  instagram: true,
  telefone: true,
  especialidades: true,
  portfolioUrl: true,
  equipamentos: true,
};

/**
 * Maps a Fotografo entity to profile page format.
 * Respects visibilitySettings: hidden fields are returned as null/empty.
 * @param {Object} data - Prisma Fotografo entity
 * @param {number} downloadsCount - Count of paid downloads
 * @returns {Object} Photographer profile data
 */
export function mapFotografoToProfile(data, downloadsCount = 0) {
  if (!data) return null;

  const visibility =
    data.visibilitySettings && typeof data.visibilitySettings === "object"
      ? { ...DEFAULT_VISIBILITY, ...data.visibilitySettings }
      : DEFAULT_VISIBILITY;

  const show = (key) => visibility[key] !== false;

  return {
    username: data.username,
    name: data.user?.name ?? "Fotógrafo GTClicks",
    avatarUrl: data.user?.image,
    city: show("cidade") ? data.cidade : null,
    state: show("estado") ? data.estado : null,
    cityState:
      show("cidade") && show("estado") && data.cidade && data.estado
        ? `${data.cidade}, ${data.estado}`
        : show("cidade") && data.cidade
        ? data.cidade
        : show("estado") && data.estado
        ? data.estado
        : null,
    bio: show("bio") ? data.bio : null,
    instagram: show("instagram") ? data.instagram : null,
    telefone: show("telefone") ? data.telefone : null,
    portfolioUrl: show("portfolioUrl") ? data.portfolioUrl : null,
    equipamentos: show("equipamentos") ? data.equipamentos : null,
    especialidades: show("especialidades") ? data.especialidades ?? [] : [],
    colecoesPublicadas: data.colecoes?.length ?? 0,
    downloads: downloadsCount,
  };
}
