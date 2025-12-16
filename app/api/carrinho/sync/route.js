import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';

export async function POST(request) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items } = await request.json(); // items from local storage

    // 1. Get or Create Cart for User
    let cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
      include: { itens: true },
    });

    if (!cart) {
      cart = await prisma.carrinho.create({
        data: { userId: user.id },
        include: { itens: true },
      });
    }

    // 2. Merge Items
    // We want to add local items to the DB if they don't exist
    if (items && items.length > 0) {
      for (const item of items) {
        // Check if item already exists in DB cart
        const exists = cart.itens.some(
          (dbItem) => dbItem.fotoId === item.fotoId
        );

        if (!exists) {
          await prisma.itemCarrinho.create({
            data: {
              carrinhoId: cart.id,
              fotoId: item.fotoId,
              // licencaId is now optional/ignored
            },
          });
        }
      }
    }

    // 3. Fetch final updated cart with prices
    const updatedCart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
      include: {
        itens: {
          include: {
            foto: {
              include: { colecao: true }
            },
          },
        },
      },
    });

    const formattedItems = updatedCart.itens.map((item) => {
       const preco = item.foto.colecao?.precoFoto ? Number(item.foto.colecao.precoFoto) : 0;
       
       return {
        fotoId: item.fotoId,
        licencaId: null, // No longer used
        titulo: item.foto.titulo,
        preco: preco,
        licenca: 'Uso Padrão',
        previewUrl: item.foto.previewUrl,
       };
    });

    return NextResponse.json({ items: formattedItems });

  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
