// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFotografoToCard(fotografo: any) {
  const colecoesCount =
    fotografo._count?.colecoes ?? fotografo.colecoes?.length ?? 0;
  return {
    username: fotografo.username,
    name: fotografo.user?.name ?? "Fotógrafo GTClicks",
    city: fotografo.cidade ?? "Brasil",
    specialties: fotografo.especialidades?.length
      ? fotografo.especialidades
      : ["autorais"],
    stats: { colecoes: colecoesCount },
    avatarUrl: fotografo.user?.image,
  };
}

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  bio: true,
  cidade: true,
  estado: true,
  instagram: true,
  telefone: true,
  especialidades: true,
  portfolioUrl: true,
  equipamentos: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFotografoToProfile(data: any, downloadsCount = 0) {
  if (!data) return null;

  const visibility =
    data.visibilitySettings && typeof data.visibilitySettings === "object"
      ? { ...DEFAULT_VISIBILITY, ...data.visibilitySettings }
      : DEFAULT_VISIBILITY;

  const show = (key: string) => visibility[key] !== false;

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
    colecoesPublicadas: data._count?.colecoes ?? data.colecoes?.length ?? 0,
    downloads: downloadsCount,
  };
}
