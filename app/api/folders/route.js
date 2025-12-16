import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from "@/stack/server";

export async function POST(request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nome, colecaoId, parentId } = body;

    if (!nome || !colecaoId) {
      return NextResponse.json({ error: 'Nome e Coleção são obrigatórios' }, { status: 400 });
    }

    // Verify ownership
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      include: { fotografo: true }
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
      return NextResponse.json({ error: 'Coleção não encontrada ou sem permissão' }, { status: 403 });
    }

    const folder = await prisma.folder.create({
      data: {
        nome,
        colecaoId,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma pasta com este nome neste local.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao criar pasta' }, { status: 500 });
  }
}

export async function GET(request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const colecaoId = searchParams.get('colecaoId');
  const parentId = searchParams.get('parentId');

  if (!colecaoId) {
    return NextResponse.json({ error: 'Coleção ID é obrigatório' }, { status: 400 });
  }

  try {
    // Verify ownership (optional for read, but good practice if private)
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      include: { fotografo: true }
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
       return NextResponse.json({ error: 'Coleção não encontrada ou sem permissão' }, { status: 403 });
    }

    const folders = await prisma.folder.findMany({
      where: {
        colecaoId,
        parentId: parentId || null,
      },
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: { fotos: true, children: true }
        }
      }
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error listing folders:', error);
    return NextResponse.json({ error: 'Erro ao listar pastas', details: error.message }, { status: 500 });
  }
}
