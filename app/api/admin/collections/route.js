import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PUBLICADA';
    
    const collections = await prisma.colecao.findMany({
      where: {
        status: status
      },
      include: {
        fotografo: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            fotos: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return NextResponse.json(collections);
    
  } catch (error) {
    console.error('[API /admin/collections] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
