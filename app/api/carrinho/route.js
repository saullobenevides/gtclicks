import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';

export async function DELETE(request) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a cart
    const cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      // Delete all items in the cart
      await prisma.itemCarrinho.deleteMany({
        where: { carrinhoId: cart.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
