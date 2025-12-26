import { NextResponse } from 'next/server';
import { requireAdmin, logAdminActivity } from '@/lib/admin/permissions';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = params;
    
    // Activate user
    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        suspendedAt: null,
        suspendedBy: null
      }
    });
    
    // Log activity
    await logAdminActivity(
      admin.id,
      'USER_ACTIVATED',
      'User',
      id,
      { 
        userName: user.name,
        userEmail: user.email
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário ativado com sucesso' 
    });
    
  } catch (error) {
    console.error('Error activating user:', error);
    return NextResponse.json(
      { error: 'Erro ao ativar usuário' },
      { status: 500 }
    );
  }
}
