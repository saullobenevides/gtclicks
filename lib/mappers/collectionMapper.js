const gradientFallbacks = [
  "linear-gradient(135deg,#1c3b3b,#58c6b0)",
  "linear-gradient(135deg,#1b1f3a,#5258f2)",
  "linear-gradient(135deg,#511b4b,#fb5ce3)",
];

import { serializePrismaData } from "@/lib/utils/serialization";

/**
 * Maps a Colecao entity from Prisma to a card display format
 * @param {Object} colecao - Prisma Colecao entity with relations
 * @param {number} index - Index for gradient fallback rotation
 * @returns {Object} Mapped collection card data
 */
export function mapColecaoToCard(colecao, index = 0) {
  return {
    id: colecao.id,
    name: colecao.nome,
    slug: colecao.slug,
    description: colecao.descricao ?? "",
    cover:
      colecao.capaUrl ?? gradientFallbacks[index % gradientFallbacks.length],
    createdAt: colecao.createdAt,
    photographer: colecao.fotografo
      ? {
          name: colecao.fotografo.user?.name ?? colecao.fotografo.username,
          city: colecao.fotografo.cidade,
          avatarUrl: colecao.fotografo.user?.image,
        }
      : undefined,
  };
}

/**
 * Maps a Colecao entity to homepage collection format
 * @param {Object} colecao - Prisma Colecao entity with relations
 * @param {number} index - Index for gradient fallback
 * @returns {Object} Homepage collection data
 */
export function mapColecaoToHomepage(colecao, index = 0) {
  return {
    ...mapColecaoToCard(colecao, index),
    totalPhotos: colecao._count?.fotos ?? 0,
    photographerName:
      colecao.fotografo?.user?.name ??
      (colecao.fotografo?.username || "Fotógrafo GTClicks"),
    precoFoto: colecao.precoFoto ? parseFloat(colecao.precoFoto) : 0,
  };
}

/**
 * Maps a Colecao entity with photos to detail page format
 * @param {Object} data - Prisma Colecao entity with fotos and folders
 * @returns {Object} Collection detail data
 */
export function mapColecaoToDetail(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.nome,
    capaUrl: data.capaUrl,
    location:
      data.local ||
      (data.cidade
        ? `${data.cidade}${data.estado ? `, ${data.estado}` : ""}`
        : null),
    eventDate: data.dataInicio,
    precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : 0,
    description: data.descricao,
    photographer: data.fotografo?.user?.name ?? "Fotógrafo GTClicks",
    photographerAvatar: data.fotografo?.user?.image,
    photographerUsername: data.fotografo?.username,
    folders: (data.folders || []).map((f) => ({
      id: f.id,
      name: f.nome,
      parentId: f.parentId,
      count: f._count?.fotos ?? 0,
    })),
    photos: (data.fotos || []).map((foto) => ({
      id: foto.id,
      title: foto.titulo,
      orientation: foto.orientacao,
      previewUrl: foto.previewUrl,
      folderId: foto.folderId,
      colecao: { precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : 0 },
    })),
  };
}

/**
 * Maps a Colecao entity to editor format
 * @param {Object} data - Prisma Colecao entity
 * @returns {Object} Collection editor data
 */
export function mapColecaoToEditor(data) {
  if (!data) return null;

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    slug: data.slug,
    categoria: data.categoria,
    status: data.status,
    capaUrl: data.capaUrl,
    precoFoto: data.precoFoto ? Number(data.precoFoto) : 0,
    cidade: data.cidade,
    estado: data.estado,
    local: data.local,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
    descontos: data.descontos ? serializePrismaData(data.descontos) : [],
    fotografoId: data.fotografoId,
    faceRecognitionEnabled: data.faceRecognitionEnabled,
    fotos: (data.fotos || []).map((foto) => ({
      id: foto.id,
      titulo: foto.titulo,
      orientacao: foto.orientacao,
      previewUrl: foto.previewUrl,
      folderId: foto.folderId,
      s3Key: foto.s3Key, // Apenas para editor (gestão); não expor em APIs públicas (Manual v3.0)
      sequentialId: foto.sequentialId,
      numeroSequencial: foto.numeroSequencial,
    })),
  };
}
