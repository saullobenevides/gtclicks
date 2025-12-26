import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    console.log('[API /admin/collections/suspend] Suspending collection:', id);
    
    // Update collection status to RASCUNHO (suspended)
    await prisma.colecao.update({
      where: { id },
      data: {
        status: 'RASCUNHO'
      }
    });
    
    console.log('[API /admin/collections/suspend] Collection suspended successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Coleção suspensa com sucesso' 
    });
    
  } catch (error) {
    console.error('[API /admin/collections/suspend] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao suspender coleção', message: error.message },
      { status: 500 }
    );
  }
}
