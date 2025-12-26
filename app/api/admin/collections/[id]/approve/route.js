import { NextResponse } from 'next/server';
import { requireAdmin, logAdminActivity } from '@/lib/admin/permissions';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = params;
    
    // Update collection status to APPROVED
    const collection = await prisma.colecao.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: admin.id
      }
    });
    
    // Log activity
    await logAdminActivity(
      admin.id,
      'COLLECTION_APPROVED',
      'Collection',
      id,
      { collectionName: collection.nome }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Coleção aprovada com sucesso' 
    });
    
  } catch (error) {
    console.error('Error approving collection:', error);
    return NextResponse.json(
      { error: 'Erro ao aprovar coleção' },
      { status: 500 }
    );
  }
}
