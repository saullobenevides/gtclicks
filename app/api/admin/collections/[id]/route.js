import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('[API /admin/collections/delete] Deleting collection:', id);
    
    // Delete collection
    await prisma.colecao.delete({
      where: { id }
    });
    
    console.log('[API /admin/collections/delete] Collection deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Coleção excluída com sucesso' 
    });
    
  } catch (error) {
    console.error('[API /admin/collections/delete] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir coleção', message: error.message },
      { status: 500 }
    );
  }
}
