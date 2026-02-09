// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFotoToDetail(data: any) {
  if (!data) return null;

  const colecaoData = data.colecao
    ? {
        id: data.colecao.id,
        nome: data.colecao.nome,
        slug: data.colecao.slug,
        precoFoto: data.colecao.precoFoto
          ? parseFloat(data.colecao.precoFoto)
          : 0,
      }
    : null;

  return {
    id: data.id,
    titulo: data.titulo,
    numeroSequencial: data.numeroSequencial,
    orientacao: data.orientacao,
    descricao: data.descricao,
    previewUrl: data.previewUrl,
    categoria: data.categoriaFoto ?? data.categoria,
    corPredominante: data.corPredominante,
    width: data.width,
    height: data.height,
    camera: data.camera,
    lens: data.lens,
    focalLength: data.focalLength,
    iso: data.iso,
    shutterSpeed: data.shutterSpeed,
    aperture: data.aperture,
    colecao: colecaoData,
    fotografo: {
      id: data.fotografo?.id,
      username: data.fotografo?.username,
      name: data.fotografo?.user?.name ?? data.fotografo?.username,
      avatarUrl: data.fotografo?.user?.image,
      bio: data.fotografo?.bio,
    },
  };
}
