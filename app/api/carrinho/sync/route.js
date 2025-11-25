import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack';

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
          (dbItem) => dbItem.fotoId === item.fotoId && dbItem.licencaId === item.licencaId
        );

        if (!exists) {
          await prisma.itemCarrinho.create({
            data: {
              carrinhoId: cart.id,
              fotoId: item.fotoId,
              licencaId: item.licencaId,
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
            foto: true,
            licenca: {
              include: {
                fotos: {
                  where: {
                    fotoId: { in: cart.itens.map(i => i.fotoId) } // Optimization? No, this is tricky.
                  }
                }
              }
            },
          },
        },
      },
    });

    // Better approach: Fetch prices separately or use a more complex query.
    // Let's iterate and fetch prices.
    const formattedItems = await Promise.all(updatedCart.itens.map(async (item) => {
       const fotoLicenca = await prisma.fotoLicenca.findUnique({
         where: {
           fotoId_licencaId: {
             fotoId: item.fotoId,
             licencaId: item.licencaId,
           }
         }
       });

       return {
        fotoId: item.fotoId,
        licencaId: item.licencaId,
        titulo: item.foto.titulo,
        preco: fotoLicenca ? Number(fotoLicenca.preco) : 0,
        licenca: item.licenca,
        previewUrl: item.foto.previewUrl,
       };
    }));

    return NextResponse.json({ items: formattedItems });

  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
