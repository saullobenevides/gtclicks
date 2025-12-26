import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where = {};
    if (status) {
      where.status = status;
    }
    
    const orders = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    return NextResponse.json(orders);
    
  } catch (error) {
    console.error('[API /admin/orders] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

