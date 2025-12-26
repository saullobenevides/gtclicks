import { collectionRepository } from "../../repository/CollectionRepository";
import { photographerRepository } from "../../repository/PhotographerRepository";
import { photoRepository } from "../../repository/PhotoRepository";
import {
  mapColecaoToCard,
  mapColecaoToHomepage,
  mapColecaoToDetail,
  mapColecaoToEditor,
} from "../mappers/collectionMapper";
import { mapFotografoToCard, mapFotografoToProfile } from "../mappers/photographerMapper";
import { mapFotoToDetail } from "../mappers/photoMapper";
import {
  sampleCollections,
  sampleHighlights,
  samplePhotographers,
  samplePhoto,
  sampleDownloads,
} from "./mocks/sampleData";
import { getCached, invalidate } from "@/lib/cache";

async function safeExecute(callback, fallback) {
  try {
    const result = await callback();
    return result;
  } catch (error) {
    console.warn("[data] Error executing query:", error.message);
    return fallback;
  }
}

export async function getHomepageData() {
  const [collections, photographers] = await Promise.all([
    safeExecute(
      async () => {
        const data = await collectionRepository.getForHomepage();
        return data.map((colecao, index) => mapColecaoToHomepage(colecao, index));
      },
      sampleCollections.map((item, index) => ({
        ...mapColecaoToCard(
          {
            ...item,
            fotografo: {
              username: item.fotografo?.username,
              cidade: item.fotografo?.cidade,
              user: { name: item.fotografo?.name },
            },
          },
          index
        ),
        totalPhotos: item.fotos?.length ?? 0,
        photographerName: item.fotografo?.name,
      }))
    ),
    safeExecute(
      async () => {
        const data = await photographerRepository.getForHomepage();
        const photographersWithDownloads = await Promise.all(
          data.map(async (fotografo) => {
            const downloads = await photographerRepository.countDownloads(fotografo.id);
            return { ...fotografo, realDownloads: downloads };
          })
        );
        return photographersWithDownloads.map(mapFotografoToCard);
      },
      samplePhotographers.map((item) => ({
        username: item.username,
        name: item.name,
        city: item.cidade,
        specialties: item.specialties ?? ["autorais"],
        stats: {
          colecoes: item.colecoesPublicadas ?? 0,
          downloads: item.downloads ?? 0,
        },
      }))
    ),
  ]);

  return {
    collections,
    photographers,
    highlights: sampleHighlights,
  };
}

export async function getCollections() {
  return safeExecute(
    async () => {
      const data = await collectionRepository.getAll();
      return data.map((colecao, index) => mapColecaoToHomepage(colecao, index));
    },
    sampleCollections.map((colecao, index) => ({
      ...mapColecaoToCard(
        {
          ...colecao,
          fotografo: { user: { name: colecao.fotografo?.name } },
        },
        index
      ),
      totalPhotos: colecao.fotos?.length ?? 0,
      photographerName: colecao.fotografo?.name,
    }))
  );
}

export async function getCollectionBySlug(slug) {
  return safeExecute(
    async () => {
      const data = await collectionRepository.getBySlug(slug);
      return mapColecaoToDetail(data);
    },
    sampleCollections
      .filter((colecao) => colecao.slug === slug)
      .map((colecao) => ({
        id: colecao.id,
        title: colecao.nome,
        description: colecao.descricao,
        photographer: colecao.fotografo?.name,
        photographerUsername: colecao.fotografo?.username,
        photos: colecao.fotos,
      }))[0] ?? null
  );
}

export async function getCollectionByIdForEdit(id) {
  return safeExecute(
    async () => {
      const data = await collectionRepository.getByIdForEdit(id);
      return mapColecaoToEditor(data);
    },
    sampleCollections.find((c) => c.id === id) ?? null
  );
}

export async function getPhotoById(id) {
  return safeExecute(
    async () => {
      const data = await photoRepository.getById(id);
      return mapFotoToDetail(data);
    },
    samplePhoto
      ? {
          id: samplePhoto.id,
          titulo: samplePhoto.titulo,
          orientacao: samplePhoto.orientacao,
          descricao: samplePhoto.descricao,
          tags: samplePhoto.tags,
          previewUrl: samplePhoto.previewUrl,
          width: samplePhoto.width,
          height: samplePhoto.height,
          camera: samplePhoto.camera,
          lens: samplePhoto.lens,
          focalLength: samplePhoto.focalLength,
          iso: samplePhoto.iso,
          shutterSpeed: samplePhoto.shutterSpeed,
          aperture: samplePhoto.aperture,
          fotografo: samplePhoto.fotografo,
          licencas: samplePhoto.licencas,
          colecao: null,
        }
      : null
  );
}

export async function getPhotographerByUsername(username) {
  return safeExecute(
    async () => {
      const data = await photographerRepository.getByUsername(username);
      if (!data) return null;
      const downloadsCount = await photographerRepository.countDownloads(data.id);
      return mapFotografoToProfile(data, downloadsCount);
    },
    (() => {
      const fallback = samplePhotographers.find((item) => item.username === username);
      if (!fallback) return null;
      return {
        username: fallback.username,
        name: fallback.name,
        city: fallback.cidade,
        bio: fallback.bio,
        colecoesPublicadas: fallback.colecoesPublicadas,
        downloads: fallback.downloads,
      };
    })()
  );
}

export async function getPhotosByPhotographerUsername(username) {
  return safeExecute(
    async () => {
      return await photoRepository.getByPhotographerUsername(username);
    },
    []
  );
}

export async function getCollectionsByPhotographerUsername(username) {
  return safeExecute(
    async () => {
      const colecoes = await collectionRepository.getByPhotographerUsername(username);
      return colecoes.map((colecao, index) => mapColecaoToHomepage(colecao, index));
    },
    []
  );
}

export async function searchCollections(filters = {}) {
  const { q, cor, orientacao, categoria, date } = filters;

  return safeExecute(
    async () => {
      const data = await collectionRepository.search(filters);
      return data.map((colecao, index) => mapColecaoToHomepage(colecao, index));
    },
    sampleCollections.filter((colecao) => {
        if (q) {
          const search = q.toLowerCase();
          const matchesName = colecao.nome?.toLowerCase().includes(search);
          const matchesDesc = colecao.descricao?.toLowerCase().includes(search);
          const matchesPhotos = colecao.fotos?.some(f => 
             f.titulo?.toLowerCase().includes(search) || 
             f.descricao?.toLowerCase().includes(search) ||
             f.tags?.some(t => t.toLowerCase().includes(search))
          );
          if (!matchesName && !matchesDesc && !matchesPhotos) return false;
        }
        if (categoria && categoria !== 'all' && colecao.categoria !== categoria) return false;
        return true;
    }).map((colecao, index) => ({
        ...mapColecaoToCard(colecao, index),
        totalPhotos: colecao.fotos?.length ?? 0,
        photographerName: colecao.fotografo?.name
    }))
  );
}

export async function searchPhotos(filters = {}) {
  return safeExecute(
    async () => {
      return await photoRepository.search(filters);
    },
    sampleCollections
      .flatMap((colecao) => colecao.fotos ?? [])
      .filter((foto) => {
        const { q, cor, orientacao, categoria } = filters;
        if (q) {
          const search = q.toLowerCase();
          const matchesTitle = foto.titulo?.toLowerCase().includes(search);
          const matchesDesc = foto.descricao?.toLowerCase().includes(search);
          const matchesTags = foto.tags?.some((tag) => tag.toLowerCase().includes(search));
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }
        if (cor && foto.corPredominante !== cor) return false;
        if (orientacao && foto.orientacao !== orientacao.toUpperCase()) return false;
        if (categoria && foto.categoria !== categoria) return false;
        return true;
      })
  );
}

export async function getLatestDownloads(limit = 5) {
  return safeExecute(
    async () => {
      return await photoRepository.getLatestDownloads(limit);
    },
    sampleDownloads
  );
}
