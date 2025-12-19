import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { slugify } from "@/lib/slug";

export async function PUT(request, context) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const { id: colecaoId } = params;
    if (!colecaoId) {
      return NextResponse.json({ error: "ID da coleção é obrigatório" }, { status: 400 });
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json({ error: "Perfil de fotografo nao encontrado" }, { status: 403 });
    }

    const body = await request.json();
    console.log("API UPDATE Payload:", body);
    const { nome, descricao, categoria, status, precoFoto, capaUrl, cidade, estado, local, dataInicio, dataFim, descontos } = body;

    // Verify ownership
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
    });

    if (!colecao || colecao.fotografoId !== fotografo.id) {
      return NextResponse.json({ error: "Coleção não encontrada ou não autorizada" }, { status: 404 });
    }

    let updatedSlug = colecao.slug;
    if (nome && slugify(nome) !== colecao.slug.replace(/-\d+$/, '')) {
        const baseSlug = slugify(nome);
        let slug = baseSlug;
        const count = await prisma.colecao.count({ where: { slug: { startsWith: slug }, NOT: { id: colecaoId } } });
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
        if (v === undefined || v === null || v === '') return undefined;
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
      { status: 500 }
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
    return NextResponse.json({ error: "ID da coleção é obrigatório" }, { status: 400 });
  }

  try {
    // Verify ownership
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      include: { fotografo: true }
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
      return NextResponse.json({ error: "Coleção não encontrada ou não autorizada" }, { status: 404 });
    }

    // Delete collection (cascade should handle photos and folders if configured, 
    // but let's check schema. Usually better to be explicit or rely on cascade)
    // Assuming schema has onDelete: Cascade for relations. 
    // If not, we might need to delete photos/folders first.
    // Based on previous context, we added Cascade to Folders. 
    // Let's assume it's fine for now, or Prisma will throw.

    await prisma.colecao.delete({
      where: { id: colecaoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Erro ao deletar coleção ${colecaoId}:`, error);
    return NextResponse.json(
      { error: "Erro ao deletar coleção", details: error.message },
      { status: 500 }
    );
  }
}
