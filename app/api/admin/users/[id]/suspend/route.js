import { NextResponse } from 'next/server';
import { requireAdmin, logAdminActivity } from '@/lib/admin/permissions';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = params;
    const body = await request.json();
    const { reason } = body;
    
    // Suspend user
    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: admin.id,
        adminNotes: reason || 'Sem motivo especificado'
      }
    });
    
    // Log activity
    await logAdminActivity(
      admin.id,
      'USER_SUSPENDED',
      'User',
      id,
      { 
        userName: user.name,
        userEmail: user.email,
        reason 
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário suspenso com sucesso' 
    });
    
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: 'Erro ao suspender usuário' },
      { status: 500 }
    );
  }
}
