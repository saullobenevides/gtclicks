import { NextResponse } from 'next/server';
import { requireAdmin, logAdminActivity } from '@/lib/admin/permissions';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = params;
    const body = await request.json();
    const { reason } = body;
    
    // Update collection status to RASCUNHO (back to draft)
    const collection = await prisma.colecao.update({
      where: { id },
      data: {
        status: 'RASCUNHO',
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        rejectionReason: reason || 'Não especificado'
      }
    });
    
    // Log activity
    await logAdminActivity(
      admin.id,
      'COLLECTION_REJECTED',
      'Collection',
      id,
      { 
        collectionName: collection.nome,
        reason 
      }
    );
    
    // TODO: Send notification to photographer
    
    return NextResponse.json({ 
      success: true, 
      message: 'Coleção rejeitada' 
    });
    
  } catch (error) {
    console.error('Error rejecting collection:', error);
    return NextResponse.json(
      { error: 'Erro ao rejeitar coleção' },
      { status: 500 }
    );
  }
}
