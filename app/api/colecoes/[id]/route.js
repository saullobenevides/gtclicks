import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { slugify } from "@/lib/slug";
import { deleteManyPhotoFiles } from "@/lib/s3-delete";

export async function PUT(request, context) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const { id: colecaoId } = params;
    if (!colecaoId) {
      return NextResponse.json(
        { error: "ID da coleção é obrigatório" },
        { status: 400 },
      );
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Perfil de fotografo nao encontrado" },
        { status: 403 },
      );
    }

    const body = await request.json();
    console.log("API UPDATE Payload:", body);
    const {
      nome,
      descricao,
      categoria,
      status,
      precoFoto,
      capaUrl,
      cidade,
      estado,
      local,
      dataInicio,
      dataFim,
      descontos,
    } = body;

    // Verify ownership
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
    });

    if (!colecao || colecao.fotografoId !== fotografo.id) {
      return NextResponse.json(
        { error: "Coleção não encontrada ou não autorizada" },
        { status: 404 },
      );
    }

    let updatedSlug = colecao.slug;
    if (nome && slugify(nome) !== colecao.slug.replace(/-\d+$/, "")) {
      const baseSlug = slugify(nome);
      let slug = baseSlug;
      const count = await prisma.colecao.count({
        where: { slug: { startsWith: slug }, NOT: { id: colecaoId } },
      });
      if (count > 0) {
        slug = `${baseSlug}-${count + 1}`;
      }
      updatedSlug = slug;
    }

    // Validation Helpers
    const parseDate = (d) => {
      if (!d) return null;
      const date = new Date(d);
      return isNaN(date.getTime()) ? null : date;
    };

    const parseMoney = (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      const floatVal = parseFloat(v);
      return isNaN(floatVal) ? undefined : floatVal;
    };

    const updatedColecao = await prisma.colecao.update({
      where: { id: colecaoId },
      data: {
        nome,
        descricao,
        categoria,
        capaUrl,
        slug: updatedSlug,
        status: status, // Update status
        precoFoto: parseMoney(precoFoto),
        cidade,
        estado,
        local,
        dataInicio: parseDate(dataInicio),
        dataFim: parseDate(dataFim),
        descontos,
      },
    });

    return NextResponse.json({ data: updatedColecao });
  } catch (error) {
    console.error(`Erro ao atualizar coleção:`, error);
    return NextResponse.json(
      { error: "Erro ao atualizar coleção", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, context) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const params = await context.params;
  const { id: colecaoId } = params;

  if (!colecaoId) {
    return NextResponse.json(
      { error: "ID da coleção é obrigatório" },
      { status: 400 },
    );
  }

  try {
    // Verify ownership
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      include: { fotografo: true },
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
      return NextResponse.json(
        { error: "Coleção não encontrada ou não autorizada" },
        { status: 404 },
      );
    }

    // 1. Fetch all photos in this collection to get their S3 keys
    const photosToDelete = await prisma.foto.findMany({
      where: { colecaoId },
      select: { s3Key: true },
    });

    const s3KeysToDelete = photosToDelete.map((p) => p.s3Key).filter(Boolean);

    // 2. Delete from Database (Cascade should handle relations, but let's be safe with manual deletion if needed)
    // The previous logic assumed simple delete. Let's stick to it, relying on Cascade or manual cleanup if needed.
    // However, for S3 sync, step 1 was crucial.

    await prisma.colecao.delete({
      where: { id: colecaoId },
    });

    // 3. Delete from S3 (Fire and forget or await, but don't block response on error effectively)
    if (s3KeysToDelete.length > 0) {
      await deleteManyPhotoFiles(s3KeysToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Erro ao deletar coleção ${colecaoId}:`, error);
    return NextResponse.json(
      { error: "Erro ao deletar coleção", details: error.message },
      { status: 500 },
    );
  }
}
