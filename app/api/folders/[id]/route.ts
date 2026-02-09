import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      nome?: string;
      parentId?: string | null;
    };
    const { nome, parentId } = body;

    const existingFolder = await prisma.folder.findUnique({
      where: { id },
      include: { colecao: { include: { fotografo: true } } },
    });

    if (
      !existingFolder ||
      existingFolder.colecao.fotografo.userId !== user.id
    ) {
      return NextResponse.json(
        { error: "Pasta não encontrada ou sem permissão" },
        { status: 403 }
      );
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        nome: nome || undefined,
        parentId: parentId === undefined ? undefined : parentId,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma pasta com este nome neste local." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar pasta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
      include: { colecao: { include: { fotografo: true } } },
    });

    if (
      !existingFolder ||
      existingFolder.colecao.fotografo.userId !== user.id
    ) {
      return NextResponse.json(
        { error: "Pasta não encontrada ou sem permissão" },
        { status: 403 }
      );
    }

    await prisma.folder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Erro ao deletar pasta" },
      { status: 500 }
    );
  }
}
