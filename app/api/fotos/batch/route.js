import { OrientacaoFoto } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function resolveOrientation(value) {
  if (!value) return OrientacaoFoto.HORIZONTAL;
  const normalized = value.toString().toUpperCase();
  return Object.prototype.hasOwnProperty.call(OrientacaoFoto, normalized)
    ? normalized
    : OrientacaoFoto.HORIZONTAL;
}

async function ensureUniqueSlug(base, model) {
  const client = model === "colecao" ? prisma.colecao : prisma.foto;
  let slug = base;
  let suffix = 1;
  let exists = await client.findUnique({ where: { slug } });
  while (exists) {
    slug = `${base}-${suffix++}`;
    exists = await client.findUnique({ where: { slug } });
  }
  return slug;
}

export async function POST(request) {
  try {
    const {
      fotografoId,
      modoColecao = "avulso",
      colecaoId,
      novaColecao,
      coverIndex,
      fotos = [],
    } = await request.json();

    if (!fotografoId) {
      return NextResponse.json(
        { error: "Informe o fotografoId." },
        { status: 400 }
      );
    }

    if (!Array.isArray(fotos) || fotos.length === 0) {
      return NextResponse.json(
        { error: "Envie ao menos uma foto." },
        { status: 400 }
      );
    }

    let colecaoDestinoId = null;

    if (modoColecao === "existente") {
      if (!colecaoId) {
        return NextResponse.json(
          { error: "Selecione uma colecao existente." },
          { status: 400 }
        );
      }
      colecaoDestinoId = colecaoId;
    }

    if (modoColecao === "nova") {
      if (!novaColecao?.nome) {
        return NextResponse.json(
          { error: "Informe o nome da nova colecao." },
          { status: 400 }
        );
      }

      const slug = await ensureUniqueSlug(slugify(novaColecao.nome), "colecao");

      // Determine cover URL
      let finalCapaUrl = novaColecao.capaUrl;
      if (
        typeof coverIndex === "number" &&
        coverIndex >= 0 &&
        coverIndex < fotos.length &&
        fotos[coverIndex]?.previewUrl
      ) {
        finalCapaUrl = fotos[coverIndex].previewUrl;
      }

      const created = await prisma.colecao.create({
        data: {
          nome: novaColecao.nome,
          slug,
          descricao: novaColecao.descricao,
          capaUrl: finalCapaUrl,
          fotografoId,
        },
      });
      colecaoDestinoId = created.id;
    }

    const createdFotos = [];

    for (const foto of fotos) {
      if (!foto.previewUrl || !foto.originalUrl) {
        return NextResponse.json(
          { error: "Cada foto precisa de previewUrl e originalUrl." },
          { status: 400 }
        );
      }

      const slug = await ensureUniqueSlug(
        slugify(foto.titulo || `foto-${Date.now()}`),
        "foto"
      );

      const createdFoto = await prisma.foto.create({
        data: {
          titulo: foto.titulo || "Foto sem titulo",
          slug,
          descricao: foto.descricao,
          tags: Array.isArray(foto.tags)
            ? foto.tags
            : typeof foto.tags === "string" && foto.tags.length
            ? foto.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
            : [],
          orientacao: resolveOrientation(foto.orientacao),
          categoria: foto.categoria,
          corPredominante: foto.corPredominante,
          previewUrl: foto.previewUrl,
          originalUrl: foto.originalUrl,
          fotografoId,
          colecaoId: colecaoDestinoId,
        },
      });

      createdFotos.push(createdFoto);
    }

    return NextResponse.json({
      data: createdFotos,
      colecaoId: colecaoDestinoId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel salvar as fotos.", details: error.message },
      { status: 500 }
    );
  }
}
