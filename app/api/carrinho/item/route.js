import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';

export async function DELETE(request) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fotoId } = await request.json();

    if (!fotoId) {
      return NextResponse.json({ error: 'Foto ID required' }, { status: 400 });
    }

    // Find user's cart
    const cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.itemCarrinho.deleteMany({
        where: {
          carrinhoId: cart.id,
          fotoId: fotoId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
