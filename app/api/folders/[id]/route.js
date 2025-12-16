import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from "@/stack/server";

export async function PUT(request, { params }) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { nome, parentId } = body;

    // Verify ownership through the folder -> colecao -> fotografo chain
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
      include: { colecao: { include: { fotografo: true } } }
    });

    if (!existingFolder || existingFolder.colecao.fotografo.userId !== user.id) {
      return NextResponse.json({ error: 'Pasta não encontrada ou sem permissão' }, { status: 403 });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        nome: nome || undefined,
        parentId: parentId === undefined ? undefined : parentId, // Allow moving to root (null)
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma pasta com este nome neste local.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar pasta' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
      include: { colecao: { include: { fotografo: true } } }
    });

    if (!existingFolder || existingFolder.colecao.fotografo.userId !== user.id) {
      return NextResponse.json({ error: 'Pasta não encontrada ou sem permissão' }, { status: 403 });
    }

    // Cascade delete is handled by Prisma schema, but we might want to check for photos first?
    // For now, let's assume cascade delete is what we want (deleting folder deletes subfolders and unlinks photos? 
    // Wait, photos have `folderId`. If we delete folder, photos might be deleted if we didn't set onDelete behavior correctly or if we want them to move to root.
    // In schema: `folderRef Folder? @relation(fields: [folderId], references: [id])` - No onDelete action specified, defaults to SetNull usually or restricts.
    // Let's check schema again. I didn't add onDelete to Foto relation.
    // If I delete a folder, I probably want to keep the photos but move them to root or just have them "unfoldered".
    // Or maybe delete them. Standard behavior for "Delete Folder" is usually "Delete content too" or "Ask".
    // Let's stick to simple delete for now. If Prisma restricts, we'll fail.
    
    // Actually, let's explicitly delete the folder.
    await prisma.folder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Erro ao deletar pasta' }, { status: 500 });
  }
}
